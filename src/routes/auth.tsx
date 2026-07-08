import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpenText } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  // Already logged in? bounce in.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/overview" });
    });
    supabase.rpc("admin_exists").then(({ data, error }) => {
      setAdminExists(error ? true : Boolean(data));
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/overview" },
        });
        if (error) throw error;
        toast.success("Admin account created");
      }
      navigate({ to: "/overview" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-sidebar-foreground"
           style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-sidebar-primary/20 grid place-items-center">
            <BookOpenText className="size-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="font-display text-lg">Madrasah</div>
            <div className="font-bn text-sm opacity-80">মাদরাসা ব্যবস্থাপনা</div>
          </div>
        </div>
        <div>
          <h1 className="font-display text-5xl leading-tight">
            A measured ledger<br />for a place of learning.
          </h1>
          <p className="mt-4 max-w-md opacity-80 font-bn text-lg">
            শিক্ষার্থী, শিক্ষক ও আর্থিক ব্যবস্থাপনা — একটি শান্ত, সুসংগঠিত প্ল্যাটফর্মে।
          </p>
        </div>
        <div className="text-xs opacity-60">Administrators only · প্রশাসকদের জন্য</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <BookOpenText className="size-5 text-primary" />
            <span className="font-display text-lg">Madrasah</span>
          </div>
          <h2 className="font-display text-2xl">
            {mode === "signin" ? "Admin Sign In" : "Create Admin Account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-bn">
            {mode === "signin" ? "প্রশাসক হিসেবে প্রবেশ করুন" : "প্রথম প্রশাসক অ্যাকাউন্ট তৈরি করুন"}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="font-bn text-muted-foreground">/ ইমেইল</span></Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="font-bn text-muted-foreground">/ পাসওয়ার্ড</span></Label>
              <PasswordInput id="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "signin" ? (
              <>First time here?{" "}
                <button className="text-primary underline-offset-4 hover:underline"
                        onClick={() => setMode("signup")}>Create the first admin</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button className="text-primary underline-offset-4 hover:underline"
                        onClick={() => setMode("signin")}>Sign in</button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// silence unused
void useRouterState;
void Link;
