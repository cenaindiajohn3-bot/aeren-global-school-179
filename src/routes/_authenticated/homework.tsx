import { createFileRoute } from '@tanstack/react-router';
import { HomeworkPage, homeworkQuery } from '@/components/school/homework-page';
import { pageHead, portalQuery } from '@/components/school/portal-page';
export const Route = createFileRoute('/_authenticated/homework')({
  head: () => pageHead('Assignments', 'Class assignments from teachers for Aeren Global School students.'),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(portalQuery), context.queryClient.ensureQueryData(homeworkQuery)]); },
  component: HomeworkPage,
});