import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { generateCarrossel, type Slide } from "@/lib/carrossel.functions";
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
  component: CarrosselPage,
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


function CarrosselPage() {
  const gen = useServerFn(generateCarrossel);
  const [form, setForm] = useState({
    tema: TEMAS[0],
    persona: PERSONAS[0],
    estilo: ESTILOS[0],
    cidade: "",
    loja: "",
    whatsapp: "",
  });
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
                <SlideCard slide={slides[current]} loja={form.loja} whatsapp={form.whatsapp} />
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
                <SlideCard slide={s} loja={form.loja} whatsapp={form.whatsapp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SlideCard({ slide, loja, whatsapp }: { slide: Slide; loja: string; whatsapp: string }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
        background: "#111",
      }}
    >
      <img
        src={slide.imagemUrl}
        crossOrigin="anonymous"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 100%)",
        }}
      />
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
        <div style={{ fontSize: 28, opacity: 0.85, marginBottom: 24, letterSpacing: 2 }}>
          {String(slide.numero).padStart(2, "0")} / 08
        </div>
        <h2 style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase", margin: 0, letterSpacing: -2 }}>
          {slide.titulo}
        </h2>
        <p style={{ fontSize: 44, lineHeight: 1.3, marginTop: 32, opacity: 0.95, fontWeight: 500 }}>
          {slide.corpo}
        </p>
        {(loja || whatsapp) && (
          <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", fontSize: 28, opacity: 0.85 }}>
            <span>{loja}</span>
            <span>{whatsapp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
