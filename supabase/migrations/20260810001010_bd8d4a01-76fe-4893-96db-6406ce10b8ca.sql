REVOKE ALL ON FUNCTION public.acting_owner(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.seller_id_of(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.staff_can(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.acting_owner(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.seller_id_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.staff_can(uuid, text) TO authenticated, service_role;