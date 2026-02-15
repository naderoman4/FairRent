import { NextResponse } from 'next/server';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { getUserCreditBalance, checkAndDeductCredits } from '@/lib/credits';
import type { Profile } from '@/lib/supabase/types';

// GET /api/credits — Get current credit balance
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  const balance = await getUserCreditBalance(user.id, profile?.team_id ?? null);

  return NextResponse.json({ balance });
}

// POST /api/credits — Deduct credits
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { amount, action, description } = await request.json();
  if (!amount || !action) {
    return NextResponse.json({ error: 'Montant et action requis' }, { status: 400 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  const result = await checkAndDeductCredits(
    user.id,
    profile?.team_id ?? null,
    amount,
    action,
    description
  );

  if (!result.success) {
    return NextResponse.json(
      { error: 'Crédits insuffisants', balance: result.remainingBalance },
      { status: 402 }
    );
  }

  return NextResponse.json({ success: true, balance: result.remainingBalance });
}
