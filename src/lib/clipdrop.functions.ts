import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  /** Base64 (sem prefixo data:) da imagem original */
  imageBase64: z.string().min(100).max(20_000_000),
  mimeType: z.string().max(60).optional().default("image/jpeg"),
});

/** Remove o fundo da foto via Clipdrop. Retorna PNG (base64) com fundo transparente. */
export const removeBackground = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.CLIPDROP_API_KEY;
    if (!key) throw new Error("CLIPDROP_API_KEY ausente");

    const bytes = Uint8Array.from(atob(data.imageBase64), (c) => c.charCodeAt(0));
    const form = new FormData();
    form.append("image_file", new Blob([bytes], { type: data.mimeType }), "photo.jpg");

    const res = await fetch("https://clipdrop-api.co/remove-background/v1", {
      method: "POST",
      headers: { "x-api-key": key },
      body: form,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[clipdrop] falha", res.status, detail.slice(0, 300));
      throw new Error("Falha ao remover o fundo da foto");
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 8192) {
      binary += String.fromCharCode(...buf.subarray(i, i + 8192));
    }
    return { pngBase64: btoa(binary) };
  });
