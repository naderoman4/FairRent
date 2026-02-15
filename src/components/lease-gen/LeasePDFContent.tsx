'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { LeaseGenData } from '@/lib/types-lease-gen';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 24 },
  mainTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666', marginBottom: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '40%', color: '#444' },
  value: { width: '60%', fontWeight: 'bold' },
  paragraph: { marginBottom: 6, lineHeight: 1.5 },
  article: { marginBottom: 10 },
  articleTitle: { fontWeight: 'bold', marginBottom: 3 },
  articleBody: { lineHeight: 1.5, color: '#333' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 7, color: '#999' },
  disclaimer: { fontSize: 7, color: '#999', marginTop: 8, fontStyle: 'italic' },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  signatureBox: { width: '45%', borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 8 },
  signatureLabel: { fontSize: 9, color: '#666', textAlign: 'center' },
});

function LeaseDocument({ data }: { data: LeaseGenData }) {
  const { property, parties, financial, terms } = data;
  const totalRent = financial.rentExcludingCharges + financial.charges + (financial.complementLoyer || 0);

  const paymentLabels: Record<string, string> = {
    virement: 'virement bancaire',
    prelevement: 'prelevement automatique',
    cheque: 'cheque',
    especes: 'especes',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>CONTRAT DE LOCATION</Text>
          <Text style={styles.subtitle}>
            {property.furnished ? 'Logement meuble' : 'Logement non meuble'} — Loi du 6 juillet 1989
          </Text>
          <Text style={styles.subtitle}>
            Etabli le {new Date().toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {/* Article 1: Parties */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>Article 1 — Designation des parties</Text>
          <Text style={styles.articleBody}>
            Le bailleur : {parties.landlord.firstName} {parties.landlord.lastName}, demeurant au {parties.landlord.address}
            {parties.landlord.email ? `, email : ${parties.landlord.email}` : ''}
            {parties.landlord.phone ? `, tel : ${parties.landlord.phone}` : ''}
          </Text>
          <Text style={styles.articleBody}>
            Le locataire : {parties.tenant.firstName} {parties.tenant.lastName}, demeurant au {parties.tenant.address}
            {parties.tenant.email ? `, email : ${parties.tenant.email}` : ''}
            {parties.tenant.phone ? `, tel : ${parties.tenant.phone}` : ''}
          </Text>
          {parties.guarantor && (
            <Text style={styles.articleBody}>
              Le garant : {parties.guarantor.firstName} {parties.guarantor.lastName}, demeurant au {parties.guarantor.address}
            </Text>
          )}
        </View>

        {/* Article 2: Property */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>Article 2 — Objet du contrat</Text>
          <Text style={styles.articleBody}>
            Le bailleur loue au locataire le logement situe au {property.address}, {property.postalCode} {property.city}.
          </Text>
          <View style={{ marginTop: 4 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Surface habitable :</Text>
              <Text style={styles.value}>{property.surface} m2</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre de pieces :</Text>
              <Text style={styles.value}>{property.numberOfRooms}</Text>
            </View>
            {property.floor !== null && (
              <View style={styles.row}>
                <Text style={styles.label}>Etage :</Text>
                <Text style={styles.value}>{property.floor}{property.totalFloors ? ` / ${property.totalFloors}` : ''}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Periode de construction :</Text>
              <Text style={styles.value}>{property.constructionPeriod}</Text>
            </View>
            {property.dpeClass && (
              <View style={styles.row}>
                <Text style={styles.label}>Classe energetique (DPE) :</Text>
                <Text style={styles.value}>{property.dpeClass}</Text>
              </View>
            )}
          </View>
          {property.description && (
            <Text style={[styles.articleBody, { marginTop: 4 }]}>
              Description : {property.description}
            </Text>
          )}
        </View>

        {/* Article 3: Duration */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>Article 3 — Duree du bail</Text>
          <Text style={styles.articleBody}>
            Le present bail est consenti pour une duree de {terms.duration} an{terms.duration > 1 ? 's' : ''}, a compter du {new Date(terms.startDate).toLocaleDateString('fr-FR')}.
            Le bail se renouvelle par tacite reconduction pour la meme duree, sauf conge donne dans les conditions prevues par la loi.
          </Text>
        </View>

        {/* Article 4: Financial */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>Article 4 — Conditions financieres</Text>
          <View style={{ marginTop: 4 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Loyer mensuel hors charges :</Text>
              <Text style={styles.value}>{financial.rentExcludingCharges.toFixed(2)} EUR</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Provision pour charges :</Text>
              <Text style={styles.value}>{financial.charges.toFixed(2)} EUR</Text>
            </View>
            {financial.complementLoyer && financial.complementLoyer > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Complement de loyer :</Text>
                <Text style={styles.value}>{financial.complementLoyer.toFixed(2)} EUR</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Total mensuel :</Text>
              <Text style={styles.value}>{totalRent.toFixed(2)} EUR</Text>
            </View>
          </View>
          <Text style={[styles.articleBody, { marginTop: 4 }]}>
            Le loyer est payable le {financial.paymentDay} de chaque mois, par {paymentLabels[financial.paymentMethod]}.
          </Text>
          {financial.complementLoyer && financial.complementLoyerJustification && (
            <Text style={[styles.articleBody, { marginTop: 4 }]}>
              Justification du complement de loyer : {financial.complementLoyerJustification}
            </Text>
          )}
        </View>

        {/* Article 5: Deposit */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>Article 5 — Depot de garantie</Text>
          <Text style={styles.articleBody}>
            Le locataire verse un depot de garantie de {financial.depositAmount.toFixed(2)} EUR a la signature du present bail.
            Ce depot sera restitue dans un delai maximum de {property.furnished ? 'deux' : 'un'} mois apres la remise des cles, deduction faite des sommes restant dues.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le bailleur</Text>
            <Text style={[styles.signatureLabel, { marginTop: 2 }]}>
              {parties.landlord.firstName} {parties.landlord.lastName}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le locataire</Text>
            <Text style={[styles.signatureLabel, { marginTop: 2 }]}>
              {parties.tenant.firstName} {parties.tenant.lastName}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Document genere par FairRent — Outil informatif, ne constitue pas un avis juridique. Consultez un professionnel pour validation.
        </Text>
      </Page>

      {/* Page 2: Special conditions (if any) */}
      {terms.specialConditions && (
        <Page size="A4" style={styles.page}>
          <View style={styles.article}>
            <Text style={styles.articleTitle}>Article 6 — Conditions particulieres</Text>
            <Text style={styles.articleBody}>{terms.specialConditions}</Text>
          </View>

          <View style={styles.article}>
            <Text style={styles.articleTitle}>Mentions obligatoires</Text>
            <Text style={styles.articleBody}>
              Conformement a la loi du 6 juillet 1989 et au decret du 29 mai 2015, ce contrat respecte le modele type de contrat de location.
              Le logement est soumis a l&apos;encadrement des loyers en vigueur a Paris.
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            Ce document est un modele genere automatiquement. Il est recommande de le faire verifier par un professionnel du droit avant signature.
          </Text>

          <Text style={styles.footer}>
            Document genere par FairRent — Page 2
          </Text>
        </Page>
      )}
    </Document>
  );
}

interface Props {
  data: LeaseGenData;
}

export default function LeasePDFContent({ data }: Props) {
  const fileName = `bail-${data.property.address.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

  return (
    <PDFDownloadLink document={<LeaseDocument data={data} />} fileName={fileName}>
      {({ loading }) => (
        <Button className="w-full" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Préparation du PDF...' : 'Télécharger le bail PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
