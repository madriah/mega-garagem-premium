import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Check, BarChart3, MessageCircle, X, Sparkles, TrendingUp, Eye, Camera, Wand2, Image as ImageIcon, Send, Globe, Palette, FileText, Star, Quote } from "lucide-react";
import antesCar from "@/assets/antes-car.jpg";
import depoisCar from "@/assets/depois-car.jpg";
import { TransformationCarousel } from "@/components/TransformationCarousel";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MegaGaragem — Seu site white-label para vender mais carros" },
      { name: "description", content: "Site profissional com a sua marca, catálogo, artes, disparo no WhatsApp e ficha digital de financiamento. Tudo em minutos." },

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

function Testimonials() {
  const items = [
    { name: "Rafael Menezes", store: "RM Multimarcas · Campinas/SP", text: "Em 3 semanas usando a MegaGaragem vendi 4 carros que estavam parados há mais de 2 meses. O site com a minha marca faz o cliente chegar decidido.", rating: 5 },
    { name: "Juliana Prado", store: "Prado Veículos · Belo Horizonte/MG", text: "Parei de pagar designer. As artes de feed saem prontas com meu logo e o preço abaixo da FIPE. Meu Instagram bombou.", rating: 5 },
    { name: "Anderson Lopes", store: "Lopes Auto Center · Curitiba/PR", text: "O disparo em massa no WhatsApp foi um divisor. Mando o carro novo pra 900 contatos em 1 clique e já cai lead na hora.", rating: 5 },
    { name: "Camila Ferreira", store: "CF Garage · Ribeirão Preto/SP", text: "A ficha digital pra financiamento resolveu minha vida. O cliente preenche pelo celular, chega tudo pronto e eu só fecho.", rating: 5 },
    { name: "Diego Almeida", store: "Almeida Motors · Porto Alegre/RS", text: "Site profissional, dashboard, artes, IA nas fotos… tudo por menos do que eu pagava só o gerente de tráfego. Recomendo demais.", rating: 5 },
    { name: "Patrícia Souza", store: "PS Auto · Salvador/BA", text: "Meus carros aparecem no Google com a minha marca, não mais como anúncio genérico. A percepção de valor mudou.", rating: 5 },
  ];
  return (
    <section className="border-t border-border/40 bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Star className="size-3 fill-current" /> Garajistas que já usam
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl">
            LOJAS QUE PARARAM DE <span className="text-primary">DEPENDER DE MARKETPLACE</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <Quote className="size-6 text-primary/60" />
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.text}"</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-sm font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.store}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


const features = [
  { icon: Globe, title: "SITE PROFISSIONAL AUTOMÁTICO", desc: "Cadastrou? Pronto. Seu site white-label entra no ar com a sua marca e suas cores." },
  { icon: Palette, title: "IDENTIDADE DA SUA LOJA", desc: "Logo e cores aplicados em catálogo, artes e materiais — você no centro, sempre." },
  { icon: Wand2, title: "EDIÇÃO DE FOTOS COM IA", desc: "Fundo limpo e iluminação de estúdio — sem precisar de designer." },
  { icon: ImageIcon, title: "ARTES PARA FEED E STORIES", desc: "Posts 1:1 e Stories 9:16 gerados em 1 clique com preço e CTA do WhatsApp." },
  { icon: FileText, title: "DESCRIÇÃO/COPY COM IA", desc: "Texto profissional pronto para WhatsApp, feed e site em segundos." },
  { icon: Send, title: "DISPARO EM MASSA WHATSAPP", desc: "Envie o catálogo ou um veículo novo para toda a sua lista de contatos." },
  { icon: MessageCircle, title: "FICHA DIGITAL DE FINANCIAMENTO", desc: "Cliente preenche pelo celular e a proposta chega pronta pra você fechar." },
  { icon: BarChart3, title: "DASHBOARD COMPLETO", desc: "Visitas, cliques no WhatsApp e conversão por veículo em tempo real." },
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
  { name: "STARTER", price: 97, features: ["Até 15 veículos", "Site white-label com sua marca", "Catálogo e showroom público", "Botão WhatsApp rastreado", "Consulta FIPE automática", "Descrição com IA", "Artes para feed e stories", "Dashboard básico"], cta: "Começar agora" },
  { name: "PRO", price: 197, featured: true, features: ["Veículos ilimitados", "Tudo do Starter, mais:", "Domínio personalizado próprio", "Edição de fotos com IA", "Vídeos Reels automáticos", "Disparo em massa no WhatsApp", "Dashboard completo + relatórios", "Suporte prioritário"], cta: "Assinar Pro" },
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

function WhiteLabel() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Globe className="size-3" /> Site white-label
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl">
              SEU SITE, <span className="text-primary">SUA MARCA</span>.<br />
              NO AR EM MINUTOS.
            </h1>
            <h2 className="mt-5 text-xl md:text-2xl font-display text-muted-foreground normal-case tracking-normal">
              Site profissional com <span className="text-foreground">a sua marca</span>, catálogo, artes e WhatsApp — tudo em minutos.
            </h2>


            <p className="mt-4 text-muted-foreground">
              Quando você cadastra a sua loja, o sistema inteiro vira o <strong className="text-foreground">seu site profissional</strong> — com o seu logo, suas cores, seu nome e seu domínio. O cliente final nem percebe que existe MegaGaragem por trás. Você só aparece. Você vende.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Logo e cores da sua loja em todo o catálogo, artes e Reels",
                "Domínio próprio (suaempresa.com.br) — sem precisar de programador",
                "Header, hero e rodapé com a identidade visual da sua marca",
                "Compartilhe o link e o cliente vê SÓ a sua marca",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/auth" search={{ mode: "register" }} className="mt-8 inline-block">
              <Button size="lg" className="shadow-glow">Criar meu site agora</Button>
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-glow">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-primary/70" />
                <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                <span className="ml-3 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                  autocarspremium.com.br
                </span>
              </div>
              <div className="overflow-hidden rounded-xl bg-background">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-gradient-to-br from-primary to-primary/60" />
                    <span className="font-display text-lg tracking-wide">AUTOCARS PREMIUM</span>
                  </div>
                  <div className="hidden gap-4 text-xs text-muted-foreground sm:flex">
                    <span>Estoque</span><span>Sobre</span><span>Contato</span>
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={depoisCar} alt="Preview do site da loja" className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <p className="text-xs uppercase tracking-wider text-primary">Destaque da semana</p>
                    <p className="font-display text-2xl">HONDA CIVIC TOURING 2022</p>
                    <p className="text-sm text-muted-foreground">R$ 87.900 · 32.000 km</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-4 -z-10 bg-grad-primary opacity-20 blur-3xl" />
          </div>
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
        <WhiteLabel />
        <BeforeAfter />
        <Features />
        <Testimonials />
        <Plans />

      </main>
      <Footer />
    </div>
  );
}
