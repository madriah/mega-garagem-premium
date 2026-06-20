import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Car, PlusCircle, BarChart3, Settings, LogOut, Store, Loader2, FileText, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({ component: AuthedLayout });

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/cars", label: "Meus Carros", icon: Car },
  { to: "/cars/new", label: "Cadastrar Carro", icon: PlusCircle },
  { to: "/applications", label: "Fichas", icon: FileText },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

function AuthedLayout() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-5">
          <Link to="/dashboard"><Logo size="sm" /></Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        {profile && (
          <div className="border-t border-sidebar-border p-4">
            <Link to="/loja/$slug" params={{ slug: profile.store_slug }} target="_blank" className="mb-3 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-sidebar-foreground hover:border-primary/50">
              <Store className="size-3.5 text-primary" />
              <span className="truncate">/loja/{profile.store_slug}</span>
            </Link>
            <div className="mb-3 px-1">
              <p className="truncate text-sm font-medium">{profile.store_name}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden">
        <div className="fixed top-0 z-30 flex w-full items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Link to="/dashboard"><Logo size="sm" /></Link>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4" /></Button>
        </div>
      </div>

      <main className="flex-1 px-4 pb-24 pt-20 md:px-8 md:pt-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 z-30 flex w-full justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
        {nav.map((n) => {
          const active = pathname === n.to;
          return (
            <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
              <n.icon className="size-5" /> {n.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
