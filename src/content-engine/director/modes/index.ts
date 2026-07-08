import type { AgencyMode, CameraMove, Effect, Transition, TextStyle } from "../../types";

export interface AgencyModeDefinition {
  id: AgencyMode;
  label: string;
  emoji: string;
  description: string;
  /** Tier mínimo requerido. */
  minTier: "basico" | "pro" | "elite";
  /** Cortes por segundo (aproximado) — dá o ritmo. */
  cutsPerSec: number;
  /** Preferências de câmera para o Diretor. */
  cameras: CameraMove[];
  /** Efeitos permitidos. */
  effects: Effect[];
  /** Transições permitidas. */
  transitions: Transition[];
  /** Estilo tipográfico dominante. */
  textStyles: TextStyle[];
  /** Palette override para tipografia/detalhes (hex). */
  palette: { primary: string; accent: string; text: string };
  /** Tom pro Diretor (vai pro prompt). */
  toneHint: string;
}

export const AGENCY_MODES: Record<AgencyMode, AgencyModeDefinition> = {
  comercial_premium: {
    id: "comercial_premium",
    label: "Comercial Premium",
    emoji: "🎬",
    description: "Ritmo cinematográfico. Cortes elegantes, tipografia refinada.",
    minTier: "basico",
    cutsPerSec: 0.8,
    cameras: ["push_in", "orbit", "dolly", "parallax", "zoom_cinematic"],
    effects: ["bloom", "lens_flare", "grain", "vignette", "motion_blur"],
    transitions: ["fade_cinematic", "mask_reveal", "zoom", "blur"],
    textStyles: ["mask_reveal", "kinetic", "stroke"],
    palette: { primary: "#0f0f10", accent: "#c9a24a", text: "#ffffff" },
    toneHint: "sofisticado, aspiracional, sem gritar",
  },
  reel_viral: {
    id: "reel_viral",
    label: "Reel Viral",
    emoji: "🔥",
    description: "Ritmo alto, cortes rápidos, kinetic typography. Feito pra prender.",
    minTier: "basico",
    cutsPerSec: 2.2,
    cameras: ["whip_pan", "push_in", "handheld", "speed_ramp", "zoom_cinematic"],
    effects: ["motion_blur", "chromatic_aberration", "camera_shake", "light_leak"],
    transitions: ["whip", "flash", "glitch", "speed_ramp", "zoom"],
    textStyles: ["kinetic", "pop", "bounce", "highlight"],
    palette: { primary: "#000000", accent: "#ff3366", text: "#ffffff" },
    toneHint: "provocativo, direto, energia de TikTok",
  },
  oferta_relampago: {
    id: "oferta_relampago",
    label: "Oferta Relâmpago",
    emoji: "💰",
    description: "Urgência total. Preço grande, contador, chamada forte.",
    minTier: "basico",
    cutsPerSec: 1.6,
    cameras: ["push_in", "zoom_cinematic", "whip_pan"],
    effects: ["camera_shake", "chromatic_aberration", "vignette", "bloom"],
    transitions: ["flash", "whip", "zoom", "speed_ramp"],
    textStyles: ["counter", "pop", "highlight", "kinetic"],
    palette: { primary: "#1a0000", accent: "#ffcc00", text: "#ffffff" },
    toneHint: "urgência real, oferta que expira, sem enrolar",
  },
  showcase: {
    id: "showcase",
    label: "Showcase",
    emoji: "🚗",
    description: "Foco no veículo: cada detalhe respirando na tela.",
    minTier: "pro",
    cutsPerSec: 1.0,
    cameras: ["orbit", "dolly", "parallax", "push_in"],
    effects: ["bloom", "grain", "vignette", "lens_flare"],
    transitions: ["mask_reveal", "blur", "fade_cinematic"],
    textStyles: ["mask_reveal", "stroke", "kinetic"],
    palette: { primary: "#0a0a0a", accent: "#00d4ff", text: "#ffffff" },
    toneHint: "descritivo, técnico com classe, deixa a imagem falar",
  },
  familia: {
    id: "familia",
    label: "Família",
    emoji: "👨‍👩‍👧",
    description: "Warm. Foco em segurança, espaço, cotidiano.",
    minTier: "pro",
    cutsPerSec: 0.9,
    cameras: ["parallax", "push_in", "dolly", "handheld"],
    effects: ["bloom", "grain", "light_leak"],
    transitions: ["fade_cinematic", "blur", "mask_reveal"],
    textStyles: ["highlight", "kinetic", "typewriter"],
    palette: { primary: "#1a1410", accent: "#ff8c42", text: "#ffffff" },
    toneHint: "acolhedor, familiar, prático",
  },
  luxo: {
    id: "luxo",
    label: "Luxo",
    emoji: "✨",
    description: "Slow motion, dourado, cinema. Para o topo do estoque.",
    minTier: "elite",
    cutsPerSec: 0.6,
    cameras: ["orbit", "dolly", "parallax", "push_in"],
    effects: ["bloom", "lens_flare", "grain", "vignette", "chromatic_aberration"],
    transitions: ["fade_cinematic", "mask_reveal", "blur"],
    textStyles: ["stroke", "mask_reveal", "kinetic"],
    palette: { primary: "#0a0908", accent: "#d4af37", text: "#f5f0e6" },
    toneHint: "silêncio, prestígio, quase sem palavras",
  },
};
