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
  imagemUrl: string;
};

const IMAGEM_MAP: Record<string, string> = {
  woman: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1080&q=80",
  smiling: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&q=80",
  driving: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1080&q=80",
  steering: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1080&q=80",
  wheel: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1080&q=80",
  safe: "https://images.unsplash.com/photo-1581578731548-c64695aadbd7?w=1080&q=80",
  safety: "https://images.unsplash.com/photo-1581578731548-c64695aadbd7?w=1080&q=80",
  price: "https://images.unsplash.com/photo-1434256920148-e73ce00444f9?w=1080&q=80",
  money: "https://images.unsplash.com/photo-1579621970795-48250267fd11?w=1080&q=80",
  maintenance: "https://images.unsplash.com/photo-1486262715619-67b519e0edd3?w=1080&q=80",
  mechanic: "https://images.unsplash.com/photo-1486262715619-67b519e0edd3?w=1080&q=80",
  family: "https://images.unsplash.com/photo-1503551723145-6c040742065b-v2?w=1080&q=80",
  child: "https://images.unsplash.com/photo-1503551723145-6c040742065b?w=1080&q=80",
  kids: "https://images.unsplash.com/photo-1503551723145-6c040742065b?w=1080&q=80",
  suv: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1080&q=80",
  luxury: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1080&q=80",
  keys: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1080&q=80",
  key: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1080&q=80",
  couple: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1080&q=80",
  young: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1080&q=80",
  city: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1080&q=80",
  road: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&q=80",
  new: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1080&q=80",
  dealer: "https://images.unsplash.com/photo-1567449303078-57ad995bd17f?w=1080&q=80",
  showroom: "https://images.unsplash.com/photo-1567449303078-57ad995bd17f?w=1080&q=80",
  handshake: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1080&q=80",
  happy: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&q=80",
  work: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1080&q=80",
  uber: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1080&q=80",
  default: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1080&q=80",
};

function mapearImagem(descricao: string): string {
  const desc = (descricao || "").toLowerCase();
  for (const [keyword, url] of Object.entries(IMAGEM_MAP)) {
    if (keyword !== "default" && desc.includes(keyword)) return url;
  }
  return IMAGEM_MAP.default;
}

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

REGRAS:
- Retorne APENAS JSON válido
- titulo: CAPS, 3-4 palavras
- corpo: 1-2 linhas, coloquial (tá, pra, é)
- imagemUrl: descrição em inglês simples (ex: "woman smiling driving car new")
- CTA no slide 8: urgência leve ("essa semana", "agora", "grátis")
- Sem explicações, só JSON

JSON:
{"slides":[{"numero":1,"titulo":"...","corpo":"...","imagemUrl":"..."}, ...8 slides]}

Responda APENAS com JSON válido. Sem markdown, sem backticks.`;

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
    let parsed: { slides?: Array<{ numero?: number; titulo?: string; corpo?: string; imagemUrl?: string; imagemQuery?: string }> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("IA retornou JSON inválido");
    }
    const slides: Slide[] = (parsed.slides ?? []).slice(0, 8).map((s, i) => {
      const desc = String(s.imagemUrl ?? s.imagemQuery ?? "car").slice(0, 120);
      return {
        numero: i + 1,
        titulo: String(s.titulo ?? "").slice(0, 60),
        corpo: String(s.corpo ?? "").slice(0, 200),
        imagemUrl: mapearImagem(desc),
      };
    });
    if (slides.length < 8) throw new Error("IA não retornou 8 slides");
    return { slides };
  });
