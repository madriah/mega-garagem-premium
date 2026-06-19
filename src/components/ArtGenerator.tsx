import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Loader2, Save, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { renderArt, canvasToBlob, SIZES, type ArtVehicle, type ArtBranding, type Format, type TemplateId } from "@/lib/art-templates";

export type { ArtVehicle } from "@/lib/art-templates";

type Props = {
  vehicleId: string;
  userId: string;
  vehicle: ArtVehicle;
  branding: ArtBranding;
  template: TemplateId;
  trigger?: React.ReactNode;
};

const BUCKET = "vehicle-arts";

export function ArtGenerator({ vehicleId, userId, vehicle, branding, template, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("story");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const build = useCallback(async () => {
    setRendering(true);
    try {
      const canvas = await renderArt(template, format, vehicle, branding);
      setDataUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar arte");
    } finally {
      setRendering(false);
    }
  }, [template, format, vehicle, branding]);

  useEffect(() => { if (open) build(); }, [open, format, build]);

  const download = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
  };

  const saveAndDownload = async () => {
    setSaving(true);
    try {
      const canvas = await renderArt(template, format, vehicle, branding);
      const blob = await canvasToBlob(canvas);
      const path = `${userId}/${vehicleId}/${template}-${format}-${Date.now()}.png`;
      const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/png", upsert: false });
      if (up.error) throw up.error;
      const ins = await supabase.from("vehicle_arts" as any).insert({ vehicle_id: vehicleId, user_id: userId, storage_path: path, format, template });
      if (ins.error) throw ins.error;
      download(canvas.toDataURL("image/png"), `megagaragem-${format}-${(vehicle.model ?? "carro").replace(/\s+/g, "-").toLowerCase()}.png`);
      qc.invalidateQueries({ queryKey: ["vehicle-arts", vehicleId] });
      toast.success("Arte salva na galeria");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline"><Sparkles className="size-3.5" /> Gerar arte</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">GERAR ARTE — TEMPLATE {template.toUpperCase()}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="gerar">
          <TabsList>
            <TabsTrigger value="gerar"><Sparkles className="size-3.5" /> Gerar</TabsTrigger>
            <TabsTrigger value="galeria"><ImageIcon className="size-3.5" /> Galeria</TabsTrigger>
          </TabsList>
          <TabsContent value="gerar" className="space-y-3">
            <div className="flex gap-2">
              {(Object.keys(SIZES) as Format[]).map((f) => (
                <Button key={f} size="sm" variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)}>{SIZES[f].label}</Button>
              ))}
            </div>
            <div className="flex justify-center rounded-lg bg-muted/30 p-4">
              {rendering || !dataUrl ? (
                <div className="flex h-96 items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
              ) : (
                <img src={dataUrl} alt="Preview" className={format === "story" ? "max-h-[70vh] rounded" : "max-h-[60vh] rounded"} />
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveAndDownload} disabled={!dataUrl || saving} size="lg" className="flex-1">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Salvar e baixar
              </Button>
              <Button variant="outline" size="lg" onClick={() => dataUrl && download(dataUrl, `preview-${format}.png`)} disabled={!dataUrl}>
                <Download className="size-4" /> Só baixar
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="galeria">
            <Gallery vehicleId={vehicleId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Gallery({ vehicleId }: { vehicleId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["vehicle-arts", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicle_arts" as any).select("*").eq("vehicle_id", vehicleId).order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as any[];
      const paths = rows.map((r) => r.storage_path);
      const signed = paths.length ? (await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60)).data ?? [] : [];
      return rows.map((r, i) => ({ ...r, url: signed[i]?.signedUrl ?? "" }));
    },
  });

  const remove = async (id: string, path: string) => {
    if (!confirm("Excluir esta arte?")) return;
    await supabase.storage.from(BUCKET).remove([path]);
    await supabase.from("vehicle_arts" as any).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["vehicle-arts", vehicleId] });
    toast.success("Arte removida");
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="size-5 animate-spin" /></div>;
  if (!data?.length) return <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma arte salva ainda.</p>;

  return (
    <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto p-1">
      {data.map((a: any) => (
        <div key={a.id} className="group relative overflow-hidden rounded-lg border border-border bg-muted/20">
          <img src={a.url} alt="" className={a.format === "story" ? "aspect-[9/16] w-full object-cover" : "aspect-square w-full object-cover"} />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-2">
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">{a.format} · {a.template}</span>
            <div className="flex gap-1">
              <a href={a.url} download={`arte-${a.format}-${a.id}.png`} className="rounded bg-white/90 p-1.5 text-black hover:bg-white"><Download className="size-3.5" /></a>
              <button onClick={() => remove(a.id, a.storage_path)} className="rounded bg-red-500/90 p-1.5 text-white hover:bg-red-500"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
