import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number; // in EUR
  priceId: string;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: '1-credit',
    name: '1 crédit',
    credits: 1,
    price: 4.90,
    priceId: process.env.STRIPE_PRICE_1_CREDIT!,
  },
  {
    id: '5-credits',
    name: '5 crédits',
    credits: 5,
    price: 19.90,
    priceId: process.env.STRIPE_PRICE_5_CREDITS!,
    popular: true,
  },
  {
    id: '15-credits',
    name: '15 crédits',
    credits: 15,
    price: 49.90,
    priceId: process.env.STRIPE_PRICE_15_CREDITS!,
  },
];

export function getPackByPriceId(priceId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.priceId === priceId);
}
