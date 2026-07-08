/**
 * Preset do formato "Reels do Estoque" (vertical 9:16, 20-26s).
 * Só declara canvas, duração e estrutura narrativa alvo.
 * A Direção Criativa preenche as escolhas cena a cena.
 */
import type { ContentFormat, SceneRole } from "../types";

export interface FormatPreset {
  id: ContentFormat;
  label: string;
  aspect: "9:16" | "1:1" | "16:9" | "4:5";
  width: number;
  height: number;
  fps: number;
  minDuration: number;
  maxDuration: number;
  defaultDuration: number;
  /** Arco narrativo alvo em papéis de cena e pesos de duração (soma ~1). */
  narrative: Array<{ role: SceneRole; weight: number }>;
}

export const REELS_ESTOQUE: FormatPreset = {
  id: "reels_estoque",
  label: "Reels do Estoque",
  aspect: "9:16",
  width: 1080,
  height: 1920,
  fps: 30,
  minDuration: 18,
  maxDuration: 28,
  defaultDuration: 24,
  narrative: [
    { role: "hook", weight: 0.12 },
    { role: "development", weight: 0.28 },
    { role: "build_up", weight: 0.22 },
    { role: "reveal", weight: 0.2 },
    { role: "cta", weight: 0.18 },
  ],
};

export const FORMAT_REGISTRY: Record<ContentFormat, FormatPreset | null> = {
  reels_estoque: REELS_ESTOQUE,
  // Reservado — mesmo pipeline, só o preset muda.
  reels_educativo: null,
  stories: null,
  shorts: null,
  carrossel: null,
  video_institucional: null,
};
