'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  credits: number;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: 'landlord' | 'agency') => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    const p = data as Profile | null;
    setProfile(p);
    return p;
  }, [supabase]);

  const fetchCredits = useCallback(async (userId: string, teamId: string | null) => {
    if (teamId) {
      const { data } = await supabase
        .from('team_credits')
        .select('balance')
        .eq('team_id', teamId)
        .single();
      setCredits((data as { balance: number } | null)?.balance ?? 0);
    } else {
      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single();
      setCredits((data as { balance: number } | null)?.balance ?? 0);
    }
  }, [supabase]);

  const refreshCredits = useCallback(async () => {
    if (user) {
      await fetchCredits(user.id, profile?.team_id ?? null);
    }
  }, [user, profile?.team_id, fetchCredits]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) {
        await fetchCredits(user.id, p.team_id);
      }
    }
  }, [user, fetchProfile, fetchCredits]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        if (p) {
          await fetchCredits(currentUser.id, p.team_id);
        }
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const p = await fetchProfile(currentUser.id);
          if (p) {
            await fetchCredits(currentUser.id, p.team_id);
          }
        } else {
          setProfile(null);
          setCredits(0);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, fetchCredits]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, role: 'landlord' | 'agency') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) return { error: error.message };

    // Create profile if signup succeeded
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          role,
        } as Record<string, unknown>);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: 'Erreur lors de la création du profil.' };
      }

      // Initialize empty credits row for landlords
      if (role === 'landlord') {
        await supabase.from('credits').insert({
          user_id: data.user.id,
          balance: 0,
          total_purchased: 0,
          total_used: 0,
        } as Record<string, unknown>);
      }
    }

    return { error: null };
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCredits(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        credits,
        loading,
        signIn,
        signUp,
        signInWithMagicLink,
        signOut,
        refreshCredits,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
