import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CLASS_OPTIONS } from "@/lib/i18n";
import { StudentRegistrationDialog } from "@/components/student-registration-dialog";
import { Users, BookOpenText, Sparkles, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/_dash/overview")({
  component: Overview,
});

function Overview() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [classIncome, setClassIncome] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [recent, setRecent] = useState<{ id: string; name_en: string; name_bn: string; class: string; created_at: string }[]>([]);

  async function load() {
    const { data } = await supabase
      .from("students")
      .select("class,monthly_fee")
      .returns<{ class: string; monthly_fee: number | null }[]>();
    const c: Record<string, number> = {};
    const inc: Record<string, number> = {};
    (data ?? []).forEach((r) => {
      c[r.class] = (c[r.class] ?? 0) + 1;
      inc[r.class] = (inc[r.class] ?? 0) + Number(r.monthly_fee ?? 0);
    });
    setCounts(c); setClassIncome(inc); setTotal((data ?? []).length);

    const { data: r } = await supabase
      .from("students")
      .select("id,name_en,name_bn,class,created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    setRecent((r ?? []) as typeof recent);

    const { count } = await supabase
      .from("teachers")
      .select("id", { count: "exact", head: true });
    setTeacherCount(count ?? 0);

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;

    const { data: fees } = await supabase
      .from("student_fee_payments")
      .select("amount")
      .eq("period_year", y)
      .eq("period_month", m)
      .returns<{ amount: number | null }[]>();
    setMonthlyIncome((fees ?? []).reduce((s, x) => s + Number(x.amount ?? 0), 0));

    const { data: sal } = await supabase
      .from("teacher_salary_payments")
      .select("amount")
      .eq("period_year", y)
      .eq("period_month", m)
      .returns<{ amount: number | null }[]>();
    setMonthlyExpense((sal ?? []).reduce((s, x) => s + Number(x.amount ?? 0), 0));
  }
  useEffect(() => { load(); }, []);

  const fmtTk = (n: number) => `৳${n.toLocaleString()}`;

  const stats = [
    { label: "Total Students", bn: "মোট শিক্ষার্থী", value: total, icon: Users, accent: "text-primary" },
    { label: "Active Classes",  bn: "সক্রিয় শ্রেণি",  value: CLASS_OPTIONS.length, icon: BookOpenText, accent: "text-gold" },
    { label: "New This Week",   bn: "এই সপ্তাহে নতুন", value: recent.filter(r => Date.now() - new Date(r.created_at).getTime() < 7*86400000).length, icon: Sparkles, accent: "text-primary" },
    { label: "Teachers",        bn: "শিক্ষক",          value: teacherCount, icon: Users, accent: "text-muted-foreground" },
  ];

  const monthLabel = format(new Date(), "MMMM yyyy");

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

      {/* Monthly income / expense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/10" />
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp className="size-5" />
            <span className="text-xs uppercase tracking-wide font-medium">Monthly Income</span>
          </div>
          <div className="mt-3 font-display text-4xl">{fmtTk(monthlyIncome)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Fees collected · {monthLabel}
          </div>
          <div className="font-bn text-xs text-muted-foreground/80">এই মাসের মোট আয়</div>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-rose-500/10" />
          <div className="flex items-center gap-2 text-rose-600">
            <TrendingDown className="size-5" />
            <span className="text-xs uppercase tracking-wide font-medium">Monthly Expense</span>
          </div>
          <div className="mt-3 font-display text-4xl">{fmtTk(monthlyExpense)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Salaries paid · {monthLabel}
          </div>
          <div className="font-bn text-xs text-muted-foreground/80">এই মাসের মোট ব্যয়</div>
        </Card>
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
              const income = classIncome[c.value] ?? 0;
              const pct = total ? (n / total) * 100 : 0;
              return (
                <li key={c.value}>
                  <div className="flex items-baseline justify-between text-sm mb-1.5 gap-3">
                    <span className="min-w-0">
                      {c.en} <span className="font-bn text-muted-foreground ml-1 text-xs">{c.bn}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground flex items-baseline gap-3 shrink-0">
                      <span>{n} <span className="text-xs">students</span></span>
                      <span className="text-foreground font-medium">{fmtTk(income)}</span>
                    </span>
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
