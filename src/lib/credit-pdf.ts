import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBRL } from "./fipe";
import { STATUS_LABELS } from "./credit-schema";

type App = Record<string, any>;

const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
const fmtMoney = (n: any) => (n != null ? formatBRL(Number(n)) : "—");
const dash = (v: any) => (v == null || v === "" ? "—" : String(v));

export function generateApplicationPDF(app: App, storeName: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // header
  doc.setFillColor(232, 97, 10);
  doc.rect(0, 0, W, 60, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FICHA DIGITAL DE FINANCIAMENTO", 40, 35);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${storeName} · Protocolo #${app.protocol}`, 40, 52);

  doc.setTextColor(20);
  let y = 90;

  const section = (title: string, rows: [string, any][]) => {
    autoTable(doc, {
      startY: y,
      head: [[{ content: title, colSpan: 2, styles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: "bold" } }]],
      body: rows.map(([k, v]) => [k, dash(v)]),
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 160, fillColor: [245, 245, 245] } },
      margin: { left: 40, right: 40 },
    });
    y = (doc as any).lastAutoTable.finalY + 15;
  };

  section("DADOS PESSOAIS", [
    ["Status", STATUS_LABELS[app.status] ?? app.status],
    ["Nome completo", app.full_name],
    ["CPF", app.cpf],
    ["RG", app.rg],
    ["Nascimento", fmtDate(app.birth_date)],
    ["Nome da mãe", app.mother_name],
    ["Estado civil", app.marital_status],
    ["Nacionalidade", app.nationality],
    ["E-mail", app.email],
    ["Telefone", app.phone],
    ["WhatsApp", app.whatsapp],
  ]);
  section("ENDEREÇO", [
    ["CEP", app.cep],
    ["Logradouro", `${app.street}, ${app.number}${app.complement ? ` — ${app.complement}` : ""}`],
    ["Bairro", app.neighborhood],
    ["Cidade/UF", `${app.city}/${app.state}`],
    ["Tipo de residência", app.residence_type],
    ["Tempo de residência (meses)", app.residence_time_months],
  ]);
  section("PROFISSIONAL", [
    ["Profissão", app.occupation],
    ["Empresa", app.company_name],
    ["Telefone da empresa", app.company_phone],
    ["Vínculo", app.employment_type],
    ["Renda mensal", fmtMoney(app.monthly_income)],
    ["Outras rendas", fmtMoney(app.other_income)],
    ["Tempo no emprego (meses)", app.time_at_job_months],
  ]);
  section("PROPOSTA", [
    ["Entrada", fmtMoney(app.down_payment)],
    ["Parcelas", app.installments],
    ["Parcela desejada", fmtMoney(app.desired_installment_value)],
    ["Carro na troca", app.has_trade_in ? `Sim — ${app.trade_in_description || ""}` : "Não"],
  ]);

  const refs = Array.isArray(app.references) ? app.references : [];
  if (refs.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [[{ content: "REFERÊNCIAS", colSpan: 3, styles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: "bold" } }], ["Nome", "Vínculo", "Telefone"]],
      body: refs.map((r: any) => [dash(r.name), dash(r.relationship), dash(r.phone)]),
      styles: { fontSize: 9, cellPadding: 5 },
      margin: { left: 40, right: 40 },
    });
    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // consent + signature
  if (y > 650) { doc.addPage(); y = 60; }
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CONSENTIMENTO LGPD E ASSINATURA", 40, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Aceite LGPD: ${app.consent_lgpd ? "SIM" : "NÃO"}  ·  Consulta de score: ${app.consent_score ? "SIM" : "NÃO"}`, 40, y);
  y += 12;
  doc.text(`Assinado em: ${app.consent_signed_at ? new Date(app.consent_signed_at).toLocaleString("pt-BR") : "—"}`, 40, y);
  y += 12;
  doc.text(`IP: ${dash(app.signature_ip)}`, 40, y);
  y += 16;

  if (app.signature_data_url) {
    try {
      doc.addImage(app.signature_data_url, "PNG", 40, y, 200, 80);
      doc.setDrawColor(180);
      doc.line(40, y + 85, 240, y + 85);
      doc.setFontSize(8);
      doc.text(app.full_name, 40, y + 100);
    } catch {}
  }

  doc.save(`ficha-${app.protocol}.pdf`);
}
