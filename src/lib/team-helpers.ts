import { createClient } from '@/lib/supabase/server';
import type { TeamMember, Profile } from '@/lib/supabase/types';

export interface TeamMemberWithProfile extends TeamMember {
  profile: Pick<Profile, 'email' | 'full_name'>;
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberWithProfile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('team_members')
    .select('*, profiles(email, full_name)')
    .eq('team_id', teamId);

  if (!data) return [];

  return (data as unknown as Array<TeamMember & { profiles: Pick<Profile, 'email' | 'full_name'> }>).map(
    (row) => ({
      ...row,
      profile: row.profiles,
    })
  );
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: 'admin' | 'member' = 'member'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, team_id')
    .eq('email', email)
    .single();

  if (!profile) {
    return { success: false, error: 'Aucun utilisateur trouvé avec cet e-mail.' };
  }

  const p = profile as { id: string; team_id: string | null };

  if (p.team_id) {
    return { success: false, error: 'Cet utilisateur appartient déjà à une équipe.' };
  }

  // Add to team
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: p.id, role } as Record<string, unknown>);

  if (memberError) {
    return { success: false, error: 'Erreur lors de l\'ajout.' };
  }

  // Update profile with team_id
  await supabase
    .from('profiles')
    .update({ team_id: teamId } as Record<string, unknown>)
    .eq('id', p.id);

  return { success: true };
}

export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  await supabase
    .from('profiles')
    .update({ team_id: null } as Record<string, unknown>)
    .eq('id', userId);

  return { success: true };
}

export async function getTeamCreditUsage(teamId: string): Promise<
  Array<{ userId: string; email: string; creditsUsed: number }>
> {
  const supabase = createClient();

  const { data } = await supabase
    .from('credit_transactions')
    .select('user_id, amount')
    .eq('team_id', teamId)
    .eq('type', 'use');

  if (!data) return [];

  // Aggregate by user
  const usageMap = new Map<string, number>();
  for (const row of data as Array<{ user_id: string; amount: number }>) {
    if (row.user_id) {
      usageMap.set(row.user_id, (usageMap.get(row.user_id) || 0) + Math.abs(row.amount));
    }
  }

  // Get emails
  const userIds = Array.from(usageMap.keys());
  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', userIds);

  const profileMap = new Map(
    ((profiles as Array<{ id: string; email: string }>) || []).map((p) => [p.id, p.email])
  );

  return userIds.map((userId) => ({
    userId,
    email: profileMap.get(userId) || 'inconnu',
    creditsUsed: usageMap.get(userId) || 0,
  }));
}
