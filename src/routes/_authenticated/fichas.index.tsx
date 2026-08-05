import { createFileRoute, redirect } from "@tanstack/react-router";

// Alias em português: /fichas -> /applications (lista de fichas digitais)
export const Route = createFileRoute("/_authenticated/fichas/")({
  beforeLoad: () => {
    throw redirect({ to: "/applications" });
  },
  component: () => null,
});
