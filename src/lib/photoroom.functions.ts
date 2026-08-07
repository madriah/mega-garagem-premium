import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  /** Base64 (sem prefixo data:) da foto original */
  imageBase64: z.string().min(100).max(20_000_000),
  mimeType: z.string().max(60).optional().default("image/jpeg"),
});

const SHOWROOM_PROMPT =
  "showroom de concessionária moderno, piso claro, iluminação profissional";

/**
 * Envia a foto para a Photoroom Image Editing API e devolve a imagem editada
 * (base64). Roda em modo sandbox (sem consumir crédito, com marca d'água).
 * Nunca lança para o cliente sem motivo: retorna { ok: false } em falha.
 */
export const editVehiclePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.PHOTOROOM_API_KEY;
    if (!key) {
      console.error("[photoroom] PHOTOROOM_API_KEY ausente");
      return { ok: false as const, reason: "missing_key" };
    }

    try {
      const bytes = Uint8Array.from(atob(data.imageBase64), (c) => c.charCodeAt(0));
      const form = new FormData();
      form.append("imageFile", new Blob([bytes], { type: data.mimeType }), "photo.jpg");
      form.append("background.prompt", SHOWROOM_PROMPT);
      form.append("sandbox", "true");

      const res = await fetch("https://image-api.photoroom.com/v2/edit", {
        method: "POST",
        headers: { "x-api-key": key, accept: "image/png, application/json" },
        body: form,
        signal: AbortSignal.timeout(60_000),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[photoroom] falha", res.status, detail.slice(0, 300));
        return { ok: false as const, reason: `http_${res.status}` };
      }

      const buf = new Uint8Array(await res.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buf.length; i += 8192) {
        binary += String.fromCharCode(...buf.subarray(i, i + 8192));
      }
      return {
        ok: true as const,
        imageBase64: btoa(binary),
        contentType: res.headers.get("content-type") ?? "image/png",
        /** sandbox = imagem de teste, contém marca d'água */
        preview: true as const,
      };
    } catch (err) {
      console.error("[photoroom] erro", err instanceof Error ? err.message : err);
      return { ok: false as const, reason: "network" };
    }
  });
