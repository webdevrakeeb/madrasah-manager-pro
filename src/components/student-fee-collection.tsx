import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CLASS_OPTIONS } from "@/lib/i18n";
import { MONTHS, currentYear, monthLabel, yearOptions } from "@/lib/months";
import { format } from "date-fns";
import { Check, CircleDashed, Wallet } from "lucide-react";

interface StudentLite {
  id: string;
  name_en: string;
  name_bn: string;
  class: string;
  monthly_fee: number;
}

interface Payment {
  id: string;
  period_year: number;
  period_month: number;
  amount: number;
  paid_at: string;
  note: string | null;
}

export function StudentFeeCollection() {
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [year, setYear] = useState<number>(currentYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => students.find((s) => s.id === selectedId), [students, selectedId]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,name_en,name_bn,class,monthly_fee")
        .order("name_en");
      if (error) return toast.error(error.message);
      setStudents((data ?? []) as StudentLite[]);
    })();
  }, []);

  useEffect(() => {
    if (!selected) { setPayments([]); setAmount(""); return; }
    setAmount(String(selected.monthly_fee ?? 0));
    loadPayments(selected.id);
  }, [selected]);

  async function loadPayments(studentId: string) {
    const { data, error } = await supabase
      .from("student_fee_payments")
      .select("id,period_year,period_month,amount,paid_at,note")
      .eq("student_id", studentId)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false });
    if (error) return toast.error(error.message);
    setPayments((data ?? []) as Payment[]);
  }

  const paidForYear = useMemo(() => {
    const set = new Set<number>();
    payments.filter((p) => p.period_year === year).forEach((p) => set.add(p.period_month));
    return set;
  }, [payments, year]);

  const alreadyPaid = paidForYear.has(month);

  async function recordPayment() {
    if (!selected) return toast.error("Select a student");
    const amt = Number(amount);
    if (isNaN(amt) || amt < 0) return toast.error("Enter a valid amount");
    if (alreadyPaid) return toast.error("This month is already paid");
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("student_fee_payments").insert({
      student_id: selected.id,
      period_year: year,
      period_month: month,
      amount: amt,
      note: note || null,
      created_by: userData.user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      if (error.code === "23505") return toast.error("Payment for this month already exists");
      return toast.error(error.message);
    }
    toast.success(`Recorded ${monthLabel(month).en} ${year}`);
    setNote("");
    loadPayments(selected.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Student Fee Collection <span className="font-bn text-xl text-muted-foreground ml-2">শিক্ষার্থী ফি সংগ্রহ</span></h2>
        <p className="text-sm text-muted-foreground mt-1">Record monthly fee payments · <span className="font-bn">মাসিক ফি নথিভুক্ত করুন</span></p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Collect form */}
        <Card className="p-6 lg:col-span-1 space-y-4">
          <div className="space-y-2">
            <Label>Student / শিক্ষার্থী</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => {
                  const cls = CLASS_OPTIONS.find((c) => c.value === s.class);
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name_en} <span className="font-bn text-muted-foreground ml-1 text-xs">{s.name_bn}</span>
                      <span className="text-xs text-muted-foreground ml-2">· {cls?.en}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm flex items-center gap-3">
              <Wallet className="size-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Assigned monthly fee</div>
                <div className="font-display text-lg">৳ {Number(selected.monthly_fee).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Year / বছর</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions().map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month / মাস</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.en} <span className="font-bn text-muted-foreground ml-1 text-xs">{m.bn}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount (৳) / পরিমাণ</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Note / নোট (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {selected && alreadyPaid && (
            <div className="text-xs text-destructive">Already paid for {monthLabel(month).en} {year}</div>
          )}

          <Button className="w-full" disabled={!selected || saving || alreadyPaid} onClick={recordPayment}>
            {saving ? "Saving…" : "Record Payment"}
          </Button>
        </Card>

        {/* History + status */}
        <Card className="p-6 lg:col-span-2">
          {!selected ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Select a student to view fee history</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-display text-lg">{selected.name_en}</div>
                  <div className="font-bn text-sm text-muted-foreground">{selected.name_bn}</div>
                </div>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {yearOptions().map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{year} status</div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {MONTHS.map((m) => {
                    const paid = paidForYear.has(m.value);
                    return (
                      <button
                        key={m.value}
                        onClick={() => setMonth(m.value)}
                        className={
                          "rounded-md border p-2 text-left text-xs transition " +
                          (paid
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted/30 hover:bg-muted/60") +
                          (month === m.value ? " ring-2 ring-primary/40" : "")
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{m.en.slice(0, 3)}</span>
                          {paid
                            ? <Check className="size-3.5" />
                            : <CircleDashed className="size-3.5 opacity-50" />}
                        </div>
                        <div className="font-bn text-[10px] opacity-70">{m.bn}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">History</div>
                {payments.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">No payments recorded yet</div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {payments.map((p) => {
                      const ml = monthLabel(p.period_month);
                      return (
                        <div key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <div>
                            <div className="font-medium">{ml.en} {p.period_year}</div>
                            <div className="font-bn text-xs text-muted-foreground">{ml.bn} · {format(new Date(p.paid_at), "PP")}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            {p.note && <span className="text-xs text-muted-foreground max-w-40 truncate">{p.note}</span>}
                            <Badge variant="secondary">৳ {Number(p.amount).toLocaleString()}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
