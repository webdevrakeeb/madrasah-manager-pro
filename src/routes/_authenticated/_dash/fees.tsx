import { createFileRoute } from "@tanstack/react-router";
import { StudentFeeCollection } from "@/components/student-fee-collection";

export const Route = createFileRoute("/_authenticated/_dash/fees")({
  component: StudentFeeCollection,
});
