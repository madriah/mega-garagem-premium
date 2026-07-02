import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { ApplicationSchema } from "./credit-schema";

const AttachDocSchema = z.object({
  application_id: z.string().uuid(),
  doc_type: z.string().min(1).max(50),
  storage_path: z.string().min(1).max(300),
});

export const attachApplicationDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AttachDocSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Enforce storage path is scoped to this application id
    if (!data.storage_path.startsWith(`${data.application_id}/`)) {
      throw new Error("Invalid storage path");
    }
    const { data: app } = await supabaseAdmin
      .from("credit_applications")
      .select("id")
      .eq("id", data.application_id)
      .maybeSingle();
    if (!app) throw new Error("Ficha não encontrada");

    const { error } = await supabaseAdmin
      .from("credit_application_documents")
      .insert({
        application_id: data.application_id,
        doc_type: data.doc_type,
        storage_path: data.storage_path,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ApplicationSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      getRequestHeader("x-real-ip") ||
      "unknown";
    const ua = getRequestHeader("user-agent") || "unknown";

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, store_slug")
      .eq("id", data.user_id)
      .eq("store_slug", data.store_slug)
      .maybeSingle();
    if (!profile) throw new Error("Loja inválida");

    if (data.vehicle_id) {
      const { data: v } = await supabaseAdmin
        .from("vehicles")
        .select("id")
        .eq("id", data.vehicle_id)
        .eq("user_id", data.user_id)
        .maybeSingle();
      if (!v) throw new Error("Veículo inválido");
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("credit_applications")
      .insert({
        user_id: data.user_id,
        vehicle_id: data.vehicle_id ?? null,
        store_slug: data.store_slug,
        full_name: data.full_name,
        cpf: data.cpf,
        birth_date: data.birth_date,
        mother_name: data.mother_name,
        marital_status: data.marital_status || null,
        email: data.email || `${data.cpf.replace(/\D/g, "")}@sem-email.local`,
        phone: data.phone,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        residence_type: data.residence_type || null,
        occupation: data.occupation || null,
        company_name: data.company_name || null,
        employment_type: data.employment_type || null,
        monthly_income: data.monthly_income,
        other_income: data.other_income,
        time_at_job_months: data.time_at_job_months,
        down_payment: data.down_payment,
        installments: data.installments,
        consent_lgpd: true,
        consent_signed_at: new Date().toISOString(),
        signature_ip: ip,
        signature_user_agent: ua,
        ...({
          seller_id: data.seller_id ?? null,
          selected_banks: data.selected_banks,
          vendor_notes: data.vendor_notes || null,
        } as any),
      })
      .select("id, protocol")
      .single();

    if (error || !inserted) throw new Error(error?.message || "Falha ao salvar ficha");
    return { id: inserted.id, protocol: inserted.protocol };
  });
