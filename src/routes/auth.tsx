import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/components/school/login-page';
import { pageHead } from '@/components/school/portal-page';

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): { role?: string } => ({ role: ['student', 'teacher', 'admin'].includes(String(search['role'])) ? String(search['role']) : undefined }),
  head: () => pageHead('Account Sign In', 'Sign in to your student, teacher or admin account at Aeren Global School.'),
  component: Auth,
});

function Auth() {
  const { role } = Route.useSearch();
  return <LoginPage key={role} initialRole={role}/>;
}