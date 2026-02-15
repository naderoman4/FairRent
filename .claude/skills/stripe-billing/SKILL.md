# Stripe Billing

## Overview
Two billing models: credit packs (landlords) and subscriptions (agencies).

## Key Files
- `src/lib/stripe.ts` — Stripe client + CREDIT_PACKS config
- `src/lib/stripe-plans.ts` — AGENCY_PLANS config
- `src/lib/credits.ts` — `checkAndDeductCredits()`, `getUserCreditBalance()`, `grantCredits()`
- `src/lib/subscription-helpers.ts` — `resetTeamCredits()`, `handleSubscriptionChange()`, `handleSubscriptionCancel()`
- `src/app/api/stripe/checkout/route.ts` — Create checkout session for credit packs
- `src/app/api/stripe/subscription/route.ts` — Create checkout session for subscriptions
- `src/app/api/stripe/webhooks/route.ts` — Webhook handler (raw body, signature verification)
- `src/app/api/stripe/portal/route.ts` — Customer portal session
- `src/app/api/credits/route.ts` — GET balance, POST deduct

## Credit Packs (Landlords)
- 1 credit (4.90 EUR), 5 credits (19.90 EUR), 15 credits (49.90 EUR)
- No expiry. Deducted AFTER successful operation.
- 1 credit = verification, 2 credits = lease generation

## Agency Subscriptions
- Starter (29 EUR/mo, 10 credits, 1 member)
- Pro (79 EUR/mo, 30 credits, 5 members)
- Business (199 EUR/mo, 100 credits, 20 members)
- Credits reset monthly via `invoice.paid` webhook

## Webhook Events
- `checkout.session.completed` — Grant credits (payment) or create team (subscription)
- `invoice.paid` — Reset monthly credits
- `customer.subscription.updated` — Plan change
- `customer.subscription.deleted` — Cancel, zero credits

## Critical
- Webhook route excluded from Next.js middleware (needs raw body)
- Uses Supabase admin client (service role) for webhook operations
- `grant_credits` RPC is idempotent (checks stripe_session_id)
- `deduct_credits` uses `FOR UPDATE` lock for atomicity

## Environment Variables
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_1_CREDIT`, `STRIPE_PRICE_5_CREDITS`, `STRIPE_PRICE_15_CREDITS`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`
