
-- 1. Template de arte no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS art_template text NOT NULL DEFAULT 'a';
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_art_template_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_art_template_check CHECK (art_template IN ('a','b','c'));

-- 2. Tabela de artes geradas
CREATE TABLE IF NOT EXISTS public.vehicle_arts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  format text NOT NULL CHECK (format IN ('feed','story')),
  template text NOT NULL CHECK (template IN ('a','b','c')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vehicle_arts_vehicle_idx ON public.vehicle_arts(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_arts_user_idx ON public.vehicle_arts(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_arts TO authenticated;
GRANT ALL ON public.vehicle_arts TO service_role;

ALTER TABLE public.vehicle_arts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages arts" ON public.vehicle_arts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. RLS no bucket vehicle-arts (criado via tool a seguir)
-- Políticas: dono lê/escreve/deleta seus próprios objetos
CREATE POLICY "Owner reads own arts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-arts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner uploads arts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-arts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner deletes arts" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-arts' AND auth.uid()::text = (storage.foldername(name))[1]);
