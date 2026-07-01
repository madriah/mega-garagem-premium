import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/loja/$slug/ficha")({
  // Generic ficha route — redirect to store, since the new flow is per-vehicle.
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/loja/$slug", params: { slug: params.slug } });
  },
  component: () => null,
});
