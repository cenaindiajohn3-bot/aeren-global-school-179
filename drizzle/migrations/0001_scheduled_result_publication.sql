-- lovable-cron-fallback-reviewed: explicit scheduled declaration requires minute precision; each per-exam job unschedules after due execution or cancellation.
CREATE OR REPLACE FUNCTION public.exam_validation(_exam uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ DECLARE sheets integer; done integer; missing integer; invalid integer; pupils integer; BEGIN
IF NOT public.has_role(auth.uid(),'super_admin') AND auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'Administrator access required'; END IF;
SELECT count(*),count(*) FILTER(WHERE es.submitted_at IS NOT NULL) INTO sheets,done FROM public.exam_subjects es WHERE es.examination_id=_exam;
SELECT count(*) INTO missing FROM public.exam_subjects es JOIN public.teacher_assignments a ON a.id=es.assignment_id JOIN public.examinations e ON e.id=es.examination_id JOIN public.students s ON s.section_id=a.section_id AND s.session_id=e.session_id AND s.active LEFT JOIN public.marks m ON m.exam_subject_id=es.id AND m.student_id=s.id WHERE es.examination_id=_exam AND m.id IS NULL;
SELECT count(*) INTO invalid FROM public.marks m JOIN public.exam_subjects es ON es.id=m.exam_subject_id WHERE es.examination_id=_exam AND ((m.status='PRESENT' AND (m.obtained IS NULL OR m.obtained<0 OR m.obtained>es.max_marks OR (NOT es.allow_decimal AND m.obtained<>trunc(m.obtained)))) OR (m.status='EXEMPT' AND NOT es.allow_exempt));
SELECT count(DISTINCT s.id) INTO pupils FROM public.exam_subjects es JOIN public.teacher_assignments a ON a.id=es.assignment_id JOIN public.examinations e ON e.id=es.examination_id JOIN public.students s ON s.section_id=a.section_id AND s.session_id=e.session_id AND s.active WHERE es.examination_id=_exam;
RETURN jsonb_build_object('total',sheets,'submitted',done,'missing',missing,'invalid',invalid,'students',pupils,'ready',sheets>0 AND pupils>0 AND sheets=done AND missing=0 AND invalid=0); END $$;
CREATE FUNCTION public.unpublish_examination(_exam uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF; UPDATE public.examinations SET status='REOPENED',published_at=NULL,scheduled_at=NULL WHERE id=_exam; INSERT INTO public.marksheet_publications(examination_id,admin_id,action) VALUES(_exam,auth.uid(),'UNPUBLISHED'); INSERT INTO public.audit_logs(actor_id,action,details) VALUES(auth.uid(),'Results unpublished',jsonb_build_object('examination',_exam)); END $$;
REVOKE ALL ON FUNCTION public.unpublish_examination(uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.unpublish_examination(uuid) TO authenticated;
CREATE FUNCTION public.run_scheduled_publication(_exam uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE e public.examinations; v jsonb; BEGIN
SELECT * INTO e FROM public.examinations WHERE id=_exam FOR UPDATE;
IF e.scheduled_at>now() AND e.status='SCHEDULED' THEN RETURN; END IF;
IF e.status='SCHEDULED' AND e.scheduled_at<=now() THEN
PERFORM 1 FROM public.exam_subjects WHERE examination_id=_exam FOR UPDATE; v:=public.exam_validation(_exam);
IF (v->>'ready')::boolean AND public.has_role(e.scheduled_by,'super_admin') THEN
UPDATE public.examinations SET status='PUBLISHED',published_at=now(),scheduled_at=NULL WHERE id=_exam;
INSERT INTO public.marksheet_publications(examination_id,admin_id,action) VALUES(_exam,e.scheduled_by,'SCHEDULED_PUBLICATION');
INSERT INTO public.audit_logs(actor_id,action,details) VALUES(e.scheduled_by,'Scheduled results declared',jsonb_build_object('examination',_exam));
ELSE UPDATE public.examinations SET status='MARKS_ENTRY_IN_PROGRESS',scheduled_at=NULL WHERE id=_exam;
INSERT INTO public.audit_logs(actor_id,action,details) VALUES(e.scheduled_by,'Scheduled publication blocked — incomplete marks or inactive administrator',jsonb_build_object('examination',_exam,'validation',v)); END IF; END IF;
PERFORM cron.unschedule('school-exam-'||_exam::text); END $$;
REVOKE ALL ON FUNCTION public.run_scheduled_publication(uuid) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.run_scheduled_publication(uuid) TO service_role;
CREATE FUNCTION public.schedule_examination(_exam uuid,_at timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF;
IF _at<=now() THEN RAISE EXCEPTION 'Select a future declaration time'; END IF;
PERFORM 1 FROM public.examinations WHERE id=_exam FOR UPDATE;
IF NOT FOUND OR EXISTS(SELECT 1 FROM public.examinations WHERE id=_exam AND status='PUBLISHED') THEN RAISE EXCEPTION 'Select an unpublished examination'; END IF;
UPDATE public.examinations SET status='SCHEDULED',scheduled_at=_at,scheduled_by=auth.uid() WHERE id=_exam;
PERFORM cron.schedule('school-exam-'||_exam::text,'* * * * *',format('SELECT public.run_scheduled_publication(%L::uuid)',_exam));
INSERT INTO public.audit_logs(actor_id,action,details) VALUES(auth.uid(),'Result declaration scheduled',jsonb_build_object('examination',_exam,'at',_at)); END $$;
REVOKE ALL ON FUNCTION public.schedule_examination(uuid,timestamptz) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.schedule_examination(uuid,timestamptz) TO authenticated;