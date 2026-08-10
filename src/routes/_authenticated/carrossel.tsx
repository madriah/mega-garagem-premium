import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { generateCarrossel, type Slide } from "@/lib/carrossel.functions";
import { searchUnsplashPhoto } from "@/lib/unsplash.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Loader2, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/_authenticated/carrossel")({
  component: () => (<PermissionGate perm="content"><CarrosselPage /></PermissionGate>),
});

const TEMAS = [
  "Primeiro carro",
  "Upgrade de carro",
  "Carro para família",
  "Financiamento sem entrada",
  "Troca com troco",
  "SUV para o dia a dia",
  "Carro econômico",
];
const PERSONAS = [
  "Jovem 18-25 primeiro carro",
  "Família com filhos",
  "Profissional autônomo",
  "Motorista de app",
  "Casal recém-casado",
];
const ESTILOS = ["Emocional", "Direto e vendedor", "Educativo", "Descontraído", "Aspiracional"];

function useUnsplashPhoto(query: string) {
  const search = useServerFn(searchUnsplashPhoto);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setUrl(null);
    if (!query) return;
    search({ data: { query } })
      .then((r) => {
        if (active) setUrl(r.url);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return url;
}

function renderTextoComDestaque(texto: string, accentColor: string) {
  const parts = texto.split(/\[destaque\]|\[\/destaque\]/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ color: accentColor, fontWeight: 800 }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function CarrosselPage() {
  const gen = useServerFn(generateCarrossel);
  const { profile } = useAuth();
  const accentColor =
    ((profile as unknown as { accent_color?: string | null } | null)?.accent_color as string | undefined) ||
    "#25D366";

  const [form, setForm] = useState({
    tema: TEMAS[0],
    persona: PERSONAS[0],
    estilo: ESTILOS[0],
    cidade: "",
    loja: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        loja: f.loja || profile.store_name || "",
        whatsapp: f.whatsapp || profile.whatsapp || "",
      }));
    }
  }, [profile]);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  async function handleGenerate() {
    if (!form.cidade.trim()) {
      toast.error("Informe a cidade");
      return;
    }
    setLoading(true);
    try {
      const r = await gen({ data: form });
      setSlides(r.slides);
      setCurrent(0);
      toast.success("Carrossel gerado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar");
    } finally {
      setLoading(false);
    }
  }

  async function downloadOne(i: number) {
    const el = slideRefs.current[i];
    if (!el) return;
    const canvas = await html2canvas(el, { useCORS: true, scale: 1, backgroundColor: null });
    const link = document.createElement("a");
    link.download = `slide-${i + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function downloadAll() {
    setDownloading(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        await downloadOne(i);
        await new Promise((r) => setTimeout(r, 300));
      }
      toast.success("8 imagens baixadas");
    } catch {
      toast.error("Erro ao baixar");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Gerador de Carrossel</h1>
        <p className="text-muted-foreground text-sm">
          IA cria 8 slides prontos para o Instagram da sua loja.
        </p>
      </header>

      <div className="bg-card space-y-4 rounded-lg border p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={form.tema} onValueChange={(v) => setForm({ ...form, tema: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Persona</Label>
            <Select value={form.persona} onValueChange={(v) => setForm({ ...form, persona: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERSONAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estilo</Label>
            <Select value={form.estilo} onValueChange={(v) => setForm({ ...form, estilo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ESTILOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Ex: São Paulo" />
          </div>
          <div className="space-y-2">
            <Label>Nome da loja (opcional)</Label>
            <Input value={form.loja} onChange={(e) => setForm({ ...form, loja: e.target.value })} placeholder="Mega Garagem" />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp (opcional)</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 90000-0000" />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full md:w-auto">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loading ? "Gerando..." : "Gerar Carrossel"}
        </Button>
      </div>

      {slides.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Preview {current + 1}/{slides.length}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadOne(current)}>
                <Download /> Baixar este
              </Button>
              <Button size="sm" onClick={downloadAll} disabled={downloading}>
                {downloading ? <Loader2 className="animate-spin" /> : <Download />}
                Baixar todos (8)
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
              <ChevronLeft />
            </Button>
            <div
              className="overflow-hidden rounded-lg border shadow-lg"
              style={{ width: 360, height: 450 }}
            >
              <div style={{ transform: "scale(0.3333)", transformOrigin: "top left", width: 1080, height: 1350 }}>
                <SlideCard slide={slides[current]} loja={form.loja} whatsapp={form.whatsapp} accentColor={accentColor} />
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))} disabled={current === slides.length - 1}>
              <ChevronRight />
            </Button>
          </div>

          {/* Off-screen renders for html2canvas capture at full resolution */}
          <div style={{ position: "fixed", left: -99999, top: 0 }} aria-hidden>
            {slides.map((s, i) => (
              <div key={i} ref={(el) => { slideRefs.current[i] = el; }}>
                <SlideCard slide={s} loja={form.loja} whatsapp={form.whatsapp} accentColor={accentColor} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="#25D366" width={size} height={size} style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.504 3.935 1.393 5.61L0 24l6.545-1.368A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.587-.467-5.107-1.29L3 21.646l.943-3.788A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function SlideCard({
  slide,
  loja,
  whatsapp,
  accentColor,
}: {
  slide: Slide;
  loja: string;
  whatsapp: string;
  accentColor: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = useUnsplashPhoto(slide.imageSearchQuery);

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
        background: `linear-gradient(135deg, ${accentColor} 0%, #111 100%)`,
      }}
    >
      {/* Camada base: ícone de carro grande (aparece se imagem falhar) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.15,
        }}
      >
        <svg viewBox="0 0 24 24" fill="#fff" width={600} height={600}>
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zM7.5 16c.83 0 1.5-.67 1.5-1.5S8.33 13 7.5 13 6 13.67 6 14.5 6.67 16 7.5 16zm9 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
        </svg>
      </div>

      {/* Camada imagem */}
      {!imgFailed && photoUrl && (
        <img
          src={photoUrl}
          crossOrigin="anonymous"
          alt=""
          onError={() => setImgFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Overlay escuro */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Faixa accent no topo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: accentColor,
        }}
      />

      {/* Conteúdo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85, marginBottom: 24, letterSpacing: 2, color: accentColor, fontWeight: 700 }}>
          {String(slide.numero).padStart(2, "0")} / 08
        </div>
        <h2
          style={{
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: "uppercase",
            margin: 0,
            letterSpacing: -2,
          }}
        >
          {slide.titulo}
        </h2>
        <p style={{ fontSize: 44, lineHeight: 1.3, marginTop: 32, opacity: 0.95, fontWeight: 500 }}>
          {renderTextoComDestaque(slide.corpo, accentColor)}
        </p>
        {(loja || whatsapp) && (
          <div
            style={{
              marginTop: 48,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 28,
              opacity: 0.9,
            }}
          >
            <span style={{ fontWeight: 600 }}>{loja}</span>
            {whatsapp && (
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <WhatsAppIcon size={32} />
                <span>{whatsapp}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
