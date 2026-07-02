
-- 1) Tighten always-true INSERT policies
DROP POLICY IF EXISTS "Anyone can submit application" ON public.credit_applications;
CREATE POLICY "Anyone can submit application" ON public.credit_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = credit_applications.user_id AND p.store_slug = credit_applications.store_slug));

DROP POLICY IF EXISTS "Anyone can log view" ON public.vehicle_views;
CREATE POLICY "Anyone can log view" ON public.vehicle_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_views.vehicle_id AND v.is_active));

DROP POLICY IF EXISTS "Anyone can log click" ON public.whatsapp_clicks;
CREATE POLICY "Anyone can log click" ON public.whatsapp_clicks
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = whatsapp_clicks.vehicle_id AND v.is_active));

-- 2) Lock credit_application_documents INSERT to owner only (client goes through server fn using admin)
DROP POLICY IF EXISTS "Anyone can attach doc to existing application" ON public.credit_application_documents;
CREATE POLICY "Owner can attach docs" ON public.credit_application_documents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = credit_application_documents.application_id AND a.user_id = auth.uid()));

-- 3) Restrict profiles SELECT to owner; expose safe columns via view
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Owner reads own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, store_name, store_slug, logo_url, accent_color, tagline, city, store_template, art_template, whatsapp
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4) Restrict sellers SELECT for anon; expose safe columns via view (no email)
DROP POLICY IF EXISTS "Public can read active sellers" ON public.sellers;

CREATE OR REPLACE VIEW public.public_sellers AS
SELECT id, user_id, name, whatsapp, is_active
FROM public.sellers
WHERE is_active = true;

GRANT SELECT ON public.public_sellers TO anon, authenticated;
