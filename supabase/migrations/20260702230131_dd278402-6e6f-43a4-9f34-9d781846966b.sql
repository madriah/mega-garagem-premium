
ALTER VIEW public.public_profiles SET (security_invoker = on);
ALTER VIEW public.public_sellers SET (security_invoker = on);

-- Allow anon SELECT rows but only safe columns
CREATE POLICY "Public can read profile display" ON public.profiles
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public can read active sellers" ON public.sellers
  FOR SELECT TO anon USING (is_active = true);

REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, store_name, store_slug, logo_url, accent_color, tagline, city, store_template, art_template, whatsapp)
  ON public.profiles TO anon;

REVOKE SELECT ON public.sellers FROM anon;
GRANT SELECT (id, user_id, name, whatsapp, is_active) ON public.sellers TO anon;
