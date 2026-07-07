
-- 1) Tier no profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'basico'
  CHECK (tier IN ('basico','pro','elite'));

-- 2) reels_projects
CREATE TABLE public.reels_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  tier TEXT NOT NULL DEFAULT 'basico' CHECK (tier IN ('basico','pro','elite')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','failed')),
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reels_projects TO authenticated;
GRANT ALL ON public.reels_projects TO service_role;
ALTER TABLE public.reels_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reels_projects" ON public.reels_projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER reels_projects_updated_at BEFORE UPDATE ON public.reels_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) reels_scripts
CREATE TABLE public.reels_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.reels_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hook_text TEXT NOT NULL,
  hook_category TEXT NOT NULL,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_text TEXT NOT NULL,
  generated_by TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reels_scripts TO authenticated;
GRANT ALL ON public.reels_scripts TO service_role;
ALTER TABLE public.reels_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reels_scripts" ON public.reels_scripts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
