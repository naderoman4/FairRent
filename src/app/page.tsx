import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QuickCheck } from '@/components/QuickCheck';
import { PricingTeaser } from '@/components/landing/PricingTeaser';
import { Shield, Zap, BarChart3, FileText, CheckCircle, Scale, ArrowRight, Home, Building2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero + Quick Check */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Votre loyer est-il légal ?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10">
              Vérifiez gratuitement si votre loyer respecte l&apos;encadrement des loyers à Paris.
              Locataires, propriétaires et agences : FairRent vous accompagne.
            </p>

            <QuickCheck analysisUrl="/analyser#analyse-complete" />

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Aucun fichier conservé
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Résultat en moins d&apos;une minute
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Données officielles Paris
              </div>
            </div>
          </div>
        </section>

        {/* Role-based CTAs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
              Quel est votre profil ?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/analyser"
                className="group border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <Scale className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Je suis locataire</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vérifiez gratuitement si votre loyer respecte les plafonds légaux.
                </p>
                <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                  Analyser mon bail <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/signup"
                className="group border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <Home className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Je suis propriétaire</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vérifiez vos baux et générez des baux 100 % conformes.
                </p>
                <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                  Créer un compte <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/signup"
                className="group border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <Building2 className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Je suis une agence</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gérez les baux de votre portefeuille avec votre équipe.
                </p>
                <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                  Découvrir les offres <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
              Comment ça marche ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Importez</h3>
                <p className="text-gray-600 text-sm">
                  Glissez votre bail PDF, remplissez le formulaire ou collez le texte.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Vérifiez</h3>
                <p className="text-gray-600 text-sm">
                  On compare votre loyer aux plafonds officiels et on analyse vos clauses.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <Scale className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Agissez</h3>
                <p className="text-gray-600 text-sm">
                  Obtenez un rapport détaillé avec les démarches à suivre si besoin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <PricingTeaser />
      </main>
      <Footer />
    </div>
  );
}
