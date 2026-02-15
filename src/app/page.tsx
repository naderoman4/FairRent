'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LeaseUpload } from '@/components/LeaseUpload';
import { LeaseForm } from '@/components/LeaseForm';
import { ManualWizard } from '@/components/ManualWizard';
import { CopyPasteInput } from '@/components/CopyPasteInput';
import { QuickCheck } from '@/components/QuickCheck';
import { ProgressStepper } from '@/components/ProgressStepper';
import type { LeaseData, ComplianceIssue } from '@/lib/types';
import { Shield, Zap, BarChart3, FileText, CheckCircle, Scale, Upload, PenLine, ClipboardPaste } from 'lucide-react';

type AppState = 'landing' | 'uploading' | 'form' | 'manual' | 'copypaste' | 'checking';
type InputTab = 'pdf' | 'manual' | 'copypaste';

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<AppState>('landing');
  const [leaseData, setLeaseData] = useState<Partial<LeaseData> | null>(null);
  const [uploadStep, setUploadStep] = useState<string>('extracting');
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [clauseIssues, setClauseIssues] = useState<ComplianceIssue[]>([]);
  const [activeTab, setActiveTab] = useState<InputTab>('pdf');

  const handleUploadComplete = (data: Partial<LeaseData>, conf: Record<string, number>, issues?: ComplianceIssue[]) => {
    setLeaseData(data);
    setConfidence(conf);
    if (issues) setClauseIssues(issues);
    setState('form');
  };

  const handleCopyPasteComplete = (data: Partial<LeaseData>, conf: Record<string, number>, issues?: ComplianceIssue[]) => {
    setLeaseData(data);
    setConfidence(conf);
    if (issues) setClauseIssues(issues);
    setState('form');
  };

  const handleFormSubmit = async (data: LeaseData) => {
    setState('checking');
    try {
      const response = await fetch('/api/check-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseData: data,
          clauseIssues: clauseIssues.length > 0 ? clauseIssues : undefined,
        }),
      });
      const result = await response.json();
      if (result.success && result.report) {
        sessionStorage.setItem('fairrent-report', JSON.stringify(result.report));
        router.push('/report');
      } else {
        alert(result.error || 'Une erreur est survenue lors de la vérification.');
        setState('form');
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.');
      setState('form');
    }
  };

  const handleWizardSubmit = async (data: LeaseData, issues?: ComplianceIssue[]) => {
    setState('checking');
    try {
      const response = await fetch('/api/check-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseData: data,
          clauseIssues: issues && issues.length > 0 ? issues : undefined,
        }),
      });
      const result = await response.json();
      if (result.success && result.report) {
        sessionStorage.setItem('fairrent-report', JSON.stringify(result.report));
        router.push('/report');
      } else {
        alert(result.error || 'Une erreur est survenue lors de la vérification.');
        setState('manual');
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.');
      setState('manual');
    }
  };

  const handleReset = () => {
    setState('landing');
    setLeaseData(null);
    setConfidence({});
    setClauseIssues([]);
    setActiveTab('pdf');
  };

  const tabs: { id: InputTab; label: string; icon: typeof Upload }[] = [
    { id: 'pdf', label: 'Importer un PDF', icon: Upload },
    { id: 'manual', label: 'Saisie manuelle', icon: PenLine },
    { id: 'copypaste', label: 'Copier-coller', icon: ClipboardPaste },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {state === 'landing' && (
          <>
            {/* Hero + Quick Check */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
              <div className="container mx-auto px-4 text-center max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Votre loyer est-il légal ?
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-10">
                  Vérifiez gratuitement si votre loyer respecte l&apos;encadrement des loyers à Paris.
                </p>

                <QuickCheck />

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

            {/* Full analysis section with tabs */}
            <section className="py-16 bg-white" id="analyse-complete">
              <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Analyse complète de votre bail
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                  Importez votre bail pour une vérification détaillée : loyer, clauses, validité et plus.
                </p>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                {activeTab === 'pdf' && (
                  <LeaseUpload
                    onProgress={(s) => {
                      setUploadStep(s);
                      setState('uploading');
                    }}
                    onComplete={handleUploadComplete}
                    onError={(err) => alert(err)}
                  />
                )}

                {activeTab === 'manual' && (
                  <div className="text-center space-y-4 py-8">
                    <p className="text-sm text-muted-foreground">
                      Remplissez les informations de votre bail en 4 étapes simples.
                    </p>
                    <button
                      onClick={() => setState('manual')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      <PenLine className="h-4 w-4" />
                      Commencer la saisie
                    </button>
                  </div>
                )}

                {activeTab === 'copypaste' && (
                  <div className="text-center space-y-4 py-8">
                    <p className="text-sm text-muted-foreground">
                      Copiez-collez le texte de votre bail pour une extraction et analyse automatique.
                    </p>
                    <button
                      onClick={() => setState('copypaste')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ClipboardPaste className="h-4 w-4" />
                      Coller mon bail
                    </button>
                  </div>
                )}
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

        {state === 'manual' && (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-2xl">
              <ManualWizard
                onSubmit={handleWizardSubmit}
                onBack={handleReset}
              />
            </div>
          </section>
        )}

        {state === 'copypaste' && (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-2xl">
              <CopyPasteInput
                onComplete={handleCopyPasteComplete}
                onError={(err) => alert(err)}
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
      </main>
      <Footer />
    </div>
  );
}
