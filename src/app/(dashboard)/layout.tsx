import { requireAuth, getUserProfile, getUserCredits } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { Team } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  if (!profile) {
    // Profile doesn't exist yet — this shouldn't happen, but handle gracefully
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  const credits = await getUserCredits(user.id, profile.team_id);

  // Get team plan if user belongs to a team
  let teamPlan: string | null = null;
  if (profile.team_id) {
    const supabase = createClient();
    const { data: team } = await supabase
      .from('teams')
      .select('plan')
      .eq('id', profile.team_id)
      .single();
    teamPlan = (team as Pick<Team, 'plan'> | null)?.plan ?? null;
  }

  return (
    <DashboardShell
      role={profile.role}
      credits={credits}
      teamPlan={teamPlan}
    >
      {children}
    </DashboardShell>
  );
}
