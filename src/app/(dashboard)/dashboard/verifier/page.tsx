'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LeaseUpload } from '@/components/LeaseUpload';
import { LeaseForm } from '@/components/LeaseForm';
import { ManualWizard } from '@/components/ManualWizard';
import { CopyPasteInput } from '@/components/CopyPasteInput';
import { ProgressStepper } from '@/components/ProgressStepper';
import { ComplianceReport } from '@/components/ComplianceReport';
import { LandlordGuidance } from '@/components/dashboard/LandlordGuidance';
import type { LeaseData, ComplianceIssue, ComplianceReport as ReportType } from '@/lib/types';
import { Upload, PenLine, ClipboardPaste, AlertCircle } from 'lucide-react';

type PageState = 'input' | 'uploading' | 'form' | 'manual' | 'copypaste' | 'checking' | 'report';
type InputTab = 'pdf' | 'manual' | 'copypaste';

export default function VerifierPage() {
  const router = useRouter();
  const { credits, refreshCredits } = useAuth();
  const [state, setState] = useState<PageState>('input');
  const [leaseData, setLeaseData] = useState<Partial<LeaseData> | null>(null);
  const [uploadStep, setUploadStep] = useState<string>('extracting');
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [clauseIssues, setClauseIssues] = useState<ComplianceIssue[]>([]);
  const [activeTab, setActiveTab] = useState<InputTab>('pdf');
  const [report, setReport] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasCredits = credits >= 1;

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
    await runAnalysis(data, clauseIssues.length > 0 ? clauseIssues : undefined);
  };

  const handleWizardSubmit = async (data: LeaseData, issues?: ComplianceIssue[]) => {
    await runAnalysis(data, issues && issues.length > 0 ? issues : undefined);
  };

  const runAnalysis = async (data: LeaseData, issues?: ComplianceIssue[]) => {
    setState('checking');
    setError(null);

    try {
      // Run compliance check
      const response = await fetch('/api/check-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseData: data,
          clauseIssues: issues,
        }),
      });
      const result = await response.json();

      if (!result.success || !result.report) {
        setError(result.error || 'Une erreur est survenue lors de la vérification.');
        setState('input');
        return;
      }

      // Save analysis and deduct credit
      const saveRes = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMode: activeTab,
          inputSummary: {
            address: data.address,
            rent: data.rentExcludingCharges,
            surface: data.surface,
          },
          report: result.report,
        }),
      });

      if (!saveRes.ok) {
        const saveResult = await saveRes.json();
        if (saveRes.status === 402) {
          setError('Crédits insuffisants. Veuillez recharger votre compte.');
          setState('input');
          return;
        }
        setError(saveResult.error || 'Erreur lors de la sauvegarde.');
        setState('input');
        return;
      }

      setReport(result.report);
      setState('report');
      refreshCredits();
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
      setState('input');
    }
  };

  const handleReset = () => {
    setState('input');
    setLeaseData(null);
    setConfidence({});
    setClauseIssues([]);
    setReport(null);
    setError(null);
    setActiveTab('pdf');
  };

  const tabs: { id: InputTab; label: string; icon: typeof Upload }[] = [
    { id: 'pdf', label: 'Importer un PDF', icon: Upload },
    { id: 'manual', label: 'Saisie manuelle', icon: PenLine },
    { id: 'copypaste', label: 'Copier-coller', icon: ClipboardPaste },
  ];

  if (!hasCredits && state === 'input') {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Vérifier un bail</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
          <p className="text-amber-900 font-medium">Crédits insuffisants</p>
          <p className="text-sm text-amber-700">
            Vous avez besoin d&apos;au moins 1 crédit pour vérifier un bail.
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

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vérifier un bail</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {state === 'input' && (
        <>
          <p className="text-sm text-muted-foreground">
            1 crédit sera déduit après une analyse réussie. Vous avez {credits} crédit{credits !== 1 ? 's' : ''}.
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
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

          {activeTab === 'pdf' && (
            <LeaseUpload
              onProgress={(s) => {
                setUploadStep(s);
                setState('uploading');
              }}
              onComplete={handleUploadComplete}
              onError={(err) => setError(err)}
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
                Coller le bail
              </button>
            </div>
          )}
        </>
      )}

      {state === 'uploading' && <ProgressStepper currentStep={uploadStep} />}

      {state === 'form' && (
        <LeaseForm
          initialData={leaseData}
          confidence={confidence}
          onSubmit={handleFormSubmit}
          onBack={handleReset}
        />
      )}

      {state === 'manual' && (
        <ManualWizard onSubmit={handleWizardSubmit} onBack={handleReset} />
      )}

      {state === 'copypaste' && (
        <CopyPasteInput
          onComplete={handleCopyPasteComplete}
          onError={(err) => setError(err)}
          onBack={handleReset}
        />
      )}

      {state === 'checking' && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      )}

      {state === 'report' && report && (
        <div className="space-y-8">
          <ComplianceReport report={report} onReset={handleReset} />
          <LandlordGuidance issues={report.issues} />
        </div>
      )}
    </div>
  );
}
