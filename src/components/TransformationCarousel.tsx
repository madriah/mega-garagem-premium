import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Wand2, ImageIcon, Film, FileText, Camera, MessageCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import antesCar from "@/assets/antes-car.jpg";
import depoisCar from "@/assets/depois-car.jpg";

type Slide = {
  key: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  render: () => React.ReactNode;
};

// ---------- Slide animations ----------

function PlateDemo() {
  const full = "ABC1D23";
  const [typed, setTyped] = useState("");
  const [showData, setShowData] = useState(false);
  useEffect(() => {
    setTyped(""); setShowData(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(t);
        setTimeout(() => setShowData(true), 500);
      }
    }, 140);
    return () => clearInterval(t);
  }, []);
  const formatted = typed.length > 3 ? `${typed.slice(0,3)}-${typed.slice(3)}` : typed;
  const rows: [string, string][] = [
    ["Marca","HONDA"],["Modelo","CIVIC TOURING 1.5"],["Ano","2022"],["Combustível","Flex"],["FIPE","R$ 89.450"],
  ];
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Placa</div>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex h-12 min-w-[180px] items-center rounded-md border-2 border-foreground bg-foreground/5 px-4 font-mono text-2xl font-bold tracking-widest">
          {formatted}
          {typed.length < full.length && <span className="ml-0.5 inline-block h-6 w-0.5 animate-pulse bg-foreground" />}
        </div>
        <Button size="sm" className="ml-auto"><Search className="size-3.5" /> Buscar</Button>
      </div>
      <div className="mt-5 min-h-[160px] space-y-2 border-t border-border pt-4 text-xs">
        {showData ? rows.map(([k,v], i) => (
          <div key={k} className="flex animate-fade-in justify-between opacity-0" style={{ animationDelay: `${i*120}ms`, animationFillMode: "forwards" }}>
            <span className="text-muted-foreground">{k}</span>
            <span className="font-semibold text-foreground">{v}</span>
          </div>
        )) : (
          <div className="flex items-center justify-center pt-8 text-muted-foreground">
            <Sparkles className="mr-2 size-3.5 animate-pulse text-primary" /> Consultando base nacional…
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoDemo() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    const t = setInterval(() => setProgress(p => p >= 100 ? 100 : p + 2), 60);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black">
      <div className="relative aspect-[16/10]">
        <img src={antesCar} alt="Antes" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${progress}%)` }}>
          <img src={antesCar} alt="" className="size-full object-cover" />
        </div>
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100-progress}% 0 0)` }}>
          <img src={depoisCar} alt="Depois" className="size-full object-cover" />
        </div>
        <div className="absolute top-0 h-full w-0.5 bg-primary shadow-glow" style={{ left: `${progress}%` }}>
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary p-1.5">
            <Wand2 className="size-3 text-primary-foreground" />
          </div>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Foto crua</span>
        <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Editada com IA</span>
      </div>
    </div>
  );
}

const COPY = `🚗 Honda Civic Touring 2022 — único dono, 32.000 km, revisões na concessionária. Motor 1.5 Turbo, CVT, couro, teto solar e multimídia.

✅ FIPE R$ 89.450 — leva por R$ 87.900
📲 (11) 9 9999-0000`;

