ALTER TABLE public.reels_projects
  ADD COLUMN IF NOT EXISTS campaign_objective TEXT,
  ADD COLUMN IF NOT EXISTS agency_mode TEXT,
  ADD COLUMN IF NOT EXISTS seed BIGINT,
  ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'reels_estoque',
  ADD COLUMN IF NOT EXISTS music_track_id TEXT;

ALTER TABLE public.reels_scripts
  ADD COLUMN IF NOT EXISTS storyboard_json JSONB;