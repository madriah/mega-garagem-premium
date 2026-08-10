import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth, type Permission } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

/**
 * Gate de permissão do painel. Dono sempre passa.
 * A segurança real é garantida pelas políticas do banco (RLS) — isto é só a UI.
 */
export function PermissionGate({
  perm,
  ownerOnly,
  children,
}: {
  perm?: Permission;
  ownerOnly?: boolean;
  children: ReactNode;
}) {
  const { isSeller, can, loading } = useAuth();
  if (loading) return null;

  const allowed = !isSeller || (!ownerOnly && (!perm || can(perm)));
  if (allowed) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl">SEM ACESSO</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Você não tem permissão para esta área. Fale com o dono da loja para liberar o acesso.
      </p>
      <Link to="/dashboard">
        <Button variant="outline" size="sm" className="mt-5">Voltar ao dashboard</Button>
      </Link>
    </div>
  );
}
