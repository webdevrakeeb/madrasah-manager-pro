import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_dash/change-password")({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (next === current) {
      toast.error("New password must differ from current password");
      return;
    }
    setBusy(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user?.email) throw new Error("Not signed in");

      // Verify current password by re-authenticating
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: current,
      });
      if (signInErr) {
        toast.error("Current password is incorrect");
        setBusy(false);
        return;
      }

      const { error: updErr } = await supabase.auth.updateUser({ password: next });
      if (updErr) throw updErr;

      toast.success("Password updated successfully");
      setCurrent(""); setNext(""); setConfirm("");
      navigate({ to: "/overview" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-md bg-primary/10 grid place-items-center">
            <KeyRound className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl">Change Password</h2>
            <p className="font-bn text-sm text-muted-foreground">পাসওয়ার্ড পরিবর্তন</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password <span className="font-bn text-muted-foreground">/ বর্তমান পাসওয়ার্ড</span></Label>
            <PasswordInput id="current" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password <span className="font-bn text-muted-foreground">/ নতুন পাসওয়ার্ড</span></Label>
            <PasswordInput id="new" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password <span className="font-bn text-muted-foreground">/ নিশ্চিত করুন</span></Label>
            <PasswordInput id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update Password"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/overview" })} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
