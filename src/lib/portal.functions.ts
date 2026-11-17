import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { uidEmail } from './school';
import { canManageSchoolAccounts } from './account-permissions';

export const loadPortal = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data,error}=await context.supabase.rpc('portal_snapshot');
  if(error) throw new Error(error.message);
  const {data:names,error:nameError}=await context.supabase.rpc("student_subject_names");if(nameError)throw new Error(nameError.message);
  const snapshot=data as unknown as {sheets:{id:string;subject_name?:string}[]};const map=names as Record<string,string>;for(const sheet of snapshot.sheets)sheet.subject_name=map[sheet.id]??"Subject";
  return data;
});
const accountSchema=z.object({kind:z.enum(['student','teacher']),uid:z.string(),full_name:z.string().min(2),password:z.string().min(8),section_id:z.string().uuid().optional(),session_id:z.string().uuid().optional()});
export const createAccount=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(accountSchema).handler(async({data,context})=>{
   const {data:admin,error:roleError}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'super_admin'});
   if(roleError || !canManageSchoolAccounts(admin)) throw new Error('Only Super Admin can create school UIDs and passwords.');
  if(data.kind==='student' && (!data.section_id || !data.session_id)) throw new Error('Class and academic session are required.');
  const email=uidEmail(data.uid);
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:created,error}=await supabaseAdmin.auth.admin.createUser({email,password:data.password,email_confirm:true,user_metadata:{full_name:data.full_name}});
  if(error || !created.user) throw new Error(error?.message??'Account creation failed.');
  const id=created.user.id;
  try {
    const {error:roleError}=await supabaseAdmin.from('user_roles').insert({user_id:id,role:data.kind}); if(roleError) throw roleError;
    const {error:recordError}=data.kind==='student'
      ? await supabaseAdmin.from('students').insert({profile_id:id,uid:data.uid.trim().toLowerCase(),full_name:data.full_name,section_id:data.section_id??'',session_id:data.session_id??''})
      : await supabaseAdmin.from('teachers').insert({profile_id:id,username:data.uid.trim().toLowerCase(),full_name:data.full_name});
    if(recordError) throw recordError;
    await supabaseAdmin.from('audit_logs').insert({actor_id:context.userId,action:`${data.kind} account created`,details:{uid:data.uid}});
    return {id};
  } catch(err){await supabaseAdmin.auth.admin.deleteUser(id); throw new Error(err instanceof Error?err.message:'Account details could not be saved.');}
});
export const adminAction=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({action:z.string(),id:z.string().optional(),values:z.record(z.unknown()).default({})})).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'super_admin'});
  if(!allowed) throw new Error('Administrator access required.');
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const v=data.values;
  let result: unknown;
  const check=(r:{error: {message:string}|null;data?:unknown})=>{if(r.error)throw new Error(r.error.message);return r.data;};
  switch(data.action){
    case 'class': result=check(await supabaseAdmin.from('classes').insert(z.object({name:z.string().min(2),level:z.coerce.number().int().min(1).max(10)}).parse(v)).select());break;
    case 'section':result=check(await supabaseAdmin.from('sections').insert(z.object({name:z.string().min(1),class_id:z.string().uuid()}).parse(v)));break;
    case 'subject':result=check(await supabaseAdmin.from('subjects').insert(z.object({name:z.string().min(2),code:z.string().min(1)}).parse(v)));break;
    case 'session':result=check(await supabaseAdmin.from('academic_sessions').insert(z.object({name:z.string().min(4)}).parse(v)));break;
    case 'assignment':result=check(await supabaseAdmin.from('teacher_assignments').insert(z.object({teacher_id:z.string().uuid(),section_id:z.string().uuid(),subject_id:z.string().uuid()}).parse(v)));break;
    case 'exam':{
      const parsed=z.object({name:z.string().min(2),session_id:z.string().uuid(),start_date:z.string(),end_date:z.string(),max_marks:z.coerce.number().positive(),passing_marks:z.coerce.number().nonnegative(),allow_decimal:z.boolean().default(false),allow_exempt:z.boolean().default(false),assignment_ids:z.array(z.string().uuid()).min(1)}).parse(v);
      if(parsed.passing_marks>parsed.max_marks || parsed.end_date<parsed.start_date)throw new Error('Check passing marks and exam dates.');
      const {data:exam,error}=await supabaseAdmin.from('examinations').insert({name:parsed.name,session_id:parsed.session_id,start_date:parsed.start_date,end_date:parsed.end_date}).select().single();
      if(error || !exam)throw new Error(error?.message??'Exam creation failed.');
      check(await supabaseAdmin.from('exam_subjects').insert(parsed.assignment_ids.map(assignment_id=>({examination_id:exam.id,assignment_id,max_marks:parsed.max_marks,passing_marks:parsed.passing_marks,allow_decimal:parsed.allow_decimal,allow_exempt:parsed.allow_exempt}))));result=exam;break;
    }
    case 'unpublish': check(await context.supabase.rpc('unpublish_examination',{_exam:z.string().uuid().parse(data.id)}));break;
    case 'schedule':check(await context.supabase.rpc('schedule_examination',{_exam:z.string().uuid().parse(data.id),_at:z.string().parse(v['at'])}));break;
    case 'archive':check(await supabaseAdmin.from('examinations').update({archived:Boolean(v['archived'])}).eq('id',z.string().uuid().parse(data.id)));break;
    case 'grade':check(await supabaseAdmin.from('examinations').update({grade_rules:z.array(z.object({min:z.number().min(0).max(100),grade:z.string().min(1)})).min(1).parse(v['rules'])}).eq('id',z.string().uuid().parse(data.id)));break;
    case 'account_update':{
      const parsed=z.object({kind:z.enum(['student','teacher']),full_name:z.string().min(2),active:z.boolean(),section_id:z.string().uuid().optional()}).parse(v);
      const table=parsed.kind==='student'?'students':'teachers';
      const record=check(await supabaseAdmin.from(table).select('profile_id').eq('id',z.string().uuid().parse(data.id)).single()) as {profile_id:string|null};
      if(parsed.kind==='student')check(await supabaseAdmin.from('students').update({full_name:parsed.full_name,active:parsed.active,...(parsed.section_id?{section_id:parsed.section_id}:{})}).eq('id',data.id??''));else check(await supabaseAdmin.from('teachers').update({full_name:parsed.full_name,active:parsed.active}).eq('id',data.id??''));
      if(record.profile_id){check(await supabaseAdmin.from('profiles').update({full_name:parsed.full_name,active:parsed.active}).eq('id',record.profile_id));check(await supabaseAdmin.auth.admin.updateUserById(record.profile_id,{ban_duration:parsed.active?'none':'876000h'}));}break;
    }
    case 'reset_password':check(await supabaseAdmin.auth.admin.updateUserById(z.string().uuid().parse(data.id),{password:z.string().min(8).parse(v['password'])}));break;
    case 'account_delete':{
      const kind=z.enum(['student','teacher']).parse(v['kind']);
      const table=kind==='student'?'students':'teachers';
      const id=z.string().uuid().parse(data.id);
      const record=check(await supabaseAdmin.from(table).select('profile_id').eq('id',id).single()) as {profile_id:string|null};
      if(kind==='teacher'){
        const {count}=await supabaseAdmin.from('teacher_assignments').select('id',{count:'exact',head:true}).eq('teacher_id',id);
        if(count)throw new Error('This teacher has academic assignments. Deactivate the account to preserve examination history.');
      }else{
        const {count}=await supabaseAdmin.from('marks').select('id',{count:'exact',head:true}).eq('student_id',id);
        if(count)throw new Error('This student has examination records. Deactivate the account to preserve marks.');
      }
      check(await supabaseAdmin.from(table).delete().eq('id',id));
      if(record.profile_id)check(await supabaseAdmin.auth.admin.deleteUser(record.profile_id));
      break;
    }
    default:throw new Error('Unsupported administrative action.');
  }
  check(await supabaseAdmin.from('audit_logs').insert({actor_id:context.userId,action:data.action,details:{id:data.id??null}}));
  return {success:true};
});