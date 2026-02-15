import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { getPlanById } from '@/lib/stripe-plans';
import type { Profile } from '@/lib/supabase/types';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  if (!profile || profile.role !== 'agency') {
    return NextResponse.json({ error: 'Réservé aux agences' }, { status: 403 });
  }

  const { planId } = await request.json();
  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
  }

  // Create or reuse Stripe customer
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id, role: 'agency' },
    });
    customerId = customer.id;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId } as Record<string, unknown>)
      .eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    metadata: {
      user_id: user.id,
      team_id: profile.team_id || '',
      plan_id: plan.id,
      monthly_credits: plan.monthlyCredits.toString(),
    },
    success_url: `${request.headers.get('origin')}/dashboard?subscription=success&plan=${plan.name}`,
    cancel_url: `${request.headers.get('origin')}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
