import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signPhotos } from "@/lib/photo-url";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/fipe";
import { MessageCircle, ArrowLeft, Gauge, Calendar, Palette, Fuel, FileText } from "lucide-react";

export const Route = createFileRoute("/loja/$slug/$vehicleId")({
  loader: async ({ params }) => {
    const { data: profile } = await (supabase as any).from("public_profiles").select("*").eq("store_slug", params.slug).maybeSingle() as { data: any };
    if (!profile) throw notFound();
    const { data: vehicle } = await supabase.from("vehicles").select("*").eq("id", params.vehicleId).eq("user_id", profile.id).maybeSingle();
    if (!vehicle) throw notFound();
    const signed = await signPhotos(vehicle.photos ?? []);
    return { profile, vehicle: { ...vehicle, _signedPhotos: signed } };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.vehicle.brand} ${loaderData.vehicle.model} — ${loaderData.profile.store_name}` },
          { name: "description", content: `${loaderData.vehicle.brand} ${loaderData.vehicle.model} ${loaderData.vehicle.year} por ${formatBRL(Number(loaderData.vehicle.sale_price))}` },
          { property: "og:image", content: loaderData.vehicle._signedPhotos?.[0] ?? "" },
        ]
      : [],
  }),
  component: VehiclePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Veículo não encontrado.</p>
    </div>
  ),
});

function VehiclePage() {
  const { profile, vehicle } = Route.useLoaderData();
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    supabase.from("vehicle_views").insert({ vehicle_id: vehicle.id });
  }, [vehicle.id]);

  const waText = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} (${formatBRL(Number(vehicle.sale_price))}) que vi no MegaGaragem.`;
  const waUrl = `https://wa.me/55${profile.whatsapp}?text=${encodeURIComponent(waText)}`;

  const trackClick = () => {
    supabase.from("whatsapp_clicks").insert({ vehicle_id: vehicle.id });
  };

  const specs = [
    { icon: Calendar, label: "Ano", value: vehicle.year ?? "—" },
    { icon: Gauge, label: "KM", value: vehicle.km.toLocaleString("pt-BR") },
    { icon: Palette, label: "Cor", value: vehicle.color ?? "—" },
    { icon: Fuel, label: "Combustível", value: vehicle.fuel ?? "—" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/loja/$slug" params={{ slug: profile.store_slug }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {profile.store_name}
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="aspect-video overflow-hidden rounded-xl bg-muted">
              {vehicle._signedPhotos?.[activePhoto] ? (
                <img src={vehicle._signedPhotos[activePhoto]} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">Sem foto</div>
              )}
            </div>
            {vehicle._signedPhotos && vehicle._signedPhotos.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {vehicle._signedPhotos.map((p: string, i: number) => (
                  <button key={i} onClick={() => setActivePhoto(i)} className={`aspect-square overflow-hidden rounded-lg border-2 ${i === activePhoto ? "border-primary" : "border-transparent opacity-70"}`}>
                    <img src={p} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{vehicle.brand}</p>
              <h1 className="mt-1 text-4xl">{vehicle.model}</h1>
              <p className="mt-4 font-display text-5xl text-primary">{formatBRL(Number(vehicle.sale_price))}</p>
              {vehicle.fipe_value ? (
                <p className="mt-1 text-xs text-muted-foreground">FIPE: {formatBRL(Number(vehicle.fipe_value))}</p>
              ) : null}
            </div>

            <a href={waUrl} target="_blank" rel="noreferrer" onClick={trackClick}>
              <Button size="lg" className="w-full shadow-glow"><MessageCircle className="size-4" /> Falar no WhatsApp</Button>
            </a>
            <Link to="/loja/$slug/ficha/$vehicleId" params={{ slug: profile.store_slug, vehicleId: vehicle.id }}>
              <Button size="lg" variant="outline" className="w-full"><FileText className="size-4" /> Quero financiar</Button>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><s.icon className="size-3.5" /> {s.label}</div>
                  <p className="mt-1 truncate font-medium">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Placa</p>
              <p className="mt-1 font-mono text-lg">{vehicle.plate}</p>
            </div>

            {vehicle.description && (
              <div>
                <h3 className="text-lg">DESCRIÇÃO</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{vehicle.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-xs text-muted-foreground">
          <span>Anúncio publicado em</span>
          <Link to="/"><Logo size="sm" /></Link>
        </div>
      </footer>
    </div>
  );
}
