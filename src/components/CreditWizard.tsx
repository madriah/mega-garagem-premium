import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { submitApplication, attachApplicationDocument } from "@/lib/credit.functions";
import {
  ApplicationSchema,
  brDateToISO,
  maskCEP,
  maskCPF,
  maskDate,
  maskMoney,
  maskPhone,
  parseMoney,
} from "@/lib/credit-schema";

type Profile = {
  id: string;
  store_name: string;
  store_slug: string;
  whatsapp: string | null;
  logo_url: string | null;
  accent_color: string | null;
  city: string | null;
};
type Vehicle = {
  id: string;
  brand: string | null;
  model: string | null;
  year: string | null;
  km: number | null;
  fuel: string | null;
  sale_price: number | string;
  fipe_value: number | string | null;
  _cover?: string;
};
type Seller = { id: string; name: string; whatsapp: string } | null;

type Props = { profile: Profile; vehicle: Vehicle; seller: Seller };

const BANKS = [
  { id: "santander", name: "Santander", icon: "🔴", tint: "rgba(255,0,0,0.1)" },
  { id: "bv", name: "BV", icon: "🔵", tint: "rgba(0,100,255,0.1)" },
  { id: "itau", name: "Itaú", icon: "🟠", tint: "rgba(255,165,0,0.1)" },
  { id: "c6", name: "C6 Bank", icon: "🟢", tint: "rgba(0,200,100,0.1)" },
  { id: "bradesco", name: "Bradesco", icon: "❤️", tint: "rgba(200,0,0,0.1)" },
  { id: "pan", name: "Banco Pan", icon: "💜", tint: "rgba(100,0,200,0.1)" },
];

const STEP_LABELS = [
  "Dados Pessoais",
  "Endereço",
  "Renda",
  "Documentos",
  "Enviar para bancos",
] as const;

const DOC_TYPES = [
  { k: "rg_frente", label: "RG — Frente", desc: "Documento de identidade", icon: "🪪" },
  { k: "rg_verso", label: "RG — Verso", desc: "Verso do documento", icon: "🪪" },
  { k: "cpf", label: "CPF", desc: "Cadastro de pessoa física", icon: "📄" },
  { k: "comprovante_renda", label: "Comprovante de Renda", desc: "Holerite ou extrato", icon: "💰" },
  { k: "comprovante_endereco", label: "Comprovante de Residência", desc: "Conta de luz, água ou gás", icon: "🏠" },
  { k: "cnh", label: "CNH (opcional)", desc: "Carteira de motorista", icon: "🚗" },
] as const;

const empty = {
  full_name: "", cpf: "", birth_date_br: "", mother_name: "",
  marital_status: "", escolaridade: "",
  whatsapp: "", email: "",
  cep: "", number: "", street: "", neighborhood: "", complement: "",
  city: "", state: "SP",
  residence_type: "", residence_time: "",
  employment_type: "", company_name: "", occupation: "",
  monthly_income: 0, other_income: 0, time_at_job: "",
  down_payment: 0, installments: 48,
  vendor_notes: "",
};

