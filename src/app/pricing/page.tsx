import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PricingTabs } from '@/components/pricing/PricingTabs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs — FairRent',
  description:
    'Gratuit pour les locataires. Crédits à l\'unité pour les propriétaires. Abonnements mensuels pour les agences immobilières.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs adaptés à votre profil
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gratuit pour les locataires. Crédits flexibles pour les propriétaires. Forfaits mensuels pour les agences.
            </p>
          </div>

          <PricingTabs />
        </div>
      </main>
      <Footer />
    </div>
  );
}
