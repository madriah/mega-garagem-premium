import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  marca: z.string().max(60).default(""),
  modelo: z.string().max(60).default(""),
  ano: z.string().max(10).default(""),
  km: z.number().nonnegative().default(0),
  preco: z.number().nonnegative().default(0),
  diferenciais: z.string().max(240).default(""),
  condicao: z.string().max(120).default(""),
  tier: z.enum(["basico", "pro", "elite"]).default("basico"),
});

export type ReelsScript = {
  hook_text: string;
  hook_category: "pergunta" | "numero_chocante" | "contraste" | "urgencia" | "curiosidade";
  bullets: string[];
  cta_text: string;
  preco_label: string;
};

export const generateReelsScript = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<ReelsScript> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const preco = data.preco > 0 ? `R$ ${data.preco.toLocaleString("pt-BR")}` : "consultar";
    const km = data.km > 0 ? `${data.km.toLocaleString("pt-BR")} km` : "km baixa";

    const prompt = `Você gera roteiros de Reels de 20-26s para venda de veículos no Brasil.

REGRAS:
- hook_text: máx 12 palavras, sem clichê de vendedor, prende nos primeiros 3s
- hook_category: uma de [pergunta, numero_chocante, contraste, urgencia, curiosidade]
- bullets: array com EXATAMENTE 3 diferenciais, cada um com MÁX 6 palavras (viram texto na tela)
- cta_text: direto, com urgência real do estoque (não use "chame agora" genérico)
- preco_label: label curta do preço para exibir (ex: "R$ 48.900" ou "12x de R$ 899")

VEÍCULO:
${data.marca} ${data.modelo} ${data.ano}
${km} rodados
Preço: ${preco}
Diferenciais cadastrados: ${data.diferenciais || "revisado, único dono"}
Condição de pagamento: ${data.condicao || "aceita troca e financia"}

Retorne APENAS JSON válido, sem markdown, sem backticks:
{"hook_text":"","hook_category":"","bullets":["","",""],"cta_text":"","preco_label":""}`;

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
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Limite de uso atingido. Tente novamente em instantes.");
      if (res.status === 402) throw new Error("Créditos de IA esgotados.");
      throw new Error(`Falha na IA (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    let raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed: Partial<ReelsScript>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("IA retornou JSON inválido");
    }

    const validCats: ReelsScript["hook_category"][] = [
      "pergunta",
      "numero_chocante",
      "contraste",
      "urgencia",
      "curiosidade",
    ];
    const cat = validCats.includes(parsed.hook_category as ReelsScript["hook_category"])
      ? (parsed.hook_category as ReelsScript["hook_category"])
      : "curiosidade";

    const bullets = Array.isArray(parsed.bullets) ? parsed.bullets : [];
    const bulletsClean: string[] = bullets
      .map((b) => String(b ?? "").trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 3);
    while (bulletsClean.length < 3) bulletsClean.push("Confira na loja");

    return {
      hook_text: String(parsed.hook_text ?? "").slice(0, 120) || `${data.marca} ${data.modelo}`,
      hook_category: cat,
      bullets: bulletsClean,
      cta_text: String(parsed.cta_text ?? "").slice(0, 120) || "Chama no WhatsApp hoje",
      preco_label: String(parsed.preco_label ?? "").slice(0, 40) || preco,
    };
  });
