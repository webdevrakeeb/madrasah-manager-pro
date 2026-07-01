import { useEffect, useState } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  CLASS_OPTIONS, GENDER_OPTIONS, RELIGION_OPTIONS, BLOOD_GROUPS, NATIONALITY_OPTIONS,
  type ClassValue,
} from "@/lib/i18n";

const schema = z.object({
  name_bn: z.string().trim().min(1, "Required").max(120),
  name_en: z.string().trim().min(1, "Required").max(120),
  mother_name_bn: z.string().trim().max(120).optional().or(z.literal("")),
  mother_name_en: z.string().trim().max(120).optional().or(z.literal("")),
  father_name_bn: z.string().trim().max(120).optional().or(z.literal("")),
  father_name_en: z.string().trim().max(120).optional().or(z.literal("")),
  date_of_birth: z.date().optional(),
  birth_certificate_no: z.string().trim().max(40).optional().or(z.literal("")),
  father_mobile: z.string().trim().max(20).optional().or(z.literal("")),
  mother_mobile: z.string().trim().max(20).optional().or(z.literal("")),
  guardian_mobile: z.string().trim().max(20).optional().or(z.literal("")),
  class: z.enum(["play","nursery","one","two","three","four","hifz"]),
  gender: z.string().optional(),
  religion: z.string().optional(),
  blood_group: z.string().optional(),
  nationality: z.string().optional(),
  present_address: z.string().trim().max(500).optional().or(z.literal("")),
  permanent_address: z.string().trim().max(500).optional().or(z.literal("")),
  monthly_fee: z.coerce.number().min(0, "Must be 0 or more").max(1000000),
  confirm: z.literal(true, { errorMap: () => ({ message: "Please confirm" }) }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultClass?: ClassValue;
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export function StudentRegistrationDialog({ defaultClass, trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_bn: "", name_en: "",
      mother_name_bn: "", mother_name_en: "",
      father_name_bn: "", father_name_en: "",
      birth_certificate_no: "",
      father_mobile: "", mother_mobile: "", guardian_mobile: "",
      present_address: "", permanent_address: "",
      class: defaultClass ?? "play",
      monthly_fee: 0,
      confirm: false as unknown as true,
    },
  });

  useEffect(() => {
    if (defaultClass) form.setValue("class", defaultClass);
  }, [defaultClass, form]);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB"); return; }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const up = await supabase.storage.from("student-photos").upload(path, photoFile, {
          contentType: photoFile.type, upsert: false,
        });
        if (up.error) throw up.error;
        photo_url = up.data.path;
      }

      const { error } = await supabase.from("students").insert({
        name_bn: values.name_bn,
        name_en: values.name_en,
        mother_name_bn: values.mother_name_bn || null,
        mother_name_en: values.mother_name_en || null,
        father_name_bn: values.father_name_bn || null,
        father_name_en: values.father_name_en || null,
        date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
        birth_certificate_no: values.birth_certificate_no || null,
        father_mobile: values.father_mobile || null,
        mother_mobile: values.mother_mobile || null,
        guardian_mobile: values.guardian_mobile || null,
        class: values.class,
        gender: values.gender || null,
        religion: values.religion || null,
        blood_group: values.blood_group || null,
        nationality: values.nationality || null,
        present_address: values.present_address || null,
        permanent_address: values.permanent_address || null,
        monthly_fee: values.monthly_fee,
        photo_url,
      });
      if (error) throw error;
      toast.success("Student registered successfully");
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

  const dob = form.watch("date_of_birth");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Register Student</Button>}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Register Student <span className="font-bn text-base text-muted-foreground">/ শিক্ষার্থী নিবন্ধন</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">

          {/* Student name */}
          <Section title="Student" subtitle="শিক্ষার্থী">
            <Field label="Name (English) / নাম (ইংরেজি)" error={form.formState.errors.name_en?.message}>
              <Input {...form.register("name_en")} />
            </Field>
            <Field label="Name (Bangla) / নাম (বাংলা)" error={form.formState.errors.name_bn?.message}>
              <Input className="font-bn" {...form.register("name_bn")} />
            </Field>

            <Field label="Date of Birth / জন্ম তারিখ">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button"
                    className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 size-4" />
                    {dob ? format(dob, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dob} onSelect={(d) => form.setValue("date_of_birth", d!)}
                    initialFocus captionLayout="dropdown" fromYear={2005} toYear={new Date().getFullYear()}
                    className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="Birth Certificate No. / জন্ম নিবন্ধন নম্বর">
              <Input {...form.register("birth_certificate_no")} />
            </Field>

            <Field label="Gender / লিঙ্গ">
              <SelectField
                value={form.watch("gender") ?? ""}
                onChange={(v) => form.setValue("gender", v)}
                placeholder="Select"
                options={GENDER_OPTIONS}
              />
            </Field>

            <Field label="Religion / ধর্ম">
              <SelectField
                value={form.watch("religion") ?? ""}
                onChange={(v) => form.setValue("religion", v)}
                placeholder="Select"
                options={RELIGION_OPTIONS}
              />
            </Field>

            <Field label="Blood Group / রক্তের গ্রুপ">
              <SelectField
                value={form.watch("blood_group") ?? ""}
                onChange={(v) => form.setValue("blood_group", v)}
                placeholder="Select"
                options={BLOOD_GROUPS.map((b) => ({ value: b, en: b }))}
              />
            </Field>

            <Field label="Nationality / জাতীয়তা">
              <SelectField
                value={form.watch("nationality") ?? ""}
                onChange={(v) => form.setValue("nationality", v)}
                placeholder="Select"
                options={NATIONALITY_OPTIONS}
              />
            </Field>

            <Field label="Class / শ্রেণি" error={form.formState.errors.class?.message}>
              <SelectField
                value={form.watch("class")}
                onChange={(v) => form.setValue("class", v as ClassValue)}
                placeholder="Select"
                options={CLASS_OPTIONS.map((c) => ({ value: c.value, en: c.en, bn: c.bn }))}
              />
            </Field>
          </Section>

          {/* Parents */}
          <Section title="Parents" subtitle="পিতামাতা">
            <Field label="Father's Name (English) / পিতার নাম (ইংরেজি)">
              <Input {...form.register("father_name_en")} />
            </Field>
            <Field label="Father's Name (Bangla) / পিতার নাম (বাংলা)">
              <Input className="font-bn" {...form.register("father_name_bn")} />
            </Field>
            <Field label="Mother's Name (English) / মাতার নাম (ইংরেজি)">
              <Input {...form.register("mother_name_en")} />
            </Field>
            <Field label="Mother's Name (Bangla) / মাতার নাম (বাংলা)">
              <Input className="font-bn" {...form.register("mother_name_bn")} />
            </Field>
          </Section>

          {/* Contact */}
          <Section title="Contact" subtitle="যোগাযোগ">
            <Field label="Father's Mobile / পিতার মোবাইল">
              <Input type="tel" {...form.register("father_mobile")} />
            </Field>
            <Field label="Mother's Mobile / মাতার মোবাইল">
              <Input type="tel" {...form.register("mother_mobile")} />
            </Field>
            <Field label="Guardian's Mobile / অভিভাবকের মোবাইল" hint="Person who brings the student to and from the madrasah">
              <Input type="tel" {...form.register("guardian_mobile")} />
            </Field>
          </Section>

          {/* Address */}
          <Section title="Address" subtitle="ঠিকানা">
            <Field label="Present Address / বর্তমান ঠিকানা" full>
              <Textarea rows={2} {...form.register("present_address")} />
            </Field>
            <Field label="Permanent Address / স্থায়ী ঠিকানা" full>
              <Textarea rows={2} {...form.register("permanent_address")} />
            </Field>
          </Section>

          {/* Photo */}
          <Section title="Photo" subtitle="ছবি">
            <div className="md:col-span-2 flex items-center gap-4">
              <div className="size-24 rounded-lg border bg-muted overflow-hidden grid place-items-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="size-full object-cover" />
                ) : (
                  <Upload className="size-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="photo" className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
                  <Upload className="size-4" /> Upload photo / ছবি আপলোড
                </Label>
                <Input id="photo" type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
                <p className="text-xs text-muted-foreground mt-2">JPG/PNG, up to 5MB</p>
              </div>
            </div>
          </Section>

          {/* Confirm */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <Checkbox
              id="confirm"
              checked={form.watch("confirm") as unknown as boolean}
              onCheckedChange={(c) => form.setValue("confirm", (c === true) as unknown as true, { shouldValidate: true })}
            />
            <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
              I confirm that all the information provided above is accurate and complete.
              <span className="block font-bn text-muted-foreground mt-1">আমি নিশ্চিত করছি যে উপরে দেওয়া সমস্ত তথ্য সঠিক ও সম্পূর্ণ।</span>
              {form.formState.errors.confirm && (
                <span className="block text-destructive text-xs mt-1">{form.formState.errors.confirm.message}</span>
              )}
            </Label>
          </div>

          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Register Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-baseline gap-2 mb-4">
        <h3 className="font-display text-base">{title}</h3>
        <span className="font-bn text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </Card>
  );
}

function Field({ label, hint, error, full, children }: { label: string; hint?: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SelectField({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; en: string; bn?: string }[];
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.en}{o.bn ? <span className="font-bn text-muted-foreground ml-2 text-xs">{o.bn}</span> : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
