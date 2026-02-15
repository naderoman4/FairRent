'use client';

import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  maxMembers: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 10,
    maxMembers: 1,
    features: [
      '10 crédits / mois',
      '1 utilisateur',
      'Vérification de baux',
      'Génération de baux',
      'Historique des analyses',
      'Export PDF',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    credits: 30,
    maxMembers: 5,
    features: [
      '30 crédits / mois',
      'Jusqu\'à 5 utilisateurs',
      'Vérification de baux',
      'Génération de baux',
      'Historique des analyses',
      'Export PDF',
      'Gestion d\'équipe',
      'Crédits partagés',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    credits: 100,
    maxMembers: 20,
    features: [
      '100 crédits / mois',
      'Jusqu\'à 20 utilisateurs',
      'Vérification de baux',
      'Génération de baux',
      'Historique des analyses',
      'Export PDF',
      'Gestion d\'équipe',
      'Crédits partagés',
      'Support prioritaire',
    ],
  },
];

export function SubscriptionCards() {
  return (
    <div>
      <p className="text-center text-muted-foreground mb-8">
        Forfaits mensuels pour agences immobilières. Crédits renouvelés chaque mois.
      </p>
      <div className="grid sm:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${
              plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Populaire
              </div>
            )}

            <h3 className="font-semibold text-gray-900 text-lg">{plan.name}</h3>

            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-500 ml-1">EUR / mois</span>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className={`block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Commencer
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
