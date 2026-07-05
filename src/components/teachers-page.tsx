import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TeacherRegistrationDialog } from "./teacher-registration-dialog";
import { TeacherViewDialog } from "./teacher-view-dialog";
import { Trash2, UserPlus, Users, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { confirmDelete } from "@/lib/swal";

interface Teacher {
  id: string;
  name: string;
  father_name: string | null;
  mother_name: string | null;
  designation: string | null;
  mobile: string;
  email: string | null;
  address: string | null;
  joining_date: string | null;
  monthly_salary: number;
  photo_url: string | null;
}

export function TeachersPage() {
  const [rows, setRows] = useState<Teacher[]>([]);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const list = (data ?? []) as Teacher[];
    setRows(list);
    const paths = list.map((t) => t.photo_url).filter(Boolean) as string[];
    if (paths.length) {
      const { data: sd } = await supabase.storage.from("teacher-photos").createSignedUrls(paths, 3600);
      const map: Record<string, string> = {};
      sd?.forEach((s) => { if (s.path && s.signedUrl) map[s.path] = s.signedUrl; });
      setSigned(map);
    } else setSigned({});
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string, photo?: string | null) {
    const result = await confirmDelete(
      "Delete this teacher?",
      "This will permanently remove the teacher and their salary payment history."
    );
    if (!result.isConfirmed) return;
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (photo) await supabase.storage.from("teacher-photos").remove([photo]);
    toast.success("Teacher deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Teachers <span className="font-bn text-xl text-muted-foreground ml-2">শিক্ষক</span></h2>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} teacher{rows.length === 1 ? "" : "s"}
            <span className="font-bn ml-1">· {rows.length} জন শিক্ষক</span>
          </p>
        </div>
        <TeacherRegistrationDialog
          onCreated={load}
          trigger={
            <Button>
              <UserPlus className="size-4 mr-2" />
              Register Teacher
              <span className="font-bn ml-2 opacity-80 text-xs">নিবন্ধন</span>
            </Button>
          }
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-16 text-center">
            <div className="size-12 mx-auto rounded-full bg-muted grid place-items-center mb-3">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg">No teachers yet</h3>
            <p className="font-bn text-sm text-muted-foreground mt-1">এখনও কোনো শিক্ষক নেই</p>
            <div className="mt-4"><TeacherRegistrationDialog onCreated={load} /></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Name / নাম</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Joining</TableHead>
                <TableHead>Salary (৳)</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="size-10 rounded-full bg-muted overflow-hidden grid place-items-center">
                      {t.photo_url && signed[t.photo_url] ? (
                        <img src={signed[t.photo_url]} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="text-xs font-display text-muted-foreground">{t.name[0]?.toUpperCase()}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.email ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm">{t.designation ?? "—"}</TableCell>
                  <TableCell className="text-sm">{t.mobile ?? "—"}</TableCell>
                  <TableCell className="text-sm">{t.joining_date ? format(new Date(t.joining_date), "PP") : "—"}</TableCell>
                  <TableCell className="text-sm">{Number(t.monthly_salary).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="View" onClick={() => setViewTeacher(t)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => setEditTeacher(t)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => remove(t.id, t.photo_url)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <TeacherViewDialog
        teacher={viewTeacher}
        open={!!viewTeacher}
        onOpenChange={(o) => { if (!o) setViewTeacher(null); }}
        signedPhoto={viewTeacher?.photo_url ? signed[viewTeacher.photo_url] : undefined}
      />

      <TeacherRegistrationDialog
        teacher={editTeacher}
        open={!!editTeacher}
        onOpenChange={(o) => { if (!o) setEditTeacher(null); }}
        onCreated={() => { setEditTeacher(null); load(); }}
      />
    </div>
  );
}
