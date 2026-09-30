import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TeacherRegistrationDialog } from "./teacher-registration-dialog";
import { TeacherViewDialog } from "./teacher-view-dialog";
import { listTeachers, deleteTeacher, type Teacher } from "@/lib/store";
import { Trash2, UserPlus, Users, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { confirmDelete } from "@/lib/swal";

export function TeachersPage() {
  const [rows, setRows] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);

  function load() {
    setLoading(true);
    setRows(listTeachers());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    const result = await confirmDelete(
      "Delete this teacher?",
      "This will permanently remove the teacher and their salary payment history."
    );
    if (!result.isConfirmed) return;
    deleteTeacher(id);
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
                      {t.photo_url ? (
                        <img src={t.photo_url} alt="" className="size-full object-cover" />
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
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => remove(t.id)}>
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
