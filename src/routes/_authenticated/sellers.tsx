import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, PERMISSIONS } from "@/hooks/use-auth";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, MailCheck, MailWarning, Copy } from "lucide-react";
import { toast } from "sonner";
import { maskPhone } from "@/lib/credit-schema";

export const Route = createFileRoute("/_authenticated/sellers")({
  component: () => (
    <PermissionGate ownerOnly>
      <SellersPage />
    </PermissionGate>
  ),
});

const DEFAULT_PERMS = ["fichas"];

function SellersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", permissions: DEFAULT_PERMS as string[] });
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
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return toast.error("E-mail obrigatório para o vendedor acessar o painel");
    setSaving(true);
    const { error } = await supabase.from("sellers" as any).insert({
      user_id: user.id,
      name: form.name.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      email: form.email.trim().toLowerCase(),
      permissions: form.permissions,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Vendedor convidado — ele deve criar a conta com esse e-mail");
    setForm({ name: "", whatsapp: "", email: "", permissions: DEFAULT_PERMS });
    qc.invalidateQueries({ queryKey: ["sellers"] });
  };

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from("sellers" as any).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["sellers"] });
  };

  const togglePerm = async (s: any, key: string, value: boolean) => {
    const current: string[] = s.permissions ?? [];
    const next = value ? [...new Set([...current, key])] : current.filter((p) => p !== key);
    await update(s.id, { permissions: next });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este vendedor? Ele perderá o acesso ao painel.")) return;
    const { error } = await supabase.from("sellers" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Vendedor removido");
    qc.invalidateQueries({ queryKey: ["sellers"] });
  };

  const signupUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-4xl">VENDEDORES</h1>
        <p className="mt-1 text-muted-foreground">
          Cada vendedor tem painel próprio, métricas individuais e só acessa o que você liberar.
        </p>
      </header>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium">Como o vendedor entra no painel</p>
        <p className="mt-1 text-muted-foreground">
          Cadastre o vendedor com o e-mail dele abaixo. Depois peça para ele criar a conta em{" "}
          <span className="font-mono text-foreground">{signupUrl}</span> usando <strong>o mesmo e-mail</strong> —
          a conta é vinculada automaticamente à sua loja com as permissões escolhidas.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => { navigator.clipboard.writeText(signupUrl); toast.success("Link copiado"); }}
        >
          <Copy className="size-3.5" /> Copiar link de acesso
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Convidar vendedor</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do vendedor" />
          </div>
          <div>
            <Label className="text-xs">WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: maskPhone(e.target.value) }))} placeholder="(00) 00000-0000" inputMode="tel" />
          </div>
          <div>
            <Label className="text-xs">E-mail de acesso</Label>
            <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="vendedor@email.com" inputMode="email" />
          </div>
        </div>

        <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Permissões</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PERMISSIONS.map((p) => (
            <label key={p.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
              <Checkbox
                checked={form.permissions.includes(p.key)}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    permissions: v ? [...new Set([...f.permissions, p.key])] : f.permissions.filter((x) => x !== p.key),
                  }))
                }
              />
              <span>
                <span className="block text-sm font-medium">{p.label}</span>
                <span className="block text-xs text-muted-foreground">{p.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <Button onClick={add} disabled={saving} className="mt-4">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> Convidar vendedor</>}
        </Button>
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
              <li key={s.id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.whatsapp}{s.email ? ` · ${s.email}` : ""}</p>
                  </div>
                  {s.auth_user_id ? (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400"><MailCheck className="mr-1 size-3" /> Acesso ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400"><MailWarning className="mr-1 size-3" /> Aguardando cadastro</Badge>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{s.is_active ? "Ativo" : "Inativo"}</span>
                    <Switch checked={s.is_active} onCheckedChange={(v) => update(s.id, { is_active: v })} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(s.id)}><Trash2 className="size-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-background/40 p-3">
                  {PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex cursor-pointer items-center gap-2 text-xs">
                      <Checkbox
                        checked={(s.permissions ?? []).includes(p.key)}
                        onCheckedChange={(v) => togglePerm(s, p.key, !!v)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
