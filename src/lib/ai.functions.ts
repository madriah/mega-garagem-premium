import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  brand: z.string().min(1).max(80),
  model: z.string().min(1).max(160),
  year: z.string().min(1).max(20),
  fuel: z.string().max(40).optional().default(""),
  km: z.number().min(0).max(2000000).optional().default(0),
  color: z.string().max(40).optional().default(""),
  fipe_value: z.number().min(0).max(10000000).optional().default(0),
  sale_price: z.number().min(0).max(10000000).optional().default(0),
  store_name: z.string().max(120).optional().default(""),
  notes: z.string().max(500).optional().default(""),
});

export const generateDescription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const prompt = `Você é um copywriter especializado em vendas de carros usados no Brasil para garajistas.
Gere uma descrição PROFISSIONAL, vendedora e direta (máx 90 palavras) em português brasileiro,
ideal para grupos de WhatsApp, feed de Instagram e ficha do site. 
Use tom confiante, destaque benefícios, sem inventar opcionais que não foram informados.
Termine com chamada para WhatsApp.

Dados do veículo:
- Marca/Modelo: ${data.brand} ${data.model}
- Ano: ${data.year}
- Combustível: ${data.fuel}
- KM: ${data.km.toLocaleString("pt-BR")}
- Cor: ${data.color || "não informada"}
- FIPE: R$ ${data.fipe_value.toLocaleString("pt-BR")}
- Preço de venda: R$ ${data.sale_price.toLocaleString("pt-BR")}
- Loja: ${data.store_name}
- Observações do garajista: ${data.notes || "—"}

Retorne APENAS o texto da descrição, sem títulos, sem aspas, sem markdown.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Limite de uso atingido. Tente novamente em instantes.");
      if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
      throw new Error(`Falha na IA (${res.status}): ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) throw new Error("IA retornou resposta vazia");
    return { description: text };
  });
