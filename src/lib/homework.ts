export function canPostHomework(role: string) { return role === 'super_admin' || role === 'teacher'; }
export function homeworkError(title: string, dueDate: string, today: string) {
  if (title.trim().length < 2) return 'Enter an assignment title.';
  if (!dueDate) return 'Choose a due date.';
  if (dueDate < today) return 'The due date cannot be in the past.';
  return '';
}