import { NextResponse } from 'next/server';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { checkAndDeductCredits } from '@/lib/credits';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

// POST /api/analyses — Save analysis + deduct 1 credit
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 400 });
  }

  const { inputMode, inputSummary, report } = await request.json();

  // Deduct 1 credit
  const result = await checkAndDeductCredits(
    user.id,
    profile.team_id,
    1,
    'verification',
    `Vérification de bail — ${inputSummary?.address || 'adresse inconnue'}`
  );

  if (!result.success) {
    return NextResponse.json(
      { error: 'Crédits insuffisants', balance: result.remainingBalance },
      { status: 402 }
    );
  }

  // Compute severity counts
  const severityCounts: Record<string, number> = {};
  if (report?.issues) {
    for (const issue of report.issues) {
      severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
    }
  }

  // Save analysis
  const supabase = createClient();
  const { data, error } = await supabase
    .from('saved_analyses')
    .insert({
      user_id: user.id,
      team_id: profile.team_id,
      input_mode: inputMode || 'unknown',
      input_summary: inputSummary || {},
      report,
      severity_counts: severityCounts,
    } as Record<string, unknown>)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save analysis:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    analysisId: (data as { id: string }).id,
    remainingCredits: result.remainingBalance,
  });
}

// GET /api/analyses — List user's analyses
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  const supabase = createClient();

  let query = supabase
    .from('saved_analyses')
    .select('id, input_mode, input_summary, severity_counts, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (profile?.team_id) {
    query = query.eq('team_id', profile.team_id);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Erreur de chargement' }, { status: 500 });
  }

  return NextResponse.json({ analyses: data });
}
