import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Baby,
  Sprout,
  BookOpen,
  BookText,
  BookMarked,
  Library,
  GraduationCap,
  Users,
  BookOpenText,
  LogOut,
  Search,
  Menu,
  Wallet,
  BadgeDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/overview", en: "Overview", bn: "সারসংক্ষেপ", icon: LayoutDashboard },
  { to: "/play",     en: "Play",     bn: "প্লে",        icon: Baby },
  { to: "/nursery",  en: "Nursery",  bn: "নার্সারি",     icon: Sprout },
  { to: "/one",      en: "One",      bn: "প্রথম শ্রেণি",  icon: BookOpen },
  { to: "/two",      en: "Two",      bn: "দ্বিতীয় শ্রেণি", icon: BookText },
  { to: "/three",    en: "Three",    bn: "তৃতীয় শ্রেণি",  icon: BookMarked },
  { to: "/four",     en: "Four",     bn: "চতুর্থ শ্রেণি",  icon: Library },
  { to: "/hifz",     en: "Hifz",     bn: "হিফজ",        icon: GraduationCap },
  { to: "/fees",     en: "Fees",     bn: "শিক্ষার্থী ফি",   icon: Wallet },
  { to: "/teachers", en: "Teachers", bn: "শিক্ষক",       icon: Users },
  { to: "/salaries", en: "Salaries", bn: "বেতন",         icon: BadgeDollarSign },
] as const;

export function DashboardShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const active = NAV.find((n) => pathname.startsWith(n.to)) ?? NAV[0];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="px-6 py-6 border-b border-sidebar-border flex items-center gap-3">
          <div className="size-10 rounded-md bg-sidebar-primary/15 grid place-items-center">
            <BookOpenText className="size-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="font-display text-lg leading-none">Madrasah</div>
            <div className="font-bn text-xs opacity-70 mt-1">মাদরাসা ব্যবস্থাপনা</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="px-3 text-[10px] uppercase tracking-widest text-sidebar-foreground/50 mb-2">
            Classes · শ্রেণিসমূহ
          </div>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to || (item.to !== "/overview" && pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                        : "hover:bg-sidebar-accent/60 text-sidebar-foreground/85 border-l-2 border-transparent",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.en}</span>
                    <span className="font-bn text-xs opacity-60">{item.bn}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="text-xs text-sidebar-foreground/60">Signed in as</div>
          <div className="text-sm truncate">{email || "—"}</div>
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4 mr-2" /> Sign out <span className="font-bn ml-auto text-xs opacity-60">লগ আউট</span>
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/70 backdrop-blur sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="font-display text-xl truncate">{active.en}</h1>
            <span className="font-bn text-sm text-muted-foreground truncate">{active.bn}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search students…" className="pl-9 w-64 bg-background" />
            </div>
            <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center font-display text-sm">
              {email ? email[0]?.toUpperCase() : "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
