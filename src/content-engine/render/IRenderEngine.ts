/**
 * Contrato abstrato do renderizador.
 * Hoje: WebGLRenderEngine (Three.js + Canvas overlay + MediaRecorder).
 * Amanhã: RemotionRenderEngine, FFmpegRenderEngine — sem tocar no Diretor.
 */
import type { RenderJob } from "../types";

export interface RenderProgress {
  phase: "prepare" | "render" | "encode" | "done";
  progress: number; // 0..1
  currentSec?: number;
  totalSec?: number;
}

export interface RenderResult {
  blob: Blob;
  mime: string;
  extension: "mp4" | "webm";
  durationSec: number;
}

export interface IRenderEngine {
  /** Prepara texturas, shaders, timeline. */
  prepare(job: RenderJob, onProgress?: (p: RenderProgress) => void): Promise<void>;
  /** Renderiza tudo e devolve o arquivo final. */
  render(onProgress?: (p: RenderProgress) => void): Promise<RenderResult>;
  /** Libera GPU, contextos, streams. */
  dispose(): void;
  /** Canvas de preview (para exibir na UI). Opcional. */
  getPreviewCanvas?(): HTMLCanvasElement | null;
}
