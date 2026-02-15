import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

// Get current authenticated user (returns null if not authenticated)
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Require authentication — redirects to login if not authenticated
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

// Get user profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data as Profile | null;
}

// Get user credits (individual or team)
export async function getUserCredits(userId: string, teamId: string | null): Promise<number> {
  const supabase = createClient();

  if (teamId) {
    const { data } = await supabase
      .from('team_credits')
      .select('balance')
      .eq('team_id', teamId)
      .single();
    return (data as { balance: number } | null)?.balance ?? 0;
  }

  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
  return (data as { balance: number } | null)?.balance ?? 0;
}
