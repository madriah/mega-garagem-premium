/**
 * Motor de Conteúdo IA — entry point público.
 *
 * Uso alto nível (será plugado no próximo passo):
 *
 *   import { generateContent } from "@/content-engine";
 *   const job = await generateContent(brief);
 *   const engine = new WebGLRenderEngine(canvas);
 *   await engine.prepare(job);
 *   const result = await engine.render();
 *
 * Este arquivo só re-exporta os tipos e registros;
 * a orquestração (director → storyboard → render) chega no próximo passo.
 */

export * from "./types";
export { CAMPAIGN_OBJECTIVES } from "./director/campaign-objectives";
export { AGENCY_MODES } from "./director/modes";
export { SeededRandom, randomSeed } from "./director/variation";
export { MUSIC_LIBRARY, pickTrack, beatCuts } from "./music/library";
export { REELS_ESTOQUE, FORMAT_REGISTRY } from "./formats/reels-estoque";
export type { IRenderEngine, RenderProgress, RenderResult } from "./render/IRenderEngine";
