import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ExternalLink, Upload } from "lucide-react";
import { TEMPLATE_OPTIONS } from "@/components/store-templates";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    store_name: "",
    store_slug: "",
    whatsapp: "",
    store_template: "showroom",
    logo_url: "",
    accent_color: "",
    tagline: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setForm({
        full_name: p.full_name ?? "",
        store_name: p.store_name ?? "",
        store_slug: p.store_slug ?? "",
        whatsapp: p.whatsapp ?? "",
        store_template: p.store_template ?? "showroom",
        logo_url: p.logo_url ?? "",
        accent_color: p.accent_color ?? "",
        tagline: p.tagline ?? "",
        city: p.city ?? "",
      });
    }
  }, [profile]);

  const onUploadLogo = async (file: File) => {
    if (!profile) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${profile.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
    setUploading(false);
    toast.success("Logo enviado. Salve para aplicar.");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const slug = form.store_slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || profile.store_slug;
    const whatsapp = form.whatsapp.replace(/\D/g, "");
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      store_name: form.store_name,
      store_slug: slug,
      whatsapp,
      store_template: form.store_template,
      logo_url: form.logo_url || null,
      accent_color: form.accent_color || null,
      tagline: form.tagline || null,
      city: form.city || null,
    } as any).eq("id", profile.id);
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
        <p className="mt-1 text-muted-foreground">Personalize a identidade e o template da sua loja.</p>
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
          <div>
            <Label>Cidade (opcional)</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" placeholder="São Paulo, SP" />
          </div>
          <div>
            <Label>Tagline (opcional)</Label>
            <Textarea value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="mt-1.5" placeholder="Frase de apresentação que aparece no topo da loja" rows={2} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl">IDENTIDADE VISUAL</h2>
          <div>
            <Label>Logo da loja</Label>
            <div className="mt-1.5 flex items-center gap-4">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="size-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="grid size-16 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">sem logo</div>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadLogo(f); }}
              />
              <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {form.logo_url ? "Trocar logo" : "Enviar logo"}
              </Button>
              {form.logo_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, logo_url: "" })}>Remover</Button>
              )}
            </div>
          </div>
          <div>
            <Label>Cor de destaque</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="color"
                value={form.accent_color || "#E8610A"}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
              />
              <Input
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                placeholder="#E8610A"
                className="flex-1"
              />
              {form.accent_color && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, accent_color: "" })}>Padrão</Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Botões, preços e detalhes da sua loja usam essa cor.</p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl">TEMPLATE DA LOJA</h2>
          <p className="text-sm text-muted-foreground">Escolha o estilo do seu site. Você pode trocar quando quiser.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATE_OPTIONS.map((t) => {
              const selected = form.store_template === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, store_template: t.id })}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}
                >
                  <div className="font-display text-lg">{t.label.toUpperCase()}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                </button>
              );
            })}
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
