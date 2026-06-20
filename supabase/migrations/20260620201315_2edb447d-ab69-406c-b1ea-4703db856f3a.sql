
-- Sellers table (each lojista has multiple sellers)
CREATE TABLE public.sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  whatsapp text NOT NULL,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
GRANT SELECT ON public.sellers TO anon;
GRANT ALL ON public.sellers TO service_role;

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their sellers" ON public.sellers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can read active sellers" ON public.sellers FOR SELECT TO anon
  USING (is_active = true);

CREATE TRIGGER sellers_set_updated_at BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX sellers_user_id_idx ON public.sellers(user_id);

-- Add columns to credit_applications
ALTER TABLE public.credit_applications
  ADD COLUMN seller_id uuid REFERENCES public.sellers(id) ON DELETE SET NULL,
  ADD COLUMN selected_banks text[] NOT NULL DEFAULT '{}',
  ADD COLUMN vendor_notes text;

CREATE INDEX credit_applications_seller_id_idx ON public.credit_applications(seller_id);
