
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_template text NOT NULL DEFAULT 'showroom',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS city text;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_store_template_check
    CHECK (store_template IN ('confianca','showroom','conversao'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE POLICY "Public read store logos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'store-logos');

CREATE POLICY "Owner upload store logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'store-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner update store logo"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'store-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner delete store logo"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'store-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
