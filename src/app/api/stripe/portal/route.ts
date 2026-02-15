import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import type { Profile } from '@/lib/supabase/types';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Aucun compte Stripe associé' },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${request.headers.get('origin')}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
