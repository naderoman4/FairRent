import { Suspense } from 'react';
import { requireAuth, getUserProfile, getUserCredits } from '@/lib/auth';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PurchaseSuccess } from '@/components/credits/PurchaseSuccess';
import { Coins } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord',
};

const roleLabels: Record<string, string> = {
  tenant: 'Locataire',
  landlord: 'Propriétaire',
  agency: 'Agence',
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);
  const credits = await getUserCredits(user.id, profile?.team_id ?? null);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Purchase success banner */}
      <Suspense fallback={null}>
        <PurchaseSuccess />
      </Suspense>

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour{profile?.full_name ? `, ${profile.full_name}` : ''} !
        </h1>
        <p className="text-muted-foreground mt-1">
          {roleLabels[profile?.role ?? 'tenant']} — Votre tableau de bord FairRent
        </p>
      </div>

      {/* Credits card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Crédits disponibles</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{credits}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <Coins className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        {credits <= 1 && (
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">
            Il vous reste {credits} crédit{credits !== 1 ? 's' : ''}. Rechargez pour continuer à utiliser FairRent.
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <QuickActions />
      </div>
    </div>
  );
}