function CopyDemo() {
  const [text, setText] = useState("");
  useEffect(() => {
    setText("");
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      setText(COPY.slice(0, i));
      if (i >= COPY.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-primary">Copy gerada</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
          <Wand2 className="size-3 animate-pulse" /> IA escrevendo…
        </span>
      </div>
      <p className="mt-3 min-h-[180px] whitespace-pre-line text-sm leading-relaxed text-foreground">
        {text}
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
      </p>
    </div>
  );
}

function ArtDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const steps = [600, 1200, 1800, 2400];
    const timers = steps.map((d, i) => setTimeout(() => setStep(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex justify-center gap-5">
      {(["FEED 1:1", "STORY 9:16"] as const).map((label, idx) => {
        const ratio = idx === 0 ? "1 / 1" : "9 / 16";
        const w = idx === 0 ? "w-56" : "w-40";
        return (
          <div key={label} className={w}>
            <div className="relative overflow-hidden rounded-xl border border-primary/60 bg-black shadow-glow" style={{ aspectRatio: ratio }}>
              <img src={depoisCar} alt={label} className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${step >= 1 ? "opacity-100" : "opacity-0"}`} />
              <div className={`absolute left-2 top-2 flex items-center gap-1.5 transition-all duration-500 ${step >= 2 ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
                <div className="size-5 rounded bg-gradient-to-br from-primary to-primary/60" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white">AUTOCARS</span>
              </div>
              <div className={`absolute bottom-12 left-2 right-2 text-white transition-all duration-500 ${step >= 3 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                <div className="text-[9px] font-bold uppercase tracking-wider">CIVIC TOURING 22</div>
                <div className="text-[9px] text-white/70 line-through decoration-destructive decoration-2">FIPE 89.450</div>
                <div className="font-display text-lg leading-none text-primary">R$ 87.900</div>
              </div>
              <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 rounded-md bg-primary px-2 py-1 text-[9px] font-bold uppercase text-primary-foreground transition-all duration-500 ${step >= 4 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                <MessageCircle className="size-2.5" /> (11) 9 9999-0000
              </div>
            </div>
            <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function ReelsDemo() {
  const frames = [
    { label: "Abertura", overlay: "NOVO NA LOJA" },
    { label: "Ficha", overlay: "1.5 TURBO • CVT • 32MIL KM" },
    { label: "FIPE", overlay: "FIPE R$ 89.450" },
    { label: "Oferta", overlay: "POR R$ 87.900" },
    { label: "CTA", overlay: "FALE NO WHATSAPP" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI(p => (p + 1) % frames.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 overflow-hidden rounded-2xl border-2 border-primary/60 bg-black shadow-glow" style={{ aspectRatio: "9 / 16" }}>
        <img src={depoisCar} alt="Reels" className="absolute inset-0 size-full object-cover" style={{ transform: `scale(${1 + i*0.04})`, transition: "transform 0.9s ease-out" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">
          <Film className="size-2.5" /> Reels
        </div>
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center">
          <div key={i} className="animate-fade-in font-display text-xl uppercase leading-tight text-white drop-shadow-lg">
            {frames[i].overlay}
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1">
          {frames.map((_, k) => (
            <div key={k} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: k < i ? "100%" : k === i ? "100%" : "0%", transitionDuration: k === i ? "900ms" : "200ms" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{frames[i].label} • 9:16</div>
    </div>
  );
}

const SLIDES: Slide[] = [
  { key: "placa", tag: "Consulta por placa", icon: Search, title: "DA PLACA AO CADASTRO COMPLETO", subtitle: "Digite a placa — marca, modelo, ano e FIPE aparecem em segundos.", render: () => <PlateDemo /> },
  { key: "foto", tag: "Edição de foto", icon: Camera, title: "FOTO DE GARAGEM → FOTO DE SHOWROOM", subtitle: "A IA tira o ambiente bagunçado, ajusta luz e devolve um carro pronto para vender.", render: () => <PhotoDemo /> },
  { key: "copy", tag: "Descrição com IA", icon: FileText, title: "COPY PROFISSIONAL EM 1 CLIQUE", subtitle: "Texto para o WhatsApp, para o feed e para o site — escrito por uma IA treinada para revenda.", render: () => <CopyDemo /> },
  { key: "arte", tag: "Stories + Feed", icon: ImageIcon, title: "ARTES PRONTAS PARA POSTAR", subtitle: "Feed 1:1 e Story 9:16 montados com sua marca, FIPE cortada e preço em destaque.", render: () => <ArtDemo /> },
  { key: "reels", tag: "Vídeo Reels", icon: Film, title: "REELS 9:16 GERADOS AUTOMÁTICAMENTE", subtitle: "Abertura, ficha técnica, FIPE riscada, oferta e CTA — montagem profissional sem editor.", render: () => <ReelsDemo /> },
];

export function TransformationCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIdx(i => (i + 1) % SLIDES.length), 6500);
    return () => clearTimeout(t);
  }, [idx, paused]);

  const slide = SLIDES[idx];
  const Icon = slide.icon;
  const go = (delta: number) => setIdx(i => (i + delta + SLIDES.length) % SLIDES.length);

  return (
    <section id="demo" className="border-t border-border/40 bg-gradient-to-b from-background to-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Sparkles className="size-3" /> Veja a transformação
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl">
            DO COMEÇO AO FIM, <span className="text-primary">EM TEMPO REAL</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Cada função do MegaGaragem em mini-demo animado. Passe entre elas e veja o antes/depois acontecer.</p>
        </div>

        <div
          className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Icon className="size-3.5" /> {slide.tag}
              </span>
              <h3 className="mt-3 text-2xl md:text-3xl">{slide.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{slide.subtitle}</p>

              <div className="mt-6 flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => go(-1)} aria-label="Anterior">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => go(1)} aria-label="Próximo">
                  <ChevronRight className="size-4" />
                </Button>
                <span className="ml-2 text-xs text-muted-foreground">{idx + 1} / {SLIDES.length}</span>
              </div>
            </div>

            <div key={slide.key} className="animate-fade-in">
              {slide.render()}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {SLIDES.map((s, i) => {
              const SIcon = s.icon;
              const active = i === idx;
              return (
                <button
                  key={s.key}
                  onClick={() => setIdx(i)}
                  className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                >
                  <SIcon className="size-3.5" />
                  <span className="hidden sm:inline">{s.tag}</span>
                  {active && !paused && (
                    <span className="ml-1 hidden h-1 w-8 overflow-hidden rounded-full bg-primary-foreground/30 sm:block">
                      <span className="block h-full animate-[carousel-progress_6.5s_linear] bg-primary-foreground" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
