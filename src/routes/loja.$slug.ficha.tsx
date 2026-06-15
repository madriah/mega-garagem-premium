import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { CreditWizard } from "@/components/CreditWizard";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/loja/$slug/ficha")({
  loader: async ({ params }) => {
    const { data: profile } = await supabase.from("profiles").select("id,store_name,store_slug").eq("store_slug", params.slug).maybeSingle();
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Solicitar financiamento — ${loaderData.profile.store_name}` : "Ficha" },
      { name: "description", content: "Preencha sua ficha de financiamento de forma segura." },
    ],
  }),
  component: FichaPage,
  notFoundComponent: () => (<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loja não encontrada.</p></div>),
});

function FichaPage() {
  const { profile } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/loja/$slug" params={{ slug: profile.store_slug }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <Logo size="sm" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">{profile.store_name}</p>
          <p className="text-xs text-muted-foreground">Solicitação de financiamento — preencha com calma, salvamos seu progresso.</p>
        </div>
        <CreditWizard profile={profile} vehicle={null} />
      </main>
    </div>
  );
}
