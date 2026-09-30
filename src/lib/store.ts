// Frontend-only data layer backed by localStorage.
// All students, teachers, and payments live in the browser — no backend.

export interface Student {
  id: string;
  name_en: string;
  name_bn: string;
  mother_name_bn: string | null;
  mother_name_en: string | null;
  father_name_bn: string | null;
  father_name_en: string | null;
  father_mobile: string | null;
  mother_mobile: string | null;
  guardian_mobile: string | null;
  date_of_birth: string | null;
  birth_certificate_no: string | null;
  gender: string | null;
  religion: string | null;
  blood_group: string | null;
  nationality: string | null;
  present_address: string | null;
  permanent_address: string | null;
  photo_url: string | null; // data URL
  class: string;
  monthly_fee: number;
  created_at: string;
}

export interface Teacher {
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
  photo_url: string | null; // data URL
  created_at: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  period_year: number;
  period_month: number;
  amount: number;
  paid_at: string;
  note: string | null;
}

export interface SalaryPayment {
  id: string;
  teacher_id: string;
  period_year: number;
  period_month: number;
  amount: number;
  paid_at: string;
  note: string | null;
}

interface DB {
  students: Student[];
  teachers: Teacher[];
  feePayments: FeePayment[];
  salaryPayments: SalaryPayment[];
}

const KEY = "madrasah-data-v1";

const empty: DB = { students: [], teachers: [], feePayments: [], salaryPayments: [] };

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      students: parsed.students ?? [],
      teachers: parsed.teachers ?? [],
      feePayments: parsed.feePayments ?? [],
      salaryPayments: parsed.salaryPayments ?? [],
    };
  } catch {
    return { ...empty };
  }
}

function write(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- Students ----------

export function listStudents(): Student[] {
  return read().students;
}

export function addStudent(data: Omit<Student, "id" | "created_at">): Student {
  const db = read();
  const student: Student = { ...data, id: uid(), created_at: new Date().toISOString() };
  db.students.unshift(student);
  write(db);
  return student;
}

export function updateStudent(id: string, data: Partial<Omit<Student, "id" | "created_at">>): void {
  const db = read();
  db.students = db.students.map((s) => (s.id === id ? { ...s, ...data } : s));
  write(db);
}

export function deleteStudent(id: string): void {
  const db = read();
  db.students = db.students.filter((s) => s.id !== id);
  db.feePayments = db.feePayments.filter((p) => p.student_id !== id);
  write(db);
}

// ---------- Teachers ----------

export function listTeachers(): Teacher[] {
  return read().teachers;
}

export function addTeacher(data: Omit<Teacher, "id" | "created_at">): Teacher {
  const db = read();
  const teacher: Teacher = { ...data, id: uid(), created_at: new Date().toISOString() };
  db.teachers.unshift(teacher);
  write(db);
  return teacher;
}

export function updateTeacher(id: string, data: Partial<Omit<Teacher, "id" | "created_at">>): void {
  const db = read();
  db.teachers = db.teachers.map((t) => (t.id === id ? { ...t, ...data } : t));
  write(db);
}

export function deleteTeacher(id: string): void {
  const db = read();
  db.teachers = db.teachers.filter((t) => t.id !== id);
  db.salaryPayments = db.salaryPayments.filter((p) => p.teacher_id !== id);
  write(db);
}

// ---------- Fee payments ----------

export function listFeePayments(studentId?: string): FeePayment[] {
  const all = read().feePayments;
  const filtered = studentId ? all.filter((p) => p.student_id === studentId) : all;
  return [...filtered].sort(
    (a, b) => b.period_year - a.period_year || b.period_month - a.period_month,
  );
}

export function addFeePayment(data: Omit<FeePayment, "id" | "paid_at">): FeePayment {
  const db = read();
  const dup = db.feePayments.some(
    (p) =>
      p.student_id === data.student_id &&
      p.period_year === data.period_year &&
      p.period_month === data.period_month,
  );
  if (dup) throw new Error("Payment for this month already exists");
  const payment: FeePayment = { ...data, id: uid(), paid_at: new Date().toISOString() };
  db.feePayments.push(payment);
  write(db);
  return payment;
}

// ---------- Salary payments ----------

export function listSalaryPayments(teacherId?: string): SalaryPayment[] {
  const all = read().salaryPayments;
  const filtered = teacherId ? all.filter((p) => p.teacher_id === teacherId) : all;
  return [...filtered].sort(
    (a, b) => b.period_year - a.period_year || b.period_month - a.period_month,
  );
}

export function addSalaryPayment(data: Omit<SalaryPayment, "id" | "paid_at">): SalaryPayment {
  const db = read();
  const dup = db.salaryPayments.some(
    (p) =>
      p.teacher_id === data.teacher_id &&
      p.period_year === data.period_year &&
      p.period_month === data.period_month,
  );
  if (dup) throw new Error("Salary for this month already exists");
  const payment: SalaryPayment = { ...data, id: uid(), paid_at: new Date().toISOString() };
  db.salaryPayments.push(payment);
  write(db);
  return payment;
}

// ---------- Photos ----------
// Convert an image file to a small data URL so it fits in localStorage.

export function fileToDataUrl(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Could not process image"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
