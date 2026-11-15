export type Row = { id: string; action?: any; active?: any; allow_decimal?: any; allow_exempt?: any; archived?: any; assignment_id?: any; at?: any; class_id?: any; created_at?: any; end_date?: any; exam_subject_id?: any; examination_id?: any; full_name?: any; label?: any; max_marks?: any; name?: any; obtained?: any; passing_marks?: any; password?: any; profile_id?: any; rules?: any; section_id?: any; session_id?: any; start_date?: any; status?: any; student_id?: any; subject_id?: any; submitted?: any; submitted_at?: any; total?: any; uid?: any; [key: string]: any };
export type Snapshot = { role: string; profile: Row; sessions: Row[]; classes: Row[]; sections: Row[]; subjects: Row[]; students: Row[]; teachers: Row[]; assignments: Row[]; exams: Row[]; sheets: Row[]; marks: Row[]; audit: Row[]; validation?: Record<string, Validation> };
export type Validation = { total: number; submitted: number; missing: number; invalid: number; students: number; ready: boolean };
export function uidEmail(uid: string) {
  const normalized = uid.trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,50}$/.test(normalized)) throw new Error('Use a UID with 2–50 letters, digits, hyphens or underscores.');
  return `${normalized}@aeren.school.local`;
}
export function validateMark(value: string, max: number, decimal = false, exempt = false) {
  if (value === 'AB') return true;
  if (value === 'EXEMPT') return exempt;
  if (value.trim() === '') return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= max && (decimal || Number.isInteger(n));
}
export function summarize(marks: Row[], sheets: Row[], rules: { min: number; grade: string }[]) {
  let obtained = 0, maximum = 0, failed = false;
  for (const m of marks) {
    const sheet = sheets.find(s => s.id === m.exam_subject_id);
    if (!sheet || m.status === 'EXEMPT') continue;
    maximum += Number(sheet.max_marks);
    if (m.status === 'AB') { failed = true; continue; }
    obtained += Number(m.obtained);
    if (Number(m.obtained) < Number(sheet.passing_marks)) failed = true;
  }
  const percentage = maximum ? obtained / maximum * 100 : 0;
  const grade = [...rules].sort((a,b) => b.min-a.min).find(r => percentage >= r.min)?.grade ?? '—';
  return { obtained, maximum, percentage, grade, result: failed ? 'FAIL' : maximum ? 'PASS' : 'EXEMPT' };
}
export function formatDate(date: string | null | undefined) { return date ? new Date(date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'; }
export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0] ?? {});
  const escape = (v: unknown) => '"' + String(v ?? '').replace(/^[=+@-]/,'\t$&').replaceAll('"','""') + '"';
  const csv = [keys.map(escape).join(','), ...rows.map(r=>keys.map(k=>escape(r[k])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
}