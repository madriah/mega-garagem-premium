import { z } from "zod";

export function isValidCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let d1 = 11 - (s % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  let d2 = 11 - (s % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10]);
}

export const maskCPF = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
export const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
};
export const maskCEP = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
export const maskMoney = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (!d) return "";
  return (parseInt(d) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
export const parseMoney = (v: string): number => {
  const d = v.replace(/\D/g, "");
  return d ? parseInt(d) / 100 : 0;
};

export const ReferenceSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(120),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  relationship: z.string().trim().min(1, "Vínculo obrigatório").max(40),
});

export const ApplicationSchema = z.object({
  user_id: z.string().uuid(),
  vehicle_id: z.string().uuid().nullable().optional(),
  store_slug: z.string().min(1).max(120),
  // pessoal
  full_name: z.string().trim().min(3, "Nome muito curto").max(160),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  rg: z.string().max(30).optional().default(""),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  mother_name: z.string().trim().min(3).max(160),
  gender: z.enum(["M", "F", "Outro"]).optional(),
  marital_status: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]),
  nationality: z.string().max(60).optional().default("Brasileira"),
  email: z.string().trim().email("E-mail inválido").max(160),
  phone: z.string().trim().min(10).max(20),
  whatsapp: z.string().max(20).optional().default(""),
  // endereço
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().trim().min(1).max(160),
  number: z.string().trim().min(1).max(20),
  complement: z.string().max(80).optional().default(""),
  neighborhood: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  state: z.string().length(2),
  residence_type: z.enum(["propria", "alugada", "financiada", "familiar", "outro"]),
  residence_time_months: z.number().int().min(0).max(1200),
  // profissional
  occupation: z.string().trim().min(1).max(120),
  company_name: z.string().max(160).optional().default(""),
  company_phone: z.string().max(20).optional().default(""),
  employment_type: z.enum(["clt", "autonomo", "empresario", "servidor", "aposentado", "outro"]),
  monthly_income: z.number().min(0).max(10000000),
  other_income: z.number().min(0).max(10000000).optional().default(0),
  time_at_job_months: z.number().int().min(0).max(1200),
  // referências + proposta
  references: z.array(ReferenceSchema).min(2, "Mínimo 2 referências").max(3),
  down_payment: z.number().min(0).max(10000000),
  installments: z.number().int().min(6).max(72),
  desired_installment_value: z.number().min(0).max(1000000),
  has_trade_in: z.boolean().default(false),
  trade_in_description: z.string().max(500).optional().default(""),
  // LGPD
  consent_lgpd: z.literal(true, { errorMap: () => ({ message: "Você precisa aceitar os termos LGPD" }) }),
  consent_score: z.boolean().default(false),
  signature_data_url: z.string().min(100, "Assine para continuar").max(200000),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;

export const STATUS_LABELS: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
  cancelada: "Cancelada",
};
export const STATUS_COLORS: Record<string, string> = {
  nova: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  em_analise: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  aprovada: "bg-green-500/15 text-green-400 border-green-500/30",
  recusada: "bg-red-500/15 text-red-400 border-red-500/30",
  cancelada: "bg-muted text-muted-foreground border-border",
};
