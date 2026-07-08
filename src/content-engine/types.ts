/**
 * Motor de Conteúdo IA — tipos centrais.
 * Compartilhado por Diretor Criativo, Storyboard, Render Engine e Formatos.
 * Nenhum tipo aqui depende de Three.js, DOM ou React.
 */

// ---------- Formatos ----------
export type ContentFormat =
  | "reels_estoque"
  | "reels_educativo"
  | "stories"
  | "shorts"
  | "carrossel"
  | "video_institucional";

export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5";

// ---------- Objetivos de campanha ----------
export type CampaignObjective =
  | "vender_veiculo"
  | "ganhar_seguidores"
  | "gerar_mensagens"
  | "levar_ao_site"
  | "divulgacao_loja"
  | "financiamento"
  | "consorcio"
  | "oferta";

// ---------- Modos agência ----------
export type AgencyMode =
  | "comercial_premium"
  | "reel_viral"
  | "oferta_relampago"
  | "showcase"
  | "familia"
  | "luxo";

// ---------- Brief de entrada ----------
export interface VehicleBrief {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  km: number;
  preco: number;
  cor?: string;
  combustivel?: string;
  diferenciais?: string;
  fotos: string[]; // URLs assinadas
}

export interface StoreBrief {
  nome: string;
  cidade?: string;
  whatsapp?: string;
  logoUrl?: string;
  accentColor?: string;
}

export interface ContentBrief {
  format: ContentFormat;
  objective: CampaignObjective;
  mode: AgencyMode;
  seed: number;
  vehicle: VehicleBrief;
  store: StoreBrief;
  durationSec?: number; // override opcional
}

// ---------- Storyboard ----------
export type CameraMove =
  | "push_in"
  | "push_out"
  | "orbit"
  | "dolly"
  | "parallax"
  | "handheld"
  | "zoom_cinematic"
  | "whip_pan"
  | "speed_ramp";

export type Effect =
  | "motion_blur"
  | "bloom"
  | "lens_flare"
  | "grain"
  | "chromatic_aberration"
  | "vignette"
  | "camera_shake"
  | "light_leak"
  | "dust_particles";

export type Transition =
  | "cut"
  | "whip"
  | "flash"
  | "zoom"
  | "blur"
  | "glitch"
  | "mask_reveal"
  | "speed_ramp"
  | "fade_cinematic";

export type TextStyle =
  | "kinetic"
  | "highlight"
  | "counter"
  | "typewriter"
  | "mask_reveal"
  | "stroke"
  | "pop"
  | "bounce";

export type SceneRole =
  | "hook"
  | "development"
  | "build_up"
  | "reveal"
  | "cta";

export interface TextOverlay {
  text: string;
  style: TextStyle;
  position: "top" | "center" | "bottom" | "custom";
  emphasis?: string[]; // palavras a destacar
  colorHint?: "accent" | "white" | "custom";
}

export interface Scene {
  id: string;
  role: SceneRole;
  startSec: number;
  durationSec: number;
  /** Índice/URL da foto principal, ou null para cena tipográfica pura. */
  photoRef: number | null;
  /** Foco sugerido pela Visual Intelligence (rodas, painel, frente, ...). */
  focus?: PhotoFocus;
  camera: CameraMove;
  effects: Effect[];
  transitionOut: Transition;
  text?: TextOverlay;
}

export interface BeatMap {
  bpm: number;
  /** Timestamps em segundos onde a IA quer que caia um corte. */
  cuts: number[];
}

export interface Storyboard {
  format: ContentFormat;
  aspect: AspectRatio;
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  scenes: Scene[];
  music: {
    trackId: string;
    beatMap: BeatMap;
  };
  cta: {
    text: string;
    style: TextStyle;
  };
  meta: {
    hookCategory: string;
    mode: AgencyMode;
    objective: CampaignObjective;
    seed: number;
  };
}

// ---------- Visual Intelligence ----------
export type PhotoTag =
  | "frente"
  | "lateral"
  | "traseira"
  | "interior"
  | "painel"
  | "roda"
  | "detalhe"
  | "desconhecida";

export interface PhotoFocus {
  tag: PhotoTag;
  /** Região normalizada 0-1 para crops/closes. */
  crop?: { x: number; y: number; w: number; h: number };
}

export interface AnalyzedPhoto {
  url: string;
  width: number;
  height: number;
  aspect: number;
  focus: PhotoFocus;
}

// ---------- Render job (output do motor, input do render engine) ----------
export interface RenderJob {
  brief: ContentBrief;
  storyboard: Storyboard;
  photos: AnalyzedPhoto[];
}
