import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const searchSchema = z.object({ mode: z.enum(["login", "register"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Entrar — MegaGaragem" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "register">(initialMode ?? "login");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard" });
  }, [user, authLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/"><Logo size="lg" /></Link>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "login" ? "Acesse sua garagem virtual" : "Crie sua garagem em 1 minuto"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card-premium">
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Ainda não tem conta?{" "}
                <button onClick={() => setMode("register")} className="font-medium text-primary hover:underline">Cadastre-se</button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">Entrar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5" />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} Entrar
      </Button>
    </form>
  );
}

const registerSchema = z.object({
  full_name: z.string().min(2, "Informe seu nome"),
  store_name: z.string().min(2, "Informe o nome da loja"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

function RegisterForm() {
  const [form, setForm] = useState({ full_name: "", store_name: "", whatsapp: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const whatsapp = form.whatsapp.replace(/\D/g, "");
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: form.full_name, store_name: form.store_name, whatsapp },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Garagem criada! Bem-vindo.");
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Seu nome</Label>
        <Input id="full_name" value={form.full_name} onChange={set("full_name")} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="store_name">Nome da loja</Label>
        <Input id="store_name" value={form.store_name} onChange={set("store_name")} required className="mt-1.5" placeholder="Ex: Garagem do João" />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
        <Input id="whatsapp" value={form.whatsapp} onChange={set("whatsapp")} required className="mt-1.5" placeholder="11999998888" />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" value={form.email} onChange={set("email")} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" value={form.password} onChange={set("password")} required className="mt-1.5" minLength={6} />
      </div>
      <Button type="submit" className="w-full shadow-glow" size="lg" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} Criar minha garagem
      </Button>
    </form>
  );
}
