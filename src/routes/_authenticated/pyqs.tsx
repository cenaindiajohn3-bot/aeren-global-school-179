import { createFileRoute } from '@tanstack/react-router';
import { PyqsPage, pyqsQuery } from '@/components/school/pyqs-page';
import { pageHead, portalQuery } from '@/components/school/portal-page';
export const Route=createFileRoute('/_authenticated/pyqs')({
  head:()=>pageHead('PYQs','Previous-year question papers by class, subject and year for Aeren Global School.'),
  loader:async({context})=>{await Promise.all([context.queryClient.ensureQueryData(portalQuery),context.queryClient.ensureQueryData(pyqsQuery)]);},
  component:PyqsPage,
});