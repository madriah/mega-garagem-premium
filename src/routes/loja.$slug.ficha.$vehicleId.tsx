import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { signPhoto } from "@/lib/photo-url";
import { Logo } from "@/components/Logo";
import { CreditWizard } from "@/components/CreditWizard";
import { ArrowLeft } from "lucide-react";
import { formatBRL } from "@/lib/fipe";

export const Route = createFileRoute("/loja/$slug/ficha/$vehicleId")({
  loader: async ({ params }) => {
    const { data: profile } = await supabase.from("profiles").select("id,store_name,store_slug").eq("store_slug", params.slug).maybeSingle();
    if (!profile) throw notFound();
    const { data: vehicle } = await supabase.from("vehicles").select("id,brand,model,year,sale_price,photos").eq("id", params.vehicleId).eq("user_id", profile.id).maybeSingle();
    if (!vehicle) throw notFound();
    const cover = vehicle.photos?.[0] ? await signPhoto(vehicle.photos[0]) : "";
    return { profile, vehicle: { ...vehicle, _cover: cover } };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Solicitar financiamento — ${loaderData.profile.store_name}` : "Ficha" },
      { name: "description", content: "Preencha sua ficha de financiamento de forma segura." },
    ],
  }),
  component: FichaPage,
  notFoundComponent: () => (<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loja ou veículo não encontrado.</p></div>),
});

function FichaPage() {
  const { profile, vehicle } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: vehicle.id }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <Logo size="sm" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {vehicle._cover && <img src={vehicle._cover} alt="" className="size-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Financiamento para</p>
            <p className="truncate font-medium">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
            <p className="text-sm text-primary">{formatBRL(Number(vehicle.sale_price))}</p>
          </div>
        </div>
        <CreditWizard profile={profile} vehicle={vehicle} />
      </main>
    </div>
  );
}
