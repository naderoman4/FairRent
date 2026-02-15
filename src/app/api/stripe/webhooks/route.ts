import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { grantCredits } from '@/lib/credits';
import { resetTeamCredits, handleSubscriptionChange, handleSubscriptionCancel } from '@/lib/subscription-helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanByPriceId } from '@/lib/stripe-plans';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'payment') {
        // One-time credit pack purchase
        const userId = session.metadata?.user_id;
        const creditAmount = session.metadata?.credit_amount;

        if (!userId || !creditAmount) {
          console.error('Missing metadata in checkout session:', session.id);
          break;
        }

        await grantCredits(userId, parseInt(creditAmount, 10), session.id);
        console.log(`Granted ${creditAmount} credits to user ${userId}`);
      } else if (session.mode === 'subscription') {
        // New agency subscription — create team + grant initial credits
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const monthlyCredits = parseInt(session.metadata?.monthly_credits || '0', 10);
        const subscriptionId = (session as unknown as Record<string, unknown>).subscription as string;

        if (!userId || !planId || !subscriptionId) break;

        const admin = createAdminClient();
        const plan = getPlanByPriceId(
          // Get price from subscription items
          session.metadata?.plan_id || ''
        );

        // Check if user already has a team
        const { data: profile } = await admin
          .from('profiles')
          .select('team_id')
          .eq('id', userId)
          .single();

        const teamId = (profile as { team_id: string | null } | null)?.team_id;

        if (teamId) {
          // Update existing team
          await admin
            .from('teams')
            .update({
              plan: planId,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
              max_members: plan?.maxMembers || 1,
            } as Record<string, unknown>)
            .eq('id', teamId);

          await resetTeamCredits(teamId, monthlyCredits);
        } else {
          // Create new team
          const { data: team } = await admin
            .from('teams')
            .insert({
              name: `Agence de ${userId.slice(0, 8)}`,
              owner_id: userId,
              plan: planId,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
              max_members: plan?.maxMembers || 1,
            } as Record<string, unknown>)
            .select('id')
            .single();

          const newTeamId = (team as { id: string } | null)?.id;
          if (newTeamId) {
            // Link user to team
            await admin
              .from('profiles')
              .update({ team_id: newTeamId } as Record<string, unknown>)
              .eq('id', userId);

            // Create team member record
            await admin.from('team_members').insert({
              team_id: newTeamId,
              user_id: userId,
              role: 'admin',
            } as Record<string, unknown>);

            await resetTeamCredits(newTeamId, monthlyCredits);
          }
        }

        console.log(`Subscription created for user ${userId}, plan: ${planId}`);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string | null;
      if (!subscriptionId) break;

      // Find team and reset monthly credits
      const admin = createAdminClient();
      const { data: team } = await admin
        .from('teams')
        .select('id, plan')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (team) {
        const teamData = team as { id: string; plan: string };
        // Find plan by team's current plan
        const { AGENCY_PLANS } = await import('@/lib/stripe-plans');
        const plan = AGENCY_PLANS.find((p) => p.id === teamData.plan);
        if (plan) {
          await resetTeamCredits(teamData.id, plan.monthlyCredits);
          console.log(`Reset credits for team ${teamData.id}: ${plan.monthlyCredits} credits`);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price?.id;
      if (priceId) {
        await handleSubscriptionChange(subscription.id, priceId);
        console.log(`Subscription ${subscription.id} updated to price ${priceId}`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancel(subscription.id);
      console.log(`Subscription ${subscription.id} cancelled`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
