import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Check, Car, BarChart3, MessageCircle, Search, Zap, X, Sparkles, TrendingUp, Eye, Camera, Wand2, Image as ImageIcon, Film, Send, Globe, Palette, FileText } from "lucide-react";
import antesCar from "@/assets/antes-car.jpg";
import depoisCar from "@/assets/depois-car.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MegaGaragem — Venda mais carros, sem depender de marketplace" },
      { name: "description", content: "Sua garagem virtual profissional. Cadastre carros pela placa, gere catálogo público e receba contatos direto no WhatsApp." },
    ],
  }),
  component: Landing,
});

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/"><Logo size="md" /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground">Recursos</a>
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground">Planos</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Entrar</Link>
          <Link to="/auth" search={{ mode: "register" }}>
            <Button>Começar grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Zap className="size-3" /> Para garajistas profissionais
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl">
            <span className="text-foreground">SUA GARAGEM</span><br />
            <span className="text-primary">VIRTUAL PREMIUM</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Cadastre carros pela placa, monte um catálogo profissional e receba contatos qualificados direto no seu WhatsApp.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "register" }}>
              <Button size="lg" className="shadow-glow">Criar minha garagem</Button>
            </Link>
            <a href="#planos">
              <Button size="lg" variant="outline">Ver planos</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Search, title: "BUSCA POR PLACA", desc: "Selecione marca, modelo e ano — o FIPE preenche automaticamente." },
  { icon: Car, title: "CATÁLOGO PRÓPRIO", desc: "Sua loja em megagaragem.com/loja/seu-nome." },
  { icon: MessageCircle, title: "LEAD NO WHATSAPP", desc: "Botão direto que abre conversa com cliente interessado." },
  { icon: BarChart3, title: "DASHBOARD", desc: "Acompanhe visitas e cliques por veículo." },
];

function Features() {
  return (
    <section id="recursos" className="border-t border-border/40 bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl">TUDO QUE VOCÊ PRECISA<br /><span className="text-primary">PARA VENDER MAIS</span></h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-6" />
              </div>
              <h3 className="mt-4 text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  { name: "STARTER", price: 97, features: ["Até 15 veículos", "Catálogo público", "Botão WhatsApp", "Dashboard básico", "Busca FIPE automática"], cta: "Começar agora" },
  { name: "PRO", price: 197, featured: true, features: ["Veículos ilimitados", "Catálogo público", "Botão WhatsApp", "Dashboard completo", "Busca FIPE automática", "Suporte prioritário", "Domínio personalizado"], cta: "Assinar Pro" },
];

function Plans() {
  return (
    <section id="planos" className="border-t border-border/40 py-24" style={{ background: "linear-gradient(180deg, oklch(0.13 0 0), oklch(0.10 0 0))" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl">PLANOS <span className="text-primary">SIMPLES</span></h2>
          <p className="mt-4 text-muted-foreground">Sem taxa de setup. Cancele quando quiser.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border bg-card p-8 ${p.featured ? "border-primary shadow-glow" : "border-border"}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-grad-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  Mais popular
                </span>
              )}
              <h3 className="text-3xl">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-display">R${p.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" search={{ mode: "register" }} className="mt-8 block">
                <Button className="w-full" variant={p.featured ? "default" : "outline"} size="lg">{p.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <Logo size="sm" />
        <p className="text-sm text-muted-foreground">© 2026 MegaGaragem. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

function BeforeAfter() {
  return (
    <section className="border-t border-border/40 bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Sparkles className="size-3" /> Garagem Inteligente
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl">
            DE AMADOR PARA <span className="text-primary">PROFISSIONAL</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A diferença entre um carro parado no grupo de WhatsApp e um carro vendido em 7 dias está em <strong className="text-foreground">como você apresenta o seu estoque.</strong>
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* ANTES */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
              <X className="size-3" /> Antes
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={antesCar}
                alt="Foto amadora de carro tirada com celular em ambiente bagunçado"
                width={1024}
                height={768}
                loading="lazy"
                className="size-full object-cover grayscale-[40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl text-foreground">FOTO NO GRUPO DO ZAP</h3>
              <p className="mt-1 text-sm text-muted-foreground">Catálogo improvisado, fotos sem padrão.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Foto torta, tirada às pressas no quintal",
                  "Sem ficha técnica, sem FIPE, sem confiança",
                  "Cliente pergunta tudo de novo no WhatsApp",
                  "Sem histórico de visitas nem cliques",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* DEPOIS */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/60 bg-card shadow-glow">
            <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              <Sparkles className="size-3" /> Depois
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={depoisCar}
                alt="Foto profissional de carro em estilo catálogo premium"
                width={1024}
                height={768}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary">FIPE R$ 89.450</div>
                  <div className="font-display text-3xl text-foreground leading-none">R$ 87.900</div>
                </div>
                <div className="rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase text-primary-foreground">
                  <MessageCircle className="inline size-3.5" /> WhatsApp
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl text-primary">CATÁLOGO MEGAGARAGEM</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vitrine profissional que vende sozinha.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Layout premium com galeria, ficha e preço FIPE",
                  "Link próprio: megagaragem.com/loja/sua-loja",
                  "Botão WhatsApp rastreado por veículo",
                  "Dashboard de visitas e leads em tempo real",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { icon: Camera, value: "+3x", label: "Mais cliques em anúncios com fotos profissionais" },
            { icon: Eye, value: "92%", label: "Dos clientes decidem pela primeira foto" },
            { icon: TrendingUp, value: "7 dias", label: "Tempo médio de venda no catálogo MegaGaragem" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card/50 p-5 text-center">
              <s.icon className="mx-auto size-5 text-primary" />
              <div className="mt-3 font-display text-4xl text-foreground">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <BeforeAfter />
        <Features />
        <Plans />
      </main>
      <Footer />
    </div>
  );
}
