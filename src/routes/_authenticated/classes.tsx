import { createFileRoute } from '@tanstack/react-router';
import { PortalPage, portalQuery, pageHead } from '@/components/school/portal-page';
export const Route=createFileRoute('/_authenticated/classes')({
 head:()=>pageHead('Classes','Secure classes for Aeren Global School examination and result management.'),
 loader:({context})=>context.queryClient.ensureQueryData(portalQuery),
 component:()=> <PortalPage view="classes"/>,
});
