import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  father_name: z.string().trim().max(120).optional().or(z.literal("")),
  mother_name: z.string().trim().max(120).optional().or(z.literal("")),
  mobile: z.string().trim().min(1, "Required").max(20),
  email: z.string().trim().email("Invalid email").max(200).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  designation: z.string().trim().max(120).optional().or(z.literal("")),
  joining_date: z.date().optional(),
  monthly_salary: z.coerce.number().min(0).max(10000000),
});
type FormValues = z.infer<typeof schema>;

export function TeacherRegistrationDialog({ trigger, onCreated }: { trigger?: React.ReactNode; onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", father_name: "", mother_name: "", mobile: "", email: "", address: "", designation: "", monthly_salary: 0 },
  });

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB"); return; }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function onSubmit(v: FormValues) {
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const up = await supabase.storage.from("teacher-photos").upload(path, photoFile, {
          contentType: photoFile.type, upsert: false,
        });
        if (up.error) throw up.error;
        photo_url = up.data.path;
      }
      const { error } = await supabase.from("teachers").insert({
        name: v.name,
        father_name: v.father_name || null,
        mother_name: v.mother_name || null,
        mobile: v.mobile,
        email: v.email || null,
        address: v.address || null,
        designation: v.designation || null,
        joining_date: v.joining_date ? format(v.joining_date, "yyyy-MM-dd") : null,
        monthly_salary: v.monthly_salary,
        photo_url,
      });
      if (error) throw error;
      toast.success("Teacher registered successfully");
      form.reset();
      setPhotoFile(null); setPhotoPreview(null);
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setSubmitting(false);
    }
  }

  const jd = form.watch("joining_date");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Register Teacher</Button>}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Register Teacher <span className="font-bn text-base text-muted-foreground">/ শিক্ষক নিবন্ধন</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <Card className="p-5 grid md:grid-cols-2 gap-4">
            <Field label="Full Name / নাম" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>
            <Field label="Designation / পদবি">
              <Input {...form.register("designation")} placeholder="e.g. Senior Teacher" />
            </Field>
            <Field label="Father's Name / পিতার নাম">
              <Input {...form.register("father_name")} />
            </Field>
            <Field label="Mother's Name / মাতার নাম">
              <Input {...form.register("mother_name")} />
            </Field>
            <Field label="Mobile / মোবাইল" error={form.formState.errors.mobile?.message}>
              <Input type="tel" {...form.register("mobile")} />
            </Field>
            <Field label="Email / ইমেইল (optional)" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Joining Date / যোগদানের তারিখ">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button"
                    className={cn("w-full justify-start text-left font-normal", !jd && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 size-4" />
                    {jd ? format(jd, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={jd} onSelect={(d) => form.setValue("joining_date", d!)}
                    initialFocus captionLayout="dropdown" fromYear={1990} toYear={new Date().getFullYear() + 1}
                    className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </Field>
            <Field label="Monthly Salary (৳) / মাসিক বেতন" error={form.formState.errors.monthly_salary?.message}>
              <Input type="number" min={0} step="1" {...form.register("monthly_salary")} />
            </Field>
            <Field label="Address / ঠিকানা" full>
              <Textarea rows={2} {...form.register("address")} />
            </Field>

            <div className="md:col-span-2 flex items-center gap-4">
              <div className="size-20 rounded-lg border bg-muted overflow-hidden grid place-items-center">
                {photoPreview ? <img src={photoPreview} alt="" className="size-full object-cover" /> : <Upload className="size-5 text-muted-foreground" />}
              </div>
              <div>
                <Label htmlFor="tphoto" className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
                  <Upload className="size-4" /> Upload photo / ছবি
                </Label>
                <Input id="tphoto" type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
                <p className="text-xs text-muted-foreground mt-2">JPG/PNG, up to 5MB</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Register Teacher"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
