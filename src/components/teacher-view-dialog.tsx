import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MONTHS, currentYear, yearOptions } from "@/lib/months";
import { format } from "date-fns";
import { Check, CircleDashed } from "lucide-react";
import { toast } from "sonner";

export interface TeacherViewData {
  id: string;
  name: string;
  father_name?: string | null;
  mother_name?: string | null;
  mobile: string;
  email?: string | null;
  address?: string | null;
  designation?: string | null;
  joining_date?: string | null;
  monthly_salary: number;
  photo_url?: string | null;
}

interface Payment {
  id: string;
  period_year: number;
  period_month: number;
  amount: number;
  paid_at: string;
}

interface Props {
  teacher: TeacherViewData | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  signedPhoto?: string;
}

export function TeacherViewDialog({ teacher, open, onOpenChange, signedPhoto }: Props) {
  const [year, setYear] = useState<number>(currentYear());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !teacher) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("teacher_salary_payments")
        .select("id,period_year,period_month,amount,paid_at")
        .eq("teacher_id", teacher.id)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      setLoading(false);
      if (error) return toast.error(error.message);
      setPayments((data ?? []) as Payment[]);
    })();
  }, [open, teacher?.id]);

  if (!teacher) return null;

  const paidMap = new Map<number, Payment>();
  payments.filter((p) => p.period_year === year).forEach((p) => paidMap.set(p.period_month, p));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Teacher Details <span className="font-bn text-base text-muted-foreground">/ শিক্ষকের বিবরণ</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <Card className="p-5 flex items-start gap-4">
            <div className="size-20 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
              {signedPhoto ? (
                <img src={signedPhoto} alt="" className="size-full object-cover" />
              ) : (
                <span className="font-display text-2xl text-muted-foreground">{teacher.name[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl">{teacher.name}</div>
              {teacher.designation && <div className="text-muted-foreground text-sm">{teacher.designation}</div>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Monthly Salary: ৳ {Number(teacher.monthly_salary).toLocaleString()}</Badge>
                {teacher.joining_date && (
                  <Badge variant="secondary">Joined: {format(new Date(teacher.joining_date), "PP")}</Badge>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
            <Info label="Mobile / মোবাইল" value={teacher.mobile} />
            <Info label="Email / ইমেইল" value={teacher.email} />
            <Info label="Father's Name / পিতার নাম" value={teacher.father_name} />
            <Info label="Mother's Name / মাতার নাম" value={teacher.mother_name} />
            <Info label="Address / ঠিকানা" value={teacher.address} full />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-base">Salary Payment History</div>
                <div className="font-bn text-xs text-muted-foreground">বেতন পরিশোধের ইতিহাস</div>
              </div>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions().map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-4">Loading…</div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {MONTHS.map((m) => {
                  const p = paidMap.get(m.value);
                  const paid = !!p;
                  return (
                    <div
                      key={m.value}
                      className={
                        "rounded-md border p-3 text-sm " +
                        (paid ? "bg-primary/10 border-primary/30" : "bg-muted/30")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{m.en}</div>
                          <div className="font-bn text-xs text-muted-foreground">{m.bn}</div>
                        </div>
                        {paid ? <Check className="size-4 text-primary" /> : <CircleDashed className="size-4 text-muted-foreground" />}
                      </div>
                      <div className="mt-2 text-xs">
                        {paid ? (
                          <>
                            <div className="text-primary font-medium">Paid · ৳ {Number(p!.amount).toLocaleString()}</div>
                            <div className="text-muted-foreground">on {format(new Date(p!.paid_at), "PP")}</div>
                          </>
                        ) : (
                          <div className="text-destructive font-medium">Unpaid · <span className="font-bn">অপরিশোধিত</span></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value, full }: { label: string; value?: string | null; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
