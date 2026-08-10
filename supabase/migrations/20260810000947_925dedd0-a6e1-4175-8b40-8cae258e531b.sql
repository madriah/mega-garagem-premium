-- 1. Profiles: account type + owning store
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS owner_id uuid;

-- 2. Sellers: linked auth account + permissions
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS permissions text[] NOT NULL DEFAULT '{}'::text[];
CREATE UNIQUE INDEX IF NOT EXISTS sellers_auth_user_id_key ON public.sellers(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS sellers_email_lower_idx ON public.sellers(lower(email));

-- 3. Helper functions
CREATE OR REPLACE FUNCTION public.acting_owner(_uid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT s.user_id FROM public.sellers s WHERE s.auth_user_id = _uid AND s.is_active LIMIT 1),
    _uid
  );
$$;

CREATE OR REPLACE FUNCTION public.seller_id_of(_uid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id FROM public.sellers s WHERE s.auth_user_id = _uid AND s.is_active LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.staff_can(_uid uuid, _perm text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.sellers s WHERE s.auth_user_id = _uid AND s.is_active)
      OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.auth_user_id = _uid AND s.is_active AND _perm = ANY(s.permissions));
$$;

-- 4. Auto-link invited sellers on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE base_slug TEXT; final_slug TEXT; n INT := 0; v_seller public.sellers; v_owner public.profiles;
BEGIN
  SELECT * INTO v_seller FROM public.sellers
   WHERE lower(email) = lower(NEW.email) AND auth_user_id IS NULL AND is_active LIMIT 1;

  IF v_seller.id IS NOT NULL THEN
    UPDATE public.sellers SET auth_user_id = NEW.id WHERE id = v_seller.id;
    SELECT * INTO v_owner FROM public.profiles WHERE id = v_seller.user_id;
    INSERT INTO public.profiles (id, full_name, store_name, store_slug, whatsapp, email, role, owner_id)
    VALUES (
      NEW.id,
      coalesce(NULLIF(NEW.raw_user_meta_data->>'full_name',''), v_seller.name),
      coalesce(v_owner.store_name, 'Loja'),
      'vendedor-' || replace(NEW.id::text, '-', ''),
      coalesce(v_seller.whatsapp, ''),
      NEW.email,
      'seller',
      v_seller.user_id
    );
    RETURN NEW;
  END IF;

  base_slug := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'store_name', 'loja'), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN base_slug := 'loja'; END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE store_slug = final_slug) LOOP
    n := n + 1; final_slug := base_slug || '-' || n;
  END LOOP;
  INSERT INTO public.profiles (id, full_name, store_name, store_slug, whatsapp, email)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', ''),
    coalesce(NEW.raw_user_meta_data->>'store_name', 'Minha Loja'),
    final_slug,
    coalesce(NEW.raw_user_meta_data->>'whatsapp', ''),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- 5. Profiles: seller may read the store owner profile
DROP POLICY IF EXISTS "Staff reads store profile" ON public.profiles;
CREATE POLICY "Staff reads store profile" ON public.profiles
FOR SELECT TO authenticated USING (id = public.acting_owner(auth.uid()));

-- 6. Sellers: seller reads own record
DROP POLICY IF EXISTS "Seller reads own record" ON public.sellers;
CREATE POLICY "Seller reads own record" ON public.sellers
FOR SELECT TO authenticated USING (auth_user_id = auth.uid());

-- 7. Vehicles: store staff access gated by permission
DROP POLICY IF EXISTS "Staff reads store vehicles" ON public.vehicles;
CREATE POLICY "Staff reads store vehicles" ON public.vehicles
FOR SELECT TO authenticated USING (user_id = public.acting_owner(auth.uid()));

DROP POLICY IF EXISTS "Staff inserts vehicles" ON public.vehicles;
CREATE POLICY "Staff inserts vehicles" ON public.vehicles
FOR INSERT TO authenticated
WITH CHECK (user_id = public.acting_owner(auth.uid()) AND public.staff_can(auth.uid(), 'cars'));

DROP POLICY IF EXISTS "Staff updates vehicles" ON public.vehicles;
CREATE POLICY "Staff updates vehicles" ON public.vehicles
FOR UPDATE TO authenticated
USING (user_id = public.acting_owner(auth.uid()) AND public.staff_can(auth.uid(), 'cars'))
WITH CHECK (user_id = public.acting_owner(auth.uid()) AND public.staff_can(auth.uid(), 'cars'));

DROP POLICY IF EXISTS "Staff deletes vehicles" ON public.vehicles;
CREATE POLICY "Staff deletes vehicles" ON public.vehicles
FOR DELETE TO authenticated
USING (user_id = public.acting_owner(auth.uid()) AND public.staff_can(auth.uid(), 'cars'));

-- 8. Credit applications: staff read/update gated by permission and ownership of the lead
DROP POLICY IF EXISTS "Staff reads applications" ON public.credit_applications;
CREATE POLICY "Staff reads applications" ON public.credit_applications
FOR SELECT TO authenticated USING (
  user_id = public.acting_owner(auth.uid())
  AND public.staff_can(auth.uid(), 'fichas')
  AND (
    public.seller_id_of(auth.uid()) IS NULL
    OR public.staff_can(auth.uid(), 'fichas_all')
    OR seller_id = public.seller_id_of(auth.uid())
  )
);

DROP POLICY IF EXISTS "Staff updates applications" ON public.credit_applications;
CREATE POLICY "Staff updates applications" ON public.credit_applications
FOR UPDATE TO authenticated USING (
  user_id = public.acting_owner(auth.uid())
  AND public.staff_can(auth.uid(), 'fichas')
  AND (
    public.seller_id_of(auth.uid()) IS NULL
    OR public.staff_can(auth.uid(), 'fichas_all')
    OR seller_id = public.seller_id_of(auth.uid())
  )
) WITH CHECK (user_id = public.acting_owner(auth.uid()));

-- 9. Documents and notes follow readable applications
DROP POLICY IF EXISTS "Owner can read docs" ON public.credit_application_documents;
CREATE POLICY "Staff can read docs" ON public.credit_application_documents
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id)
);

DROP POLICY IF EXISTS "Owner can read notes" ON public.credit_application_notes;
CREATE POLICY "Staff can read notes" ON public.credit_application_notes
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id)
);

DROP POLICY IF EXISTS "Owner can add notes" ON public.credit_application_notes;
CREATE POLICY "Staff can add notes" ON public.credit_application_notes
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id)
);

-- 10. Metrics readable by store staff
DROP POLICY IF EXISTS "Staff read views" ON public.vehicle_views;
CREATE POLICY "Staff read views" ON public.vehicle_views
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.user_id = public.acting_owner(auth.uid()))
);

DROP POLICY IF EXISTS "Staff read clicks" ON public.whatsapp_clicks;
CREATE POLICY "Staff read clicks" ON public.whatsapp_clicks
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.user_id = public.acting_owner(auth.uid()))
);