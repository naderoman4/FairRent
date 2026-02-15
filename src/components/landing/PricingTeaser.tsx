import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Locataire',
    price: 'Gratuit',
    description: 'Vérifiez votre loyer gratuitement',
    features: ['Analyse complète du bail', 'Détection de clauses abusives', 'Rapport de conformité détaillé'],
    cta: { label: 'Analyser mon bail', href: '/analyser' },
    highlight: false,
  },
  {
    name: 'Propriétaire',
    price: 'Dès 4,90 €',
    description: 'Vérifiez et créez vos baux',
    features: ['Vérification de conformité', 'Génération de bail conforme', 'Historique des analyses'],
    cta: { label: 'Commencer', href: '/signup' },
    highlight: true,
  },
  {
    name: 'Agence',
    price: 'Dès 29 €/mois',
    description: 'Gérez vos baux à grande échelle',
    features: ['Tout du plan Propriétaire', 'Gestion d\'équipe', 'Export CSV'],
    cta: { label: 'Découvrir', href: '/pricing' },
    highlight: false,
  },
];

export function PricingTeaser() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Une solution pour chaque profil
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Locataire, propriétaire ou agence : FairRent s&apos;adapte à vos besoins.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'border-primary shadow-lg ring-1 ring-primary/20'
                  : 'border-gray-200'
              }`}
            >
              <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta.label}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link href="/pricing" className="text-sm text-primary hover:underline">
            Voir tous les tarifs
          </Link>
        </p>
      </div>
    </section>
  );
}
