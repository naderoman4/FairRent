'use client';

import { useState } from 'react';
import type { LeaseData, ConstructionPeriod, DPEClass, LeaseType, ComplianceIssue } from '@/lib/types';
import { CONSTRUCTION_PERIODS, DPE_CLASSES, LEASE_TYPES, MAX_CLAUSE_TEXT_LENGTH } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressAutocomplete } from './AddressAutocomplete';
import { ArrowLeft, ArrowRight, CheckCircle, Home, Wallet, FileText, Search, Shield } from 'lucide-react';

interface ManualWizardProps {
  onSubmit: (data: LeaseData, clauseIssues?: ComplianceIssue[]) => void;
  onBack: () => void;
}

const STEPS = [
  { label: 'Logement', icon: Home },
  { label: 'Finances', icon: Wallet },
  { label: 'Bail', icon: FileText },
  { label: 'Clauses', icon: Search },
];

export function ManualWizard({ onSubmit, onBack }: ManualWizardProps) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clauseLoading, setClauseLoading] = useState(false);

  const [form, setForm] = useState({
    address: '',
    postalCode: '',
    city: 'Paris',
    surface: '',
    numberOfRooms: '2',
    constructionPeriod: '' as string,
    furnished: false,
    dpeClass: '' as string,
    rentExcludingCharges: '',
    charges: '',
    depositAmount: '',
    agencyFees: '',
    complementLoyer: '',
    complementLoyerJustification: '',
    leaseStartDate: '',
    leaseDuration: '',
    leaseType: '' as string,
    mentionsReferenceRent: null as boolean | null,
    mentionsMaxRent: null as boolean | null,
    clauseText: '',
  });

  const updateField = (field: string, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddressSelect = (addr: string, pc: string) => {
    updateField('address', addr);
    updateField('postalCode', pc);
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 0) {
      if (!form.address.trim()) newErrors.address = 'Adresse requise';
      if (!form.surface || parseFloat(form.surface) <= 0) newErrors.surface = 'Surface requise';
      if (!form.constructionPeriod) newErrors.constructionPeriod = 'Période requise';
    } else if (s === 1) {
      if (!form.rentExcludingCharges || parseFloat(form.rentExcludingCharges) <= 0)
        newErrors.rentExcludingCharges = 'Loyer requis';
    } else if (s === 2) {
      if (!form.leaseStartDate) newErrors.leaseStartDate = 'Date requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const buildLeaseData = (): LeaseData => ({
    address: form.address.trim(),
    postalCode: form.postalCode.trim() || '75001',
    city: form.city.trim() || 'Paris',
    rentExcludingCharges: parseFloat(form.rentExcludingCharges),
    charges: form.charges ? parseFloat(form.charges) : null,
    surface: parseFloat(form.surface),
    numberOfRooms: parseInt(form.numberOfRooms, 10),
    furnished: form.furnished,
    constructionPeriod: form.constructionPeriod as ConstructionPeriod,
    leaseStartDate: form.leaseStartDate,
    complementLoyer: form.complementLoyer ? parseFloat(form.complementLoyer) : null,
    complementLoyerJustification: form.complementLoyerJustification || null,
    mentionsReferenceRent: form.mentionsReferenceRent,
    mentionsMaxRent: form.mentionsMaxRent,
    dpeClass: form.dpeClass ? (form.dpeClass as DPEClass) : null,
    depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : null,
    agencyFees: form.agencyFees ? parseFloat(form.agencyFees) : null,
    leaseType: form.leaseType ? (form.leaseType as LeaseType) : null,
    leaseDuration: form.leaseDuration ? parseInt(form.leaseDuration, 10) : null,
    clauseText: form.clauseText || null,
  });

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    const leaseData = buildLeaseData();

    if (form.clauseText.trim()) {
      // Run clause analysis via API
      setClauseLoading(true);
      try {
        const response = await fetch('/api/parse-lease', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: form.clauseText, mode: 'clauses_only' }),
        });

        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let buffer = '';
          let clauseIssues: ComplianceIssue[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const event = JSON.parse(trimmed);
                if (event.step === 'done' && event.clauseIssues) {
                  clauseIssues = event.clauseIssues;
                }
              } catch {
                // skip malformed
              }
            }
          }

          if (buffer.trim()) {
            try {
              const event = JSON.parse(buffer.trim());
              if (event.step === 'done' && event.clauseIssues) {
                clauseIssues = event.clauseIssues;
              }
            } catch {
              // ignore
            }
          }

          onSubmit(leaseData, clauseIssues);
        } else {
          onSubmit(leaseData);
        }
      } catch {
        // If clause analysis fails, still submit without it
        onSubmit(leaseData);
      } finally {
        setClauseLoading(false);
      }
    } else {
      onSubmit(leaseData);
    }
  };

  const fieldClass = (field: string) =>
    errors[field] ? 'border-red-500' : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">Saisie manuelle</h2>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === step;
          const isComplete = idx < step;
          return (
            <div key={s.label} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (idx < step) setStep(idx);
                }}
                disabled={idx > step}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : isComplete
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && <div className="w-2" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Property */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Le logement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wiz-address">Adresse du logement</Label>
              <AddressAutocomplete
                id="wiz-address"
                value={form.address}
                onChange={(v) => updateField('address', v)}
                onSelect={handleAddressSelect}
                className={fieldClass('address')}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wiz-surface">Surface habitable (m²)</Label>
                <Input
                  id="wiz-surface"
                  type="number"
                  step="0.01"
                  min="1"
                  value={form.surface}
                  onChange={(e) => updateField('surface', e.target.value)}
                  placeholder="35"
                  className={fieldClass('surface')}
                />
                {errors.surface && <p className="text-red-500 text-xs mt-1">{errors.surface}</p>}
              </div>
              <div>
                <Label htmlFor="wiz-rooms">Nombre de pièces</Label>
                <Select
                  id="wiz-rooms"
                  value={form.numberOfRooms}
                  onChange={(e) => updateField('numberOfRooms', e.target.value)}
                >
                  <option value="1">1 pièce</option>
                  <option value="2">2 pièces</option>
                  <option value="3">3 pièces</option>
                  <option value="4">4 pièces et plus</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="wiz-period">Époque de construction</Label>
              <Select
                id="wiz-period"
                value={form.constructionPeriod}
                onChange={(e) => updateField('constructionPeriod', e.target.value)}
                className={fieldClass('constructionPeriod')}
              >
                <option value="">Sélectionner...</option>
                {CONSTRUCTION_PERIODS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
              {errors.constructionPeriod && <p className="text-red-500 text-xs mt-1">{errors.constructionPeriod}</p>}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="wiz-furnished"
                checked={form.furnished}
                onChange={(e) => updateField('furnished', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="wiz-furnished" className="cursor-pointer">Logement meublé</Label>
            </div>

            <div>
              <Label htmlFor="wiz-dpe">Classe DPE (si connue)</Label>
              <Select
                id="wiz-dpe"
                value={form.dpeClass}
                onChange={(e) => updateField('dpeClass', e.target.value)}
              >
                <option value="">Non renseigné</option>
                {DPE_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Financial */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations financières</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wiz-rent">Loyer hors charges (€/mois)</Label>
                <Input
                  id="wiz-rent"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.rentExcludingCharges}
                  onChange={(e) => updateField('rentExcludingCharges', e.target.value)}
                  placeholder="850"
                  className={fieldClass('rentExcludingCharges')}
                />
                {errors.rentExcludingCharges && <p className="text-red-500 text-xs mt-1">{errors.rentExcludingCharges}</p>}
              </div>
              <div>
                <Label htmlFor="wiz-charges">Charges (€/mois)</Label>
                <Input
                  id="wiz-charges"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.charges}
                  onChange={(e) => updateField('charges', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wiz-deposit">Dépôt de garantie (€)</Label>
                <Input
                  id="wiz-deposit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.depositAmount}
                  onChange={(e) => updateField('depositAmount', e.target.value)}
                  placeholder="850"
                />
              </div>
              <div>
                <Label htmlFor="wiz-fees">Honoraires d&apos;agence (€)</Label>
                <Input
                  id="wiz-fees"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.agencyFees}
                  onChange={(e) => updateField('agencyFees', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wiz-complement">Complément de loyer (€/mois)</Label>
                <Input
                  id="wiz-complement"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.complementLoyer}
                  onChange={(e) => updateField('complementLoyer', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="wiz-justification">Justification</Label>
                <Input
                  id="wiz-justification"
                  value={form.complementLoyerJustification}
                  onChange={(e) => updateField('complementLoyerJustification', e.target.value)}
                  placeholder="Terrasse, vue..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Lease details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Détails du bail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wiz-startdate">Date de début du bail</Label>
                <Input
                  id="wiz-startdate"
                  type="date"
                  value={form.leaseStartDate}
                  onChange={(e) => updateField('leaseStartDate', e.target.value)}
                  className={fieldClass('leaseStartDate')}
                />
                {errors.leaseStartDate && <p className="text-red-500 text-xs mt-1">{errors.leaseStartDate}</p>}
              </div>
              <div>
                <Label htmlFor="wiz-duration">Durée du bail (mois)</Label>
                <Input
                  id="wiz-duration"
                  type="number"
                  min="1"
                  value={form.leaseDuration}
                  onChange={(e) => updateField('leaseDuration', e.target.value)}
                  placeholder="36"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="wiz-leasetype">Type de bail</Label>
              <Select
                id="wiz-leasetype"
                value={form.leaseType}
                onChange={(e) => updateField('leaseType', e.target.value)}
              >
                <option value="">Non renseigné</option>
                {LEASE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Le bail mentionne-t-il le loyer de référence ?</Label>
              <div className="flex gap-4 mt-2">
                {([
                  { value: true, label: 'Oui' },
                  { value: false, label: 'Non' },
                  { value: null, label: 'Je ne sais pas' },
                ] as const).map((opt) => (
                  <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wiz-refrent"
                      checked={form.mentionsReferenceRent === opt.value}
                      onChange={() => updateField('mentionsReferenceRent', opt.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Le bail mentionne-t-il le loyer de référence majoré ?</Label>
              <div className="flex gap-4 mt-2">
                {([
                  { value: true, label: 'Oui' },
                  { value: false, label: 'Non' },
                  { value: null, label: 'Je ne sais pas' },
                ] as const).map((opt) => (
                  <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wiz-maxrent"
                      checked={form.mentionsMaxRent === opt.value}
                      onChange={() => updateField('mentionsMaxRent', opt.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Clause analysis (optional) */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analyse des clauses (optionnel)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Collez ici le texte de votre bail pour détecter d&apos;éventuelles clauses abusives ou illégales.
              Cette étape est facultative.
            </p>

            <textarea
              value={form.clauseText}
              onChange={(e) => updateField('clauseText', e.target.value)}
              rows={8}
              maxLength={MAX_CLAUSE_TEXT_LENGTH}
              placeholder="Collez ici le texte de votre bail..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {form.clauseText.length.toLocaleString()} / {MAX_CLAUSE_TEXT_LENGTH.toLocaleString()} caractères
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Le texte est analysé uniquement pour cette vérification et n&apos;est pas conservé.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={handlePrev} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext} className="flex-1">
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={clauseLoading}
            className="flex-1"
          >
            {clauseLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Analyse en cours...
              </span>
            ) : (
              'Vérifier mon loyer'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
