/**
 * Biblioteca curada de trilhas royalty-free (Pixabay/Uppbeat).
 * Arquivos em public/music/. BPM medido/checado manualmente.
 *
 * Nesta fase começamos com o catálogo de referência (metadados);
 * os MP3 sobem depois em public/music/ com os mesmos ids.
 */
import type { AgencyMode, CampaignObjective } from "../types";

export interface Track {
  id: string;
  title: string;
  url: string; // /music/xxx.mp3
  bpm: number;
  durationSec: number;
  energy: "low" | "mid" | "high";
  mood: Array<"cinematic" | "hype" | "epic" | "warm" | "luxury" | "urgency" | "chill">;
}

export const MUSIC_LIBRARY: Track[] = [
  {
    id: "cinematic-01",
    title: "Cinematic Rise",
    url: "/music/cinematic-01.mp3",
    bpm: 90,
    durationSec: 60,
    energy: "mid",
    mood: ["cinematic", "epic"],
  },
  {
    id: "hype-01",
    title: "Trap Hype",
    url: "/music/hype-01.mp3",
    bpm: 140,
    durationSec: 45,
    energy: "high",
    mood: ["hype", "urgency"],
  },
  {
    id: "hype-02",
    title: "Bass Drop",
    url: "/music/hype-02.mp3",
    bpm: 128,
    durationSec: 40,
    energy: "high",
    mood: ["hype"],
  },
  {
    id: "urgency-01",
    title: "Ticking Deal",
    url: "/music/urgency-01.mp3",
    bpm: 120,
    durationSec: 40,
    energy: "high",
    mood: ["urgency", "hype"],
  },
  {
    id: "warm-01",
    title: "Family Ride",
    url: "/music/warm-01.mp3",
    bpm: 95,
    durationSec: 50,
    energy: "mid",
    mood: ["warm", "chill"],
  },
  {
    id: "luxury-01",
    title: "Golden Slow",
    url: "/music/luxury-01.mp3",
    bpm: 75,
    durationSec: 55,
    energy: "low",
    mood: ["luxury", "cinematic"],
  },
];

/** Escolhe trilha coerente com modo/objetivo. */
export function pickTrack(mode: AgencyMode, objective: CampaignObjective): Track {
  const preferences: Record<AgencyMode, Track["mood"][number][]> = {
    comercial_premium: ["cinematic", "epic"],
    reel_viral: ["hype", "urgency"],
    oferta_relampago: ["urgency", "hype"],
    showcase: ["cinematic", "epic"],
    familia: ["warm", "chill"],
    luxo: ["luxury", "cinematic"],
  };
  const wanted = preferences[mode];
  const boost = objective === "oferta" ? ["urgency"] : [];
  const scored = MUSIC_LIBRARY.map((t) => {
    const s =
      t.mood.filter((m) => wanted.includes(m)).length * 2 +
      t.mood.filter((m) => boost.includes(m)).length;
    return { t, s };
  }).sort((a, b) => b.s - a.s);
  return scored[0]?.t ?? MUSIC_LIBRARY[0];
}

/** Gera timestamps de corte a partir do BPM (subdivisões). */
export function beatCuts(
  bpm: number,
  durationSec: number,
  cutsPerSec: number,
): number[] {
  const beat = 60 / bpm; // segundos por batida
  // Escolhe subdivisão que aproxime cutsPerSec
  const targetInterval = 1 / cutsPerSec;
  let interval = beat;
  while (interval / 2 >= targetInterval * 0.8) interval /= 2;
  const out: number[] = [];
  for (let t = interval; t < durationSec - 0.2; t += interval) {
    out.push(Number(t.toFixed(3)));
  }
  return out;
}
