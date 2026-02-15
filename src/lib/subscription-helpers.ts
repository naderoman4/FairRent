import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanByPriceId } from '@/lib/stripe-plans';
import type { TeamPlan } from '@/lib/supabase/types';

// Reset team credits at subscription renewal (called from webhook on invoice.paid)
export async function resetTeamCredits(
  teamId: string,
  monthlyCredits: number
): Promise<void> {
  const admin = createAdminClient();

  await admin
    .from('team_credits')
    .upsert({
      team_id: teamId,
      balance: monthlyCredits,
      monthly_allowance: monthlyCredits,
      total_used_this_period: 0,
      period_start: new Date().toISOString(),
    } as Record<string, unknown>);

  // Log the transaction
  await admin.from('credit_transactions').insert({
    team_id: teamId,
    amount: monthlyCredits,
    type: 'subscription_grant',
    action: 'subscription_renewal',
    description: `Renouvellement mensuel — ${monthlyCredits} crédits`,
  } as Record<string, unknown>);
}

// Handle subscription plan change
export async function handleSubscriptionChange(
  stripeSubscriptionId: string,
  stripePriceId: string
): Promise<void> {
  const admin = createAdminClient();
  const plan = getPlanByPriceId(stripePriceId);
  if (!plan) return;

  // Find team by subscription ID
  const { data: team } = await admin
    .from('teams')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!team) return;
  const teamId = (team as { id: string }).id;

  // Update team plan and max members
  await admin
    .from('teams')
    .update({
      plan: plan.id as TeamPlan,
      max_members: plan.maxMembers,
    } as Record<string, unknown>)
    .eq('id', teamId);

  // Update monthly allowance
  await admin
    .from('team_credits')
    .update({
      monthly_allowance: plan.monthlyCredits,
    } as Record<string, unknown>)
    .eq('team_id', teamId);
}

// Handle subscription cancellation
export async function handleSubscriptionCancel(
  stripeSubscriptionId: string
): Promise<void> {
  const admin = createAdminClient();

  // Find team by subscription ID
  const { data: team } = await admin
    .from('teams')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!team) return;
  const teamId = (team as { id: string }).id;

  // Downgrade to starter (no subscription)
  await admin
    .from('teams')
    .update({
      plan: 'starter' as TeamPlan,
      stripe_subscription_id: null,
    } as Record<string, unknown>)
    .eq('id', teamId);

  // Zero out credits
  await admin
    .from('team_credits')
    .update({
      balance: 0,
      monthly_allowance: 0,
    } as Record<string, unknown>)
    .eq('team_id', teamId);
}
