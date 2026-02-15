import { requireAuth, getUserProfile } from '@/lib/auth';
import { getTeamMembers, getTeamCreditUsage } from '@/lib/team-helpers';
import { TeamMemberList } from '@/components/team/TeamMemberList';
import { InviteMemberForm } from '@/components/team/InviteMemberForm';
import { TeamCreditUsage } from '@/components/team/TeamCreditUsage';
import { createClient } from '@/lib/supabase/server';
import type { Team } from '@/lib/supabase/types';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Équipe',
};

export default async function EquipePage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  if (!profile?.team_id) {
    redirect('/dashboard');
  }

  // Get team info
  const supabase = createClient();
  const { data: teamData } = await supabase
    .from('teams')
    .select('*')
    .eq('id', profile.team_id)
    .single();

  const team = teamData as Team | null;
  if (!team || (team.plan === 'starter')) {
    redirect('/dashboard');
  }

  const members = await getTeamMembers(profile.team_id);
  const creditUsage = await getTeamCreditUsage(profile.team_id);

  const isOwner = team.owner_id === user.id;
  const canInvite = isOwner && members.length < team.max_members;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion d&apos;équipe</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {team.name} — Plan {team.plan.charAt(0).toUpperCase() + team.plan.slice(1)} — {members.length}/{team.max_members} membres
        </p>
      </div>

      {/* Members */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Membres ({members.length})</h2>
        <TeamMemberList
          members={members.map((m) => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role as 'admin' | 'member',
            profile: m.profile,
          }))}
          currentUserId={user.id}
          ownerId={team.owner_id}
        />
        {canInvite && <InviteMemberForm />}
        {isOwner && members.length >= team.max_members && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
            Limite de {team.max_members} membre{team.max_members > 1 ? 's' : ''} atteinte.
            Passez à un plan supérieur pour ajouter plus de membres.
          </p>
        )}
      </div>

      {/* Credit usage */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Utilisation des crédits</h2>
        <TeamCreditUsage usage={creditUsage} />
      </div>
    </div>
  );
}
