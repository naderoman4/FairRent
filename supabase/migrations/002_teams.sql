-- Teams table for agency organizations
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'business')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  api_key TEXT UNIQUE DEFAULT 'fk_' || encode(gen_random_bytes(24), 'hex'),
  max_members INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key from profiles to teams (deferred to avoid circular dependency)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Team members junction table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team members can read their team
CREATE POLICY "Team members can read own team"
  ON public.teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    OR owner_id = auth.uid()
  );

-- Only owner can update team
CREATE POLICY "Owner can update team"
  ON public.teams FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Any authenticated user can create a team (on agency signup)
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Team members can read team members list
CREATE POLICY "Team members can read members"
  ON public.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team admins can insert/update/delete members
CREATE POLICY "Team admins can manage members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
    OR team_id IN (
      SELECT t.id FROM public.teams t WHERE t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update members"
  ON public.team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
    OR team_id IN (
      SELECT t.id FROM public.teams t WHERE t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can delete members"
  ON public.team_members FOR DELETE
  USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
    OR team_id IN (
      SELECT t.id FROM public.teams t WHERE t.owner_id = auth.uid()
    )
    OR user_id = auth.uid() -- members can remove themselves
  );

-- Auto-update updated_at for teams
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
