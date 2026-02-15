// Database types for Supabase
// These types can be auto-generated later with `supabase gen types typescript`
// For now, manually maintained to match our migration schema

export type UserRole = 'tenant' | 'landlord' | 'agency';
export type TeamPlan = 'starter' | 'pro' | 'business';
export type TeamMemberRole = 'admin' | 'member';
export type CreditTransactionType = 'purchase' | 'use' | 'refund' | 'subscription_grant' | 'expiry';
export type LeaseStatus = 'draft' | 'generated' | 'downloaded';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  team_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  plan: TeamPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  api_key: string;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  invited_at: string;
  joined_at: string | null;
}

export interface Credits {
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  updated_at: string;
}

export interface TeamCredits {
  team_id: string;
  balance: number;
  monthly_allowance: number;
  total_used_this_period: number;
  period_start: string | null;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string | null;
  team_id: string | null;
  amount: number;
  type: CreditTransactionType;
  action: string | null;
  description: string | null;
  stripe_session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string | null;
  team_id: string | null;
  session_id: string | null;
  action: string;
  input_mode: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  model: string | null;
  estimated_cost_eur: number | null;
  referral_source: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SavedAnalysis {
  id: string;
  user_id: string;
  team_id: string | null;
  input_mode: string;
  input_summary: Record<string, unknown>;
  report: Record<string, unknown>;
  severity_counts: Record<string, number> | null;
  created_at: string;
}

export interface GeneratedLease {
  id: string;
  user_id: string;
  team_id: string | null;
  property_data: Record<string, unknown>;
  parties_data: Record<string, unknown>;
  financial_data: Record<string, unknown>;
  lease_terms: Record<string, unknown>;
  compliance_result: Record<string, unknown> | null;
  generated_content: Record<string, unknown> | null;
  status: LeaseStatus;
  created_at: string;
}

// Supabase Database type for typed client
export interface Database {
  public: {
    Views: {
      [_ in never]: never;
    };
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'api_key'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          api_key?: string;
        };
        Update: Partial<Omit<Team, 'id'>>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'invited_at'> & {
          id?: string;
          invited_at?: string;
        };
        Update: Partial<Omit<TeamMember, 'id'>>;
        Relationships: [];
      };
      credits: {
        Row: Credits;
        Insert: Omit<Credits, 'updated_at'> & { updated_at?: string };
        Update: Partial<Omit<Credits, 'user_id'>>;
        Relationships: [];
      };
      team_credits: {
        Row: TeamCredits;
        Insert: Omit<TeamCredits, 'updated_at'> & { updated_at?: string };
        Update: Partial<Omit<TeamCredits, 'team_id'>>;
        Relationships: [];
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CreditTransaction, 'id'>>;
        Relationships: [];
      };
      usage_logs: {
        Row: UsageLog;
        Insert: Omit<UsageLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UsageLog, 'id'>>;
        Relationships: [];
      };
      saved_analyses: {
        Row: SavedAnalysis;
        Insert: Omit<SavedAnalysis, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SavedAnalysis, 'id'>>;
        Relationships: [];
      };
      generated_leases: {
        Row: GeneratedLease;
        Insert: Omit<GeneratedLease, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<GeneratedLease, 'id'>>;
        Relationships: [];
      };
    };
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_action: string;
          p_description?: string;
        };
        Returns: boolean;
      };
      deduct_team_credits: {
        Args: {
          p_team_id: string;
          p_user_id: string;
          p_amount: number;
          p_action: string;
          p_description?: string;
        };
        Returns: boolean;
      };
      grant_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_stripe_session_id?: string;
        };
        Returns: void;
      };
    };
  };
}
