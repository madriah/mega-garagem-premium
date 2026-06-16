import { TemplateConfianca } from "./TemplateConfianca";
import { TemplateShowroom } from "./TemplateShowroom";
import { TemplateConversao } from "./TemplateConversao";
import type { TemplateProps } from "./types";

export const TEMPLATE_OPTIONS = [
  { id: "confianca", label: "Confiança", description: "Claro, sóbrio, foco em credibilidade e estoque inspecionado." },
  { id: "showroom", label: "Showroom", description: "Dark, cinematográfico, hero gigante. Vibe premium." },
  { id: "conversao", label: "Conversão", description: "Formulário lateral + WhatsApp fixo. Foco em capturar lead rápido." },
] as const;

export type TemplateId = (typeof TEMPLATE_OPTIONS)[number]["id"];

export function StoreTemplate({ profile, vehicles }: TemplateProps) {
  const id = (profile as any).store_template as TemplateId | undefined;
  switch (id) {
    case "confianca":
      return <TemplateConfianca profile={profile} vehicles={vehicles} />;
    case "conversao":
      return <TemplateConversao profile={profile} vehicles={vehicles} />;
    case "showroom":
    default:
      return <TemplateShowroom profile={profile} vehicles={vehicles} />;
  }
}

export { TemplateConfianca, TemplateShowroom, TemplateConversao };
