'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import type { ComplianceReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#1e40af' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label: { color: '#444' },
  value: { fontWeight: 'bold' },
  verdictCompliant: { backgroundColor: '#dcfce7', padding: 12, borderRadius: 6, marginBottom: 16 },
  verdictWarning: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 6, marginBottom: 16 },
  verdictViolation: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 6, marginBottom: 16 },
  verdictText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  issue: { marginBottom: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 4 },
  issueTitle: { fontWeight: 'bold', marginBottom: 2 },
  issueDesc: { color: '#444', marginBottom: 2 },
  issueRef: { fontSize: 8, color: '#999' },
  action: { marginBottom: 8 },
  actionTitle: { fontWeight: 'bold' },
  actionDesc: { color: '#444', marginTop: 2 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999' },
});

function ReportDocument({ report }: { report: ComplianceReport }) {
  const verdictLabels = {
    compliant: 'Conforme',
    warning: 'Points d\'attention',
    violation: 'Dépassement du loyer',
  };
  const verdictStyle =
    report.verdict === 'compliant'
      ? styles.verdictCompliant
      : report.verdict === 'warning'
        ? styles.verdictWarning
        : styles.verdictViolation;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FairRent — Rapport de conformité</Text>
          <Text style={styles.subtitle}>
            Généré le {new Date(report.generatedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        <View style={verdictStyle}>
          <Text style={styles.verdictText}>{verdictLabels[report.verdict]}</Text>
          {report.overchargeTotal && report.overchargeTotal > 0 && (
            <Text style={{ textAlign: 'center', marginTop: 4 }}>
              Trop-perçu estimé : {report.overchargeTotal.toFixed(2)} €/mois
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparaison des loyers</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Votre loyer</Text>
            <Text style={styles.value}>{report.rentPerSqm.toFixed(2)} €/m² ({report.leaseData.rentExcludingCharges.toFixed(2)} €/mois)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Plafond légal</Text>
            <Text style={styles.value}>{report.maxLegalRentPerSqm.toFixed(2)} €/m² ({report.maxLegalRentTotal.toFixed(2)} €/mois)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Loyer de référence</Text>
            <Text>{report.rentReference.referenceRent.toFixed(2)} €/m²</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quartier</Text>
            <Text>{report.quartier.name} ({report.quartier.arrondissement}e arr.)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Surface</Text>
            <Text>{report.leaseData.surface} m²</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Période</Text>
            <Text>{report.rentReference.constructionPeriod}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Année de référence</Text>
            <Text>{report.rentReference.year}</Text>
          </View>
        </View>

        {report.issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Points relevés</Text>
            {report.issues.map((issue, i) => (
              <View key={i} style={styles.issue}>
                <Text style={styles.issueTitle}>
                  {issue.severity === 'illegal' ? '● ' : issue.severity === 'red_flag' ? '▲ ' : issue.severity === 'attention' ? '◆ ' : '✓ '}
                  {issue.title}
                </Text>
                <Text style={styles.issueDesc}>{issue.description}</Text>
                <Text style={styles.issueRef}>Réf. : {issue.legalReference}</Text>
              </View>
            ))}
          </View>
        )}

        {report.actions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Que faire ?</Text>
            {report.actions.map((action, i) => (
              <View key={i} style={styles.action}>
                <Text style={styles.actionTitle}>{i + 1}. {action.title}</Text>
                <Text style={styles.actionDesc}>{action.description}</Text>
                {action.url && <Text style={{ fontSize: 8, color: '#2563eb', marginTop: 1 }}>{action.url}</Text>}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          FairRent — Outil informatif, ne constitue pas un avis juridique. Données : opendata.paris.fr
        </Text>
      </Page>
    </Document>
  );
}

export default function ReportPDFContent({ report }: { report: ComplianceReport }) {
  return (
    <PDFDownloadLink
      document={<ReportDocument report={report} />}
      fileName="fairrent-rapport.pdf"
      className="flex-1"
    >
      {({ loading }) => (
        <Button variant="default" className="w-full" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Préparation...' : 'Télécharger le rapport PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
