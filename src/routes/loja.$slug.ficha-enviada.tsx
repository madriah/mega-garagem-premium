import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/loja/$slug/ficha-enviada")({
  validateSearch: z.object({ p: z.string().optional() }),
  component: SentPage,
});

function SentPage() {
  const { slug } = Route.useParams();
  const { p } = Route.useSearch();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10 text-center text-foreground">
      <Logo size="md" />
      <div className="mt-10 flex size-20 items-center justify-center rounded-full bg-green-500/15 ring-4 ring-green-500/20">
        <CheckCircle2 className="size-10 text-green-500" />
      </div>
      <h1 className="mt-6 text-4xl">FICHA ENVIADA!</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Recebemos sua solicitação com sucesso. A loja vai analisar e entrar em contato pelo telefone informado.</p>
      {p && (
        <div className="mt-6 rounded-xl border border-border bg-card px-6 py-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Protocolo</p>
          <p className="font-mono text-2xl text-primary">#{p}</p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/loja/$slug" params={{ slug }}><Button variant="outline">Voltar para a loja</Button></Link>
      </div>
    </div>
  );
}
