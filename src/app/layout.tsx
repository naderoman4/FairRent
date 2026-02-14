import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FairRent — Votre loyer est-il légal ?',
  description:
    'Vérifiez gratuitement si votre loyer respecte l\'encadrement des loyers à Paris. Importez votre bail ou remplissez le formulaire pour un résultat instantané.',
  keywords: ['encadrement des loyers', 'Paris', 'loyer', 'bail', 'vérification'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
