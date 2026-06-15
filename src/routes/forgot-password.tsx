import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — MegaGaragem" }] }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().email("E-mail inválido") });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    // Always show the same success message — never reveal whether the email exists
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error && !/rate/i.test(error.message)) {
      // Silent: don't leak account existence. Only show generic errors for rate limits.
      console.warn("[reset]", error.message);
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/"><Logo size="lg" /></Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card-premium">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="size-7 text-primary" />
              </div>
              <h1 className="text-xl font-semibold">Verifique seu e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Se existir uma conta para <span className="font-medium text-foreground">{email}</span>, enviamos um link para redefinir sua senha. O link expira em 1 hora.
              </p>
              <p className="text-xs text-muted-foreground">Não recebeu? Confira a pasta de spam ou tente novamente em alguns minutos.</p>
              <Link to="/auth" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="size-4" /> Voltar para entrar
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-xl font-semibold">Recuperar senha</h1>
              <p className="mb-6 text-sm text-muted-foreground">Informe o e-mail da sua conta. Enviaremos um link seguro para criar uma nova senha.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />} Enviar link de recuperação
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" /> Voltar para entrar
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
