import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", store_name: "", store_slug: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name, store_name: profile.store_name, store_slug: profile.store_slug, whatsapp: profile.whatsapp });
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const slug = form.store_slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || profile.store_slug;
    const whatsapp = form.whatsapp.replace(/\D/g, "");
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name, store_name: form.store_name, store_slug: slug, whatsapp,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    await refreshProfile();
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-4xl">CONFIGURAÇÕES</h1>
        <p className="mt-1 text-muted-foreground">Gerencie os dados da sua garagem.</p>
      </header>

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl">DADOS DA LOJA</h2>
          <div>
            <Label>Seu nome</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5" required />
          </div>
          <div>
            <Label>Nome da loja</Label>
            <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="mt-1.5" required />
          </div>
          <div>
            <Label>Slug da loja (URL pública)</Label>
            <Input value={form.store_slug} onChange={(e) => setForm({ ...form, store_slug: e.target.value })} className="mt-1.5" required />
            <a href={`/loja/${profile.store_slug}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="size-3" /> Ver minha loja: /loja/{profile.store_slug}
            </a>
          </div>
          <div>
            <Label>WhatsApp (com DDD, só números)</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-1.5" required />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-xl">E-MAIL</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </section>

        <Button type="submit" size="lg" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} Salvar alterações
        </Button>
      </form>
    </div>
  );
}
