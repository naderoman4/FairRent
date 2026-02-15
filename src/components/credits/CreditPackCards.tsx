'use client';

import { useState } from 'react';
import { Coins, Loader2, Check } from 'lucide-react';

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const packs: CreditPack[] = [
  { id: '1-credit', name: '1 crédit', credits: 1, price: 4.90 },
  { id: '5-credits', name: '5 crédits', credits: 5, price: 19.90, popular: true },
  { id: '15-credits', name: '15 crédits', credits: 15, price: 49.90 },
];

export function CreditPackCards() {
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setLoadingPack(packId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {packs.map((pack) => {
        const pricePerCredit = (pack.price / pack.credits).toFixed(2);
        const isLoading = loadingPack === pack.id;

        return (
          <div
            key={pack.id}
            className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${
              pack.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Populaire
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{pack.name}</h3>
            </div>

            <div className="mb-2">
              <span className="text-3xl font-bold text-gray-900">{pack.price.toFixed(2)}</span>
              <span className="text-gray-500 ml-1">EUR</span>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {pricePerCredit} EUR / crédit
            </p>

            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {pack.credits} vérification{pack.credits > 1 ? 's' : ''} de bail
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Analyse complète avec clauses
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Crédits sans expiration
              </li>
            </ul>

            <button
              onClick={() => handlePurchase(pack.id)}
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
                pack.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                  : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirection...
                </span>
              ) : (
                'Acheter'
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
