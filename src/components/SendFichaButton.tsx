import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, FileText, MessageCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { maskPhone } from "@/lib/credit-schema";

type Props = {
  userId: string;
  storeSlug: string;
  vehicleId: string;
  vehicleLabel: string;
};

export function SendFichaButton({ userId, storeSlug, vehicleId, vehicleLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [sellerId, setSellerId] = useState<string>("none");
  const [clientPhone, setClientPhone] = useState("");

  const { data: sellers } = useQuery({
    queryKey: ["sellers", userId],
    enabled: open,
    queryFn: async () => {
      const { data } = await supabase
        .from("sellers" as any)
        .select("id,name,whatsapp,is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("name");
      return ((data ?? []) as any[]);
    },
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/loja/${storeSlug}/ficha/${vehicleId}${sellerId !== "none" ? `?seller=${sellerId}` : ""}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const sendWhatsApp = () => {
    const phone = clientPhone.replace(/\D/g, "");
    if (phone.length < 10) return toast.error("Informe o WhatsApp do cliente");
    const msg = `Olá! Preparei uma proposta especial para você no ${vehicleLabel}. Preencha sua ficha aqui em 2 minutos e já envio para os bancos:\n\n${link}`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} title="Enviar ficha para o cliente">
        <FileText className="size-3.5" /> Enviar ficha
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar ficha de financiamento</DialogTitle>
            <DialogDescription>{vehicleLabel}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Vendedor responsável (opcional)</Label>
              <Select value={sellerId} onValueChange={setSellerId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sem vendedor específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem vendedor específico</SelectItem>
                  {(sellers ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!sellers?.length && (
                <p className="mt-1 text-xs text-muted-foreground">Cadastre vendedores em <span className="text-primary">Vendedores</span> no menu.</p>
              )}
            </div>

            <div>
              <Label className="text-xs">Link gerado</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input value={link} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copy}><Copy className="size-4" /></Button>
              </div>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <LinkIcon className="size-3" /> Cliente preenche pelo celular em ~2min
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <Label className="text-xs">WhatsApp do cliente</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input value={clientPhone} onChange={(e) => setClientPhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" />
                <Button type="button" onClick={sendWhatsApp}><MessageCircle className="size-4" /> Enviar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
