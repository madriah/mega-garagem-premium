import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fipe, parseFipeValue, formatBRL, type FipeItem } from "@/lib/fipe";
import { generateDescription } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, X, Sparkles, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cars/new")({ component: NewCar });

function NewCar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const genDesc = useServerFn(generateDescription);
  const [aiLoading, setAiLoading] = useState(false);

  const [plate, setPlate] = useState("");
  const [brandCode, setBrandCode] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [yearCode, setYearCode] = useState("");
  const [fipeData, setFipeData] = useState<{ brand: string; model: string; year: string; fipe_value: number; fuel: string } | null>(null);

  const [salePrice, setSalePrice] = useState("");
  const [km, setKm] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const brandsQ = useQuery({ queryKey: ["fipe-brands"], queryFn: fipe.brands });
  const modelsQ = useQuery({
    queryKey: ["fipe-models", brandCode],
    enabled: !!brandCode,
    queryFn: async () => (await fipe.models(brandCode)).modelos,
  });
  const yearsQ = useQuery({
    queryKey: ["fipe-years", brandCode, modelCode],
    enabled: !!brandCode && !!modelCode,
    queryFn: () => fipe.years(brandCode, modelCode),
  });

  useEffect(() => {
    if (brandCode && modelCode && yearCode) {
      fipe.value(brandCode, modelCode, yearCode).then((v) => {
        setFipeData({
          brand: v.Marca,
          model: v.Modelo,
          year: String(v.AnoModelo),
          fuel: v.Combustivel,
          fipe_value: parseFipeValue(v.Valor),
        });
      }).catch(() => toast.error("Não foi possível consultar a FIPE"));
    } else setFipeData(null);
  }, [brandCode, modelCode, yearCode]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((p) => [...p, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPhotoPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fipeData) return toast.error("Selecione marca, modelo e ano");
    if (!plate.trim()) return toast.error("Informe a placa");
    if (!salePrice) return toast.error("Informe o preço");

    setSaving(true);
    try {
      // Upload photos — store storage paths (signed URLs are generated on read)
      const photoPaths: string[] = [];
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("vehicle-photos").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        photoPaths.push(path);
      }

      const { error } = await supabase.from("vehicles").insert({
        user_id: user.id,
        plate: plate.toUpperCase().trim(),
        brand: fipeData.brand,
        model: fipeData.model,
        year: fipeData.year,
        fuel: fipeData.fuel,
        fipe_value: fipeData.fipe_value,
        sale_price: Number(salePrice),
        km: Number(km) || 0,
        color: color || null,
        description: description || null,
        photos: photoPaths,
      });
      if (error) throw error;
      toast.success("Veículo cadastrado!");
      navigate({ to: "/cars" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-4xl">CADASTRAR CARRO</h1>
        <p className="mt-1 text-muted-foreground">Selecione marca, modelo e ano para consultar a FIPE automaticamente.</p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl"><Sparkles className="size-4 text-primary" /> CONSULTA FIPE</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Marca</Label>
              <Select value={brandCode} onValueChange={(v) => { setBrandCode(v); setModelCode(""); setYearCode(""); }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={brandsQ.isLoading ? "Carregando..." : "Selecione"} /></SelectTrigger>
                <SelectContent>{brandsQ.data?.map((b: FipeItem) => <SelectItem key={b.codigo} value={b.codigo}>{b.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Modelo</Label>
              <Select value={modelCode} onValueChange={(v) => { setModelCode(v); setYearCode(""); }} disabled={!brandCode}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={modelsQ.isLoading ? "Carregando..." : "Selecione"} /></SelectTrigger>
                <SelectContent>{modelsQ.data?.map((m: FipeItem) => <SelectItem key={m.codigo} value={String(m.codigo)}>{m.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ano</Label>
              <Select value={yearCode} onValueChange={setYearCode} disabled={!modelCode}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={yearsQ.isLoading ? "Carregando..." : "Selecione"} /></SelectTrigger>
                <SelectContent>{yearsQ.data?.map((y) => <SelectItem key={y.codigo} value={y.codigo}>{y.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {fipeData && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-primary">Tabela FIPE</p>
              <p className="mt-1 font-display text-2xl">{formatBRL(fipeData.fipe_value)}</p>
              <p className="text-xs text-muted-foreground">{fipeData.brand} · {fipeData.model} · {fipeData.year} · {fipeData.fuel}</p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl">DETALHES DO VEÍCULO</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Placa</Label>
              <Input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ABC1D23" maxLength={8} className="mt-1.5 uppercase" required />
            </div>
            <div>
              <Label>Preço de venda (R$)</Label>
              <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="0" min="0" step="100" className="mt-1.5" required />
            </div>
            <div>
              <Label>KM</Label>
              <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="0" min="0" className="mt-1.5" />
            </div>
            <div>
              <Label>Cor</Label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Preto" className="mt-1.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Descrição</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!fipeData || aiLoading}
                onClick={async () => {
                  if (!fipeData) return;
                  setAiLoading(true);
                  try {
                    const r = await genDesc({
                      data: {
                        brand: fipeData.brand,
                        model: fipeData.model,
                        year: fipeData.year,
                        fuel: fipeData.fuel,
                        km: Number(km) || 0,
                        color,
                        fipe_value: fipeData.fipe_value,
                        sale_price: Number(salePrice) || 0,
                        store_name: profile?.store_name ?? "",
                        notes: description,
                      },
                    });
                    setDescription(r.description);
                    toast.success("Descrição gerada");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Erro na IA");
                  } finally {
                    setAiLoading(false);
                  }
                }}
              >
                {aiLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                Gerar com IA
              </Button>
            </div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={5} placeholder="Único dono, revisões em dia... ou clique em Gerar com IA" />
            <p className="mt-1 text-xs text-muted-foreground">A IA usa os dados FIPE + km/cor para criar uma descrição vendedora pronta para WhatsApp, feed e site.</p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xl">FOTOS</h2>
          <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/50 transition-colors hover:border-primary/50">
            <Upload className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Clique para enviar fotos</p>
            <p className="text-xs text-muted-foreground">JPG, PNG · múltiplas</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
          </label>
          {photoPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
              {photoPreviews.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={src} alt="" className="size-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <Button type="submit" size="lg" className="w-full shadow-glow" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} Cadastrar veículo
        </Button>
      </form>
    </div>
  );
}
