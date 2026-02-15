import { requireAuth, getUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AnalysisReportView } from '@/components/dashboard/AnalysisReportView';
import type { SavedAnalysis } from '@/lib/supabase/types';
import type { ComplianceReport as ReportType } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function AnalysisDetailPage({ params }: Props) {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  const supabase = createClient();
  const { data } = await supabase
    .from('saved_analyses')
    .select('*')
    .eq('id', params.id)
    .single();

  const analysis = data as SavedAnalysis | null;

  if (!analysis || (analysis.user_id !== user.id && analysis.team_id !== profile?.team_id)) {
    notFound();
  }

  const report = analysis.report as unknown as ReportType;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/historique"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Résultat d&apos;analyse</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <AnalysisReportView report={report} />
    </div>
  );
}
