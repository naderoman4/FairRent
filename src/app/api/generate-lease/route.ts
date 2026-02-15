import { NextResponse } from 'next/server';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { checkAndDeductCredits } from '@/lib/credits';
import { generateLeaseContent } from '@/lib/lease-generator';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';
import type { LeaseGenData } from '@/lib/types-lease-gen';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 400 });
  }

  const data: LeaseGenData = await request.json();

  // Generate lease content with LLM (if needed)
  let generated;
  try {
    generated = await generateLeaseContent(data);
  } catch (error) {
    console.error('Lease generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du bail' },
      { status: 500 }
    );
  }

  // Deduct 2 credits AFTER successful generation
  const result = await checkAndDeductCredits(
    user.id,
    profile.team_id,
    2,
    'lease_generation',
    `Génération de bail — ${data.property.address || 'adresse inconnue'}`
  );

  if (!result.success) {
    return NextResponse.json(
      { error: 'Crédits insuffisants (2 requis)', balance: result.remainingBalance },
      { status: 402 }
    );
  }

  // Apply generated content back to data
  if (generated.specialConditions) {
    data.terms.specialConditions = generated.specialConditions;
  }
  if (generated.complementJustification) {
    data.financial.complementLoyerJustification = generated.complementJustification;
  }

  // Save to database
  const supabase = createClient();
  const { data: saved, error: saveError } = await supabase
    .from('generated_leases')
    .insert({
      user_id: user.id,
      team_id: profile.team_id,
      property_data: data.property,
      parties_data: data.parties,
      financial_data: data.financial,
      lease_terms: data.terms,
      status: 'generated',
    } as Record<string, unknown>)
    .select('id')
    .single();

  if (saveError) {
    console.error('Failed to save generated lease:', saveError);
  }

  return NextResponse.json({
    success: true,
    leaseId: (saved as { id: string } | null)?.id,
    data,
    remainingCredits: result.remainingBalance,
  });
}
