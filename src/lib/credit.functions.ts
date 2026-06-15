import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { ApplicationSchema } from "./credit-schema";

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ApplicationSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // capture IP + UA for LGPD audit trail
    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      getRequestHeader("x-real-ip") ||
      "unknown";
    const ua = getRequestHeader("user-agent") || "unknown";

    // validate the user/store exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, store_slug")
      .eq("id", data.user_id)
      .eq("store_slug", data.store_slug)
      .maybeSingle();
    if (!profile) throw new Error("Loja inválida");

    // validate vehicle, if linked
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
        rg: data.rg || null,
        birth_date: data.birth_date,
        mother_name: data.mother_name,
        gender: data.gender ?? null,
        marital_status: data.marital_status,
        nationality: data.nationality,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        residence_type: data.residence_type,
        residence_time_months: data.residence_time_months,
        occupation: data.occupation,
        company_name: data.company_name || null,
        company_phone: data.company_phone || null,
        employment_type: data.employment_type,
        monthly_income: data.monthly_income,
        other_income: data.other_income,
        time_at_job_months: data.time_at_job_months,
        references: data.references,
        down_payment: data.down_payment,
        installments: data.installments,
        desired_installment_value: data.desired_installment_value,
        has_trade_in: data.has_trade_in,
        trade_in_description: data.trade_in_description || null,
        consent_lgpd: data.consent_lgpd,
        consent_score: data.consent_score,
        consent_signed_at: new Date().toISOString(),
        signature_data_url: data.signature_data_url,
        signature_ip: ip,
        signature_user_agent: ua,
      })
      .select("id, protocol")
      .single();

    if (error || !inserted) throw new Error(error?.message || "Falha ao salvar ficha");
    return { id: inserted.id, protocol: inserted.protocol };
  });
