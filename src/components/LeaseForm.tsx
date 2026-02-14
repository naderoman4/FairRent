'use client';

import { useState } from 'react';
import type { LeaseData, ConstructionPeriod, DPEClass } from '@/lib/types';
import { CONSTRUCTION_PERIODS, DPE_CLASSES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface LeaseFormProps {
  initialData: Partial<LeaseData> | null;
  confidence: Record<string, number>;
  onSubmit: (data: LeaseData) => void;
  onBack: () => void;
}

function isLowConfidence(field: string, confidence: Record<string, number>): boolean {
  return confidence[field] !== undefined && confidence[field] < 0.7;
}

export function LeaseForm({ initialData, confidence, onSubmit, onBack }: LeaseFormProps) {
  const [form, setForm] = useState({
    address: initialData?.address ?? '',
    postalCode: initialData?.postalCode ?? '',
    city: initialData?.city ?? 'Paris',
    rentExcludingCharges: initialData?.rentExcludingCharges?.toString() ?? '',
    charges: initialData?.charges?.toString() ?? '',
    surface: initialData?.surface?.toString() ?? '',
    numberOfRooms: initialData?.numberOfRooms?.toString() ?? '1',
    furnished: initialData?.furnished ?? false,
    constructionPeriod: initialData?.constructionPeriod ?? ('' as string),
    leaseStartDate: initialData?.leaseStartDate ?? '',
    complementLoyer: initialData?.complementLoyer?.toString() ?? '',
    complementLoyerJustification: initialData?.complementLoyerJustification ?? '',
    mentionsReferenceRent: initialData?.mentionsReferenceRent ?? null,
    mentionsMaxRent: initialData?.mentionsMaxRent ?? null,
    dpeClass: initialData?.dpeClass ?? ('' as string),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.address.trim()) newErrors.address = 'Adresse requise';
    if (!form.postalCode.trim()) newErrors.postalCode = 'Code postal requis';
    if (!form.rentExcludingCharges || parseFloat(form.rentExcludingCharges) <= 0)
      newErrors.rentExcludingCharges = 'Loyer requis et supérieur à 0';
    if (!form.surface || parseFloat(form.surface) <= 0)
      newErrors.surface = 'Surface requise et supérieure à 0';
    if (!form.constructionPeriod)
      newErrors.constructionPeriod = 'Période de construction requise';
    if (!form.leaseStartDate)
      newErrors.leaseStartDate = 'Date de début du bail requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: LeaseData = {
      address: form.address.trim(),
      postalCode: form.postalCode.trim(),
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
    };

    onSubmit(data);
  };

  const fieldClass = (field: string) =>
    `${errors[field] ? 'border-red-500' : ''} ${isLowConfidence(field, confidence) ? 'border-amber-400 bg-amber-50' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">Informations du bail</h2>
      </div>

      {Object.keys(confidence).length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Les champs surlignés en orange n&apos;ont pas pu être extraits avec certitude. Veuillez les vérifier.</span>
        </div>
      )}

      {/* Le logement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Le logement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="12 Rue de la Paix"
              className={fieldClass('address')}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                placeholder="75002"
                className={fieldClass('postalCode')}
              />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={form.city} disabled className="bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="surface">Surface habitable (m²)</Label>
              <Input
                id="surface"
                type="number"
                step="0.01"
                min="1"
                value={form.surface}
                onChange={(e) => updateField('surface', e.target.value)}
                placeholder="45"
                className={fieldClass('surface')}
              />
              {errors.surface && <p className="text-red-500 text-xs mt-1">{errors.surface}</p>}
            </div>
            <div>
              <Label htmlFor="numberOfRooms">Nombre de pièces</Label>
              <Select
                id="numberOfRooms"
                value={form.numberOfRooms}
                onChange={(e) => updateField('numberOfRooms', e.target.value)}
                className={fieldClass('numberOfRooms')}
              >
                <option value="1">1 pièce</option>
                <option value="2">2 pièces</option>
                <option value="3">3 pièces</option>
                <option value="4">4 pièces et plus</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="constructionPeriod">Époque de construction</Label>
            <Select
              id="constructionPeriod"
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
              id="furnished"
              checked={form.furnished}
              onChange={(e) => updateField('furnished', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="furnished" className="cursor-pointer">Logement meublé</Label>
          </div>

          <div>
            <Label htmlFor="dpeClass">Classe DPE (si connue)</Label>
            <Select
              id="dpeClass"
              value={form.dpeClass}
              onChange={(e) => updateField('dpeClass', e.target.value)}
              className={fieldClass('dpeClass')}
            >
              <option value="">Non renseigné</option>
              {DPE_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Le bail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Le bail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="leaseStartDate">Date de début du bail</Label>
            <Input
              id="leaseStartDate"
              type="date"
              value={form.leaseStartDate}
              onChange={(e) => updateField('leaseStartDate', e.target.value)}
              className={fieldClass('leaseStartDate')}
            />
            {errors.leaseStartDate && <p className="text-red-500 text-xs mt-1">{errors.leaseStartDate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rentExcludingCharges">Loyer hors charges (€/mois)</Label>
              <Input
                id="rentExcludingCharges"
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
              <Label htmlFor="charges">Charges (€/mois)</Label>
              <Input
                id="charges"
                type="number"
                step="0.01"
                min="0"
                value={form.charges}
                onChange={(e) => updateField('charges', e.target.value)}
                placeholder="50"
                className={fieldClass('charges')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="complementLoyer">Complément de loyer (€/mois)</Label>
              <Input
                id="complementLoyer"
                type="number"
                step="0.01"
                min="0"
                value={form.complementLoyer}
                onChange={(e) => updateField('complementLoyer', e.target.value)}
                placeholder="0"
                className={fieldClass('complementLoyer')}
              />
            </div>
            <div>
              <Label htmlFor="complementLoyerJustification">Justification</Label>
              <Input
                id="complementLoyerJustification"
                value={form.complementLoyerJustification}
                onChange={(e) => updateField('complementLoyerJustification', e.target.value)}
                placeholder="Terrasse, vue exceptionnelle..."
                className={fieldClass('complementLoyerJustification')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentions légales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mentions dans le bail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Le bail mentionne-t-il le loyer de référence ?</Label>
            <div className="flex gap-4 mt-2">
              {[
                { value: true, label: 'Oui' },
                { value: false, label: 'Non' },
                { value: null, label: 'Je ne sais pas' },
              ].map((opt) => (
                <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mentionsReferenceRent"
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
              {[
                { value: true, label: 'Oui' },
                { value: false, label: 'Non' },
                { value: null, label: 'Je ne sais pas' },
              ].map((opt) => (
                <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mentionsMaxRent"
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

      <Button type="submit" size="lg" className="w-full">
        Vérifier mon loyer
      </Button>
    </form>
  );
}
