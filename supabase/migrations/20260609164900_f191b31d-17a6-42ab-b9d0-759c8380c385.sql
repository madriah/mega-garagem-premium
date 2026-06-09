
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_slug TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- VEHICLES
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year TEXT,
  fuel TEXT,
  fipe_value NUMERIC,
  sale_price NUMERIC NOT NULL,
  km INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  description TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active vehicles public" ON public.vehicles FOR SELECT USING (is_active OR auth.uid() = user_id);
CREATE POLICY "Users manage own vehicles ins" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own vehicles upd" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own vehicles del" ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

-- VIEWS
CREATE TABLE public.vehicle_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.vehicle_views TO anon, authenticated;
GRANT SELECT ON public.vehicle_views TO authenticated;
GRANT ALL ON public.vehicle_views TO service_role;
ALTER TABLE public.vehicle_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log view" ON public.vehicle_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can read views" ON public.vehicle_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.user_id = auth.uid())
);

-- WHATSAPP CLICKS
CREATE TABLE public.whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.whatsapp_clicks TO anon, authenticated;
GRANT SELECT ON public.whatsapp_clicks TO authenticated;
GRANT ALL ON public.whatsapp_clicks TO service_role;
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log click" ON public.whatsapp_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can read clicks" ON public.whatsapp_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.user_id = auth.uid())
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE base_slug TEXT; final_slug TEXT; n INT := 0;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
