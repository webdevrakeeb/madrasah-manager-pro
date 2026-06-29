import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CLASS_OPTIONS } from "@/lib/i18n";
import { StudentRegistrationDialog } from "@/components/student-registration-dialog";
import { Users, BookOpenText, Sparkles, UserPlus } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/_dash/overview")({
  component: Overview,
});

function Overview() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [recent, setRecent] = useState<{ id: string; name_en: string; name_bn: string; class: string; created_at: string }[]>([]);

  async function load() {
    const { data } = await supabase
      .from("students")
      .select("class")
      .returns<{ class: string }[]>();
    const c: Record<string, number> = {};
    (data ?? []).forEach((r) => { c[r.class] = (c[r.class] ?? 0) + 1; });
    setCounts(c); setTotal((data ?? []).length);

    const { data: r } = await supabase
      .from("students")
      .select("id,name_en,name_bn,class,created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    setRecent((r ?? []) as typeof recent);
  }
  useEffect(() => { load(); }, []);

  const stats = [
    { label: "Total Students", bn: "মোট শিক্ষার্থী", value: total, icon: Users, accent: "text-primary" },
    { label: "Active Classes",  bn: "সক্রিয় শ্রেণি",  value: CLASS_OPTIONS.length, icon: BookOpenText, accent: "text-gold" },
    { label: "New This Week",   bn: "এই সপ্তাহে নতুন", value: recent.filter(r => Date.now() - new Date(r.created_at).getTime() < 7*86400000).length, icon: Sparkles, accent: "text-primary" },
    { label: "Teachers",        bn: "শিক্ষক",          value: 0, icon: Users, accent: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Overview</h2>
          <p className="font-bn text-muted-foreground mt-1">আজকের মাদরাসা — এক নজরে</p>
        </div>
        <StudentRegistrationDialog
          onCreated={load}
          trigger={<button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"><UserPlus className="size-4"/>Register Student <span className="font-bn opacity-80">/ নিবন্ধন</span></button>}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/[0.04]" />
              <Icon className={`size-5 ${s.accent}`} />
              <div className="mt-4 font-display text-3xl">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              <div className="font-bn text-xs text-muted-foreground/80">{s.bn}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Class distribution */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-baseline gap-2 mb-5">
            <h3 className="font-display text-lg">Students by Class</h3>
            <span className="font-bn text-sm text-muted-foreground">শ্রেণি অনুযায়ী</span>
          </div>
          <ul className="space-y-3">
            {CLASS_OPTIONS.map((c) => {
              const n = counts[c.value] ?? 0;
              const pct = total ? (n / total) * 100 : 0;
              return (
                <li key={c.value}>
                  <div className="flex items-baseline justify-between text-sm mb-1.5">
                    <span>{c.en} <span className="font-bn text-muted-foreground ml-1 text-xs">{c.bn}</span></span>
                    <span className="tabular-nums text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Recent registrations */}
        <Card className="p-6">
          <div className="flex items-baseline gap-2 mb-5">
            <h3 className="font-display text-lg">Recent</h3>
            <span className="font-bn text-sm text-muted-foreground">সাম্প্রতিক</span>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet. <span className="font-bn">কোনো নিবন্ধন নেই।</span></p>
          ) : (
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-accent grid place-items-center font-display text-sm text-accent-foreground">
                    {r.name_en[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.name_en}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {r.class} · {format(new Date(r.created_at), "PP")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
