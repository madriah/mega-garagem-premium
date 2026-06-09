import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/fipe";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cars")({ component: CarsLayout });

function CarsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/cars") return <Outlet />;
  return <CarsList />;
}

function CarsList() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-vehicles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("vehicles").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Excluir este veículo?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Veículo excluído");
    qc.invalidateQueries({ queryKey: ["my-vehicles"] });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl">MEUS CARROS</h1>
          <p className="mt-1 text-muted-foreground">{data?.length ?? 0} veículo(s) no catálogo</p>
        </div>
        <Link to="/cars/new"><Button><PlusCircle className="size-4" /> Cadastrar carro</Button></Link>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
          <p className="text-muted-foreground">Você ainda não cadastrou nenhum carro.</p>
          <Link to="/cars/new" className="mt-4 inline-block"><Button>Cadastrar primeiro carro</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50">
              <div className="aspect-video bg-muted">
                {v.photos?.[0] ? <img src={v.photos[0]} alt="" className="size-full object-cover" /> : null}
              </div>
              <div className="p-4">
                <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{v.brand}</p>
                <h3 className="mt-1 truncate text-lg">{v.model}</h3>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{v.year} · {v.km.toLocaleString("pt-BR")} km</span>
                  <span className="font-display text-xl text-primary">{formatBRL(Number(v.sale_price))}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {profile && (
                    <Link to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: v.id }} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full"><Eye className="size-3.5" /> Ver</Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(v.id)}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
