import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SchoolShell } from '@/components/school/shell';
import { Dashboard } from '@/components/school/dashboard';
import { pageHead } from '@/components/school/portal-page';
const overviewQuery=queryOptions({queryKey:['demo-overview'],queryFn:async()=>{const {data,error}=await supabase.rpc('demo_overview');if(error)throw new Error(error.message);return data;},staleTime:30000});
export const Route=createFileRoute('/')({head:()=>pageHead('Examination Portal','Aeren Global School examination workspace. School-issued UID login, secure marks entry and centralized result declaration.'),loader:({context})=>context.queryClient.ensureQueryData(overviewQuery),component:Index});
function Index(){const {data}=useSuspenseQuery(overviewQuery);return <SchoolShell demo><Dashboard demo overview={data}/></SchoolShell>;}
