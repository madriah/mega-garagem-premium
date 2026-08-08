import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, ChevronRight, FileBadge } from "lucide-react";
import { formatBRL } from "@/lib/fipe";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/credit-schema";

export const Route = createFileRoute("/_authenticated/applications")({ component: List });

type Row = {
  id: string; protocol: string; full_name: string; cpf: string; phone: string;
  status: string; monthly_income: number | null; down_payment: number | null;
  created_at: string; read_at: string | null;
  vehicle_id: string | null;
  vehicles?: { brand: string | null; model: string | null; year: string | null; sale_price: number } | null;
  docs?: { count: number }[];
};

const maskCpf = (c: string) => c.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");

function List() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["applications", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Row[]> => {
      const { data } = await supabase
        .from("credit_applications")
        .select("id,protocol,full_name,cpf,phone,status,monthly_income,down_payment,created_at,read_at,vehicle_id,vehicles(brand,model,year,sale_price),docs:credit_application_documents(count)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as any;
    },
  });

  const filtered = useMemo(() => {
    const all = data ?? [];
    return all.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (search) {
        const s = search.toLowerCase();
        return r.full_name.toLowerCase().includes(s) || r.cpf.includes(s) || r.protocol.toLowerCase().includes(s);
      }
      return true;
    });
  }, [data, search, status]);

  const newCount = (data ?? []).filter((r) => !r.read_at).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">FICHAS DIGITAIS</h1>
          <p className="mt-1 text-muted-foreground">Solicitações de financiamento recebidas{newCount > 0 ? ` · ${newCount} nova(s)` : ""}.</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, CPF ou protocolo" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Nenhuma ficha {data?.length ? "com esse filtro" : "ainda"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Compartilhe o link da sua loja para começar a receber.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((r) => {
            const isNew = !r.read_at;
            const docsCount = r.docs?.[0]?.count ?? 0;
            return (
              <Link key={r.id} to="/applications/$id" params={{ id: r.id }} className="flex items-center gap-4 border-b border-border p-4 transition-colors last:border-0 hover:bg-accent/40">
                {isNew && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Nova" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{r.full_name}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">#{r.protocol}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{maskCpf(r.cpf)} · {r.phone}</p>
                  {r.vehicles && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">→ {r.vehicles.brand} {r.vehicles.model} {r.vehicles.year} ({formatBRL(Number(r.vehicles.sale_price))})</p>
                  )}
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Renda</p>
                  <p className="font-medium">{r.monthly_income ? formatBRL(Number(r.monthly_income)) : "—"}</p>
                </div>
                {docsCount > 0 && (
                  <span className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex"><FileBadge className="size-3.5" />{docsCount}</span>
                )}
                <Badge variant="outline" className={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status] ?? r.status}</Badge>
                <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-primary lg:inline-flex">Ver ficha completa <ChevronRight className="size-4" /></span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground lg:hidden" />

              </Link>
            );
          })}
        </div>
      )}
      <Outlet />
    </div>
  );
}
