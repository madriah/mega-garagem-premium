import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, MessageCircle, Loader2, Trash2, FileBadge } from "lucide-react";
import { formatBRL } from "@/lib/fipe";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/credit-schema";
import { generateApplicationPDF } from "@/lib/credit-pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications/$id")({ component: Detail });

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR") : "—");
const dash = (v: any) => (v == null || v === "" ? "—" : String(v));

function Detail() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: app, isLoading } = useQuery({
    queryKey: ["application", id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("credit_applications")
        .select("*,vehicles(id,brand,model,year,sale_price,plate)")
        .eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: docs } = useQuery({
    queryKey: ["application-docs", id],
    enabled: !!app,
    queryFn: async () => {
      const { data } = await supabase.from("credit_application_documents").select("*").eq("application_id", id);
      if (!data?.length) return [];
      const paths = data.map((d) => d.storage_path);
      const { data: signed } = await supabase.storage.from("credit-docs").createSignedUrls(paths, 60 * 60 * 24);
      return data.map((d, i) => ({ ...d, url: signed?.[i]?.signedUrl ?? "" }));
    },
  });

  const { data: notes } = useQuery({
    queryKey: ["application-notes", id],
    enabled: !!app,
    queryFn: async () => {
      const { data } = await supabase.from("credit_application_notes").select("*").eq("application_id", id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // mark as read once
  useEffect(() => {
    if (app && !app.read_at) {
      supabase.from("credit_applications").update({ read_at: new Date().toISOString() }).eq("id", id);
    }
  }, [app, id]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="size-6 animate-spin" /></div>;
  if (!app) return <p className="p-8 text-center text-muted-foreground">Ficha não encontrada.</p>;

  const setStatus = async (newStatus: string) => {
    setBusy(true);
    const { error } = await supabase.from("credit_applications").update({ status: newStatus }).eq("id", id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Status atualizado"); qc.invalidateQueries({ queryKey: ["application", id] }); qc.invalidateQueries({ queryKey: ["applications"] }); }
  };

  const addNote = async () => {
    if (!note.trim() || !user) return;
    const { error } = await supabase.from("credit_application_notes").insert({ application_id: id, user_id: user.id, note: note.trim() });
    if (error) toast.error(error.message); else { setNote(""); qc.invalidateQueries({ queryKey: ["application-notes", id] }); }
  };

  const remove = async () => {
    if (!confirm("Excluir esta ficha? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("credit_applications").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Ficha excluída"); navigate({ to: "/applications" }); }
  };

  const downloadPdf = () => generateApplicationPDF(app, profile?.store_name ?? "Loja");

  const waUrl = `https://wa.me/55${(app.whatsapp || app.phone).replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${app.full_name.split(" ")[0]}! Sobre sua solicitação de financiamento (protocolo #${app.protocol})...`)}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Voltar para fichas</Link>

      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">PROTOCOLO #{app.protocol}</p>
          <h1 className="mt-1 truncate text-3xl">{app.full_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recebida em {fmtDate(app.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={app.status} onValueChange={setStatus} disabled={busy}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Badge variant="outline" className={STATUS_COLORS[app.status]}>{STATUS_LABELS[app.status]}</Badge>
          <Button variant="outline" size="sm" onClick={downloadPdf}><Download className="size-4" /> PDF</Button>
          <a href={waUrl} target="_blank" rel="noreferrer"><Button size="sm"><MessageCircle className="size-4" /> WhatsApp</Button></a>
          <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="size-4" /></Button>
        </div>
      </header>

      {app.vehicles && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Veículo de interesse</p>
          <p className="mt-1 font-medium">{app.vehicles.brand} {app.vehicles.model} {app.vehicles.year} · {formatBRL(Number(app.vehicles.sale_price))}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Dados pessoais">
            <Row label="CPF" value={app.cpf} />
            <Row label="RG" value={dash(app.rg)} />
            <Row label="Nascimento" value={app.birth_date ? new Date(app.birth_date).toLocaleDateString("pt-BR") : "—"} />
            <Row label="Nome da mãe" value={app.mother_name} />
            <Row label="Estado civil" value={app.marital_status} />
            <Row label="E-mail" value={app.email} />
            <Row label="Telefone" value={app.phone} />
            {app.whatsapp && <Row label="WhatsApp" value={app.whatsapp} />}
          </Card>
          <Card title="Endereço">
            <Row label="CEP" value={app.cep} />
            <Row label="Endereço" value={`${app.street}, ${app.number}${app.complement ? ` — ${app.complement}` : ""}`} />
            <Row label="Bairro" value={app.neighborhood} />
            <Row label="Cidade/UF" value={`${app.city}/${app.state}`} />
            <Row label="Tipo" value={app.residence_type} />
            <Row label="Tempo de residência" value={`${app.residence_time_months || 0} meses`} />
          </Card>
          <Card title="Profissional e renda">
            <Row label="Profissão" value={app.occupation} />
            <Row label="Empresa" value={dash(app.company_name)} />
            <Row label="Telefone empresa" value={dash(app.company_phone)} />
            <Row label="Vínculo" value={app.employment_type} />
            <Row label="Renda mensal" value={formatBRL(Number(app.monthly_income || 0))} />
            <Row label="Outras rendas" value={formatBRL(Number(app.other_income || 0))} />
            <Row label="Tempo no emprego" value={`${app.time_at_job_months || 0} meses`} />
          </Card>
          <Card title="Proposta">
            <Row label="Entrada" value={formatBRL(Number(app.down_payment || 0))} />
            <Row label="Parcelas" value={String(app.installments || "—")} />
            <Row label="Parcela desejada" value={formatBRL(Number(app.desired_installment_value || 0))} />
            <Row label="Carro na troca" value={app.has_trade_in ? `Sim — ${app.trade_in_description || ""}` : "Não"} />
          </Card>
          {Array.isArray(app.references) && app.references.length > 0 && (
            <Card title="Referências">
              {app.references.map((r: any, i: number) => (
                <div key={i} className="mb-2 rounded-lg border border-border bg-background/40 p-3 last:mb-0">
                  <p className="font-medium">{r.name} <span className="text-xs text-muted-foreground">({r.relationship})</span></p>
                  <p className="text-sm text-muted-foreground">{r.phone}</p>
                </div>
              ))}
            </Card>
          )}
          <Card title="Consentimento e assinatura">
            <Row label="LGPD aceito" value={app.consent_lgpd ? "Sim" : "Não"} />
            <Row label="Consulta de score" value={app.consent_score ? "Autorizada" : "Não autorizada"} />
            <Row label="Assinado em" value={fmtDate(app.consent_signed_at)} />
            <Row label="IP" value={dash(app.signature_ip)} />
            {app.signature_data_url && (
              <div className="mt-3">
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Assinatura</p>
                <div className="overflow-hidden rounded-lg bg-white p-2"><img src={app.signature_data_url} alt="Assinatura" className="max-h-32" /></div>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Documentos">
            {!docs?.length ? <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p> : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-3 text-sm hover:border-primary/50">
                      <FileBadge className="size-4 text-primary" />
                      <span className="flex-1 truncate">{labelDoc(d.doc_type)}</span>
                      <Download className="size-3.5 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Anotações internas">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Anotação privada (só você vê)" />
            <Button size="sm" className="mt-2" onClick={addNote} disabled={!note.trim()}>Adicionar</Button>
            <div className="mt-4 space-y-2">
              {(notes ?? []).map((n) => (
                <div key={n.id} className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="whitespace-pre-wrap text-sm">{n.note}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{fmtDate(n.created_at)}</p>
                </div>
              ))}
              {(notes ?? []).length === 0 && <p className="text-xs text-muted-foreground">Sem anotações ainda.</p>}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value == null || value === "" ? "—" : String(value)}</span>
    </div>
  );
}
function labelDoc(t: string) {
  return { cnh: "CNH", comprovante_renda: "Comprovante de renda", comprovante_endereco: "Comprovante de endereço", outro: "Outro" }[t] ?? t;
}
