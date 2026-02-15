-- Individual credits (for landlords)
CREATE TABLE public.credits (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased INT NOT NULL DEFAULT 0,
  total_used INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team credits (for agencies)
CREATE TABLE public.team_credits (
  team_id UUID PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  monthly_allowance INT NOT NULL DEFAULT 0,
  total_used_this_period INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit transaction log
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  amount INT NOT NULL, -- positive = credit, negative = debit
  type TEXT NOT NULL CHECK (type IN ('purchase', 'use', 'refund', 'subscription_grant', 'expiry')),
  action TEXT, -- 'verify', 'generate', etc.
  description TEXT,
  stripe_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Atomic credit deduction for individual users
-- Returns true if deduction succeeded, false if insufficient balance
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INT,
  p_action TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INT;
BEGIN
  -- Lock the row to prevent concurrent modifications
  SELECT balance INTO v_balance
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user has enough credits
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE public.credits
  SET balance = balance - p_amount,
      total_used = total_used + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Log the transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, action, description)
  VALUES (p_user_id, -p_amount, 'use', p_action, p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic credit deduction for teams
CREATE OR REPLACE FUNCTION public.deduct_team_credits(
  p_team_id UUID,
  p_user_id UUID,
  p_amount INT,
  p_action TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT balance INTO v_balance
  FROM public.team_credits
  WHERE team_id = p_team_id
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.team_credits
  SET balance = balance - p_amount,
      total_used_this_period = total_used_this_period + p_amount,
      updated_at = now()
  WHERE team_id = p_team_id;

  INSERT INTO public.credit_transactions (user_id, team_id, amount, type, action, description)
  VALUES (p_user_id, p_team_id, -p_amount, 'use', p_action, p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant credits (used by webhook after purchase)
CREATE OR REPLACE FUNCTION public.grant_credits(
  p_user_id UUID,
  p_amount INT,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Idempotency check: don't grant twice for the same Stripe session
  IF p_stripe_session_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.credit_transactions
      WHERE stripe_session_id = p_stripe_session_id AND type = 'purchase'
    ) THEN
      RETURN;
    END IF;
  END IF;

  -- Upsert credits
  INSERT INTO public.credits (user_id, balance, total_purchased)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = public.credits.balance + p_amount,
    total_purchased = public.credits.total_purchased + p_amount,
    updated_at = now();

  -- Log the transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, action, stripe_session_id)
  VALUES (p_user_id, p_amount, 'purchase', 'credit_pack', p_stripe_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can read own credits"
  ON public.credits FOR SELECT
  USING (auth.uid() = user_id);

-- Team members can read their team credits
CREATE POLICY "Team members can read team credits"
  ON public.team_credits FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Users can read their own credit transactions
CREATE POLICY "Users can read own transactions"
  ON public.credit_transactions FOR SELECT
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Auto-update updated_at
CREATE TRIGGER credits_updated_at
  BEFORE UPDATE ON public.credits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER team_credits_updated_at
  BEFORE UPDATE ON public.team_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