export function CreditWizard({ profile, vehicle, seller }: Props) {
  const navigate = useNavigate();
  const submit = useServerFn(submitApplication);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState(empty);
  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const [selectedBanks, setSelectedBanks] = useState<string[]>(["santander", "bv"]);
  const [pending, setPending] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Apply store accent color as --orange
  useEffect(() => {
    const color = profile.accent_color || "#E8610A";
    document.documentElement.style.setProperty("--ficha-orange", color);
    return () => { document.documentElement.style.removeProperty("--ficha-orange"); };
  }, [profile.accent_color]);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const initials = useMemo(() => {
    const words = (profile.store_name || "L").trim().split(/\s+/);
    return (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
  }, [profile.store_name]);

  const priceBRL = (v: number | string | null | undefined) => {
    const n = Number(v ?? 0);
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  };

  const onCepBlur = async () => {
    const c = form.cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const j = await r.json();
      if (!j.erro) {
        setForm((f) => ({
          ...f,
          street: j.logradouro || f.street,
          neighborhood: j.bairro || f.neighborhood,
          city: j.localidade || f.city,
          state: j.uf || f.state,
        }));
      }
    } catch {} finally { setCepLoading(false); }
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (form.full_name.trim().length < 3) return "Informe seu nome completo";
      if (form.cpf.replace(/\D/g, "").length !== 11) return "CPF inválido";
      if (!brDateToISO(form.birth_date_br)) return "Data de nascimento inválida";
      if (form.mother_name.trim().length < 3) return "Informe o nome da mãe";
      if (!form.marital_status) return "Selecione o estado civil";
      if (form.whatsapp.replace(/\D/g, "").length < 10) return "WhatsApp inválido";
    }
    if (step === 1) {
      if (form.cep.replace(/\D/g, "").length !== 8) return "CEP inválido";
      if (!form.street.trim() || !form.number.trim() || !form.neighborhood.trim()) return "Endereço incompleto";
      if (!form.city.trim() || form.state.length !== 2) return "Informe cidade/UF";
    }
    if (step === 2) {
      if (!form.employment_type) return "Selecione a situação profissional";
      if (form.monthly_income <= 0) return "Informe a renda mensal";
    }
    if (step === 4 && selectedBanks.length === 0) return "Selecione ao menos um banco";
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) { toast.error(err); return; }
    if (step < STEP_LABELS.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => { setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = async () => {
    const iso = brDateToISO(form.birth_date_br);
    if (!iso) { toast.error("Data inválida"); return; }
    const payload = {
      user_id: profile.id,
      vehicle_id: vehicle.id,
      store_slug: profile.store_slug,
      seller_id: seller?.id ?? null,
      full_name: form.full_name,
      cpf: form.cpf,
      birth_date: iso,
      mother_name: form.mother_name,
      marital_status: form.marital_status,
      email: form.email,
      phone: form.whatsapp,
      cep: form.cep,
      street: form.street,
      number: form.number,
      complement: form.complement,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state.toUpperCase(),
      residence_type: form.residence_type,
      occupation: form.occupation,
      company_name: form.company_name,
      employment_type: form.employment_type,
      monthly_income: form.monthly_income,
      other_income: form.other_income,
      time_at_job_months: 0,
      down_payment: form.down_payment,
      installments: form.installments,
      selected_banks: selectedBanks,
      vendor_notes: form.vendor_notes,
    };
    const parsed = ApplicationSchema.safeParse(payload);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }

    setSubmitting(true);
    setPending(true);
    try {
      const result = await submit({ data: parsed.data });

      for (const [type, file] of Object.entries(docs)) {
        if (!file) continue;
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = `${result.id}/${type}.${ext}`;
        const { error: upErr } = await supabase.storage.from("credit-docs").upload(path, file, { upsert: true });
        if (!upErr) {
          await supabase.from("credit_application_documents").insert({ application_id: result.id, doc_type: type, storage_path: path });
        }
      }

      // Notify seller via WhatsApp (open on client device)
      const notifyPhone = (seller?.whatsapp || profile.whatsapp || "").replace(/\D/g, "");
      if (notifyPhone) {
        const msg = `🚗 Nova ficha de financiamento recebida!\n\nCliente: ${form.full_name}\nVeículo: ${vehicle.brand ?? ""} ${vehicle.model ?? ""} ${vehicle.year ?? ""}\n\n📋 Protocolo: #${result.protocol}`;
        const url = `https://wa.me/55${notifyPhone}?text=${encodeURIComponent(msg)}`;
        // open in new tab — non-blocking
        try { window.open(url, "_blank", "noopener"); } catch {}
      }

      setTimeout(() => {
        navigate({ to: "/loja/$slug/ficha-enviada", params: { slug: profile.store_slug }, search: { p: result.protocol } });
      }, 1500);
    } catch (e: any) {
      setPending(false);
      toast.error(e?.message || "Falha ao enviar ficha");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadField = (k: string, file: File | null) => setDocs((d) => ({ ...d, [k]: file }));

  const pct = Math.round(((step + (pending ? 1 : 0)) / STEP_LABELS.length) * 100);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ficha-root">
        {/* HEADER LOJISTA */}
        <div className="dealer-header">
          <div className="dealer-logo">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
            ) : initials.toUpperCase()}
          </div>
          <div className="dealer-info">
            <div className="dealer-name">{profile.store_name}</div>
            <div className="dealer-sub">Proposta de financiamento</div>
          </div>
          <div className="secure-badge">🔒 Seguro</div>
        </div>

        {/* CAR CARD */}
        <div className="car-card">
          <div className="car-image">
            {vehicle._cover ? (
              <img src={vehicle._cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 64 }}>🚗</span>
            )}
            <div className="car-badge">DISPONÍVEL</div>
          </div>
          <div className="car-info">
            <div>
              <div className="car-name">{vehicle.brand} {vehicle.model}</div>
              <div className="car-details">
                {vehicle.year} · {(vehicle.km ?? 0).toLocaleString("pt-BR")} km
                {vehicle.fuel ? ` · ${vehicle.fuel}` : ""}
              </div>
            </div>
            <div>
              <div className="car-price">{priceBRL(vehicle.sale_price)}</div>
              {vehicle.fipe_value ? <div className="car-fipe">FIPE {priceBRL(vehicle.fipe_value)}</div> : null}
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="progress-wrap">
          <div className="progress-header">
            <span className="progress-title">
              {pending ? "⏳ Aguardando aprovação do vendedor" : `Etapa ${step + 1} de ${STEP_LABELS.length} — ${STEP_LABELS[step]}`}
            </span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* STEPS DOTS */}
        <div className="steps-nav">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className={`step-dot ${pending ? "done" : i < step ? "done" : i === step ? "active" : ""}`} />
          ))}
        </div>

        {!pending && (
          <>
            {step === 0 && (
              <div className="form-section active">
                <SectionHeader nr="Etapa 01 — Identificação" title={<>Dados<br />Pessoais</>} sub="Informações básicas para análise de crédito" />
                <FG label="Nome completo" req>
                  <input className="field-input" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Como está no documento" />
                </FG>
                <div className="field-row">
                  <FG label="CPF" req>
                    <input className="field-input" inputMode="numeric" value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
                  </FG>
                  <FG label="Data de Nasc." req>
                    <input className="field-input" inputMode="numeric" value={form.birth_date_br} onChange={(e) => set("birth_date_br", maskDate(e.target.value))} placeholder="DD/MM/AAAA" maxLength={10} />
                  </FG>
                </div>
                <FG label="Nome da mãe" req>
                  <input className="field-input" value={form.mother_name} onChange={(e) => set("mother_name", e.target.value)} placeholder="Nome completo da mãe" />
                </FG>
                <div className="field-row">
                  <FG label="Estado civil" req>
                    <select className="field-select" value={form.marital_status} onChange={(e) => set("marital_status", e.target.value)}>
                      <option value="">Selecione</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                      <option value="uniao_estavel">União estável</option>
                    </select>
                  </FG>
                  <FG label="Escolaridade">
                    <select className="field-select" value={form.escolaridade} onChange={(e) => set("escolaridade", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>Fundamental</option>
                      <option>Médio</option>
                      <option>Superior incompleto</option>
                      <option>Superior completo</option>
                      <option>Pós-graduação</option>
                    </select>
                  </FG>
                </div>
                <div className="field-row">
                  <FG label="WhatsApp" req>
                    <input className="field-input" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
                  </FG>
                  <FG label="Email">
                    <input className="field-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="seu@email.com" />
                  </FG>
                </div>
                <div className="info-box">
                  <span className="info-icon">🔒</span>
                  <span>Seus dados são protegidos e usados apenas para análise de crédito. Não compartilhamos com terceiros.</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="form-section active">
                <SectionHeader nr="Etapa 02 — Localização" title={<>Endereço<br />Residencial</>} sub="Endereço atual onde você reside" />
                <div className="field-row">
                  <FG label="CEP" req>
                    <input className="field-input" inputMode="numeric" value={form.cep} onChange={(e) => set("cep", maskCEP(e.target.value))} onBlur={onCepBlur} placeholder="00000-000" maxLength={9} />
                    <div className="field-hint">{cepLoading ? "Buscando..." : "🔍 Preenche o endereço automaticamente"}</div>
                  </FG>
                  <FG label="Número" req>
                    <input className="field-input" value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="123" />
                  </FG>
                </div>
                <FG label="Rua / Logradouro" req>
                  <input className="field-input" value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Preenchido pelo CEP" />
                </FG>
                <div className="field-row">
                  <FG label="Bairro" req>
                    <input className="field-input" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Seu bairro" />
                  </FG>
                  <FG label="Complemento">
                    <input className="field-input" value={form.complement} onChange={(e) => set("complement", e.target.value)} placeholder="Apto, Bloco..." />
                  </FG>
                </div>
                <div className="field-row">
                  <FG label="Cidade" req>
                    <input className="field-input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Sua cidade" />
                  </FG>
                  <FG label="Estado" req>
                    <select className="field-select" value={form.state} onChange={(e) => set("state", e.target.value)}>
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                        <option key={uf}>{uf}</option>
                      ))}
                    </select>
                  </FG>
                </div>
                <FG label="Tempo de residência">
                  <select className="field-select" value={form.residence_time} onChange={(e) => set("residence_time", e.target.value)}>
                    <option value="">Selecione</option>
                    <option>Menos de 1 ano</option>
                    <option>1 a 2 anos</option>
                    <option>2 a 5 anos</option>
                    <option>Mais de 5 anos</option>
                  </select>
                </FG>
                <FG label="Tipo de moradia">
                  <div className="options-grid">
                    {[
                      { v: "propria", icon: "🏠", label: "Própria" },
                      { v: "alugada", icon: "📋", label: "Alugada" },
                      { v: "familiar", icon: "👨‍👩‍👧", label: "Familiar" },
                      { v: "outro", icon: "🏢", label: "Funcional" },
                    ].map((o) => (
                      <div key={o.v} className={`option-card ${form.residence_type === o.v ? "selected" : ""}`} onClick={() => set("residence_type", o.v)}>
                        <div className="option-icon">{o.icon}</div>
                        <div className="option-label">{o.label}</div>
                      </div>
                    ))}
                  </div>
                </FG>
              </div>
            )}

            {step === 2 && (
              <div className="form-section active">
                <SectionHeader nr="Etapa 03 — Financeiro" title={<>Renda e<br />Profissão</>} sub="Informações para análise de capacidade de pagamento" />
                <FG label="Situação profissional" req>
                  <div className="options-grid">
                    {[
                      { v: "clt", icon: "💼", label: "CLT", sub: "Empregado" },
                      { v: "empresario", icon: "🏢", label: "Empresário", sub: "CNPJ próprio" },
                      { v: "autonomo", icon: "🔧", label: "Autônomo", sub: "Por conta própria" },
                      { v: "aposentado", icon: "👴", label: "Aposentado", sub: "INSS" },
                    ].map((o) => (
                      <div key={o.v} className={`option-card ${form.employment_type === o.v ? "selected" : ""}`} onClick={() => set("employment_type", o.v)}>
                        <div className="option-icon">{o.icon}</div>
                        <div className="option-label">{o.label}</div>
                        <div className="option-sub">{o.sub}</div>
                      </div>
                    ))}
                  </div>
                </FG>
                <FG label="Empresa / Empregador">
                  <input className="field-input" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Nome da empresa" />
                </FG>
                <FG label="Cargo / Função">
                  <input className="field-input" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="Seu cargo atual" />
                </FG>
                <div className="field-row">
                  <FG label="Renda mensal" req>
                    <input className="field-input" inputMode="numeric" value={form.monthly_income ? maskMoney(String(Math.round(form.monthly_income * 100))) : ""} onChange={(e) => set("monthly_income", parseMoney(e.target.value))} placeholder="R$ 0,00" />
                  </FG>
                  <FG label="Outras rendas">
                    <input className="field-input" inputMode="numeric" value={form.other_income ? maskMoney(String(Math.round(form.other_income * 100))) : ""} onChange={(e) => set("other_income", parseMoney(e.target.value))} placeholder="R$ 0,00" />
                  </FG>
                </div>
                <FG label="Tempo no emprego atual">
                  <select className="field-select" value={form.time_at_job} onChange={(e) => set("time_at_job", e.target.value)}>
                    <option value="">Selecione</option>
                    <option>Menos de 6 meses</option>
                    <option>6 meses a 1 ano</option>
                    <option>1 a 2 anos</option>
                    <option>2 a 5 anos</option>
                    <option>Mais de 5 anos</option>
                  </select>
                </FG>
                <div className="divider" />
                <FG label="Entrada disponível">
                  <input className="field-input" inputMode="numeric" value={form.down_payment ? maskMoney(String(Math.round(form.down_payment * 100))) : ""} onChange={(e) => set("down_payment", parseMoney(e.target.value))} placeholder="R$ 0,00" />
                  <div className="field-hint">💡 Maior entrada = menor parcela e maior chance de aprovação</div>
                </FG>
                <FG label="Prazo desejado">
                  <div className="options-grid">
                    {[24, 36, 48, 60].map((p) => (
                      <div key={p} className={`option-card ${form.installments === p ? "selected" : ""}`} onClick={() => set("installments", p)}>
                        <div className="option-label">{p}x</div>
                        <div className="option-sub">{p / 12} anos</div>
                      </div>
                    ))}
                  </div>
                </FG>
              </div>
            )}

            {step === 3 && (
              <div className="form-section active">
                <SectionHeader nr="Etapa 04 — Documentos" title={<>Envie seus<br />Documentos</>} sub="Fotos claras e legíveis. Anexe os documentos para acelerar a análise." />
                <div className="ai-badge">
                  <div className="ai-dot" />
                  Envio seguro — documentos arquivados com criptografia
                </div>
                <div className="doc-grid">
                  {DOC_TYPES.map((d) => {
                    const file = docs[d.k];
                    return (
                      <div key={d.k} className={`doc-item ${file ? "uploaded" : ""}`} onClick={() => fileRefs.current[d.k]?.click()}>
                        <div className="doc-icon">{d.icon}</div>
                        <div className="doc-content">
                          <div className="doc-name">{d.label}</div>
                          <div className="doc-desc">{file ? file.name : d.desc}</div>
                        </div>
                        <div className="doc-action">{file ? "✓" : "+ Enviar"}</div>
                        <input
                          ref={(el) => { fileRefs.current[d.k] = el; }}
                          type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                          onChange={(e) => uploadField(d.k, e.target.files?.[0] ?? null)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="info-box" style={{ marginTop: 16 }}>
                  <span className="info-icon">🤖</span>
                  <span>Seus documentos ficam protegidos e visíveis apenas para o vendedor responsável pela sua ficha.</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="form-section active">
                <SectionHeader nr="Etapa 05 — Análise" title={<>Escolha os<br />Bancos</>} sub="Sua ficha será enviada simultaneamente para todos os bancos selecionados." />
                <div className="banks-grid">
                  {BANKS.map((b) => {
                    const on = selectedBanks.includes(b.id);
                    return (
                      <div key={b.id} className={`bank-card ${on ? "selected" : ""}`} onClick={() =>
                        setSelectedBanks((s) => on ? s.filter((x) => x !== b.id) : [...s, b.id])
                      }>
                        <div className="bank-icon" style={{ background: b.tint }}>{b.icon}</div>
                        <div><div className="bank-name">{b.name}</div></div>
                        <div className="bank-check">{on ? "✓" : ""}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="info-box" style={{ marginTop: 16 }}>
                  <span className="info-icon">⚡</span>
                  <span>Sua ficha será enviada para todos os bancos selecionados simultaneamente. Você recebe as respostas num único painel.</span>
                </div>
                <div className="divider" />
                <FG label="Observações para o vendedor">
                  <textarea className="field-input" style={{ height: 90, resize: "none", lineHeight: 1.6 }} value={form.vendor_notes} onChange={(e) => set("vendor_notes", e.target.value)} placeholder="Alguma informação adicional? Restrição no nome, entrada parcelada, permuta..." />
                </FG>
              </div>
            )}
          </>
        )}

        {pending && (
          <div className="pending-screen active">
            <div className="pending-icon">⏳</div>
            <div className="pending-title">Ficha<br />Recebida!</div>
            <div className="pending-sub">Seus dados foram salvos com segurança.<br />Estamos te direcionando para a confirmação...</div>
            <div className="pending-status">
              <div className="pending-dot" />
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ficha-white)" }}>Notificando o vendedor</div>
                <div style={{ fontSize: 12, color: "var(--ficha-muted)", marginTop: 2 }}>Você receberá retorno em instantes</div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        {!pending && (
          <div className="bottom-nav">
            {step > 0 && (
              <button className="btn-back" type="button" onClick={goPrev} disabled={submitting}>← Voltar</button>
            )}
            <button className="btn-next" type="button" onClick={goNext} disabled={submitting}>
              {step === STEP_LABELS.length - 1 ? "🚀 Enviar ficha" : "Continuar →"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SectionHeader({ nr, title, sub }: { nr: string; title: React.ReactNode; sub: string }) {
  return (
    <div className="section-header">
      <div className="section-number">{nr}</div>
      <div className="section-title">{title}</div>
      <div className="section-subtitle">{sub}</div>
    </div>
  );
}

function FG({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="field-group">
      <label className="field-label">{label} {req && <span>*</span>}</label>
      {children}
    </div>
  );
}

const CSS = `
.ficha-root {
  --ficha-orange: #E8610A;
  --ficha-black: #0D0D0D;
  --ficha-graphite: #1A1A1A;
  --ficha-g2: #222;
  --ficha-g3: #2a2a2a;
  --ficha-g4: #333;
  --ficha-white: #F0F0F0;
  --ficha-muted: #777;
  --ficha-green: #3ecf8e;
  --ficha-blue: #4a9eff;
  --ficha-red: #ff4d4d;
  --ficha-yellow: #f5c842;
  background: var(--ficha-black);
  color: var(--ficha-white);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  min-height: 100vh;
  padding-bottom: 110px;
  /* propagate var from root */
  --ficha-orange-eff: var(--ficha-orange);
}
.ficha-root *, .ficha-root *:before, .ficha-root *:after { box-sizing: border-box; }
.ficha-root .dealer-header { background: var(--ficha-graphite); border-bottom: 2px solid var(--ficha-orange); padding: 16px 20px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 100; }
.ficha-root .dealer-logo { width: 42px; height: 42px; border-radius: 10px; background: var(--ficha-orange); display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 18px; color: white; flex-shrink: 0; overflow:hidden; }
.ficha-root .dealer-info { flex: 1; }
.ficha-root .dealer-name { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 16px; color: var(--ficha-white); }
.ficha-root .dealer-sub { font-size: 11px; color: var(--ficha-muted); }
.ficha-root .secure-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--ficha-green); font-weight: 600; }
.ficha-root .car-card { background: var(--ficha-graphite); margin: 16px; border-radius: 14px; overflow: hidden; border: 1px solid var(--ficha-g4); }
.ficha-root .car-image { width: 100%; height: 160px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.ficha-root .car-badge { position: absolute; top: 12px; right: 12px; background: var(--ficha-orange); color: white; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; letter-spacing: 1px; }
.ficha-root .car-info { padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.ficha-root .car-name { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 20px; color: var(--ficha-white); line-height: 1.1; }
.ficha-root .car-details { font-size: 12px; color: var(--ficha-muted); margin-top: 2px; }
.ficha-root .car-price { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 22px; color: var(--ficha-orange); text-align: right; line-height: 1; }
.ficha-root .car-fipe { font-size: 10px; color: var(--ficha-muted); text-align: right; margin-top: 2px; }
.ficha-root .progress-wrap { padding: 0 16px 16px; }
.ficha-root .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; }
.ficha-root .progress-title { font-size: 12px; font-weight: 600; color: var(--ficha-muted); }
.ficha-root .progress-pct { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; color: var(--ficha-orange); }
.ficha-root .progress-track { height: 6px; background: var(--ficha-g3); border-radius: 3px; overflow: hidden; }
.ficha-root .progress-fill { height: 100%; background: linear-gradient(90deg, var(--ficha-orange), #ff8c00); border-radius: 3px; transition: width 0.5s ease; }
.ficha-root .steps-nav { display: flex; padding: 0 16px; gap: 6px; margin-bottom: 20px; }
.ficha-root .step-dot { flex: 1; height: 4px; border-radius: 2px; background: var(--ficha-g4); transition: background 0.3s; }
.ficha-root .step-dot.active { background: var(--ficha-orange); }
.ficha-root .step-dot.done { background: var(--ficha-green); }
.ficha-root .form-section { display: none; padding: 0 16px; animation: ficha-fade 0.3s ease; }
.ficha-root .form-section.active { display: block; }
@keyframes ficha-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ficha-root .section-header { margin-bottom: 24px; }
.ficha-root .section-number { font-size: 11px; font-weight: 700; color: var(--ficha-orange); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
.ficha-root .section-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 32px; color: var(--ficha-white); line-height: 1; }
.ficha-root .section-subtitle { font-size: 13px; color: var(--ficha-muted); margin-top: 6px; font-weight: 300; }
.ficha-root .field-group { margin-bottom: 18px; }
.ficha-root .field-label { font-size: 12px; font-weight: 600; color: var(--ficha-muted); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 7px; display: block; }
.ficha-root .field-label span { color: var(--ficha-orange); }
.ficha-root .field-input { width: 100%; background: var(--ficha-g2); border: 1.5px solid var(--ficha-g4); border-radius: 10px; padding: 13px 16px; color: var(--ficha-white); font-size: 15px; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; -webkit-appearance: none; }
.ficha-root .field-input:focus { border-color: var(--ficha-orange); background: rgba(232,97,10,0.04); }
.ficha-root .field-input::placeholder { color: var(--ficha-g4); }
.ficha-root .field-select { width: 100%; background: var(--ficha-g2); border: 1.5px solid var(--ficha-g4); border-radius: 10px; padding: 13px 16px; color: var(--ficha-white); font-size: 15px; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; -webkit-appearance: none; cursor: pointer; }
.ficha-root .field-select:focus { border-color: var(--ficha-orange); }
.ficha-root .field-select option { background: var(--ficha-g2); }
.ficha-root .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ficha-root .field-hint { font-size: 11px; color: var(--ficha-muted); margin-top: 5px; display: flex; align-items: center; gap: 4px; }
.ficha-root .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ficha-root .option-card { background: var(--ficha-g2); border: 1.5px solid var(--ficha-g4); border-radius: 10px; padding: 14px 12px; cursor: pointer; transition: all 0.2s; text-align: center; }
.ficha-root .option-card:hover { border-color: var(--ficha-orange); }
.ficha-root .option-card.selected { border-color: var(--ficha-orange); background: rgba(232,97,10,0.08); }
.ficha-root .option-icon { font-size: 24px; margin-bottom: 6px; }
.ficha-root .option-label { font-size: 13px; font-weight: 600; color: var(--ficha-white); }
.ficha-root .option-sub { font-size: 11px; color: var(--ficha-muted); margin-top: 2px; }
.ficha-root .banks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ficha-root .bank-card { background: var(--ficha-g2); border: 1.5px solid var(--ficha-g4); border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; }
.ficha-root .bank-card:hover { border-color: var(--ficha-orange); }
.ficha-root .bank-card.selected { border-color: var(--ficha-green); background: rgba(62,207,142,0.05); }
.ficha-root .bank-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.ficha-root .bank-name { font-size: 13px; font-weight: 600; color: var(--ficha-white); }
.ficha-root .bank-check { margin-left: auto; width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--ficha-g4); display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all 0.2s; }
.ficha-root .bank-card.selected .bank-check { background: var(--ficha-green); border-color: var(--ficha-green); color: var(--ficha-black); }
.ficha-root .doc-grid { display: grid; gap: 10px; }
.ficha-root .doc-item { background: var(--ficha-g2); border: 1.5px dashed var(--ficha-g4); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s; }
.ficha-root .doc-item:hover { border-color: var(--ficha-orange); }
.ficha-root .doc-item.uploaded { border-style: solid; border-color: var(--ficha-green); background: rgba(62,207,142,0.04); }
.ficha-root .doc-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--ficha-g3); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.ficha-root .doc-item.uploaded .doc-icon { background: rgba(62,207,142,0.1); }
.ficha-root .doc-content { flex: 1; min-width: 0; }
.ficha-root .doc-name { font-size: 14px; font-weight: 600; color: var(--ficha-white); }
.ficha-root .doc-desc { font-size: 12px; color: var(--ficha-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ficha-root .doc-item.uploaded .doc-desc { color: var(--ficha-green); }
.ficha-root .doc-action { font-size: 12px; font-weight: 600; color: var(--ficha-orange); flex-shrink: 0; }
.ficha-root .doc-item.uploaded .doc-action { color: var(--ficha-green); }
.ficha-root .ai-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(74,158,255,0.1); border: 1px solid rgba(74,158,255,0.25); border-radius: 20px; padding: 5px 12px; font-size: 11px; color: var(--ficha-blue); font-weight: 600; margin: 10px 0; }
.ficha-root .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ficha-blue); animation: ficha-pulse 1.5s infinite; }
@keyframes ficha-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.ficha-root .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; padding: 16px 20px; background: var(--ficha-graphite); border-top: 1px solid var(--ficha-g4); display: flex; gap: 12px; z-index: 200; }
.ficha-root .btn-back { flex: 1; padding: 14px; border: 1.5px solid var(--ficha-g4); border-radius: 12px; background: transparent; color: var(--ficha-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.ficha-root .btn-back:hover { border-color: var(--ficha-white); color: var(--ficha-white); }
.ficha-root .btn-next { flex: 3; padding: 14px; border: none; border-radius: 12px; background: var(--ficha-orange); color: white; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; }
.ficha-root .btn-next:hover { filter: brightness(0.92); transform: translateY(-1px); }
.ficha-root .btn-next:disabled { background: var(--ficha-g4); cursor: not-allowed; transform: none; }
.ficha-root .divider { height: 1px; background: var(--ficha-g3); margin: 20px 0; }
.ficha-root .info-box { background: rgba(74,158,255,0.06); border: 1px solid rgba(74,158,255,0.2); border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #bbb; line-height: 1.7; margin: 14px 0; display: flex; gap: 10px; align-items: flex-start; }
.ficha-root .info-box .info-icon { font-size: 16px; flex-shrink: 0; }
.ficha-root .pending-screen { padding: 32px 20px; text-align: center; }
.ficha-root .pending-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(245,200,66,0.1); border: 2px solid var(--ficha-yellow); display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; }
.ficha-root .pending-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 36px; color: var(--ficha-white); margin-bottom: 8px; line-height: 1; }
.ficha-root .pending-sub { font-size: 13px; color: var(--ficha-muted); line-height: 1.7; margin-bottom: 28px; font-weight: 300; }
.ficha-root .pending-status { background: var(--ficha-g2); border: 1px solid rgba(245,200,66,0.2); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
.ficha-root .pending-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ficha-yellow); animation: ficha-pulse 1.5s infinite; flex-shrink: 0; }
`;
