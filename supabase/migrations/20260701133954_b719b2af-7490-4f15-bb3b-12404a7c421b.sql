
-- Add monthly_fee to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS monthly_fee numeric(10,2) NOT NULL DEFAULT 0;

-- Teachers table
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  father_name text,
  mother_name text,
  mobile text,
  email text,
  address text,
  designation text,
  joining_date date,
  monthly_salary numeric(10,2) NOT NULL DEFAULT 0,
  photo_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view teachers" ON public.teachers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert teachers" ON public.teachers FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update teachers" ON public.teachers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete teachers" ON public.teachers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Student fee payments (per month)
CREATE TABLE public.student_fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  period_year int NOT NULL,
  period_month int NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  amount numeric(10,2) NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, period_year, period_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_fee_payments TO authenticated;
GRANT ALL ON public.student_fee_payments TO service_role;
ALTER TABLE public.student_fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view fee payments" ON public.student_fee_payments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert fee payments" ON public.student_fee_payments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update fee payments" ON public.student_fee_payments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete fee payments" ON public.student_fee_payments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Teacher salary payments (per month)
CREATE TABLE public.teacher_salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  period_year int NOT NULL,
  period_month int NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  amount numeric(10,2) NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, period_year, period_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_salary_payments TO authenticated;
GRANT ALL ON public.teacher_salary_payments TO service_role;
ALTER TABLE public.teacher_salary_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view salary payments" ON public.teacher_salary_payments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert salary payments" ON public.teacher_salary_payments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update salary payments" ON public.teacher_salary_payments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete salary payments" ON public.teacher_salary_payments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
