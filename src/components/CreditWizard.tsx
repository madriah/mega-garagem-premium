import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, Loader2, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { submitApplication } from "@/lib/credit.functions";
import {
  ApplicationSchema,
  maskCEP,
  maskCPF,
  maskMoney,
  maskPhone,
  parseMoney,
} from "@/lib/credit-schema";

type Props = {
  profile: { id: string; store_slug: string; store_name: string };
  vehicle?: { id: string; brand: string | null; model: string | null; year: string | null; sale_price: number } | null;
};

const STEPS = ["Pessoal", "Endereço", "Profissional", "Proposta", "Assinatura"] as const;

const empty = {
  full_name: "", cpf: "", rg: "", birth_date: "", mother_name: "",
  gender: undefined as "M" | "F" | "Outro" | undefined,
  marital_status: "" as any, nationality: "Brasileira",
  email: "", phone: "", whatsapp: "",
  cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  residence_type: "" as any, residence_time_months: 0,
  occupation: "", company_name: "", company_phone: "",
  employment_type: "" as any,
  monthly_income: 0, other_income: 0, time_at_job_months: 0,
  references: [
    { name: "", phone: "", relationship: "" },
    { name: "", phone: "", relationship: "" },
  ],
  down_payment: 0, installments: 48, desired_installment_value: 0,
  has_trade_in: false, trade_in_description: "",
  consent_lgpd: false, consent_score: false,
};

