import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { signPhotos } from "@/lib/photo-url";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/fipe";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/loja/$slug")({
  loader: async ({ params }) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("store_slug", params.slug).maybeSingle();
    if (!profile) throw notFound();
    const { data: vehicles } = await supabase.from("vehicles").select("*").eq("user_id", profile.id).eq("is_active", true).order("created_at", { ascending: false });
    const list = vehicles ?? [];
    // sign first photo of each vehicle for the grid
    const firsts = await signPhotos(list.map((v) => v.photos?.[0] ?? "").filter(Boolean));
    let i = 0;
    const withSigned = list.map((v) => ({ ...v, _coverUrl: v.photos?.[0] ? firsts[i++] : "" }));
    return { profile, vehicles: withSigned };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.profile.store_name} — MegaGaragem` : "Loja" },
      { name: "description", content: loaderData ? `Catálogo de veículos da ${loaderData.profile.store_name}` : "" },
    ],
  }),
  component: StorePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl">LOJA NÃO ENCONTRADA</h1>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">Ir para o início</Link>
      </div>
    </div>
  ),
});

function StorePage() {
  const { profile, vehicles } = Route.useLoaderData();

  const waUrl = `https://wa.me/55${profile.whatsapp}?text=${encodeURIComponent(`Olá ${profile.store_name}! Vi seu catálogo no MegaGaragem.`)}`;

  const trackClick = async () => {
    // generic click on store header
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Garagem virtual</p>
            <h1 className="mt-1 text-4xl md:text-5xl">{profile.store_name}</h1>
          </div>
          <a href={waUrl} target="_blank" rel="noreferrer" onClick={trackClick}>
            <Button size="lg" className="shadow-glow"><MessageCircle className="size-4" /> Falar no WhatsApp</Button>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {vehicles.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">Nenhum veículo disponível no momento.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v: any) => (
              <Link key={v.id} to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: v.id }} className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-card-premium">
                <div className="aspect-video overflow-hidden bg-muted">
                  {v._coverUrl ? (
                    <img src={v._coverUrl} alt={`${v.brand} ${v.model}`} className="size-full object-cover transition-transform group-hover:scale-105" />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.brand}</p>
                  <h3 className="mt-1 truncate text-xl">{v.model}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.year} · {v.km.toLocaleString("pt-BR")} km</p>
                  <p className="mt-3 font-display text-2xl text-primary">{formatBRL(Number(v.sale_price))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center text-xs text-muted-foreground">
          <Link to="/loja/$slug/ficha" params={{ slug: profile.store_slug }} className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20">
            Solicitar financiamento
          </Link>
          <span>Catálogo gerado por</span>
          <Link to="/"><Logo size="sm" /></Link>
        </div>
      </footer>
    </div>
  );
}
