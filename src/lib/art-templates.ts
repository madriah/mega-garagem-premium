import { formatBRL } from "@/lib/fipe";
import { signPhoto } from "@/lib/photo-url";

export type TemplateId = "a" | "b" | "c";
export type Format = "feed" | "story";

export type ArtVehicle = {
  brand: string | null;
  model: string | null;
  year: string | number | null;
  fuel: string | null;
  km: number;
  color: string | null;
  sale_price: number;
  fipe_value: number | null;
  photos: string[];
};

export type ArtBranding = {
  storeName: string;
  whatsapp: string;
  city?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
};

export const SIZES: Record<Format, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story 9:16" },
  feed: { w: 1080, h: 1080, label: "Feed 1:1" },
};

const DEFAULT_ACCENTS: Record<TemplateId, string> = { a: "#F5A623", b: "#0EA5E9", c: "#E53E3E" };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height;
  const tr = w / h;
  let sw = img.width, sh = img.height;
  if (ir > tr) sw = img.height * tr; else sh = img.width / tr;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, baseSize: number, weight: number, family: string, minSize = 36): number {
  let size = baseSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > minSize) {
    size -= 4;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawPills(ctx: CanvasRenderingContext2D, items: string[], x: number, y: number, opts: { bg: string; fg: string; border?: string; fontSize: number; padX: number; padY: number; gap: number; radius: number; maxW: number }) {
  ctx.font = `600 ${opts.fontSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  let cx = x;
  let cy = y;
  const h = opts.fontSize + opts.padY * 2;
  for (const t of items) {
    const tw = ctx.measureText(t).width;
    const pw = tw + opts.padX * 2;
    if (cx + pw > x + opts.maxW) { cx = x; cy += h + opts.gap; }
    ctx.fillStyle = opts.bg;
    ctx.beginPath();
    ctx.roundRect(cx, cy, pw, h, opts.radius);
    ctx.fill();
    if (opts.border) { ctx.strokeStyle = opts.border; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = opts.fg;
    ctx.fillText(t, cx + opts.padX, cy + h / 2);
    cx += pw + opts.gap;
  }
  return cy + h;
}

async function maybeLoad(src?: string | null): Promise<HTMLImageElement | null> {
  if (!src) return null;
  try { return await loadImage(src); } catch { return null; }
}

async function loadVehiclePhoto(v: ArtVehicle): Promise<HTMLImageElement | null> {
  const p = v.photos?.[0];
  if (!p) return null;
  try {
    const url = await signPhoto(p);
    return await loadImage(url || p);
  } catch { return null; }
}

// ─── TEMPLATE A — Cinematic Dark ────────────────────────────
async function renderA(format: Format, v: ArtVehicle, b: ArtBranding): Promise<HTMLCanvasElement> {
  const { w, h } = SIZES[format];
  const ac = b.accentColor || DEFAULT_ACCENTS.a;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const PAD = format === "story" ? 56 : 44;

  // bg
  ctx.fillStyle = "#0D0D0D"; ctx.fillRect(0, 0, w, h);

  // photo
  const photoH = Math.round(h * (format === "story" ? 0.55 : 0.55));
  const img = await loadVehiclePhoto(v);
  if (img) { drawCover(ctx, img, 0, 0, w, photoH); }
  else { ctx.fillStyle = "#222"; ctx.fillRect(0, 0, w, photoH); }
  // bottom fade
  const grad = ctx.createLinearGradient(0, photoH * 0.55, 0, photoH);
  grad.addColorStop(0, "rgba(13,13,13,0)"); grad.addColorStop(1, "#0D0D0D");
  ctx.fillStyle = grad; ctx.fillRect(0, photoH * 0.55, w, photoH * 0.45);

  // top bar — logo + badge
  const logoImg = await maybeLoad(b.logoUrl);
  if (logoImg) {
    const lh = format === "story" ? 84 : 64;
    const lw = (logoImg.width / logoImg.height) * lh;
    ctx.drawImage(logoImg, PAD, PAD, lw, lh);
  } else {
    ctx.textBaseline = "top";
    ctx.font = `900 ${format === "story" ? 56 : 44}px 'Barlow Condensed', Impact, sans-serif`;
    ctx.fillStyle = ac; ctx.fillText("MEGA", PAD, PAD);
    const mw = ctx.measureText("MEGA").width;
    ctx.fillStyle = "#fff"; ctx.fillText("GARAGEM", PAD + mw, PAD);
  }
  ctx.font = `600 ${format === "story" ? 24 : 20}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textBaseline = "top";
  ctx.fillText(b.storeName.toUpperCase(), PAD, PAD + (format === "story" ? 92 : 72));

  // badge
  ctx.font = `800 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  const badge = format === "story" ? "DESTAQUE DA SEMANA" : "DESTAQUE";
  const bw = ctx.measureText(badge).width + 36;
  const bh = format === "story" ? 44 : 36;
  ctx.fillStyle = ac;
  ctx.beginPath(); ctx.roundRect(w - PAD - bw, PAD, bw, bh, 4); ctx.fill();
  ctx.fillStyle = "#000"; ctx.textBaseline = "middle";
  ctx.fillText(badge, w - PAD - bw + 18, PAD + bh / 2);

  // info
  let cy = photoH + 30;
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = `700 ${format === "story" ? 24 : 20}px Inter, system-ui, sans-serif`;
  ctx.fillText((v.brand ?? "").toUpperCase(), PAD, cy);
  cy += format === "story" ? 36 : 30;

  const modelText = (v.model ?? "").toUpperCase();
  const modelBase = format === "story" ? 88 : 64;
  const size = fitText(ctx, modelText, w - PAD * 2, modelBase, 900, "'Barlow Condensed', Impact, sans-serif");
  ctx.fillStyle = "#fff"; ctx.fillText(modelText, PAD, cy);
  cy += size + 18;

  const pills = [String(v.year ?? ""), `${v.km.toLocaleString("pt-BR")} km`, v.fuel ?? "", v.color ?? ""].filter(Boolean);
  cy = drawPills(ctx, pills, PAD, cy, { bg: "rgba(255,255,255,0.06)", fg: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.12)", fontSize: format === "story" ? 22 : 18, padX: 16, padY: 8, gap: 8, radius: 24, maxW: w - PAD * 2 });
  cy += 24;

  if (v.fipe_value && v.fipe_value > 0) {
    ctx.font = `600 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    const fipe = `FIPE ${formatBRL(v.fipe_value)}`;
    ctx.fillText(fipe, PAD, cy);
    const fw = ctx.measureText(fipe).width;
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PAD, cy + 14); ctx.lineTo(PAD + fw, cy + 14); ctx.stroke();
    cy += format === "story" ? 36 : 28;
  }

  ctx.fillStyle = ac;
  const priceSize = format === "story" ? 130 : 96;
  ctx.font = `900 ${priceSize}px 'Barlow Condensed', Impact, sans-serif`;
  ctx.fillText(formatBRL(v.sale_price), PAD, cy);
  cy += priceSize + 24;

  // CTA
  const ctaH = format === "story" ? 130 : 100;
  const ctaY = h - ctaH - PAD;
  ctx.fillStyle = ac;
  ctx.beginPath(); ctx.roundRect(PAD, ctaY, w - PAD * 2, ctaH, 12); ctx.fill();
  ctx.fillStyle = "#000"; ctx.textBaseline = "middle";
  ctx.font = `900 ${format === "story" ? 36 : 28}px 'Barlow Condensed', Impact, sans-serif`;
  const cta = "FALAR NO WHATSAPP";
  const ctw = ctx.measureText(cta).width;
  ctx.fillText(cta, w / 2 - ctw / 2, ctaY + ctaH / 2 - (format === "story" ? 16 : 12));
  ctx.font = `700 ${format === "story" ? 26 : 22}px Inter, system-ui, sans-serif`;
  const phone = b.whatsapp;
  const pw = ctx.measureText(phone).width;
  ctx.fillText(phone, w / 2 - pw / 2, ctaY + ctaH / 2 + (format === "story" ? 22 : 18));

  return canvas;
}

