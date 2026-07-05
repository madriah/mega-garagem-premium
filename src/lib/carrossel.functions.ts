import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  tema: z.string().min(1).max(80),
  persona: z.string().min(1).max(80),
  estilo: z.string().min(1).max(80),
  cidade: z.string().min(1).max(80),
  loja: z.string().max(80).optional().default(""),
  whatsapp: z.string().max(40).optional().default(""),
});

export type Slide = {
  numero: number;
  titulo: string;
  corpo: string;
  imagemQuery: string;
};

export const generateCarrossel = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const prompt = `Você é copywriter especialista em Instagram para lojas de carros usados no Brasil.
Gere um carrossel de EXATAMENTE 8 slides sobre o tema abaixo, para publicação no feed (1080x1350).

Tema: ${data.tema}
Persona: ${data.persona}
Estilo de linguagem: ${data.estilo}
Cidade: ${data.cidade}
Loja: ${data.loja || "—"}

Estrutura obrigatória:
- Slide 1: GANCHO forte (título curto CAPS + subtítulo emocional)
- Slides 2-6: Desenvolvimento (dor, transformação, benefícios, prova, quebra de objeção)
- Slide 7: Oferta/CTA suave
- Slide 8: CTA final (chamar no WhatsApp, agendar test drive)

Regras:
- Título: máx 5 palavras, CAPS, impactante
- Corpo: máx 18 palavras, direto, sem emojis excessivos (no máximo 1)
- imagemQuery: 2-4 palavras em INGLÊS para buscar foto no Unsplash (ex: "young couple car", "car keys hand", "brazilian family suv")
- Sem hashtags, sem @menções

Retorne APENAS JSON válido no formato:
{"slides":[{"numero":1,"titulo":"...","corpo":"...","imagemQuery":"..."}, ...]}`;

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
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    let parsed: { slides?: Slide[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("IA retornou JSON inválido");
    }
    const slides = (parsed.slides ?? []).slice(0, 8).map((s, i) => ({
      numero: i + 1,
      titulo: String(s.titulo ?? "").slice(0, 60),
      corpo: String(s.corpo ?? "").slice(0, 200),
      imagemQuery: String(s.imagemQuery ?? "car").slice(0, 60),
    }));
    if (slides.length < 8) throw new Error("IA não retornou 8 slides");
    return { slides };
  });
