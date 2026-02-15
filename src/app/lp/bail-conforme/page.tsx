'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, FileText, ArrowRight, AlertTriangle } from 'lucide-react';
import { captureUTMParams } from '@/lib/utm';

export default function BailConformeLP() {
  useEffect(() => {
    captureUTMParams();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-red-50 to-white py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Votre bail contient-il des clauses illégales ?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Analysez gratuitement votre bail de location pour détecter les clauses abusives
            et vérifier la conformité de votre loyer.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            Analyser mon bail
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* What we check */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Ce que nous vérifions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Clauses abusives</h3>
                <p className="text-xs text-gray-600">
                  Pénalités de retard, prélèvement automatique obligatoire, interdiction d&apos;héberger...
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Plafond de loyer</h3>
                <p className="text-xs text-gray-600">
                  Comparaison avec les plafonds officiels de votre quartier parisien.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
              <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Validité du bail</h3>
                <p className="text-xs text-gray-600">
                  Durée, type de bail, dépôt de garantie, frais d&apos;agence.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
              <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">DPE et décence</h3>
                <p className="text-xs text-gray-600">
                  Passoires thermiques interdites, surface minimale, normes de décence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Analysez votre bail en 2 minutes</h2>
          <p className="text-gray-600 mb-6">
            Importez votre PDF, collez le texte ou remplissez le formulaire.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Commencer l&apos;analyse
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        <p>FairRent &mdash; Vérificateur d&apos;encadrement des loyers</p>
      </footer>
    </>
  );
}
