import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentRegistrationDialog } from "./student-registration-dialog";
import { StudentViewDialog } from "./student-view-dialog";
import { CLASS_OPTIONS, type ClassValue } from "@/lib/i18n";
import { listStudents, deleteStudent, type Student } from "@/lib/store";
import { Trash2, UserPlus, BookOpenText, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { confirmDelete } from "@/lib/swal";

export function ClassPage({ classValue }: { classValue: ClassValue }) {
  const meta = CLASS_OPTIONS.find((c) => c.value === classValue)!;
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  function load() {
    setLoading(true);
    const list = listStudents().filter((s) => s.class === classValue);
    setRows(list);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [classValue]);

  async function remove(id: string) {
    const result = await confirmDelete(
      "Delete this student?",
      "The student's record and fee history will be permanently removed."
    );
    if (!result.isConfirmed) return;
    deleteStudent(id);
    toast.success("Student deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-3xl">{meta.en}</h2>
            <span className="font-bn text-xl text-muted-foreground">{meta.bn}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} student{rows.length === 1 ? "" : "s"} enrolled
            <span className="font-bn ml-1">· {rows.length} জন শিক্ষার্থী</span>
          </p>
        </div>
        <StudentRegistrationDialog
          defaultClass={classValue}
          onCreated={load}
          trigger={
            <Button>
              <UserPlus className="size-4 mr-2" />
              Register Student
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
              <BookOpenText className="size-5 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg">No students in {meta.en} yet</h3>
            <p className="font-bn text-sm text-muted-foreground mt-1">এই শ্রেণিতে এখনও কোনো শিক্ষার্থী নেই</p>
            <div className="mt-4">
              <StudentRegistrationDialog defaultClass={classValue} onCreated={load} />
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Student / শিক্ষার্থী</TableHead>
                <TableHead>Father / পিতা</TableHead>
                <TableHead>Guardian Mobile / অভিভাবক</TableHead>
                <TableHead>DOB / জন্ম</TableHead>
                <TableHead>Fee (৳) / ফি</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="size-10 rounded-full bg-muted overflow-hidden grid place-items-center">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="text-xs font-display text-muted-foreground">{s.name_en[0]?.toUpperCase()}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{s.name_en}</div>
                    <div className="font-bn text-sm text-muted-foreground">{s.name_bn}</div>
                  </TableCell>
                  <TableCell className="text-sm">{s.father_name_en ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.guardian_mobile ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {s.date_of_birth ? format(new Date(s.date_of_birth), "PP") : "—"}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{Number(s.monthly_fee ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="View" onClick={() => setViewStudent(s)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => setEditStudent(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => remove(s.id)}>
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

      <StudentViewDialog
        student={viewStudent}
        open={!!viewStudent}
        onOpenChange={(o) => { if (!o) setViewStudent(null); }}
      />

      <StudentRegistrationDialog
        student={editStudent}
        open={!!editStudent}
        onOpenChange={(o) => { if (!o) setEditStudent(null); }}
        onCreated={() => { setEditStudent(null); load(); }}
      />
    </div>
  );
}

// silence
void Badge;
