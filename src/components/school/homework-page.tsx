import { useState } from 'react';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { CalendarDays, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { canPostHomework, homeworkError } from '@/lib/homework';
import { formatDate } from '@/lib/school';
import { SchoolShell } from './shell';
import { portalQuery } from './portal-page';

export const homeworkQuery = queryOptions({ queryKey: ['homework'], queryFn: async () => {
  const { data, error } = await supabase.from('homework').select('*').order('due_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}});

export function HomeworkPage() {
  const { data: school } = useSuspenseQuery(portalQuery);
  const { data: items } = useSuspenseQuery(homeworkQuery);
  const query = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const admin = school.role === 'super_admin';
  const post = canPostHomework(school.role);
  const sectionName = (id: string) => { const s = school.sections.find(x => x.id === id); return `${school.classes.find(c => c.id === s?.class_id)?.name ?? ''} – ${s?.name ?? ''}`; };
  const subjectName = (id: string) => school.subjects.find(s => s.id === id)?.name ?? 'Subject';
  // Teachers may only post for class subjects they teach; Admin may post for any.
  const options = admin
    ? school.sections.flatMap(s => school.subjects.map(sub => ({ key: `${s.id}|${sub.id}`, label: `${sectionName(s.id)} · ${sub.name}` })))
    : school.assignments.map(a => ({ key: `${a.section_id}|${a.subject_id}`, label: `${sectionName(a.section_id)} · ${subjectName(a.subject_id)}` }));
  const today = new Date().toLocaleDateString('en-CA');

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const title = String(f.get('title') ?? ''), due = String(f.get('due_date') ?? '');
    const problem = homeworkError(title, due, today);
    if (problem) { toast.error(problem); return; }
    const [section_id, subject_id] = String(f.get('target')).split('|');
    setBusy(true);
    const { error } = await supabase.from('homework').insert({ title: title.trim(), instructions: String(f.get('instructions') ?? '').trim(), section_id: section_id ?? '', subject_id: subject_id ?? '', due_date: due, created_by: school.profile.id });
    setBusy(false);
    if (error) { toast.error('Unable to post this assignment.'); return; }
    await query.invalidateQueries({ queryKey: ['homework'] });
    setOpen(false); toast.success('Assignment posted');
  }
  async function remove(id: string) {
    if (!window.confirm('Delete this assignment?')) return;
    setBusy(true);
    const { error } = await supabase.from('homework').delete().eq('id', id);
    setBusy(false);
    if (error) { toast.error('Unable to delete this assignment.'); return; }
    await query.invalidateQueries({ queryKey: ['homework'] });
    toast.success('Assignment deleted');
  }

  return <SchoolShell data={school}>
    <div className="page-heading"><div><div className="eyebrow">CLASS WORK</div><h1>Assignments</h1><p>{post ? 'Give work to the classes you teach.' : 'Work given by your teachers.'}</p></div>{post && <Button onClick={() => setOpen(true)}><Plus/>Give assignment</Button>}</div>
    {items.length ? <div className="record-grid">{items.map(h => <article className="record-card" key={h.id}>
      <ClipboardList className="record-icon"/><h3 className="break-words">{h.title}</h3>
      <p>{sectionName(h.section_id)} · {subjectName(h.subject_id)}</p>
      {h.instructions && <p className="whitespace-pre-line break-words">{h.instructions}</p>}
      <div className="action-row"><span className={`status ${h.due_date < today ? 'neutral' : 'warning'}`}><CalendarDays size={13}/> Due {formatDate(h.due_date)}</span><div className="toolbar-spacer"/>
        {(admin || h.created_by === school.profile.id) && <Button disabled={busy} variant="ghost" size="icon" aria-label={`Delete ${h.title}`} onClick={() => remove(h.id)}><Trash2/></Button>}</div>
    </article>)}</div> : <div className="empty-state"><ClipboardList size={36}/><h3>No assignments yet</h3><p>{post ? 'Assignments you give will appear here.' : 'When your teacher gives an assignment, it will appear here.'}</p></div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="school-dialog"><DialogHeader><DialogTitle>Give assignment</DialogTitle></DialogHeader>
      <form className="form-grid" onSubmit={save}>
        <label>Title<input name="title" required minLength={2} maxLength={150}/></label>
        <label>Class & subject<select name="target" required>{options.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}</select></label>
        <label>Instructions<textarea name="instructions" rows={5} maxLength={3000}/></label>
        <label>Due date<input name="due_date" type="date" min={today} required/></label>
        {!options.length && <p>No class subjects are assigned to you yet. Ask the Admin to add a teacher assignment.</p>}
        <Button type="submit" disabled={busy || !options.length}>{busy ? 'Posting…' : 'Post assignment'}</Button>
      </form></DialogContent></Dialog>
  </SchoolShell>;
}