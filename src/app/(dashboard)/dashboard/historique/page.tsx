import { requireAuth, getUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { SavedAnalysis } from '@/lib/supabase/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileSearch, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Historique',
};

export default async function HistoriquePage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  const supabase = createClient();

  // Fetch user's analyses (or team's if belongs to a team)
  let query = supabase
    .from('saved_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (profile?.team_id) {
    query = query.eq('team_id', profile.team_id);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data } = await query;
  const analyses = (data as SavedAnalysis[] | null) ?? [];

  const verdictLabels: Record<string, { label: string; className: string }> = {
    compliant: { label: 'Conforme', className: 'bg-green-100 text-green-800' },
    warning: { label: 'Attention', className: 'bg-amber-100 text-amber-800' },
    violation: { label: 'Non conforme', className: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historique des analyses</h1>

      {analyses.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center space-y-4">
          <Clock className="h-10 w-10 text-gray-300 mx-auto" />
          <p className="text-muted-foreground">Aucune analyse pour le moment.</p>
          <Link
            href="/dashboard/verifier"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <FileSearch className="h-4 w-4" />
            Vérifier un bail
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Adresse</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Loyer</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Verdict</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => {
                const summary = analysis.input_summary as { address?: string; rent?: number };
                const report = analysis.report as unknown as { verdict?: string };
                const verdict = verdictLabels[report?.verdict ?? ''] ?? {
                  label: '—',
                  className: 'bg-gray-100 text-gray-600',
                };

                return (
                  <tr key={analysis.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {summary?.address || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {summary?.rent ? `${summary.rent} EUR` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${verdict.className}`}>
                        {verdict.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/verifier/${analysis.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
