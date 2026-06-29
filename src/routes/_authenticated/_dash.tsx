import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";

export const Route = createFileRoute("/_authenticated/_dash")({
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
