import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Definir nova senha — MegaGaragem" }] }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid" | "done";

function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase delivers a recovery session via the URL hash and fires PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStatus("ready");
      }
    });
    // Fallback: check if a session already exists (link was just consumed).
    supabase.auth.getSession().then(({ data }) => {
      setStatus((prev) => (prev === "checking" ? (data.session ? "ready" : "invalid") : prev));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const strength = scorePassword(password);
  const strengthLabel = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"][strength];
  const strengthColor = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-primary", "bg-emerald-500"][strength];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("A senha precisa ter pelo menos 8 caracteres");
    if (strength < 2) return toast.error("Escolha uma senha mais forte");
    if (password !== confirm) return toast.error("As senhas não coincidem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    setStatus("done");
    toast.success("Senha redefinida com sucesso");
    // Sign out so the user logs in fresh with the new password (revokes other sessions on next login).
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/auth" }), 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/"><Logo size="lg" /></Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card-premium">
          {status === "checking" && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Validando link...
            </div>
          )}

          {status === "invalid" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="size-7 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold">Link inválido ou expirado</h1>
              <p className="text-sm text-muted-foreground">Este link de recuperação não é mais válido. Solicite um novo.</p>
              <Link to="/forgot-password" className="inline-block">
                <Button>Solicitar novo link</Button>
              </Link>
            </div>
          )}

          {status === "done" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="size-7 text-emerald-500" />
              </div>
              <h1 className="text-xl font-semibold">Senha alterada</h1>
              <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
            </div>
          )}

          {status === "ready" && (
            <>
              <h1 className="mb-2 text-xl font-semibold">Definir nova senha</h1>
              <p className="mb-6 text-sm text-muted-foreground">Escolha uma senha forte — mínimo 8 caracteres, com letras maiúsculas, números e símbolos.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nova senha</Label>
                  <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1.5" />
                  {password && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Força: {strengthLabel}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} className="mt-1.5" onPaste={(e) => e.preventDefault()} />
                </div>
                <Button type="submit" className="w-full shadow-glow" size="lg" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />} Salvar nova senha
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
