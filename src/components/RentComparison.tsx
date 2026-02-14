import type { ComplianceReport } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RentComparisonProps {
  report: ComplianceReport;
}

export function RentComparison({ report }: RentComparisonProps) {
  const {
    rentPerSqm,
    maxLegalRentPerSqm,
    rentReference,
    quartier,
    leaseData,
  } = report;

  const rows = [
    {
      label: 'Votre loyer',
      perSqm: rentPerSqm,
      total: leaseData.rentExcludingCharges,
      highlight: rentPerSqm > maxLegalRentPerSqm ? 'text-red-600 font-semibold' : '',
    },
    {
      label: 'Plafond légal (réf. majoré)',
      perSqm: maxLegalRentPerSqm,
      total: maxLegalRentPerSqm * leaseData.surface,
      highlight: '',
    },
    {
      label: 'Loyer de référence',
      perSqm: rentReference.referenceRent,
      total: rentReference.referenceRent * leaseData.surface,
      highlight: 'text-muted-foreground',
    },
    {
      label: 'Loyer minoré',
      perSqm: rentReference.minRent,
      total: rentReference.minRent * leaseData.surface,
      highlight: 'text-muted-foreground',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparaison des loyers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground"></th>
                <th className="text-right py-2 font-medium text-muted-foreground">€/m²</th>
                <th className="text-right py-2 font-medium text-muted-foreground">€/mois</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className={`py-2 ${row.highlight}`}>{row.label}</td>
                  <td className={`text-right py-2 ${row.highlight}`}>{row.perSqm.toFixed(2)}</td>
                  <td className={`text-right py-2 ${row.highlight}`}>{row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
          <p>Quartier : <strong>{quartier.name}</strong> ({quartier.arrondissement}e arr.)</p>
          <p>Période : <strong>{rentReference.constructionPeriod}</strong></p>
          <p>Type : <strong>{leaseData.numberOfRooms} pièce{leaseData.numberOfRooms > 1 ? 's' : ''}</strong> — {leaseData.furnished ? 'meublé' : 'non meublé'}</p>
          <p>Surface : <strong>{leaseData.surface} m²</strong></p>
          <p>Année de référence : <strong>{rentReference.year}</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}
