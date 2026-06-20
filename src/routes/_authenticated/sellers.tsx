import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { maskPhone } from "@/lib/credit-schema";

export const Route = createFileRoute("/_authenticated/sellers")({ component: SellersPage });

function SellersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["sellers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("sellers" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  const add = async () => {
    if (!user) return;
    if (form.name.trim().length < 2) return toast.error("Nome obrigatório");
    if (form.whatsapp.replace(/\D/g, "").length < 10) return toast.error("WhatsApp inválido");
    setSaving(true);
    const { error } = await supabase.from("sellers" as any).insert({
      user_id: user.id,
      name: form.name.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      email: form.email.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Vendedor cadastrado");
    setForm({ name: "", whatsapp: "", email: "" });
    qc.invalidateQueries({ queryKey: ["sellers"] });
  };

  const toggleActive = async (id: string, value: boolean) => {
    const { error } = await supabase.from("sellers" as any).update({ is_active: value }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["sellers"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este vendedor?")) return;
    const { error } = await supabase.from("sellers" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Vendedor removido");
    qc.invalidateQueries({ queryKey: ["sellers"] });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-4xl">VENDEDORES</h1>
        <p className="mt-1 text-muted-foreground">
          Cada vendedor recebe notificações no WhatsApp quando uma ficha for atribuída a ele.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Cadastrar vendedor</h2>
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do vendedor" />
          </div>
          <div>
            <Label className="text-xs">WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: maskPhone(e.target.value) }))} placeholder="(00) 00000-0000" inputMode="tel" />
          </div>
          <div>
            <Label className="text-xs">E-mail (opcional)</Label>
            <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="vendedor@email.com" />
          </div>
          <div className="flex items-end">
            <Button onClick={add} disabled={saving} className="w-full">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> Adicionar</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">
          Meus vendedores ({data?.length ?? 0})
        </h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum vendedor cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.whatsapp}{s.email ? ` · ${s.email}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{s.is_active ? "Ativo" : "Inativo"}</span>
                  <Switch checked={s.is_active} onCheckedChange={(v) => toggleActive(s.id, v)} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(s.id)}><Trash2 className="size-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
