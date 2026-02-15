'use client';

import { useState, useEffect } from 'react';
import { PropertyStep } from './PropertyStep';
import { PartiesStep } from './PartiesStep';
import { FinancialStep } from './FinancialStep';
import { TermsStep } from './TermsStep';
import { ReviewStep } from './ReviewStep';
import type { LeaseGenData, PropertyData, PartiesData, FinancialData, LeaseTerms } from '@/lib/types-lease-gen';

interface Props {
  onGenerate: (data: LeaseGenData) => Promise<void>;
  isGenerating: boolean;
}

const defaultProperty: PropertyData = {
  address: '',
  postalCode: '',
  city: 'Paris',
  surface: 0,
  numberOfRooms: 1,
  furnished: false,
  constructionPeriod: 'Apres 1990',
  dpeClass: null,
  floor: null,
  totalFloors: null,
  description: '',
};

const defaultParty = { firstName: '', lastName: '', address: '', email: '', phone: '' };

const defaultParties: PartiesData = {
  landlord: { ...defaultParty },
  tenant: { ...defaultParty },
  guarantor: null,
};

const defaultFinancial: FinancialData = {
  rentExcludingCharges: 0,
  charges: 0,
  depositAmount: 0,
  complementLoyer: null,
  complementLoyerJustification: null,
  paymentDay: 1,
  paymentMethod: 'virement',
};

const defaultTerms: LeaseTerms = {
  startDate: '',
  duration: 3,
  specialConditions: '',
};

const stepLabels = ['Logement', 'Parties', 'Finances', 'Conditions', 'Récapitulatif'];

export function LeaseGenWizard({ onGenerate, isGenerating }: Props) {
  const [step, setStep] = useState(0);
  const [property, setProperty] = useState<PropertyData>(defaultProperty);
  const [parties, setParties] = useState<PartiesData>(defaultParties);
  const [financial, setFinancial] = useState<FinancialData>(defaultFinancial);
  const [terms, setTerms] = useState<LeaseTerms>(defaultTerms);
  const [suggestedMaxRent, setSuggestedMaxRent] = useState<number | null>(null);
  const [complianceWarnings, setComplianceWarnings] = useState<string[]>([]);

  // Fetch rent reference when property step is completed
  useEffect(() => {
    if (step >= 2 && property.address && property.postalCode) {
      fetchRentSuggestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const fetchRentSuggestion = async () => {
    try {
      const res = await fetch('/api/check-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseData: {
            address: property.address,
            postalCode: property.postalCode,
            city: property.city,
            rentExcludingCharges: 0,
            charges: null,
            surface: property.surface,
            numberOfRooms: property.numberOfRooms,
            furnished: property.furnished,
            constructionPeriod: property.constructionPeriod,
            leaseStartDate: terms.startDate || new Date().toISOString().slice(0, 10),
            complementLoyer: null,
            complementLoyerJustification: null,
            mentionsReferenceRent: null,
            mentionsMaxRent: null,
            dpeClass: property.dpeClass,
            depositAmount: null,
            agencyFees: null,
            leaseType: null,
            leaseDuration: null,
            clauseText: null,
          },
        }),
      });
      const data = await res.json();
      if (data.report?.maxLegalRentTotal) {
        setSuggestedMaxRent(data.report.maxLegalRentTotal);
      }
    } catch {
      // Non-blocking — just won't show suggestion
    }
  };

  // Compute compliance warnings for review step
  useEffect(() => {
    if (step === 4) {
      const warnings: string[] = [];
      const maxDeposit = property.furnished
        ? financial.rentExcludingCharges * 2
        : financial.rentExcludingCharges;

      if (suggestedMaxRent && financial.rentExcludingCharges > suggestedMaxRent) {
        warnings.push(
          `Le loyer (${financial.rentExcludingCharges} EUR) dépasse le plafond de référence majoré (${suggestedMaxRent.toFixed(2)} EUR).`
        );
      }
      if (financial.depositAmount > maxDeposit) {
        warnings.push(
          `Le dépôt de garantie (${financial.depositAmount} EUR) dépasse le maximum légal (${maxDeposit} EUR).`
        );
      }
      if (property.dpeClass === 'G') {
        warnings.push('Un logement classé DPE G ne peut plus être loué depuis janvier 2025.');
      }
      if (property.surface < 9) {
        warnings.push('La surface est inférieure au minimum légal de 9 m².');
      }
      const minDuration = property.furnished ? 1 : 3;
      if (terms.duration < minDuration) {
        warnings.push(
          `La durée du bail (${terms.duration} an${terms.duration > 1 ? 's' : ''}) est inférieure au minimum légal (${minDuration} an${minDuration > 1 ? 's' : ''}).`
        );
      }
      setComplianceWarnings(warnings);
    }
  }, [step, property, financial, terms, suggestedMaxRent]);

  const data: LeaseGenData = { property, parties, financial, terms };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${
                i === step
                  ? 'bg-primary text-white'
                  : i < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? '\u2713' : i + 1}
            </div>
            <span className={`ml-1.5 text-xs hidden sm:inline ${
              i === step ? 'text-gray-900 font-medium' : 'text-muted-foreground'
            }`}>
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <PropertyStep data={property} onChange={setProperty} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <PartiesStep
          data={parties}
          onChange={setParties}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <FinancialStep
          data={financial}
          onChange={setFinancial}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          suggestedMaxRent={suggestedMaxRent}
          furnished={property.furnished}
        />
      )}
      {step === 3 && (
        <TermsStep
          data={terms}
          onChange={setTerms}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          furnished={property.furnished}
        />
      )}
      {step === 4 && (
        <ReviewStep
          data={data}
          complianceWarnings={complianceWarnings}
          onGenerate={() => onGenerate(data)}
          onBack={() => setStep(3)}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
