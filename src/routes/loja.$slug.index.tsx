import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { signPhotos } from "@/lib/photo-url";
import { StoreTemplate } from "@/components/store-templates";

export const Route = createFileRoute("/loja/$slug/")({
  loader: async ({ params }) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("store_slug", params.slug).maybeSingle();
    if (!profile) throw notFound();
    const { data: vehicles } = await supabase.from("vehicles").select("*").eq("user_id", profile.id).eq("is_active", true).order("created_at", { ascending: false });
    const list = vehicles ?? [];
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
  return <StoreTemplate profile={profile as any} vehicles={vehicles as any} />;
}
