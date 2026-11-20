import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { loadPortal } from '@/lib/portal.functions';
import type { Snapshot } from '@/lib/school';
import { SchoolShell } from './shell';
import { Dashboard } from './dashboard';
import { Management } from './management';
export const portalQuery=queryOptions({queryKey:['portal'],queryFn:async()=>await loadPortal() as unknown as Snapshot,staleTime:10000,refetchInterval:30000});
export function PortalPage({view}:{view:string}){const {data}=useSuspenseQuery(portalQuery);const workspace=view==='dashboard'?(data.role==='student'?'reports':data.role==='teacher'?'marks':'dashboard'):view;return <SchoolShell data={data}>{workspace==='dashboard'?<Dashboard data={data}/>:<Management data={data} view={workspace}/>}</SchoolShell>;}
export function pageHead(title:string,description:string){return {meta:[{title:`${title} | Aeren Global School`},{name:'description',content:description},{property:'og:title',content:`${title} | Aeren Global School`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
