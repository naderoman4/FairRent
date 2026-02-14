'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LeaseUpload } from '@/components/LeaseUpload';
import { LeaseForm } from '@/components/LeaseForm';
import { ProgressStepper } from '@/components/ProgressStepper';
import { ComplianceReport } from '@/components/ComplianceReport';
import type { LeaseData, ComplianceReport as ComplianceReportType } from '@/lib/types';
import { Shield, Zap, BarChart3, FileText, CheckCircle, Scale } from 'lucide-react';

type AppState = 'landing' | 'uploading' | 'form' | 'checking' | 'report';

export default function Home() {
  const [state, setState] = useState<AppState>('landing');
  const [leaseData, setLeaseData] = useState<Partial<LeaseData> | null>(null);
  const [report, setReport] = useState<ComplianceReportType | null>(null);
  const [uploadStep, setUploadStep] = useState<string>('extracting');
  const [confidence, setConfidence] = useState<Record<string, number>>({});

  const handleUploadComplete = (data: Partial<LeaseData>, conf: Record<string, number>) => {
    setLeaseData(data);
    setConfidence(conf);
    setState('form');
  };

  const handleManualEntry = () => {
    setLeaseData(null);
    setConfidence({});
    setState('form');
  };

  const handleFormSubmit = async (data: LeaseData) => {
    setState('checking');
    try {
      const response = await fetch('/api/check-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseData: data }),
      });
      const result = await response.json();
      if (result.success && result.report) {
        setReport(result.report);
        setState('report');
      } else {
        alert(result.error || 'Une erreur est survenue lors de la vérification.');
        setState('form');
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.');
      setState('form');
    }
  };

  const handleReset = () => {
    setState('landing');
    setLeaseData(null);
    setReport(null);
    setConfidence({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {state === 'landing' && (
          <>
            {/* Hero */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
              <div className="container mx-auto px-4 text-center max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Votre loyer est-il légal ?
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-10">
                  Vérifiez gratuitement si votre loyer respecte l&apos;encadrement des loyers à Paris.
                  Importez votre bail ou remplissez le formulaire.
                </p>

                <LeaseUpload
                  onProgress={(step) => {
                    setUploadStep(step);
                    setState('uploading');
                  }}
                  onComplete={handleUploadComplete}
                  onError={(err) => {
                    alert(err);
                    setState('landing');
                  }}
                />

                <button
                  onClick={handleManualEntry}
                  className="mt-6 text-primary hover:underline text-sm font-medium"
                >
                  Pas de PDF ? Remplissez le formulaire
                </button>

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

            {/* How it works */}
            <section className="py-16 bg-white">
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
                      Glissez votre bail PDF ou remplissez le formulaire manuellement.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">2. Vérifiez</h3>
                    <p className="text-gray-600 text-sm">
                      On compare votre loyer aux plafonds officiels de votre quartier.
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
          </>
        )}

        {state === 'uploading' && (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-lg">
              <ProgressStepper currentStep={uploadStep} />
            </div>
          </section>
        )}

        {state === 'form' && (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-2xl">
              <LeaseForm
                initialData={leaseData}
                confidence={confidence}
                onSubmit={handleFormSubmit}
                onBack={handleReset}
              />
            </div>
          </section>
        )}

        {state === 'checking' && (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-lg text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Vérification en cours...</p>
            </div>
          </section>
        )}

        {state === 'report' && report && (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-3xl">
              <ComplianceReport report={report} onReset={handleReset} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
