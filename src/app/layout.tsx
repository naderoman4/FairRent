import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FairRent — Votre loyer est-il légal ?',
    template: '%s | FairRent',
  },
  description:
    'Vérifiez gratuitement si votre loyer respecte l\'encadrement des loyers à Paris. Importez votre bail ou remplissez le formulaire pour un résultat instantané.',
  keywords: [
    'encadrement des loyers',
    'Paris',
    'loyer',
    'bail',
    'vérification loyer',
    'plafond loyer paris',
    'clauses abusives bail',
    'droit locataire',
  ],
  openGraph: {
    title: 'FairRent — Votre loyer est-il légal ?',
    description: 'Vérifiez gratuitement si votre loyer respecte l\'encadrement des loyers à Paris.',
    locale: 'fr_FR',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'FairRent',
  description: 'Vérificateur d\'encadrement des loyers à Paris',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
