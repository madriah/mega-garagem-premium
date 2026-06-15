
-- credit_applications
CREATE TABLE public.credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  store_slug text NOT NULL,
  status text NOT NULL DEFAULT 'nova',
  protocol text NOT NULL DEFAULT upper(substring(replace(gen_random_uuid()::text,'-','') from 1 for 8)),
  -- pessoal
  full_name text NOT NULL,
  cpf text NOT NULL,
  rg text,
  birth_date date,
  mother_name text,
  gender text,
  marital_status text,
  nationality text,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  -- endereço
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  residence_type text,
  residence_time_months integer,
  -- profissional
  occupation text,
  company_name text,
  company_phone text,
  employment_type text,
  monthly_income numeric,
  other_income numeric,
  time_at_job_months integer,
  -- referências e proposta
  "references" jsonb NOT NULL DEFAULT '[]'::jsonb,
  down_payment numeric,
  installments integer,
  desired_installment_value numeric,
  has_trade_in boolean NOT NULL DEFAULT false,
  trade_in_description text,
  -- LGPD / assinatura
  consent_lgpd boolean NOT NULL DEFAULT false,
  consent_score boolean NOT NULL DEFAULT false,
  consent_signed_at timestamptz,
  signature_data_url text,
  signature_ip text,
  signature_user_agent text,
  -- gestão
  notes_internal text,
  read_at timestamptz,
  external_sync_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credit_applications_status_chk CHECK (status IN ('nova','em_analise','aprovada','recusada','cancelada'))
);
CREATE INDEX credit_applications_user_id_idx ON public.credit_applications(user_id, created_at DESC);
CREATE INDEX credit_applications_vehicle_id_idx ON public.credit_applications(vehicle_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_applications TO authenticated;
GRANT INSERT ON public.credit_applications TO anon;
GRANT ALL ON public.credit_applications TO service_role;

ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application"
  ON public.credit_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owner can read applications"
  ON public.credit_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can update applications"
  ON public.credit_applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete applications"
  ON public.credit_applications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER credit_applications_set_updated_at
  BEFORE UPDATE ON public.credit_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- documents
CREATE TABLE public.credit_application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credit_doc_type_chk CHECK (doc_type IN ('cnh','comprovante_renda','comprovante_endereco','outro'))
);
CREATE INDEX credit_application_documents_app_idx ON public.credit_application_documents(application_id);

GRANT SELECT, INSERT, DELETE ON public.credit_application_documents TO authenticated;
GRANT INSERT ON public.credit_application_documents TO anon;
GRANT ALL ON public.credit_application_documents TO service_role;

ALTER TABLE public.credit_application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can attach doc to existing application"
  ON public.credit_application_documents FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id));
CREATE POLICY "Owner can read docs"
  ON public.credit_application_documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "Owner can delete docs"
  ON public.credit_application_documents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));

-- notes
CREATE TABLE public.credit_application_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_application_notes_app_idx ON public.credit_application_notes(application_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.credit_application_notes TO authenticated;
GRANT ALL ON public.credit_application_notes TO service_role;

ALTER TABLE public.credit_application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read notes"
  ON public.credit_application_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "Owner can add notes"
  ON public.credit_application_notes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.credit_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "Owner can delete notes"
  ON public.credit_application_notes FOR DELETE TO authenticated
  USING (user_id = auth.uid());
