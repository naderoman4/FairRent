export interface AgencyPlan {
  id: string;
  name: string;
  price: number;
  monthlyCredits: number;
  maxMembers: number;
  priceId: string;
}

export const AGENCY_PLANS: AgencyPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    monthlyCredits: 10,
    maxMembers: 1,
    priceId: process.env.STRIPE_PRICE_STARTER!,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    monthlyCredits: 30,
    maxMembers: 5,
    priceId: process.env.STRIPE_PRICE_PRO!,
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    monthlyCredits: 100,
    maxMembers: 20,
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
  },
];

export function getPlanByPriceId(priceId: string): AgencyPlan | undefined {
  return AGENCY_PLANS.find((p) => p.priceId === priceId);
}

export function getPlanById(id: string): AgencyPlan | undefined {
  return AGENCY_PLANS.find((p) => p.id === id);
}
