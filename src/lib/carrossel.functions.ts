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
  imageSearchQuery: string;
};

export const generateCarrossel = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const prompt = `Você é um copy specialist automotivo. Gere 8 slides de carrossel Instagram.

ENTRADA:
tema: ${data.tema}
persona: ${data.persona}
estilo: ${data.estilo}
cidade: ${data.cidade}

PERSONAS (leia só a sua):
1. Primeiro Carro Mulher: liberdade, autonomia, direção leve
2. Medo de Dirigir: segurança, alívio, sensor/câmera
3. Não Entende Mecânica: confiabilidade, manutenção barata
4. Motorista App: custo/km, lucro, ROI
5. Família: segurança filhos, espaço, praticidade
6. Upgrade SUV: status, comparação racional
7. Investidor: oportunidade, timing, margens
8. Autônomo: produtividade, imagem, categoria
9. Aposentado: simplicidade, conforto, sem complicação
10. Pai/Mãe pro Filho: segurança, controle, seguro barato
11. Recém-Casado: planejamento, versatilidade, crescimento
12. Decepcionado: validação, transparência, sem pressão

ESTRUTURA (8 SLIDES):
1. Hook (problema/oportunidade)
2-6. Educação/benefícios (5 slides)
7. Reforço + prova social
8. CTA com urgência leve

REGRAS DE COPY:
- titulo: CAPS, 3-4 palavras, impacto
- corpo: 1-2 linhas, coloquial (tá, pra, é)
- NO CORPO: envolva as 1-2 palavras/frases mais importantes com [destaque]palavra[/destaque]. Máximo 2 destaques por slide. Escolha palavras de impacto emocional ou urgência.
- CTA no slide 8: urgência leve ("essa semana", "agora", "grátis")

REGRAS DE IMAGEM (imageSearchQuery):
- 3-5 palavras em inglês para buscar no Unsplash
- Relação DIRETA com o conteúdo do slide
- Slide 1 (hook): SEMPRE pessoa + carro. Ex: "young woman leaning car smiling", "man holding car keys dealership", "couple looking car showroom"
- Slides de dor: imagem que representa o problema (ex: "worried person calculator bills", "broken car roadside")
- Slides de solução: positiva e aspiracional (ex: "happy driver new car", "family suv road trip")
- CTA: pessoa feliz com carro/chave. Ex: "happy customer car keys dealership"
- NUNCA imagem genérica sem carro/dirigir/loja

FORMATO DE SAÍDA:
Retorne APENAS JSON válido, sem markdown, sem backticks:
{"slides":[{"numero":1,"titulo":"...","corpo":"...","imageSearchQuery":"..."}, ...8 slides]}`;

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
    let parsed: {
      slides?: Array<{
        numero?: number;
        titulo?: string;
        corpo?: string;
        imageSearchQuery?: string;
        imagemUrl?: string;
        imagemQuery?: string;
      }>;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("IA retornou JSON inválido");
    }
    const slides: Slide[] = (parsed.slides ?? []).slice(0, 8).map((s, i) => {
      const query = String(
        s.imageSearchQuery ?? s.imagemQuery ?? s.imagemUrl ?? "person car dealership"
      )
        .replace(/[^a-zA-Z0-9\s,]/g, " ")
        .trim()
        .slice(0, 120) || "person car dealership";
      return {
        numero: i + 1,
        titulo: String(s.titulo ?? "").slice(0, 80),
        corpo: String(s.corpo ?? "").slice(0, 260),
        imageSearchQuery: query,
      };
    });
    if (slides.length < 8) throw new Error("IA não retornou 8 slides");
    return { slides };
  });
