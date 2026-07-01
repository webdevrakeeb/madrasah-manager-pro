import { createFileRoute } from "@tanstack/react-router";
import { TeacherSalaryPayment } from "@/components/teacher-salary-payment";

export const Route = createFileRoute("/_authenticated/_dash/salaries")({
  component: TeacherSalaryPayment,
});
