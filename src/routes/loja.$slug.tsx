import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/loja/$slug")({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl">LOJA NÃO ENCONTRADA</h1>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">Ir para o início</Link>
      </div>
    </div>
  ),
});
