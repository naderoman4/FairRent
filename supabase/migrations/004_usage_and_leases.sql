-- Usage logs (for cost tracking and analytics)
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id), -- NULL for anonymous tenants
  team_id UUID REFERENCES public.teams(id),
  session_id TEXT, -- for anonymous tracking
  action TEXT NOT NULL, -- 'quick_check', 'full_analysis', 'verify_landlord', 'generate_lease'
  input_mode TEXT, -- 'pdf', 'manual', 'paste', 'quick_check'
  tokens_input INT,
  tokens_output INT,
  model TEXT,
  estimated_cost_eur NUMERIC(10,6),
  referral_source TEXT, -- utm_source or ref parameter
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved analyses (for landlord/agency history)
CREATE TABLE public.saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  input_mode TEXT NOT NULL,
  input_summary JSONB NOT NULL, -- key extracted fields (address, rent, surface, etc.)
  report JSONB NOT NULL, -- full compliance report
  severity_counts JSONB, -- { illegal: 2, red_flag: 1, attention: 3, ok: 15 }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generated leases (for landlord/agency)
CREATE TABLE public.generated_leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  property_data JSONB NOT NULL, -- property info from the wizard
  parties_data JSONB NOT NULL, -- landlord + tenant info
  financial_data JSONB NOT NULL, -- rent, charges, deposit
  lease_terms JSONB NOT NULL, -- duration, dates, special conditions
  compliance_result JSONB, -- pre-generation compliance check result
  generated_content JSONB, -- generated text sections (special conditions, complement justification)
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'downloaded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_leases ENABLE ROW LEVEL SECURITY;

-- Usage logs: users see their own, team members see team logs
CREATE POLICY "Users can read own usage logs"
  ON public.usage_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Allow insert for usage logs (anonymous and authenticated)
CREATE POLICY "Anyone can insert usage logs"
  ON public.usage_logs FOR INSERT
  WITH CHECK (true);

-- Saved analyses: users see their own, team members see team analyses
CREATE POLICY "Users can read own analyses"
  ON public.saved_analyses FOR SELECT
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analyses"
  ON public.saved_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Generated leases: users see their own, team members see team leases
CREATE POLICY "Users can read own leases"
  ON public.generated_leases FOR SELECT
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own leases"
  ON public.generated_leases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leases"
  ON public.generated_leases FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX idx_saved_analyses_user_id ON public.saved_analyses(user_id);
CREATE INDEX idx_saved_analyses_team_id ON public.saved_analyses(team_id);
CREATE INDEX idx_saved_analyses_created_at ON public.saved_analyses(created_at DESC);
CREATE INDEX idx_generated_leases_user_id ON public.generated_leases(user_id);
CREATE INDEX idx_generated_leases_team_id ON public.generated_leases(team_id);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_stripe_session ON public.credit_transactions(stripe_session_id);
