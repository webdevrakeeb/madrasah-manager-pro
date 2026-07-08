
-- Create a private schema not exposed via the Data API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Recreate has_role in the private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate policies on public tables to use private.has_role
DROP POLICY IF EXISTS "Admins can view students" ON public.students;
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can view students" ON public.students FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert students" ON public.students FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update students" ON public.students FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete students" ON public.students FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admins can insert teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admins can update teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admins can delete teachers" ON public.teachers;
CREATE POLICY "Admins can view teachers" ON public.teachers FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert teachers" ON public.teachers FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update teachers" ON public.teachers FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete teachers" ON public.teachers FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view fee payments" ON public.student_fee_payments;
DROP POLICY IF EXISTS "Admins can insert fee payments" ON public.student_fee_payments;
DROP POLICY IF EXISTS "Admins can update fee payments" ON public.student_fee_payments;
DROP POLICY IF EXISTS "Admins can delete fee payments" ON public.student_fee_payments;
CREATE POLICY "Admins can view fee payments" ON public.student_fee_payments FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert fee payments" ON public.student_fee_payments FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update fee payments" ON public.student_fee_payments FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete fee payments" ON public.student_fee_payments FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view salary payments" ON public.teacher_salary_payments;
DROP POLICY IF EXISTS "Admins can insert salary payments" ON public.teacher_salary_payments;
DROP POLICY IF EXISTS "Admins can update salary payments" ON public.teacher_salary_payments;
DROP POLICY IF EXISTS "Admins can delete salary payments" ON public.teacher_salary_payments;
CREATE POLICY "Admins can view salary payments" ON public.teacher_salary_payments FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert salary payments" ON public.teacher_salary_payments FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update salary payments" ON public.teacher_salary_payments FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete salary payments" ON public.teacher_salary_payments FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Storage policies
DROP POLICY IF EXISTS "Admins can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete student photos" ON storage.objects;
CREATE POLICY "Admins can view student photos" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can upload student photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update student photos" ON storage.objects FOR UPDATE USING (bucket_id = 'student-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete student photos" ON storage.objects FOR DELETE USING (bucket_id = 'student-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins read teacher photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload teacher photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins update teacher photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete teacher photos" ON storage.objects;
CREATE POLICY "Admins read teacher photos" ON storage.objects FOR SELECT USING (bucket_id = 'teacher-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins upload teacher photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teacher-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update teacher photos" ON storage.objects FOR UPDATE USING (bucket_id = 'teacher-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete teacher photos" ON storage.objects FOR DELETE USING (bucket_id = 'teacher-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the public version so it is no longer callable via the API
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
