import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { listFeePayments } from "@/lib/store";
import { CLASS_OPTIONS, type ClassValue } from "@/lib/i18n";
import { MONTHS, currentYear, yearOptions } from "@/lib/months";
import { format } from "date-fns";
import { Check, CircleDashed } from "lucide-react";

export interface StudentViewData {
  id: string;
  name_en: string;
  name_bn: string;
  father_name_en?: string | null;
  father_name_bn?: string | null;
  mother_name_en?: string | null;
  mother_name_bn?: string | null;
  guardian_mobile?: string | null;
  father_mobile?: string | null;
  mother_mobile?: string | null;
  class: ClassValue;
  monthly_fee: number;
  created_at: string;
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
  student: StudentViewData | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  signedPhoto?: string;
}

export function StudentViewDialog({ student, open, onOpenChange, signedPhoto }: Props) {
  const [year, setYear] = useState<number>(currentYear());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !student) return;
    setLoading(false);
    setPayments(listFeePayments(student.id));
  }, [open, student?.id]);

  if (!student) return null;
  const classMeta = CLASS_OPTIONS.find((c) => c.value === student.class);

  const paidMap = new Map<number, Payment>();
  payments.filter((p) => p.period_year === year).forEach((p) => paidMap.set(p.period_month, p));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Student Details <span className="font-bn text-base text-muted-foreground">/ শিক্ষার্থীর বিবরণ</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Header card */}
          <Card className="p-5 flex items-start gap-4">
            <div className="size-20 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
              {signedPhoto ? (
                <img src={signedPhoto} alt="" className="size-full object-cover" />
              ) : (
                <span className="font-display text-2xl text-muted-foreground">{student.name_en[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl">{student.name_en}</div>
              <div className="font-bn text-muted-foreground">{student.name_bn}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">
                  Class: {classMeta?.en} <span className="font-bn ml-1">{classMeta?.bn}</span>
                </Badge>
                <Badge variant="secondary">Monthly Fee: ৳ {Number(student.monthly_fee).toLocaleString()}</Badge>
              </div>
            </div>
          </Card>

          {/* Info grid */}
          <Card className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
            <Info label="Father's Name / পিতার নাম" en={student.father_name_en} bn={student.father_name_bn} />
            <Info label="Mother's Name / মাতার নাম" en={student.mother_name_en} bn={student.mother_name_bn} />
            <Info label="Guardian Mobile / অভিভাবক মোবাইল" en={student.guardian_mobile} />
            <Info label="Father's Mobile / পিতার মোবাইল" en={student.father_mobile} />
            <Info label="Mother's Mobile / মাতার মোবাইল" en={student.mother_mobile} />
            <Info label="Admission Date / ভর্তির তারিখ" en={format(new Date(student.created_at), "PPP")} />
          </Card>

          {/* Fee history */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-base">Fee Payment History</div>
                <div className="font-bn text-xs text-muted-foreground">ফি পরিশোধের ইতিহাস</div>
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

function Info({ label, en, bn }: { label: string; en?: string | null; bn?: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{en || <span className="text-muted-foreground">—</span>}</div>
      {bn && <div className="font-bn text-muted-foreground text-sm">{bn}</div>}
    </div>
  );
}
