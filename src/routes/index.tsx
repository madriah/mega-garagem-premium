import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { TransformationCarousel } from "@/components/TransformationCarousel";
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
            <Zap className="size-3" /> Tudo-em-um para garajistas
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl">
            <span className="text-foreground">DA PLACA AO</span><br />
            <span className="text-primary">CARRO VENDIDO</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Site profissional com a sua marca, showroom de fotos, edição com IA, artes para feed e stories, Reels automáticos, disparo em massa no WhatsApp e dashboard — tudo em uma plataforma.
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
  { icon: Globe, title: "SITE PROFISSIONAL AUTOMÁTICO", desc: "Cadastrou? Pronto. Seu site white-label entra no ar com a sua marca, suas cores e seu domínio." },
  { icon: Palette, title: "IDENTIDADE VISUAL DA SUA LOJA", desc: "Logo, cores e nome aplicados em todo o catálogo, artes e materiais — você no centro, sempre." },
  { icon: Camera, title: "SHOWROOM DE FOTOS PRO", desc: "Galeria estilo concessionária premium para cada veículo do seu estoque." },
  { icon: Wand2, title: "EDIÇÃO DE FOTOS COM IA", desc: "Fundo limpo, iluminação de estúdio e correção automática — sem precisar de designer." },
  { icon: ImageIcon, title: "ARTES PARA FEED E STORIES", desc: "Posts 1:1 e Stories 9:16 gerados em 1 clique com preço, FIPE e CTA do WhatsApp." },
  { icon: FileText, title: "DESCRIÇÃO/COPY COM IA", desc: "Texto profissional pronto para WhatsApp, feed e site — a partir dos dados FIPE." },
  { icon: Film, title: "VÍDEOS REELS AUTOMÁTICOS", desc: "Reels prontos com fotos do carro, trilha e identidade visual da sua loja." },
  { icon: Send, title: "DISPARO EM MASSA WHATSAPP", desc: "Envie o catálogo ou um veículo novo para toda a sua lista de contatos." },
  { icon: Search, title: "CONSULTA FIPE AUTOMÁTICA", desc: "Marca, modelo e ano preenchidos automaticamente com o valor de tabela." },
  { icon: MessageCircle, title: "LEADS DIRETO NO ZAP", desc: "Botão rastreado por veículo que abre conversa com o cliente." },
  { icon: Car, title: "CATÁLOGO PRÓPRIO", desc: "Sua loja em megagaragem.com/loja/seu-nome ou no seu domínio." },
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
    <section className="border-t border-border/40 bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Globe className="size-3" /> Site white-label
            </span>
            <h2 className="mt-6 text-4xl md:text-5xl">
              SEU SITE, <span className="text-primary">SUA MARCA</span>.<br />
              NO AR EM MINUTOS.
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

