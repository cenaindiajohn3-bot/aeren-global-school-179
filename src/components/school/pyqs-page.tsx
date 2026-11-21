import { useState } from 'react';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { canUploadPyqs, validatePyqFile } from '@/lib/pyqs';
import { SchoolShell } from './shell';
import { portalQuery } from './portal-page';

export const pyqsQuery = queryOptions({queryKey:['pyqs'], queryFn:async()=>{
  const {data,error}=await supabase.from('pyqs').select('*').order('year',{ascending:false});
  if(error) throw new Error(error.message);
  return data;
}});
export function PyqsPage(){
  const {data:school}=useSuspenseQuery(portalQuery);
  const {data:papers}=useSuspenseQuery(pyqsQuery);
  const query=useQueryClient();
  const [open,setOpen]=useState(false), [busy,setBusy]=useState(false);
  const [classId,setClassId]=useState(''), [subjectId,setSubjectId]=useState(''), [year,setYear]=useState('');
  const [uploadClass,setUploadClass]=useState('');
  const admin=school.role==='super_admin', upload=canUploadPyqs(school.role);
  const allowedClasses=school.classes.filter(c=>admin||school.assignments.some(a=>school.sections.find(s=>s.id===a.section_id)?.class_id===c.id));
  const effectiveClass=uploadClass||allowedClasses[0]?.id||'';
  const allowedSubjects=school.subjects.filter(s=>admin||school.assignments.some(a=>a.subject_id===s.id&&school.sections.find(section=>section.id===a.section_id)?.class_id===effectiveClass));
  async function save(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();const form=new FormData(event.currentTarget);const file=form.get('file');
    if(!(file instanceof File)) return;
    setBusy(true);let path='';let saved=false;
    try{
      validatePyqFile(file);path=`${school.profile.id}/${crypto.randomUUID()}.pdf`;
      const {error:uploadError}=await supabase.storage.from('school-pyqs').upload(path,file,{contentType:'application/pdf'});
      if(uploadError)throw new Error(uploadError.message);
      const {error}=await supabase.from('pyqs').insert({title:String(form.get('title')).trim(),class_id:String(form.get('class_id')),subject_id:String(form.get('subject_id')),year:Number(form.get('year')),file_path:path,uploaded_by:school.profile.id});
      if(error)throw new Error(error.message);saved=true;
      await query.invalidateQueries({queryKey:['pyqs']});setOpen(false);toast.success('Question paper added');
    }catch(error){if(path&&!saved)await supabase.storage.from('school-pyqs').remove([path]);toast.error(error instanceof Error?error.message:'Unable to add paper.');}
    finally{setBusy(false);}
  }
  async function download(path:string,title:string){
    try{const {data,error}=await supabase.storage.from('school-pyqs').download(path);if(error)throw error;
      const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`${title}.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch{toast.error('Unable to download question paper.');}
  }
  async function remove(id:string,path:string){
    if(!window.confirm('Delete this question paper?'))return;
    setBusy(true);try{
      const {error}=await supabase.from('pyqs').delete().eq('id',id);if(error)throw error;
      const {error:fileError}=await supabase.storage.from('school-pyqs').remove([path]);
      await query.invalidateQueries({queryKey:['pyqs']});
      if(fileError)toast.error('Paper removed from the list; file cleanup could not finish.');else toast.success('Question paper deleted');
    }catch{toast.error('Unable to delete question paper.');}finally{setBusy(false);}
  }
  const visible=papers.filter(p=>(!classId||p.class_id===classId)&&(!subjectId||p.subject_id===subjectId)&&(!year||String(p.year)===year));
  return <SchoolShell data={school}><div className="page-heading"><div><div className="eyebrow">QUESTION PAPER LIBRARY</div><h1>PYQs</h1><p>Previous-year question papers</p></div>{upload&&<Button onClick={()=>setOpen(true)}><Plus/>Add question paper</Button>}</div>
    <div className="toolbar"><select aria-label="Filter class" value={classId} onChange={e=>setClassId(e.target.value)}><option value="">All classes</option>{school.classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Filter subject" value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">All subjects</option>{school.subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select aria-label="Filter year" value={year} onChange={e=>setYear(e.target.value)}><option value="">All years</option>{[...new Set(papers.map(p=>p.year))].map(y=><option key={y}>{y}</option>)}</select></div>
    {visible.length?<div className="record-grid">{visible.map(p=><article className="record-card" key={p.id}><FileText className="record-icon"/><h3 className="break-words">{p.title}</h3><p>{school.classes.find(c=>c.id===p.class_id)?.name} · {school.subjects.find(s=>s.id===p.subject_id)?.name} · {p.year}</p><div className="action-row"><Button variant="outline" onClick={()=>download(p.file_path,p.title)}><Download/>Download PDF</Button>{(admin||p.uploaded_by===school.profile.id)&&<Button disabled={busy} variant="ghost" size="icon" aria-label={`Delete ${p.title}`} onClick={()=>remove(p.id,p.file_path)}><Trash2/></Button>}</div></article>)}</div>:<div className="empty-state"><FileText size={36}/><h3>No question papers available</h3></div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="school-dialog"><DialogHeader><DialogTitle>Add question paper</DialogTitle></DialogHeader><form className="form-grid" onSubmit={save}><label>Paper title<input name="title" required minLength={2} maxLength={150}/></label><label>Class<select name="class_id" required value={effectiveClass} onChange={e=>setUploadClass(e.target.value)}>{allowedClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Subject<select key={effectiveClass} name="subject_id" required>{allowedSubjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Year<input name="year" type="number" min={1900} max={2100} defaultValue={new Date().getFullYear()-1} required/></label><label>Question paper (PDF, up to 10 MB)<input name="file" type="file" accept="application/pdf,.pdf" required/></label>{!allowedClasses.length&&<p>No teaching assignments available for uploads.</p>}<Button type="submit" disabled={busy||!allowedClasses.length||!allowedSubjects.length}>{busy?'Uploading…':'Upload paper'}</Button></form></DialogContent></Dialog>
  </SchoolShell>;
}