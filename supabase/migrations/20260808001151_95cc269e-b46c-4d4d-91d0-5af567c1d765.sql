ALTER VIEW public.public_profiles SET (security_invoker = off);
ALTER VIEW public.public_sellers SET (security_invoker = off);

REVOKE ALL ON public.public_profiles FROM anon, authenticated;
REVOKE ALL ON public.public_sellers FROM anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_sellers TO anon, authenticated;