function FeatureDemos() {
  return (
    <section className="border-t border-border/40 bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Eye className="size-3" /> Veja funcionando
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl">
            CADA FUNÇÃO, <span className="text-primary">DEMONSTRADA</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Não é promessa — é o que aparece no seu painel no primeiro clique.</p>
        </div>

        <div className="mt-16 space-y-10">
          {/* 1. FIPE por placa */}
          <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 md:p-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Search className="size-3.5" /> Consulta por placa</span>
              <h3 className="mt-3 text-2xl md:text-3xl">DIGITA A PLACA. O CARRO SE CADASTRA SOZINHO.</h3>
              <p className="mt-3 text-sm text-muted-foreground">Marca, modelo, ano, combustível e FIPE preenchidos automaticamente. Você só confirma o preço de venda.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 font-mono text-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Placa</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="rounded-md border-2 border-foreground bg-foreground/5 px-4 py-2 text-2xl font-bold tracking-widest">ABC-1D23</div>
                <Button size="sm" className="ml-auto"><Search className="size-3.5" /> Buscar</Button>
              </div>
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs">
                {[["Marca","HONDA"],["Modelo","CIVIC TOURING 1.5 TURBO"],["Ano","2022"],["Combustível","Flex"],["FIPE","R$ 89.450"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="text-foreground">{v}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Descrição com IA */}
          <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 md:p-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1 rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-primary">Copy gerada</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary"><Wand2 className="size-3" /> IA</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                🚗 <strong>Honda Civic Touring 2022</strong> — único dono, 32.000 km, revisões em dia na concessionária. Motor 1.5 Turbo, câmbio CVT, bancos em couro, teto solar e central multimídia.
                <br /><br />
                ✅ FIPE R$ 89.450 — leva por <strong>R$ 87.900</strong>
                <br />📲 Chama no WhatsApp: (11) 9 9999-0000
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><FileText className="size-3.5" /> Descrição automática</span>
              <h3 className="mt-3 text-2xl md:text-3xl">TEXTO PROFISSIONAL EM 1 CLIQUE.</h3>
              <p className="mt-3 text-sm text-muted-foreground">Pronta para colar no grupo de WhatsApp, no feed do Instagram e na ficha do site. Tom de loja séria, sem clichê de revenda.</p>
            </div>
          </div>

          {/* 3. Artes Feed + Story */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><ImageIcon className="size-3.5" /> Artes prontas</span>
              <h3 className="mt-3 text-2xl md:text-3xl">FEED 1:1 E STORY 9:16 GERADOS NA HORA.</h3>
              <p className="mt-3 text-sm text-muted-foreground">Com sua marca, ficha técnica, FIPE cortada em vermelho e o preço de venda em destaque.</p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {/* Feed mockup */}
              <ArtMockup ratio="1 / 1" widthClass="w-64" label="FEED 1:1" />
              {/* Story mockup */}
              <ArtMockup ratio="9 / 16" widthClass="w-44" label="STORY 9:16" />
              {/* Reels mockup */}
              <div className="w-44">
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-primary/60 bg-black shadow-glow">
                  <img src={depoisCar} alt="Reels do veículo" className="size-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">
                    <Film className="size-2.5" /> Reels
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-background/90 text-foreground">▶</div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white">
                    <div className="font-bold">CIVIC TOURING 2022</div>
                    <div className="text-primary">R$ 87.900</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs uppercase tracking-wider text-muted-foreground">REELS 9:16</div>
              </div>
            </div>
          </div>

          {/* 4. Disparo WhatsApp */}
          <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 md:p-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Send className="size-3.5" /> Disparo em massa</span>
              <h3 className="mt-3 text-2xl md:text-3xl">UM CLIQUE. TODA A SUA LISTA RECEBE.</h3>
              <p className="mt-3 text-sm text-muted-foreground">Envie um veículo novo ou o catálogo completo para todos os seus contatos no WhatsApp.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><MessageCircle className="size-3.5 text-primary" /> Disparo: Civic Touring 2022</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">847 contatos</span>
              </div>
              <div className="mt-4 space-y-2">
                {[["Entregues","842","bg-primary"],["Lidos","711","bg-primary/70"],["Responderam","34","bg-primary/40"]].map(([l,v,c]) => (
                  <div key={l}>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className="text-foreground">{v}</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${c}`} style={{ width: l === "Entregues" ? "99%" : l === "Lidos" ? "84%" : "4%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-5 w-full"><Send className="size-3.5" /> Enviar novamente</Button>
            </div>
          </div>

          {/* 5. Dashboard */}
          <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 md:p-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1 rounded-xl border border-border bg-background p-5">
              <div className="grid grid-cols-3 gap-3">
                {[["Visitas","2.348","+18%"],["Cliques Zap","412","+27%"],["Leads","87","+12%"]].map(([l,v,d]) => (
                  <div key={l} className="rounded-lg border border-border bg-card p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                    <div className="mt-1 font-display text-xl text-foreground">{v}</div>
                    <div className="text-[10px] text-primary">{d}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex h-24 items-end gap-1.5 rounded-lg border border-border bg-card p-3">
                {[40,55,38,72,60,85,68,90,76,95,82,100].map((h,i) => (
                  <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Últimos 12 dias</div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><BarChart3 className="size-3.5" /> Dashboard</span>
              <h3 className="mt-3 text-2xl md:text-3xl">SAIBA QUAL CARRO VENDE — E QUAL ESTÁ PARADO.</h3>
              <p className="mt-3 text-sm text-muted-foreground">Visitas, cliques no WhatsApp e leads por veículo, em tempo real. Decisão por dado, não por achismo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtMockup({ ratio, widthClass, label }: { ratio: string; widthClass: string; label: string }) {
  return (
    <div className={widthClass}>
      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-glow" style={{ aspectRatio: ratio }}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-3 pt-3">
            <div className="flex items-center gap-1.5">
              <div className="size-5 rounded bg-gradient-to-br from-primary to-primary/60" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white">AUTOCARS</span>
            </div>
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground">Oferta</span>
          </div>
          <div className="relative mx-3 mt-2 flex-1 overflow-hidden rounded-md">
            <img src={depoisCar} alt={label} className="size-full object-cover" />
          </div>
          <div className="px-3 py-2 text-white">
            <div className="text-[9px] font-bold uppercase tracking-wider">CIVIC TOURING 22</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[8px] text-white/60 line-through decoration-destructive decoration-2">FIPE 89.450</span>
            </div>
            <div className="font-display text-base leading-none text-primary">R$ 87.900</div>
            <div className="mt-1.5 flex items-center justify-center gap-1 rounded-md bg-primary px-2 py-1 text-[8px] font-bold uppercase text-primary-foreground">
              <MessageCircle className="size-2.5" /> (11) 9 9999-0000
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <TransformationCarousel />
        <WhiteLabel />
        <BeforeAfter />
        <Features />
        <FeatureDemos />
        <Plans />
      </main>
      <Footer />
    </div>
  );
}
