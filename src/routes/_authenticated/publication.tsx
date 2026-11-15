import { createFileRoute } from '@tanstack/react-router';
import { PortalPage, portalQuery, pageHead } from '@/components/school/portal-page';
export const Route=createFileRoute('/_authenticated/publication')({
 head:()=>pageHead('Result Publication','Secure result publication for Aeren Global School examination and result management.'),
 loader:({context})=>context.queryClient.ensureQueryData(portalQuery),
 component:()=> <PortalPage view="publication"/>,
});
