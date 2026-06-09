import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Loader2 } from "lucide-react";
import { formatBRL } from "@/lib/fipe";

export type ArtVehicle = {
  brand: string | null;
  model: string | null;
  year: string | null;
  fuel: string | null;
  km: number;
  color: string | null;
  sale_price: number;
  fipe_value: number | null;
  photos: string[];
};

type Props = {
  vehicle: ArtVehicle;
  storeName: string;
  whatsapp: string;
  trigger?: React.ReactNode;
};

type Format = "story" | "feed";
const SIZES: Record<Format, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story 9:16" },
  feed: { w: 1080, h: 1080, label: "Feed 1:1" },
};

const ORANGE = "#E8610A";
const DARK = "#1A1A1A";
const DARK_2 = "#0F0F0F";
const WHITE = "#FFFFFF";
const MUTED = "#9A9A9A";
const RED = "#E11D48";

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
  let sw = img.width;
  let sh = img.height;
  if (ir > tr) {
    sw = img.height * tr;
  } else {
    sh = img.width / tr;
  }
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

async function render(format: Format, v: ArtVehicle, storeName: string, whatsapp: string): Promise<string> {
  const { w, h } = SIZES[format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // background
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, w, h);

  // photo block
  const photoH = format === "story" ? Math.round(h * 0.58) : Math.round(h * 0.55);
  if (v.photos[0]) {
    try {
      const img = await loadImage(v.photos[0]);
      drawCover(ctx, img, 0, 0, w, photoH);
    } catch {
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, 0, w, photoH);
    }
  } else {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, w, photoH);
  }

  // gradient overlay over photo bottom
  const grad = ctx.createLinearGradient(0, photoH - 240, 0, photoH);
  grad.addColorStop(0, "rgba(26,26,26,0)");
  grad.addColorStop(1, DARK);
  ctx.fillStyle = grad;
  ctx.fillRect(0, photoH - 240, w, 240);

  // header: MEGA logo + store name (top-left, on photo)
  ctx.font = "900 64px 'Barlow Condensed', Impact, sans-serif";
  ctx.textBaseline = "top";
  // MEGA
  ctx.fillStyle = ORANGE;
  ctx.fillText("MEGA", 48, 48);
  const megaW = ctx.measureText("MEGA").width;
  ctx.fillStyle = WHITE;
  ctx.fillText("GARAGEM", 48 + megaW, 48);
  // store name
  ctx.font = "600 28px 'Inter', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(storeName.toUpperCase(), 48, 120);

  // bottom block content area
  let cy = photoH + 40;
  const padX = 48;

  // brand + model
  ctx.fillStyle = MUTED;
  ctx.font = "700 28px 'Inter', system-ui, sans-serif";
  ctx.fillText((v.brand ?? "").toUpperCase(), padX, cy);
  cy += 38;

  ctx.fillStyle = WHITE;
  ctx.font = `900 ${format === "story" ? 72 : 58}px 'Barlow Condensed', Impact, sans-serif`;
  const modelText = (v.model ?? "").toUpperCase();
  // wrap if needed
  const maxW = w - padX * 2;
  let text = modelText;
  if (ctx.measureText(text).width > maxW) {
    // shrink
    let size = format === "story" ? 72 : 58;
    while (ctx.measureText(text).width > maxW && size > 36) {
      size -= 4;
      ctx.font = `900 ${size}px 'Barlow Condensed', Impact, sans-serif`;
    }
  }
  ctx.fillText(text, padX, cy);
  cy += format === "story" ? 80 : 64;

  // tech sheet pills
  ctx.font = "600 24px 'Inter', system-ui, sans-serif";
  const pills = [
    v.year ?? "",
    `${v.km.toLocaleString("pt-BR")} km`,
    v.fuel ?? "",
    v.color ?? "",
  ].filter(Boolean);
  let px = padX;
  pills.forEach((p) => {
    const tw = ctx.measureText(p).width;
    const pw = tw + 32;
    const ph = 44;
    ctx.fillStyle = "#262626";
    ctx.beginPath();
    ctx.roundRect(px, cy, pw, ph, 22);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.fillText(p, px + 16, cy + 10);
    px += pw + 12;
    if (px > w - 200) {
      px = padX;
      cy += ph + 12;
    }
  });
  cy += 64;

  // FIPE crossed
  if (v.fipe_value && v.fipe_value > 0) {
    ctx.font = "600 26px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = MUTED;
    ctx.fillText("FIPE", padX, cy);
    const fipeStr = formatBRL(v.fipe_value);
    ctx.font = "800 42px 'Barlow Condensed', Impact, sans-serif";
    ctx.fillStyle = "#cccccc";
    ctx.fillText(fipeStr, padX + 90, cy - 4);
    const fipeW = ctx.measureText(fipeStr).width;
    // red strike
    ctx.strokeStyle = RED;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(padX + 84, cy + 22);
    ctx.lineTo(padX + 96 + fipeW, cy + 18);
    ctx.stroke();
    cy += 56;
  }

  // SALE price big in orange
  ctx.fillStyle = ORANGE;
  ctx.font = `900 ${format === "story" ? 110 : 88}px 'Barlow Condensed', Impact, sans-serif`;
  ctx.fillText(formatBRL(v.sale_price), padX, cy);
  cy += format === "story" ? 130 : 108;

  // WhatsApp CTA bar at bottom
  const ctaH = 140;
  const ctaY = h - ctaH - 32;
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.roundRect(padX, ctaY, w - padX * 2, ctaH, 24);
  ctx.fill();

  ctx.fillStyle = DARK_2;
  ctx.font = "900 36px 'Barlow Condensed', Impact, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("FALE NO WHATSAPP", padX + 40, ctaY + ctaH / 2 - 12);
  ctx.font = "700 32px 'Inter', system-ui, sans-serif";
  ctx.fillText(whatsapp, padX + 40, ctaY + ctaH / 2 + 24);

  return canvas.toDataURL("image/png");
}

export function ArtGenerator({ vehicle, storeName, whatsapp, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("story");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    render(format, vehicle, storeName, whatsapp).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [open, format, vehicle, storeName, whatsapp]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `megagaragem-${format}-${(vehicle.model ?? "carro").replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Sparkles className="size-3.5" /> Gerar arte
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">GERAR ARTE</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          {(Object.keys(SIZES) as Format[]).map((f) => (
            <Button key={f} size="sm" variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)}>
              {SIZES[f].label}
            </Button>
          ))}
        </div>
        <div className="flex justify-center rounded-lg bg-muted/30 p-4">
          {loading || !dataUrl ? (
            <div className="flex h-96 items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <img ref={ref} src={dataUrl} alt="Preview" className={format === "story" ? "max-h-[70vh] rounded" : "max-h-[60vh] rounded"} />
          )}
        </div>
        <Button onClick={download} disabled={!dataUrl} size="lg" className="w-full">
          <Download className="size-4" /> Baixar PNG
        </Button>
      </DialogContent>
    </Dialog>
  );
}
