'use client';

import { useState } from 'react';
import { CreditPackCards } from '@/components/credits/CreditPackCards';
import { SubscriptionCards } from '@/components/pricing/SubscriptionCards';
import { Check, User, Building2, Users } from 'lucide-react';

type Tab = 'tenant' | 'landlord' | 'agency';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'tenant', label: 'Locataire', icon: User },
  { id: 'landlord', label: 'Propriétaire', icon: Building2 },
  { id: 'agency', label: 'Agence', icon: Users },
];

export function PricingTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('landlord');

  return (
    <div className="space-y-8">
      {/* Tab selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'tenant' && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border-2 border-green-500 p-8 text-center space-y-6">
            <div className="inline-flex p-3 bg-green-50 rounded-xl">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gratuit</h3>
              <p className="text-muted-foreground mt-1">Pour les locataires parisiens</p>
            </div>
            <div>
              <span className="text-4xl font-bold text-gray-900">0</span>
              <span className="text-gray-500 ml-1">EUR</span>
            </div>
            <ul className="space-y-3 text-left">
              {[
                'Vérification illimitée du loyer',
                'Analyse complète des clauses abusives',
                'Rapport détaillé avec recommandations',
                'Export PDF du rapport',
                'Aucune inscription requise',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/analyser"
              className="block w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Vérifier mon loyer
            </a>
          </div>
        </div>
      )}

      {activeTab === 'landlord' && (
        <div>
          <p className="text-center text-muted-foreground mb-8">
            Vérifiez la conformité de vos baux et générez des baux conformes. Crédits sans expiration.
          </p>
          <CreditPackCards />
        </div>
      )}

      {activeTab === 'agency' && <SubscriptionCards />}
    </div>
  );
}
