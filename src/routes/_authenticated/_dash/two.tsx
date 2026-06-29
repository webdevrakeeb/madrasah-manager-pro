import { createFileRoute } from "@tanstack/react-router";
import { ClassPage } from "@/components/class-page";
export const Route = createFileRoute("/_authenticated/_dash/two")({ component: () => <ClassPage classValue="two" /> });
