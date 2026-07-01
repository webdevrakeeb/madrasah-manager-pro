import { createFileRoute } from "@tanstack/react-router";
import { TeachersPage } from "@/components/teachers-page";

export const Route = createFileRoute("/_authenticated/_dash/teachers")({
  component: TeachersPage,
});
