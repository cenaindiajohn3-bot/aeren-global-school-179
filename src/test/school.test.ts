import { describe, expect, it } from 'vitest';
import { uidEmail, validateMark, summarize } from '@/lib/school';
describe('School rules',()=>{
  it('uses the school UID as the credential identity',()=>expect(uidEmail(' 123456 ')).toBe('123456@aeren.school.local'));
  it('does not accept marks above the subject maximum',()=>expect(validateMark('101',100)).toBe(false));
  it('accepts absent without treating it as ordinary numerical marks',()=>expect(validateMark('AB',100)).toBe(true));
  it('does not allow exemption unless enabled by admin',()=>expect(validateMark('EXEMPT',100,false,false)).toBe(false));
  it('rejects decimals unless configured',()=>expect(validateMark('89.5',100,false)).toBe(false));
  it('excludes exempted subjects from the total maximum',()=>expect(summarize([{id:'m',exam_subject_id:'s',status:'EXEMPT',obtained:null}],[{id:'s',max_marks:100,passing_marks:35}],[]).maximum).toBe(0));
  it('counts absence as a failed subject while preserving its status',()=>expect(summarize([{id:'m',exam_subject_id:'s',status:'AB',obtained:null}],[{id:'s',max_marks:100,passing_marks:35}],[]).result).toBe('FAIL'));
});