import type { CampaignObjective } from "../types";

export interface ObjectiveDefinition {
  id: CampaignObjective;
  label: string;
  description: string;
  ctaHint: string;
  /** Peso [0..1] de urgência que o Diretor deve aplicar. */
  urgency: number;
}

export const CAMPAIGN_OBJECTIVES: Record<CampaignObjective, ObjectiveDefinition> = {
  vender_veiculo: {
    id: "vender_veiculo",
    label: "Vender o veículo",
    description: "Foco em conversão: interesse, preço, chamada pro WhatsApp.",
    ctaHint: "Chama no WhatsApp / Agende visita",
    urgency: 0.7,
  },
  ganhar_seguidores: {
    id: "ganhar_seguidores",
    label: "Ganhar seguidores",
    description: "Foco em retenção e valor. Menos preço, mais história.",
    ctaHint: "Segue pra mais",
    urgency: 0.3,
  },
  gerar_mensagens: {
    id: "gerar_mensagens",
    label: "Gerar mensagens",
    description: "Provoca a pergunta. CTA direto ao WhatsApp.",
    ctaHint: "Manda 'oi' no WhatsApp",
    urgency: 0.8,
  },
  levar_ao_site: {
    id: "levar_ao_site",
    label: "Levar ao site",
    description: "Curiosidade + link na bio.",
    ctaHint: "Link na bio",
    urgency: 0.5,
  },
  divulgacao_loja: {
    id: "divulgacao_loja",
    label: "Divulgação da loja",
    description: "Institucional. Foco na marca, atendimento, garantia.",
    ctaHint: "Visite nossa loja",
    urgency: 0.2,
  },
  financiamento: {
    id: "financiamento",
    label: "Financiamento",
    description: "Foco em parcela, aprovação, sem burocracia.",
    ctaHint: "Simule seu financiamento",
    urgency: 0.7,
  },
  consorcio: {
    id: "consorcio",
    label: "Consórcio",
    description: "Foco em planejamento, ausência de juros.",
    ctaHint: "Fale sobre consórcio",
    urgency: 0.4,
  },
  oferta: {
    id: "oferta",
    label: "Oferta relâmpago",
    description: "Urgência máxima. Preço grande, tempo limitado.",
    ctaHint: "Só essa semana",
    urgency: 1.0,
  },
};
