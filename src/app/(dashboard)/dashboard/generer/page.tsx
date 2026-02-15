'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LeaseGenWizard } from '@/components/lease-gen/LeaseGenWizard';
import { LeasePDFDownload } from '@/components/lease-gen/LeasePDF';
import type { LeaseGenData } from '@/lib/types-lease-gen';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GenererPage() {
  const router = useRouter();
  const { credits, refreshCredits } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<LeaseGenData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasCredits = credits >= 2;

  const handleGenerate = async (data: LeaseGenData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError('Crédits insuffisants (2 requis). Veuillez recharger votre compte.');
        } else {
          setError(result.error || 'Erreur lors de la génération.');
        }
        return;
      }

      setGeneratedData(result.data);
      refreshCredits();
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasCredits && !generatedData) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Créer un bail</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
          <p className="text-amber-900 font-medium">Crédits insuffisants</p>
          <p className="text-sm text-amber-700">
            Vous avez besoin d&apos;au moins 2 crédits pour générer un bail.
            Vous avez {credits} crédit{credits !== 1 ? 's' : ''}.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Acheter des crédits
          </button>
        </div>
      </div>
    );
  }

  if (generatedData) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Bail généré</h1>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            Votre bail a été généré avec succès. Téléchargez-le au format PDF.
          </p>
        </div>

        <LeasePDFDownload data={generatedData} />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-700">
            Ce document est un modèle généré automatiquement. Il est recommandé de le faire vérifier par un professionnel du droit avant signature.
          </p>
        </div>

        <button
          onClick={() => setGeneratedData(null)}
          className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Créer un autre bail
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Créer un bail</h1>
      <p className="text-sm text-muted-foreground">
        Remplissez les informations pour générer un bail conforme à la loi ALUR. 2 crédits seront déduits.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <LeaseGenWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
    </div>
  );
}