export function CreditWizard({ profile, vehicle }: Props) {
  const navigate = useNavigate();
  const submit = useServerFn(submitApplication);
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<typeof empty>(() => {
    if (typeof window === "undefined") return empty;
    try {
      const saved = localStorage.getItem(`ficha-${profile.store_slug}-${vehicle?.id ?? "any"}`);
      return saved ? { ...empty, ...JSON.parse(saved) } : empty;
    } catch { return empty; }
  });
  const [docs, setDocs] = useState<Record<string, File | null>>({ cnh: null, comprovante_renda: null, comprovante_endereco: null });
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // persist draft
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(`ficha-${profile.store_slug}-${vehicle?.id ?? "any"}`, JSON.stringify(form)); } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [form, profile.store_slug, vehicle?.id]);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }));

  // CEP lookup
  const onCepBlur = async () => {
    const c = form.cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const j = await r.json();
      if (!j.erro) {
        setForm((f) => ({ ...f, street: j.logradouro || f.street, neighborhood: j.bairro || f.neighborhood, city: j.localidade || f.city, state: j.uf || f.state }));
      }
    } catch {} finally { setCepLoading(false); }
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (form.full_name.trim().length < 3) return "Informe seu nome completo";
      if (form.cpf.replace(/\D/g, "").length !== 11) return "CPF incompleto";
      if (!form.birth_date) return "Informe a data de nascimento";
      if (form.mother_name.trim().length < 3) return "Informe o nome da mãe";
      if (!form.marital_status) return "Selecione o estado civil";
      if (!form.email.includes("@")) return "E-mail inválido";
      if (form.phone.replace(/\D/g, "").length < 10) return "Telefone inválido";
    }
    if (step === 1) {
      if (form.cep.replace(/\D/g, "").length !== 8) return "CEP inválido";
      if (!form.street.trim() || !form.number.trim() || !form.neighborhood.trim() || !form.city.trim() || form.state.length !== 2) return "Endereço incompleto";
      if (!form.residence_type) return "Selecione o tipo de residência";
    }
    if (step === 2) {
      if (!form.occupation.trim()) return "Informe sua profissão";
      if (!form.employment_type) return "Selecione o tipo de vínculo";
      if (form.monthly_income <= 0) return "Informe a renda mensal";
    }
    if (step === 3) {
      if (form.down_payment < 0) return "Entrada inválida";
      if (form.installments < 6) return "Mínimo 6 parcelas";
      const refs = form.references.filter((r) => r.name.trim() && r.phone.replace(/\D/g, "").length >= 10);
      if (refs.length < 2) return "Preencha pelo menos 2 referências completas";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => { setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = async () => {
    if (!form.consent_lgpd) { toast.error("Aceite os termos LGPD"); return; }
    if (!sigRef.current || sigRef.current.isEmpty()) { toast.error("Assine no quadro abaixo"); return; }

    const signature_data_url = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    const payload = {
      ...form,
      user_id: profile.id,
      vehicle_id: vehicle?.id ?? null,
      store_slug: profile.store_slug,
      signature_data_url,
      references: form.references.filter((r) => r.name.trim() && r.phone.replace(/\D/g, "").length >= 10),
    };

    const parsed = ApplicationSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submit({ data: parsed.data });

      // upload docs (best effort)
      for (const [type, file] of Object.entries(docs)) {
        if (!file) continue;
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = `${result.id}/${type}.${ext}`;
        const { error: upErr } = await supabase.storage.from("credit-docs").upload(path, file, { upsert: true });
        if (!upErr) {
          await supabase.from("credit_application_documents").insert({ application_id: result.id, doc_type: type, storage_path: path });
        }
      }

      try { localStorage.removeItem(`ficha-${profile.store_slug}-${vehicle?.id ?? "any"}`); } catch {}
      navigate({ to: "/loja/$slug/ficha-enviada", params: { slug: profile.store_slug }, search: { p: result.protocol } });
    } catch (e: any) {
      toast.error(e?.message || "Falha ao enviar ficha");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-muted-foreground">Etapa {step + 1} de {STEPS.length}</span>
          <span className="text-muted-foreground">{STEPS[step]}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      {step === 0 && (
        <Section title="Dados pessoais" subtitle="Suas informações básicas para o cadastro.">
          <Field label="Nome completo"><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Como aparece no RG/CNH" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CPF"><Input value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" /></Field>
            <Field label="RG (opcional)"><Input value={form.rg} onChange={(e) => set("rg", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data de nascimento"><Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} /></Field>
            <Field label="Sexo">
              <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v as any)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Feminino</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Nome completo da mãe"><Input value={form.mother_name} onChange={(e) => set("mother_name", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado civil">
              <Select value={form.marital_status} onValueChange={(v) => set("marital_status", v as any)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="uniao_estavel">União estável</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nacionalidade"><Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></Field>
          </div>
          <Field label="E-mail"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@email.com" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefone"><Input value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} inputMode="tel" placeholder="(00) 00000-0000" /></Field>
            <Field label="WhatsApp (se diferente)"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))} inputMode="tel" /></Field>
          </div>
        </Section>
      )}

      {step === 1 && (
        <Section title="Endereço" subtitle="Onde você mora atualmente.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="CEP">
              <div className="relative">
                <Input value={form.cep} onChange={(e) => set("cep", maskCEP(e.target.value))} onBlur={onCepBlur} inputMode="numeric" placeholder="00000-000" />
                {cepLoading && <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
              </div>
            </Field>
            <Field label="Estado"><Input value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" /></Field>
            <Field label="Cidade"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          </div>
          <Field label="Logradouro"><Input value={form.street} onChange={(e) => set("street", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Número"><Input value={form.number} onChange={(e) => set("number", e.target.value)} /></Field>
            <Field label="Complemento"><Input value={form.complement} onChange={(e) => set("complement", e.target.value)} /></Field>
            <Field label="Bairro"><Input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo de residência">
              <Select value={form.residence_type} onValueChange={(v) => set("residence_type", v as any)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="propria">Própria</SelectItem>
                  <SelectItem value="alugada">Alugada</SelectItem>
                  <SelectItem value="financiada">Financiada</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tempo de residência (meses)"><Input type="number" min={0} value={form.residence_time_months || ""} onChange={(e) => set("residence_time_months", parseInt(e.target.value) || 0)} /></Field>
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section title="Profissão e renda" subtitle="Informações profissionais para análise.">
          <Field label="Profissão"><Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Empresa onde trabalha"><Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></Field>
            <Field label="Telefone da empresa"><Input value={form.company_phone} onChange={(e) => set("company_phone", maskPhone(e.target.value))} inputMode="tel" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vínculo">
              <Select value={form.employment_type} onValueChange={(v) => set("employment_type", v as any)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clt">CLT</SelectItem>
                  <SelectItem value="autonomo">Autônomo</SelectItem>
                  <SelectItem value="empresario">Empresário</SelectItem>
                  <SelectItem value="servidor">Servidor público</SelectItem>
                  <SelectItem value="aposentado">Aposentado</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tempo no emprego (meses)"><Input type="number" min={0} value={form.time_at_job_months || ""} onChange={(e) => set("time_at_job_months", parseInt(e.target.value) || 0)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Renda mensal"><Input value={form.monthly_income ? maskMoney(String(Math.round(form.monthly_income * 100))) : ""} onChange={(e) => set("monthly_income", parseMoney(e.target.value))} inputMode="numeric" placeholder="R$ 0,00" /></Field>
            <Field label="Outras rendas (opcional)"><Input value={form.other_income ? maskMoney(String(Math.round(form.other_income * 100))) : ""} onChange={(e) => set("other_income", parseMoney(e.target.value))} inputMode="numeric" placeholder="R$ 0,00" /></Field>
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section title="Proposta e referências" subtitle="Como você quer financiar e quem indica você.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Entrada"><Input value={form.down_payment ? maskMoney(String(Math.round(form.down_payment * 100))) : ""} onChange={(e) => set("down_payment", parseMoney(e.target.value))} inputMode="numeric" placeholder="R$ 0,00" /></Field>
            <Field label="Parcelas"><Input type="number" min={6} max={72} value={form.installments} onChange={(e) => set("installments", parseInt(e.target.value) || 48)} /></Field>
            <Field label="Parcela desejada"><Input value={form.desired_installment_value ? maskMoney(String(Math.round(form.desired_installment_value * 100))) : ""} onChange={(e) => set("desired_installment_value", parseMoney(e.target.value))} inputMode="numeric" placeholder="R$ 0,00" /></Field>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <Checkbox id="trade" checked={form.has_trade_in} onCheckedChange={(v) => set("has_trade_in", !!v)} />
            <Label htmlFor="trade" className="cursor-pointer">Vou dar um carro na troca</Label>
          </div>
          {form.has_trade_in && (
            <Field label="Descreva o carro da troca (marca, modelo, ano, KM)"><Textarea value={form.trade_in_description} onChange={(e) => set("trade_in_description", e.target.value)} rows={2} /></Field>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Referências pessoais (mín. 2)</Label>
              {form.references.length < 3 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, references: [...f.references, { name: "", phone: "", relationship: "" }] }))}>
                  <Plus className="size-4" /> Adicionar
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {form.references.map((r, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <Input placeholder="Nome" value={r.name} onChange={(e) => setForm((f) => { const a = [...f.references]; a[i] = { ...a[i], name: e.target.value }; return { ...f, references: a }; })} />
                  <Input placeholder="Telefone" value={r.phone} onChange={(e) => setForm((f) => { const a = [...f.references]; a[i] = { ...a[i], phone: maskPhone(e.target.value) }; return { ...f, references: a }; })} />
                  <Input placeholder="Vínculo (amigo, primo...)" value={r.relationship} onChange={(e) => setForm((f) => { const a = [...f.references]; a[i] = { ...a[i], relationship: e.target.value }; return { ...f, references: a }; })} />
                  {form.references.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setForm((f) => ({ ...f, references: f.references.filter((_, j) => j !== i) }))}><Trash2 className="size-4" /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Documentos (envie depois também é possível, mas acelera)</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { k: "cnh", label: "CNH" },
                { k: "comprovante_renda", label: "Comprovante de renda" },
                { k: "comprovante_endereco", label: "Comprovante de endereço" },
              ].map((d) => (
                <FileBox key={d.k} label={d.label} file={docs[d.k]} onChange={(f) => setDocs((s) => ({ ...s, [d.k]: f }))} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {step === 4 && (
        <Section title="Termo e assinatura" subtitle="Última etapa — confirme e assine.">
          <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Termo de Consentimento — LGPD (Lei 13.709/2018)</p>
            <p className="mt-2">
              Você autoriza <span className="text-foreground font-medium">{profile.store_name}</span> a coletar, armazenar e utilizar os dados informados nesta ficha
              com a finalidade exclusiva de <span className="text-foreground">análise de crédito e intermediação de financiamento veicular</span>.
              Os dados poderão ser compartilhados com instituições financeiras parceiras para essa finalidade.
              Você pode revogar este consentimento a qualquer momento contatando a loja. Retenção: pelo prazo legal aplicável.
            </p>
          </div>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={form.consent_lgpd} onCheckedChange={(v) => set("consent_lgpd", !!v)} className="mt-0.5" />
              <span className="text-sm">Li e aceito o termo de consentimento LGPD acima. <span className="text-red-400">*</span></span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={form.consent_score} onCheckedChange={(v) => set("consent_score", !!v)} className="mt-0.5" />
              <span className="text-sm">Autorizo consulta ao meu score de crédito (opcional).</span>
            </label>
          </div>

          <div>
            <Label className="mb-2 block">Sua assinatura</Label>
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <SignatureCanvas ref={sigRef} penColor="#000" canvasProps={{ className: "w-full h-40" }} />
            </div>
            <div className="mt-2 flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => sigRef.current?.clear()}>Limpar assinatura</Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-green-500" />
            Conexão segura. IP e horário registrados para validade jurídica.
          </div>
        </Section>
      )}

      {/* nav */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={prev} disabled={step === 0 || submitting}>
          <ArrowLeft className="size-4" /> Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next} className="shadow-glow">Continuar <ArrowRight className="size-4" /></Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting} className="shadow-glow">
            {submitting ? <><Loader2 className="size-4 animate-spin" /> Enviando...</> : <><CheckCircle2 className="size-4" /> Enviar ficha</>}
          </Button>
        )}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FileBox({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-card p-4 text-center text-xs transition-colors hover:border-primary/50">
      <Upload className="size-5 text-muted-foreground" />
      <span className="font-medium">{label}</span>
      <span className="truncate text-[10px] text-muted-foreground">{file ? file.name : "Toque para enviar"}</span>
      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  );
}
