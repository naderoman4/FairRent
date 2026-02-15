import { requireAuth, getUserProfile } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paramètres',
};

export default async function SettingsPage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  const roleLabels: Record<string, string> = {
    tenant: 'Locataire',
    landlord: 'Propriétaire',
    agency: 'Agence',
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Profil</h2>
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Adresse e-mail</p>
            <p className="text-sm font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nom complet</p>
            <p className="text-sm font-medium">{profile?.full_name || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type de compte</p>
            <p className="text-sm font-medium">{roleLabels[profile?.role ?? 'tenant']}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Membre depuis</p>
            <p className="text-sm font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
