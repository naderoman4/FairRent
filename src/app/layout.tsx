import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = 'https://fair-rent-seven.vercel.app';

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
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FairRent — Votre loyer est-il légal ?',
    description: 'Vérifiez gratuitement si votre loyer respecte l\'encadrement des loyers à Paris.',
    url: SITE_URL,
    siteName: 'FairRent',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FairRent — Votre loyer est-il légal ?',
    description: 'Vérifiez gratuitement si votre loyer respecte l\'encadrement des loyers à Paris.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FairRent',
    url: SITE_URL,
    description: 'Outil gratuit de vérification de l\'encadrement des loyers à Paris. Vérifiez si votre loyer respecte les plafonds légaux, détectez les clauses abusives et obtenez un rapport de conformité.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Vérification du loyer vs plafond légal par quartier',
      'Analyse des clauses abusives du bail',
      'Vérification du dépôt de garantie et frais d\'agence',
      'Vérification du DPE et de la décence du logement',
      'Import PDF, saisie manuelle ou copier-coller',
      'Rapport de conformité détaillé',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Locataires à Paris',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FairRent',
    url: SITE_URL,
    description: 'Vérificateur d\'encadrement des loyers à Paris',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
      </head>
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
