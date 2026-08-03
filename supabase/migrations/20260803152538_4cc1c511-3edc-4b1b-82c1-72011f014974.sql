DROP POLICY IF EXISTS "Public can read profile display" ON public.profiles;
DROP POLICY IF EXISTS "Public can read active sellers" ON public.sellers;
DROP POLICY IF EXISTS "Anyone can upload credit doc" ON storage.objects;

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.sellers FROM anon;

REVOKE ALL ON TABLE public.public_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.public_sellers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.public_profiles TO anon, authenticated;
GRANT SELECT ON TABLE public.public_sellers TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sellers TO authenticated;
GRANT ALL ON TABLE public.sellers TO service_role;

REVOKE INSERT ON storage.objects FROM anon;

COMMENT ON VIEW public.public_profiles IS 'Public storefront projection containing only non-sensitive store display fields.';
COMMENT ON VIEW public.public_sellers IS 'Public active-seller projection containing only safe contact/display fields.';