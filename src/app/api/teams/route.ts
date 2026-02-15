import { NextResponse } from 'next/server';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { inviteTeamMember, removeTeamMember } from '@/lib/team-helpers';
import type { Profile } from '@/lib/supabase/types';

// POST /api/teams — Invite a member
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  if (!profile?.team_id) {
    return NextResponse.json({ error: 'Pas d\'équipe' }, { status: 400 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'E-mail requis' }, { status: 400 });
  }

  const result = await inviteTeamMember(profile.team_id, email);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/teams — Remove a member
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id) as Profile | null;
  if (!profile?.team_id) {
    return NextResponse.json({ error: 'Pas d\'équipe' }, { status: 400 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
  }

  // Only team owner can remove members
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const { data: team } = await supabase
    .from('teams')
    .select('owner_id')
    .eq('id', profile.team_id)
    .single();

  if ((team as { owner_id: string } | null)?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Seul le propriétaire peut retirer des membres' }, { status: 403 });
  }

  const result = await removeTeamMember(profile.team_id, userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
