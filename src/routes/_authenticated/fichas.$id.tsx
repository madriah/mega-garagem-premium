import { createFileRoute, redirect } from "@tanstack/react-router";

// Alias em português: /fichas/:id -> /applications/:id (tela de detalhe da ficha)
export const Route = createFileRoute("/_authenticated/fichas/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/applications/$id", params: { id: params.id } });
  },
  component: () => null,
});
