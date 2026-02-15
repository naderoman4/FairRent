'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle, ArrowRight, Scale } from 'lucide-react';
import { captureUTMParams } from '@/lib/utm';

export default function VerifierLoyerLP() {
  useEffect(() => {
    captureUTMParams();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Votre loyer est-il trop élevé ?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Vérifiez en 2 minutes si votre loyer respecte l&apos;encadrement légal à Paris.
            Gratuit et sans inscription.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            Vérifier mon loyer maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Gratuit</h3>
              <p className="text-sm text-gray-600">Aucun frais, aucune inscription requise.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Scale className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Données officielles</h3>
              <p className="text-sm text-gray-600">Basé sur les plafonds de la Mairie de Paris.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Confidentiel</h3>
              <p className="text-sm text-gray-600">Aucune donnée conservée après l&apos;analyse.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Prêt à vérifier ?</h2>
          <p className="text-gray-600 mb-6">
            Importez votre bail PDF ou remplissez le formulaire en quelques clics.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Commencer la vérification
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
