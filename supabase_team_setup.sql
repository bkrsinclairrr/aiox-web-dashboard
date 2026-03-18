-- =====================================================
-- AIOX Dashboard - Team Members Authorization System
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create the team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email         TEXT NOT NULL,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  invited_by    TEXT,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS team_members_updated_at ON public.team_members;
CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can view all members
CREATE POLICY "Authenticated users can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

-- Policy: only owners and admins can insert (invite) members
CREATE POLICY "Owners and admins can invite members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
    OR
    -- Allow first user to bootstrap as owner
    NOT EXISTS (SELECT 1 FROM public.team_members)
  );

-- Policy: only owners and admins can update member roles/status
CREATE POLICY "Owners and admins can update members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

-- Policy: only owners can delete members
CREATE POLICY "Owners can remove members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND role = 'owner'
        AND status = 'active'
    )
  );

-- Function to auto-link user_id when a user registers with an invited email
CREATE OR REPLACE FUNCTION link_user_to_team_member()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.team_members
  SET user_id = NEW.id,
      name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      status = 'active'
  WHERE email = NEW.email
    AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_user_to_team_member();

-- =====================================================
-- OPTIONAL: Seed the first owner (replace with your email)
-- Run after creating your account in Supabase Auth
-- =====================================================
-- INSERT INTO public.team_members (email, role, status, invited_by)
-- VALUES ('seu-email@gmail.com', 'owner', 'active', 'system')
-- ON CONFLICT (email) DO UPDATE SET role = 'owner', status = 'active';
