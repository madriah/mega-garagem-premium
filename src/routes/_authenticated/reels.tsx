import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateReelsScript, type ReelsScript } from "@/lib/reels.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { signPhotos } from "@/lib/photo-url";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Film, Loader2, Lock, Sparkles, Video } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reels")({
  component: ReelsPage,
});

type Vehicle = {
  id: string;
  brand: string | null;
  model: string | null;
  year: string | null;
  km: number;
  sale_price: number;
  color: string | null;
  photos: string[];
};

type Tier = "basico" | "pro" | "elite";

const TIER_INFO: Record<Tier, { label: string; desc: string; features: string[] }> = {
  basico: {
    label: "Básico",
    desc: "Slideshow + roteiro IA + legendas",
    features: ["Roteiro IA", "Ken Burns nas fotos", "Legendas estáticas"],
  },
  pro: {
    label: "Pro",
    desc: "+ contador de preço animado",
    features: ["Tudo do Básico", "Contador de preço animado", "Transições sync"],
  },
  elite: {
    label: "Elite",
    desc: "+ legendas dinâmicas com destaque colorido",
    features: ["Tudo do Pro", "Destaque colorido palavra-por-palavra", "Barra de progresso"],
  },
};

const FPS = 30;
const W = 720;
const H = 1280;

// Timeline (segundos)
const SCENES = {
  hook: { start: 0, end: 3 },
  apresentacao: { start: 3, end: 9 },
  bullets: { start: 9, end: 16 },
  preco: { start: 16, end: 21 },
  cta: { start: 21, end: 26 },
};
const TOTAL_SEC = 26;