// ─── TEMPLATE B — Clean Premium ────────────────────────────
async function renderB(format: Format, v: ArtVehicle, b: ArtBranding): Promise<HTMLCanvasElement> {
  const { w, h } = SIZES[format];
  const ac = b.accentColor || DEFAULT_ACCENTS.b;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const PAD = format === "story" ? 56 : 44;

  ctx.fillStyle = "#FAFAFA"; ctx.fillRect(0, 0, w, h);

  // top bar
  const logoImg = await maybeLoad(b.logoUrl);
  ctx.textBaseline = "top";
  if (logoImg) {
    const lh = format === "story" ? 80 : 60;
    const lw = (logoImg.width / logoImg.height) * lh;
    ctx.drawImage(logoImg, PAD, PAD, lw, lh);
  } else {
    ctx.font = `900 ${format === "story" ? 52 : 40}px 'Barlow Condensed', Impact, sans-serif`;
    ctx.fillStyle = ac; ctx.fillText("MEGA", PAD, PAD);
    const mw = ctx.measureText("MEGA").width;
    ctx.fillStyle = "#111"; ctx.fillText("GARAGEM", PAD + mw, PAD);
  }
  ctx.font = `600 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#999";
  ctx.fillText(b.storeName.toUpperCase(), PAD, PAD + (format === "story" ? 88 : 68));

  // tag underline
  const tag = format === "story" ? "DESTAQUE DA SEMANA" : "DESTAQUE";
  ctx.font = `800 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = ac;
  const tw = ctx.measureText(tag).width;
  ctx.fillText(tag, w - PAD - tw, PAD + 8);
  ctx.strokeStyle = ac; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(w - PAD - tw, PAD + 36); ctx.lineTo(w - PAD, PAD + 36); ctx.stroke();

  // photo block (centered card)
  const photoY = format === "story" ? PAD + 180 : PAD + 140;
  const photoH = Math.round(h * (format === "story" ? 0.42 : 0.42));
  const img = await loadVehiclePhoto(v);
  ctx.fillStyle = "#EEE"; ctx.fillRect(0, photoY, w, photoH);
  if (img) drawCover(ctx, img, 0, photoY, w, photoH);

  // info block
  let cy = photoY + photoH + 36;
  ctx.fillStyle = "#999";
  ctx.font = `700 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  ctx.fillText((v.brand ?? "").toUpperCase(), PAD, cy);
  cy += format === "story" ? 32 : 26;

  const modelText = (v.model ?? "").toUpperCase();
  const modelBase = format === "story" ? 80 : 56;
  const ms = fitText(ctx, modelText, w - PAD * 2, modelBase, 900, "'Barlow Condensed', Impact, sans-serif");
  ctx.fillStyle = "#111"; ctx.fillText(modelText, PAD, cy);
  cy += ms + 18;

  const pills = [String(v.year ?? ""), `${v.km.toLocaleString("pt-BR")} km`, v.fuel ?? "", v.color ?? ""].filter(Boolean);
  cy = drawPills(ctx, pills, PAD, cy, { bg: "#F0F0F0", fg: "#666", fontSize: format === "story" ? 20 : 16, padX: 14, padY: 6, gap: 6, radius: 4, maxW: w - PAD * 2 });
  cy += 22;

  // divider
  ctx.fillStyle = "#E5E5E5"; ctx.fillRect(PAD, cy, w - PAD * 2, 2);
  cy += 22;

  if (v.fipe_value && v.fipe_value > 0) {
    ctx.font = `700 ${format === "story" ? 18 : 14}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "#999"; ctx.fillText("FIPE", PAD, cy + 4);
    ctx.fillStyle = "#BBB";
    ctx.font = `600 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
    const fipe = formatBRL(v.fipe_value);
    ctx.fillText(fipe, PAD + 70, cy + 2);
    const fw = ctx.measureText(fipe).width;
    ctx.strokeStyle = "#BBB"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PAD + 70, cy + 14); ctx.lineTo(PAD + 70 + fw, cy + 14); ctx.stroke();
    cy += format === "story" ? 32 : 26;
  }
  ctx.fillStyle = ac;
  const priceSize = format === "story" ? 120 : 88;
  ctx.font = `900 ${priceSize}px 'Barlow Condensed', Impact, sans-serif`;
  ctx.fillText(formatBRL(v.sale_price), PAD, cy);

  // CTA bar (dark, centered)
  const ctaH = format === "story" ? 130 : 100;
  const ctaY = h - ctaH - PAD;
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.roundRect(PAD, ctaY, w - PAD * 2, ctaH, 14); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textBaseline = "middle";
  ctx.font = `800 ${format === "story" ? 32 : 26}px Inter, system-ui, sans-serif`;
  const cta = "FALAR NO WHATSAPP";
  const ctw = ctx.measureText(cta).width;
  ctx.fillText(cta, w / 2 - ctw / 2, ctaY + ctaH / 2 - (format === "story" ? 16 : 12));
  ctx.font = `600 ${format === "story" ? 24 : 20}px Inter, system-ui, sans-serif`;
  const pw = ctx.measureText(b.whatsapp).width;
  ctx.fillStyle = ac;
  ctx.fillText(b.whatsapp, w / 2 - pw / 2, ctaY + ctaH / 2 + (format === "story" ? 22 : 18));

  return canvas;
}

// ─── TEMPLATE C — Bold Split ────────────────────────────
async function renderC(format: Format, v: ArtVehicle, b: ArtBranding): Promise<HTMLCanvasElement> {
  const { w, h } = SIZES[format];
  const ac = b.accentColor || DEFAULT_ACCENTS.c;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const PAD = format === "story" ? 48 : 40;

  ctx.fillStyle = "#111"; ctx.fillRect(0, 0, w, h);

  // header bar (accent)
  const headH = format === "story" ? 140 : 110;
  ctx.fillStyle = ac; ctx.fillRect(0, 0, w, headH);

  const logoImg = await maybeLoad(b.logoUrl);
  ctx.textBaseline = "middle";
  if (logoImg) {
    const lh = headH * 0.55;
    const lw = (logoImg.width / logoImg.height) * lh;
    ctx.drawImage(logoImg, PAD, headH / 2 - lh / 2, lw, lh);
  } else {
    ctx.font = `900 ${format === "story" ? 56 : 44}px 'Barlow Condensed', Impact, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fillText("MEGA", PAD, headH / 2 - 8);
    const mw = ctx.measureText("MEGA").width;
    ctx.fillStyle = "#fff"; ctx.fillText("GARAGEM", PAD + mw, headH / 2 - 8);
  }
  ctx.font = `600 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(b.storeName.toUpperCase(), PAD, headH / 2 + (format === "story" ? 28 : 22));

  // destaque chip
  const chip = format === "story" ? "🔥 OFERTA RELÂMPAGO" : "🔥 OFERTA";
  ctx.font = `800 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  const cw = ctx.measureText(chip).width + 32;
  const chH = format === "story" ? 48 : 40;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.roundRect(w - PAD - cw, headH / 2 - chH / 2, cw, chH, 4); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(chip, w - PAD - cw + 16, headH / 2);

  // photo
  const photoY = headH;
  const photoH = Math.round(h * (format === "story" ? 0.42 : 0.40));
  const img = await loadVehiclePhoto(v);
  if (img) drawCover(ctx, img, 0, photoY, w, photoH);
  else { ctx.fillStyle = "#222"; ctx.fillRect(0, photoY, w, photoH); }

  // bottom block (#0a0a0a)
  const bottomY = photoY + photoH;
  ctx.fillStyle = "#0A0A0A"; ctx.fillRect(0, bottomY, w, h - bottomY);

  let cy = bottomY + 32;
  ctx.textBaseline = "top";
  ctx.fillStyle = "#666";
  ctx.font = `700 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  ctx.fillText((v.brand ?? "").toUpperCase(), PAD, cy);
  cy += format === "story" ? 32 : 26;

  const modelText = (v.model ?? "").toUpperCase();
  const ms = fitText(ctx, modelText, w - PAD * 2, format === "story" ? 84 : 60, 900, "'Barlow Condensed', Impact, sans-serif");
  ctx.fillStyle = "#fff"; ctx.fillText(modelText, PAD, cy);
  cy += ms + 16;

  const pills = [String(v.year ?? ""), `${v.km.toLocaleString("pt-BR")} km`, v.fuel ?? "", v.color ?? ""].filter(Boolean);
  cy = drawPills(ctx, pills, PAD, cy, { bg: "transparent", fg: "#666", border: "#333", fontSize: format === "story" ? 20 : 16, padX: 14, padY: 6, gap: 6, radius: 3, maxW: w - PAD * 2 });
  cy += 20;

  if (v.fipe_value && v.fipe_value > 0) {
    ctx.font = `800 ${format === "story" ? 18 : 14}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "#555"; ctx.fillText("FIPE", PAD, cy + 4);
    ctx.fillStyle = "#444";
    ctx.font = `600 ${format === "story" ? 20 : 16}px Inter, system-ui, sans-serif`;
    const fipe = formatBRL(v.fipe_value);
    ctx.fillText(fipe, PAD + 64, cy + 4);
    const fw = ctx.measureText(fipe).width;
    ctx.strokeStyle = "#444"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PAD + 64, cy + 14); ctx.lineTo(PAD + 64 + fw, cy + 14); ctx.stroke();
    cy += format === "story" ? 30 : 24;
  }
  ctx.fillStyle = "#fff";
  const priceSize = format === "story" ? 130 : 96;
  ctx.font = `900 ${priceSize}px 'Barlow Condensed', Impact, sans-serif`;
  ctx.fillText(formatBRL(v.sale_price), PAD, cy);

  // CTA split: main accent + small secondary
  const ctaH = format === "story" ? 130 : 100;
  const ctaY = h - ctaH - PAD;
  const secW = format === "story" ? 220 : 160;
  const mainW = w - PAD * 2 - secW - 12;
  ctx.fillStyle = ac;
  ctx.beginPath(); ctx.roundRect(PAD, ctaY, mainW, ctaH, 8); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textBaseline = "middle";
  ctx.font = `900 ${format === "story" ? 32 : 24}px 'Barlow Condensed', Impact, sans-serif`;
  const cta = "FALAR NO WHATSAPP";
  const ctw = ctx.measureText(cta).width;
  ctx.fillText(cta, PAD + mainW / 2 - ctw / 2, ctaY + ctaH / 2 - (format === "story" ? 14 : 10));
  ctx.font = `700 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  const pw = ctx.measureText(b.whatsapp).width;
  ctx.fillText(b.whatsapp, PAD + mainW / 2 - pw / 2, ctaY + ctaH / 2 + (format === "story" ? 22 : 18));

  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.roundRect(PAD + mainW + 12, ctaY, secW, ctaH, 8); ctx.fill();
  ctx.fillStyle = "#777";
  ctx.font = `800 ${format === "story" ? 22 : 18}px Inter, system-ui, sans-serif`;
  const sec = b.city ? b.city.toUpperCase() : "VER FICHA ↗";
  const sw = ctx.measureText(sec).width;
  ctx.fillText(sec, PAD + mainW + 12 + secW / 2 - sw / 2, ctaY + ctaH / 2);

  return canvas;
}

export async function renderArt(template: TemplateId, format: Format, v: ArtVehicle, b: ArtBranding): Promise<HTMLCanvasElement> {
  if (template === "b") return renderB(format, v, b);
  if (template === "c") return renderC(format, v, b);
  return renderA(format, v, b);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/png", 0.95);
  });
}
