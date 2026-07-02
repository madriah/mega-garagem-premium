import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signPhoto } from "@/lib/photo-url";
import { CreditWizard } from "@/components/CreditWizard";

export const Route = createFileRoute("/loja/$slug/ficha/$vehicleId")({
  validateSearch: z.object({ seller: z.string().uuid().optional() }),
  loaderDeps: ({ search }) => ({ seller: search.seller }),
  loader: async ({ params, deps }) => {
    const { data: profile } = await (supabase as any)
      .from("public_profiles")
      .select("id,store_name,store_slug,whatsapp,logo_url,accent_color,city")
      .eq("store_slug", params.slug)
      .maybeSingle() as { data: any };
    if (!profile) throw notFound();

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id,brand,model,year,km,fuel,sale_price,fipe_value,photos")
      .eq("id", params.vehicleId)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!vehicle) throw notFound();

    const cover = vehicle.photos?.[0] ? await signPhoto(vehicle.photos[0]) : "";

    let seller: { id: string; name: string; whatsapp: string } | null = null;
    if (deps.seller) {
      const { data: s } = await (supabase as any)
        .from("public_sellers")
        .select("id,name,whatsapp,is_active,user_id")
        .eq("id", deps.seller)
        .maybeSingle();
      const sAny = s as any;
      if (sAny && sAny.user_id === profile.id && sAny.is_active) {
        seller = { id: sAny.id, name: sAny.name, whatsapp: sAny.whatsapp };
      }
    }

    return {
      profile,
      vehicle: { ...vehicle, _cover: cover },
      seller,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Solicitar financiamento — ${loaderData.profile.store_name}` : "Ficha" },
      { name: "description", content: "Preencha sua ficha de financiamento em poucos minutos." },
    ],
  }),
  component: FichaPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Loja ou veículo não encontrado.</p>
    </div>
  ),
});

function FichaPage() {
  const { profile, vehicle, seller } = Route.useLoaderData();
  return <CreditWizard profile={profile as any} vehicle={vehicle as any} seller={seller} />;
}
