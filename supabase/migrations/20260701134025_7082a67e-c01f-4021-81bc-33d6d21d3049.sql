
CREATE POLICY "Admins read teacher photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'teacher-photos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins upload teacher photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'teacher-photos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update teacher photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'teacher-photos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete teacher photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'teacher-photos' AND has_role(auth.uid(), 'admin'::app_role));
