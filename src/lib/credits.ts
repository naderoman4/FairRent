import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface DeductResult {
  success: boolean;
  remainingBalance: number;
}

// Deduct credits for a user (handles individual and team credits)
export async function checkAndDeductCredits(
  userId: string,
  teamId: string | null,
  amount: number,
  action: string,
  description?: string
): Promise<DeductResult> {
  const supabase = createClient();

  if (teamId) {
    const { data: success } = await supabase.rpc('deduct_team_credits', {
      p_team_id: teamId,
      p_user_id: userId,
      p_amount: amount,
      p_action: action,
      p_description: description,
    });

    if (!success) {
      return { success: false, remainingBalance: 0 };
    }

    const { data } = await supabase
      .from('team_credits')
      .select('balance')
      .eq('team_id', teamId)
      .single();
    return { success: true, remainingBalance: (data as { balance: number } | null)?.balance ?? 0 };
  }

  const { data: success } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_action: action,
    p_description: description,
  });

  if (!success) {
    return { success: false, remainingBalance: 0 };
  }

  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
  return { success: true, remainingBalance: (data as { balance: number } | null)?.balance ?? 0 };
}

// Get credit balance for a user
export async function getUserCreditBalance(
  userId: string,
  teamId: string | null
): Promise<number> {
  const supabase = createClient();

  if (teamId) {
    const { data } = await supabase
      .from('team_credits')
      .select('balance')
      .eq('team_id', teamId)
      .single();
    return (data as { balance: number } | null)?.balance ?? 0;
  }

  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
  return (data as { balance: number } | null)?.balance ?? 0;
}

// Grant credits to a user (used by webhook after payment)
export async function grantCredits(
  userId: string,
  amount: number,
  stripeSessionId?: string
): Promise<void> {
  const admin = createAdminClient();
  await (admin.rpc as CallableFunction)('grant_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_stripe_session_id: stripeSessionId,
  });
}
