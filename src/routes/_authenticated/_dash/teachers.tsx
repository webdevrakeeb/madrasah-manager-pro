import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_dash/teachers")({
  component: Teachers,
});

function Teachers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Teachers <span className="font-bn text-xl text-muted-foreground ml-2">শিক্ষক</span></h2>
        <p className="text-sm text-muted-foreground mt-1">Teacher profiles & salaries · <span className="font-bn">শিক্ষক ও বেতন</span></p>
      </div>
      <Card className="p-16 text-center">
        <div className="size-12 mx-auto rounded-full bg-muted grid place-items-center mb-3">
          <Users className="size-5 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg">Coming soon</h3>
        <p className="font-bn text-sm text-muted-foreground mt-1">শীঘ্রই আসছে — শিক্ষক ব্যবস্থাপনা ও বেতনের হিসাব</p>
      </Card>
    </div>
  );
}