function ReelsPage() {
  const gen = useServerFn(generateReelsScript);
  const { user, profile } = useAuth();
  const userTier: Tier = (profile?.tier as Tier | undefined) ?? "basico";
  const accent = profile?.accent_color || "#25D366";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [script, setScript] = useState<ReelsScript | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImagesRef = useRef<HTMLImageElement[]>([]);

  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId) ?? null, [vehicles, vehicleId]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, brand, model, year, km, sale_price, color, photos")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) toast.error("Erro ao carregar veículos");
      else setVehicles((data as Vehicle[]) ?? []);
    })();
  }, [user]);

  useEffect(() => {
    if (!vehicle) {
      setPhotoUrls([]);
      return;
    }
    (async () => {
      const urls = await signPhotos(vehicle.photos.slice(0, 5));
      setPhotoUrls(urls.filter(Boolean));
    })();
    setScript(null);
    setVideoUrl(null);
  }, [vehicle]);

  async function handleGenerateScript() {
    if (!vehicle) {
      toast.error("Selecione um veículo");
      return;
    }
    setLoadingScript(true);
    setScript(null);
    setVideoUrl(null);
    try {
      const r = await gen({
        data: {
          marca: vehicle.brand ?? "",
          modelo: vehicle.model ?? "",
          ano: vehicle.year ?? "",
          km: vehicle.km,
          preco: Number(vehicle.sale_price),
          diferenciais: vehicle.color ? `Cor ${vehicle.color}` : "",
          condicao: "aceita troca e financia",
          tier: userTier,
        },
      });
      setScript(r);
      toast.success("Roteiro pronto!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar roteiro");
    } finally {
      setLoadingScript(false);
    }
  }

  async function loadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const imgs = await Promise.all(
      urls.map(
        (u) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = u;
          }),
      ),
    );
    return imgs.filter((x): x is HTMLImageElement => x !== null);
  }

  async function handleRender() {
    if (!script || !vehicle || !canvasRef.current) return;
    setRendering(true);
    setRenderProgress(0);
    setVideoUrl(null);

    try {
      const canvas = canvasRef.current;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível");

      const imgs = await loadImages(photoUrls);
      previewImagesRef.current = imgs;

      const stream = canvas.captureStream(FPS);
      const mimeOptions = [
        "video/mp4;codecs=avc1.42E01E",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      const mime = mimeOptions.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
      if (!mime) throw new Error("Navegador não suporta gravação de vídeo");

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const donePromise = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start(100);
      const startedAt = performance.now();

      await new Promise<void>((resolve) => {
        const tick = () => {
          const t = (performance.now() - startedAt) / 1000;
          if (t >= TOTAL_SEC) {
            resolve();
            return;
          }
          drawFrame(ctx, t, script, vehicle, imgs, accent, userTier);
          setRenderProgress(Math.min(100, (t / TOTAL_SEC) * 100));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      recorder.stop();
      await donePromise;

      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRenderProgress(100);
      toast.success("Reels renderizado!");

      // Persiste projeto (best effort)
      if (user) {
        await supabase.from("reels_projects").insert({
          user_id: user.id,
          vehicle_id: vehicle.id,
          tier: userTier,
          status: "ready",
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao renderizar");
    } finally {
      setRendering(false);
    }
  }

  function handleDownload() {
    if (!videoUrl) return;
    const ext = videoUrl.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `reels-${vehicle?.brand ?? "carro"}-${Date.now()}.${ext}`.replace(/\s+/g, "-").toLowerCase();
    a.click();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Film className="size-7 text-primary" /> Sistema Reels
          </h1>
          <p className="text-muted-foreground text-sm">
            IA gera roteiro e monta um vídeo vertical de 26s pronto pro Instagram.
          </p>
        </div>
        <TierBadge tier={userTier} />
      </header>

      <div className="bg-card space-y-4 rounded-lg border p-4 md:p-6">
        <div className="space-y-2">
          <Label>Escolha um veículo do estoque</Label>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder={vehicles.length ? "Selecione..." : "Sem veículos cadastrados"} />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} — R$ {Number(v.sale_price).toLocaleString("pt-BR")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {vehicle && (
          <div className="text-muted-foreground text-xs">
            {photoUrls.length} foto{photoUrls.length === 1 ? "" : "s"} disponíveis.
            {photoUrls.length === 0 && " Adicione fotos ao veículo para melhor resultado."}
          </div>
        )}

        <Button onClick={handleGenerateScript} disabled={!vehicle || loadingScript} size="lg" className="w-full md:w-auto">
          {loadingScript ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loadingScript ? "Gerando roteiro..." : "Gerar Roteiro"}
        </Button>
      </div>

      {script && (
        <div className="bg-card space-y-4 rounded-lg border p-4 md:p-6">
          <h2 className="text-lg font-semibold">Roteiro</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="text-muted-foreground text-xs uppercase">Hook ({script.hook_category})</span>
              <p className="font-medium">{script.hook_text}</p>
            </li>
            <li>
              <span className="text-muted-foreground text-xs uppercase">Diferenciais</span>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {script.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </li>
            <li>
              <span className="text-muted-foreground text-xs uppercase">Preço</span>
              <p className="font-medium">{script.preco_label}</p>
            </li>
            <li>
              <span className="text-muted-foreground text-xs uppercase">CTA</span>
              <p className="font-medium">{script.cta_text}</p>
            </li>
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRender} disabled={rendering} size="lg">
              {rendering ? <Loader2 className="animate-spin" /> : <Video />}
              {rendering ? `Renderizando ${Math.round(renderProgress)}%...` : "Renderizar Reels (26s)"}
            </Button>
            {videoUrl && (
              <Button onClick={handleDownload} variant="outline" size="lg">
                <Download /> Baixar vídeo
              </Button>
            )}
          </div>

          {rendering && (
            <div className="bg-secondary h-2 w-full overflow-hidden rounded">
              <div className="bg-primary h-full transition-all" style={{ width: `${renderProgress}%` }} />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-muted-foreground mb-2 text-xs uppercase">Canvas de renderização</p>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="bg-muted w-full max-w-[280px] rounded-lg border shadow-lg"
            style={{ aspectRatio: `${W}/${H}` }}
          />
        </div>
        {videoUrl && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs uppercase">Preview do vídeo</p>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-[280px] rounded-lg border shadow-lg"
              style={{ aspectRatio: `${W}/${H}` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  const info = TIER_INFO[tier];
  return (
    <div className="border-primary/40 bg-primary/5 shrink-0 rounded-lg border px-4 py-3 text-right">
      <p className="text-primary text-xs font-bold uppercase">Plano {info.label}</p>
      <p className="text-muted-foreground mt-0.5 text-xs">{info.desc}</p>
      {tier !== "elite" && (
        <p className="text-muted-foreground mt-1 flex items-center justify-end gap-1 text-[10px]">
          <Lock className="size-3" /> Upgrade para mais efeitos
        </p>
      )}
    </div>
  );
}

// ================= RENDER ENGINE =================

function drawFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  script: ReelsScript,
  vehicle: Vehicle,
  imgs: HTMLImageElement[],
  accent: string,
  tier: Tier,
) {
  ctx.clearRect(0, 0, W, H);

  // Escolhe qual imagem pra qual cena
  const pick = (i: number) => imgs[i % Math.max(1, imgs.length)];

  if (t < SCENES.hook.end) {
    drawScene(ctx, pick(0), t - SCENES.hook.start, SCENES.hook.end - SCENES.hook.start, accent, 0.55);
    drawHook(ctx, script.hook_text, script.hook_category, t - SCENES.hook.start, accent, tier);
  } else if (t < SCENES.apresentacao.end) {
    const local = t - SCENES.apresentacao.start;
    drawScene(ctx, pick(1), local, SCENES.apresentacao.end - SCENES.apresentacao.start, accent, 0.15);
    drawApresentacao(ctx, vehicle, local, accent);
  } else if (t < SCENES.bullets.end) {
    const local = t - SCENES.bullets.start;
    drawScene(ctx, pick(2), local, SCENES.bullets.end - SCENES.bullets.start, accent, 0.55);
    drawBullets(ctx, script.bullets, local, accent, tier);
  } else if (t < SCENES.preco.end) {
    const local = t - SCENES.preco.start;
    drawScene(ctx, pick(3), local, SCENES.preco.end - SCENES.preco.start, accent, 0.65);
    drawPreco(ctx, script.preco_label, Number(vehicle.sale_price), local, accent, tier);
  } else {
    const local = t - SCENES.cta.start;
    drawScene(ctx, pick(4), local, SCENES.cta.end - SCENES.cta.start, accent, 0.6);
    drawCta(ctx, script.cta_text, accent, tier);
  }

  // Elite: barra de progresso
  if (tier === "elite") {
    const p = Math.min(1, t / TOTAL_SEC);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(0, H - 8, W, 8);
    ctx.fillStyle = accent;
    ctx.fillRect(0, H - 8, W * p, 8);
  }
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  localT: number,
  dur: number,
  accent: string,
  overlayAlpha: number,
) {
  // Gradient base
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, accent);
  grad.addColorStop(1, "#111");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Ken Burns image
  if (img) {
    const p = Math.min(1, Math.max(0, localT / dur));
    const scale = 1.05 + p * 0.15;
    const iw = img.width;
    const ih = img.height;
    const arCanvas = W / H;
    const arImg = iw / ih;
    let dw: number, dh: number;
    if (arImg > arCanvas) {
      dh = H * scale;
      dw = dh * arImg;
    } else {
      dw = W * scale;
      dh = dw / arImg;
    }
    const dx = (W - dw) / 2 + Math.sin(p * Math.PI) * 20;
    const dy = (H - dh) / 2 - p * 30;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Overlay escuro
  ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
  ctx.fillRect(0, 0, W, H);
}

function drawHook(
  ctx: CanvasRenderingContext2D,
  text: string,
  category: string,
  localT: number,
  accent: string,
  tier: Tier,
) {
  // Kicker categoria
  ctx.fillStyle = accent;
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`# ${category.toUpperCase()}`, 40, 120);

  // Hook grande
  const words = text.split(" ");
  const lines = wrapText(ctx, words, W - 80, "900 64px system-ui, sans-serif");
  ctx.font = "900 64px system-ui, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  const startY = H / 2 - (lines.length * 72) / 2;
  const revealChars = Math.floor(localT * 40);
  let printed = 0;
  lines.forEach((line, i) => {
    const slice = line.slice(0, Math.max(0, revealChars - printed));
    printed += line.length;
    ctx.fillText(slice, 40, startY + i * 76);
  });

  // Pulso accent
  if (tier !== "basico") {
    const pulse = Math.sin(localT * 6) * 0.5 + 0.5;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.4 + pulse * 0.6;
    ctx.fillRect(40, startY + lines.length * 76 + 16, 80, 8);
    ctx.globalAlpha = 1;
  }
}

function drawApresentacao(
  ctx: CanvasRenderingContext2D,
  vehicle: Vehicle,
  localT: number,
  accent: string,
) {
  const title = `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim().toUpperCase();
  const sub = `${vehicle.year ?? ""} · ${vehicle.km.toLocaleString("pt-BR")} km`;

  // Faixa accent embaixo
  ctx.fillStyle = accent;
  ctx.fillRect(0, H - 240, W, 6);

  ctx.textAlign = "left";
  ctx.font = "900 58px system-ui, sans-serif";
  ctx.fillStyle = "#fff";
  const pop = Math.min(1, localT / 0.4);
  ctx.globalAlpha = pop;
  ctx.fillText(title.slice(0, 22), 40, H - 160);
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillStyle = accent;
  ctx.fillText(sub, 40, H - 110);
  ctx.globalAlpha = 1;
}

function drawBullets(
  ctx: CanvasRenderingContext2D,
  bullets: string[],
  localT: number,
  accent: string,
  tier: Tier,
) {
  const dur = SCENES.bullets.end - SCENES.bullets.start; // 7
  const per = dur / bullets.length;
  ctx.textAlign = "left";
  bullets.forEach((b, i) => {
    const startAt = i * per;
    const delta = localT - startAt;
    if (delta < 0) return;
    const p = Math.min(1, delta / 0.35);
    const y = 380 + i * 180;
    const x = 40 + (1 - p) * -40;
    ctx.globalAlpha = p;
    // Marcador
    ctx.fillStyle = accent;
    ctx.fillRect(x, y - 60, 12, 90);
    // Texto
    ctx.font = "900 52px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    if (tier === "elite") {
      // destaca última palavra
      const parts = b.split(" ");
      const last = parts.pop() ?? "";
      const first = parts.join(" ");
      ctx.fillText(first, x + 32, y);
      const w1 = ctx.measureText(first + " ").width;
      ctx.fillStyle = accent;
      ctx.fillText(" " + last, x + 32 + w1, y);
    } else {
      ctx.fillText(b, x + 32, y);
    }
    ctx.globalAlpha = 1;
  });
}

function drawPreco(
  ctx: CanvasRenderingContext2D,
  label: string,
  precoNumero: number,
  localT: number,
  accent: string,
  tier: Tier,
) {
  ctx.textAlign = "center";

  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.8;
  ctx.fillText("SAI POR", W / 2, H / 2 - 120);
  ctx.globalAlpha = 1;

  let display = label;
  if ((tier === "pro" || tier === "elite") && precoNumero > 0 && localT < 1.2) {
    // count-up
    const p = Math.min(1, localT / 1.2);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(precoNumero * eased);
    display = `R$ ${val.toLocaleString("pt-BR")}`;
  }

  ctx.font = "900 96px system-ui, sans-serif";
  ctx.fillStyle = accent;
  ctx.fillText(display, W / 2, H / 2 + 20);

  // sublinhado accent
  const w = ctx.measureText(display).width;
  ctx.fillRect((W - w) / 2, H / 2 + 40, w, 6);
}

function drawCta(ctx: CanvasRenderingContext2D, text: string, accent: string, tier: Tier) {
  ctx.textAlign = "center";
  const lines = wrapText(ctx, text.split(" "), W - 80, "900 60px system-ui, sans-serif");
  ctx.font = "900 60px system-ui, sans-serif";
  ctx.fillStyle = "#fff";
  const startY = H / 2 - (lines.length * 70) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * 74);
  });

  // Botão WhatsApp
  const btnW = 460;
  const btnH = 96;
  const bx = (W - btnW) / 2;
  const by = H - 220;
  ctx.fillStyle = "#25D366";
  roundRect(ctx, bx, by, btnW, btnH, 20);
  ctx.fill();
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText("💬  CHAMA NO WHATS", W / 2, by + btnH / 2 + 12);

  if (tier !== "basico") {
    // Seta pulsante apontando pro botão
    const pulse = Math.sin(performance.now() / 200) * 8;
    ctx.font = "800 40px system-ui, sans-serif";
    ctx.fillStyle = accent;
    ctx.fillText("▼", W / 2, by - 20 + pulse);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxW: number,
  font: string,
): string[] {
  ctx.font = font;
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
