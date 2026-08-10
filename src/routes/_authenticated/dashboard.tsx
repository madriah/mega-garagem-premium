import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Car, Eye, MessageCircle, TrendingUp, FileText, CheckCircle2 } from "lucide-react";
import { formatBRL } from "@/lib/fipe";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Row = { id: string; brand: string | null; model: string | null; year: string | null; sale_price: number; photos: string[]; views: number; clicks: number };

function Dashboard() {
  const { user, ownerId, isSeller, seller, can, profile } = useAuth();
  const showStore = !isSeller || can("metrics_store");
  const showFichas = !isSeller || can("fichas");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", ownerId, showStore],
    enabled: !!user && !!ownerId && showStore,
    queryFn: async (): Promise<Row[]> => {
      const { data: vehicles } = await supabase
        .from("vehicles").select("id,brand,model,year,sale_price,photos")
        .eq("user_id", ownerId!).order("created_at", { ascending: false });
      if (!vehicles) return [];
      const ids = vehicles.map((v) => v.id);
      if (ids.length === 0) return [];
      const [{ data: views }, { data: clicks }] = await Promise.all([
        supabase.from("vehicle_views").select("vehicle_id").in("vehicle_id", ids),
        supabase.from("whatsapp_clicks").select("vehicle_id").in("vehicle_id", ids),
      ]);
      const vCount = new Map<string, number>(); views?.forEach((v) => vCount.set(v.vehicle_id, (vCount.get(v.vehicle_id) ?? 0) + 1));
      const cCount = new Map<string, number>(); clicks?.forEach((c) => cCount.set(c.vehicle_id, (cCount.get(c.vehicle_id) ?? 0) + 1));
      return vehicles.map((v) => ({ ...v, views: vCount.get(v.id) ?? 0, clicks: cCount.get(v.id) ?? 0 } as Row));
    },
  });

  // Métricas de fichas: do vendedor logado, ou da loja para o dono
  const { data: fichas } = useQuery({
    queryKey: ["dashboard-fichas", ownerId, seller?.id, showFichas],
    enabled: !!ownerId && showFichas,
    queryFn: async () => {
      let q = supabase.from("credit_applications").select("id,status,seller_id").eq("user_id", ownerId!);
      if (isSeller && !can("fichas_all") && seller?.id) q = q.eq("seller_id", seller.id);
      const { data } = await q;
      return data ?? [];
    },
  });

  const total = data ?? [];
  const totalViews = total.reduce((a, v) => a + v.views, 0);
  const totalClicks = total.reduce((a, v) => a + v.clicks, 0);
  const fichasTotal = fichas?.length ?? 0;
  const fichasFechadas = (fichas ?? []).filter((f: any) => f.status === "aprovada" || f.status === "fechada").length;

  const stats = [
    ...(showStore
      ? [
          { label: "Veículos", value: total.length, icon: Car },
          { label: "Visitas no catálogo", value: totalViews, icon: Eye },
          { label: "Cliques no WhatsApp", value: totalClicks, icon: MessageCircle },
          { label: "Conversão", value: totalViews ? `${Math.round((totalClicks / totalViews) * 100)}%` : "—", icon: TrendingUp },
        ]
      : []),
    ...(showFichas
      ? [
          { label: isSeller && !can("fichas_all") ? "Minhas fichas" : "Fichas recebidas", value: fichasTotal, icon: FileText },
          { label: "Fichas aprovadas", value: fichasFechadas, icon: CheckCircle2 },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-4xl">DASHBOARD</h1>
        <p className="mt-1 text-muted-foreground">
          {isSeller
            ? `Seu desempenho como vendedor${profile?.store_name ? ` na ${profile.store_name}` : ""}.`
            : "Visão geral da sua garagem."}
        </p>
      </header>

      {stats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          O dono da loja ainda não liberou métricas para você.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <s.icon className="size-4 text-primary" />
              </div>
              <p className="mt-3 font-display text-3xl">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showStore && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="text-xl">DESEMPENHO POR VEÍCULO</h2>
          </div>
          {isLoading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : total.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Nenhum veículo cadastrado ainda.</p>
          ) : (
            <div className="divide-y divide-border">
              {total.map((v) => (
                <div key={v.id} className="flex items-center gap-4 p-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {v.photos[0] && <img src={v.photos[0]} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{v.brand} {v.model}</p>
                    <p className="text-xs text-muted-foreground">{v.year} · {formatBRL(v.sale_price)}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center"><p className="font-display text-lg">{v.views}</p><p className="text-[10px] uppercase text-muted-foreground">Visitas</p></div>
                    <div className="text-center"><p className="font-display text-lg text-primary">{v.clicks}</p><p className="text-[10px] uppercase text-muted-foreground">WhatsApp</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
