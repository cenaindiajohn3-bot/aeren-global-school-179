export function schoolWorkspace(role: string): '/dashboard' | '/marks' | '/reports' {
  if (role === 'super_admin') return '/dashboard';
  if (role === 'teacher') return '/marks';
  if (role === 'student') return '/reports';
  throw new Error('No active school account assigned. Contact your school administrator.');
}