'use client';

import { useState } from 'react';
import type { ConstructionPeriod, LeaseData } from '@/lib/types';
import { CONSTRUCTION_PERIODS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AddressAutocomplete } from './AddressAutocomplete';
import { Search, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuickCheckResult {
  compliant: boolean;
  rentPerSqm: number;
  maxRentPerSqm: number;
  overchargeTotal: number | null;
  quartierName: string;
}

export function QuickCheck() {
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [rooms, setRooms] = useState('2');
  const [period, setPeriod] = useState<string>('');
  const [furnished, setFurnished] = useState(false);
  const [rent, setRent] = useState('');
  const [surface, setSurface] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [error, setError] = useState('');

  const handleAddressSelect = (addr: string, pc: string) => {
    setAddress(addr);
    setPostalCode(pc);
  };

  const handleCheck = async () => {
    if (!address || !rent || !surface || !period) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const leaseData: LeaseData = {
        address,
        postalCode: postalCode || '75001',
        city: 'Paris',
        rentExcludingCharges: parseFloat(rent),
        charges: null,
        surface: parseFloat(surface),
        numberOfRooms: parseInt(rooms, 10),
        furnished,
        constructionPeriod: period as ConstructionPeriod,
        leaseStartDate: new Date().toISOString().split('T')[0],
        complementLoyer: null,
        complementLoyerJustification: null,
        mentionsReferenceRent: null,
        mentionsMaxRent: null,
        dpeClass: null,
        depositAmount: null,
        agencyFees: null,
        leaseType: null,
        leaseDuration: null,
        clauseText: null,
      };

      const response = await fetch('/api/check-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseData }),
      });
      const data = await response.json();

      if (data.success && data.report) {
        setResult({
          compliant: data.report.verdict === 'compliant',
          rentPerSqm: data.report.rentPerSqm,
          maxRentPerSqm: data.report.maxLegalRentPerSqm,
          overchargeTotal: data.report.overchargeTotal,
          quartierName: data.report.quartier.name,
        });
      } else {
        setError(data.error || 'Erreur lors de la vérification.');
      }
    } catch {
      setError('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Vérification rapide du loyer</h3>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="qc-address">Adresse du logement</Label>
              <AddressAutocomplete
                id="qc-address"
                value={address}
                onChange={setAddress}
                onSelect={handleAddressSelect}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="qc-rooms">Pièces</Label>
                <Select id="qc-rooms" value={rooms} onChange={(e) => setRooms(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="qc-period">Époque</Label>
                <Select id="qc-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="">Choisir...</option>
                  {CONSTRUCTION_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="qc-rent">Loyer HC (€)</Label>
                <Input
                  id="qc-rent"
                  type="number"
                  min="0"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="850"
                />
              </div>
              <div>
                <Label htmlFor="qc-surface">Surface (m²)</Label>
                <Input
                  id="qc-surface"
                  type="number"
                  min="1"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="35"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="qc-furnished"
                checked={furnished}
                onChange={(e) => setFurnished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="qc-furnished" className="cursor-pointer text-sm">Meublé</Label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button onClick={handleCheck} disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Vérification...
                </span>
              ) : (
                'Vérifier mon loyer'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 text-center ${result.compliant ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {result.compliant ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span className={`font-bold text-lg ${result.compliant ? 'text-green-800' : 'text-red-800'}`}>
                  {result.compliant ? 'Loyer conforme' : 'Loyer au-dessus du plafond'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Votre loyer : {result.rentPerSqm.toFixed(2)} €/m² — Plafond : {result.maxRentPerSqm.toFixed(2)} €/m²
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Quartier : {result.quartierName}
              </p>
              {result.overchargeTotal && result.overchargeTotal > 0 && (
                <p className="text-red-700 font-semibold mt-2">
                  Trop-perçu estimé : {result.overchargeTotal.toFixed(2)} €/mois
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                Nouvelle vérification
              </Button>
              <Button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1"
              >
                Analyse complète
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
