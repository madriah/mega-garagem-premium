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
export const maskDate = (v: string) =>
  v.replace(/\D/g, "").slice(0, 8).replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2");
export const maskMoney = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (!d) return "";
  return (parseInt(d) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
export const parseMoney = (v: string): number => {
  const d = v.replace(/\D/g, "");
  return d ? parseInt(d) / 100 : 0;
};
// dd/mm/aaaa -> yyyy-mm-dd
export const brDateToISO = (v: string): string | null => {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
};

export const ApplicationSchema = z.object({
  user_id: z.string().uuid(),
  vehicle_id: z.string().uuid().nullable().optional(),
  store_slug: z.string().min(1).max(120),
  seller_id: z.string().uuid().nullable().optional(),
  // pessoal
  full_name: z.string().trim().min(3, "Nome muito curto").max(160),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  mother_name: z.string().trim().min(3).max(160),
  marital_status: z.string().max(40).optional().default(""),
  email: z.string().trim().email("E-mail inválido").max(160).or(z.literal("")).optional().default(""),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  // endereço
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().trim().min(1).max(160),
  number: z.string().trim().min(1).max(20),
  complement: z.string().max(80).optional().default(""),
  neighborhood: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  state: z.string().length(2),
  residence_type: z.string().max(40).optional().default(""),
  // profissional
  occupation: z.string().max(120).optional().default(""),
  company_name: z.string().max(160).optional().default(""),
  employment_type: z.string().max(40).optional().default(""),
  monthly_income: z.number().min(0).max(10000000),
  other_income: z.number().min(0).max(10000000).optional().default(0),
  time_at_job_months: z.number().int().min(0).max(1200).optional().default(0),
  down_payment: z.number().min(0).max(10000000).optional().default(0),
  installments: z.number().int().min(6).max(96).optional().default(48),
  // bancos
  selected_banks: z.array(z.string().max(40)).max(20).default([]),
  vendor_notes: z.string().max(2000).optional().default(""),
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
