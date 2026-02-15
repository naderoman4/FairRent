import { NextResponse } from 'next/server';
import { stripe, CREDIT_PACKS } from '@/lib/stripe';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import type { Profile } from '@/lib/supabase/types';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { packId } = await request.json();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return NextResponse.json({ error: 'Pack invalide' }, { status: 400 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;

  // Create or reuse Stripe customer
  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    // Save Stripe customer ID to profile (best-effort)
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId } as Record<string, unknown>)
      .eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{ price: pack.priceId, quantity: 1 }],
    metadata: {
      user_id: user.id,
      credit_amount: pack.credits.toString(),
      pack_id: pack.id,
    },
    success_url: `${request.headers.get('origin')}/dashboard?purchase=success&credits=${pack.credits}`,
    cancel_url: `${request.headers.get('origin')}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
