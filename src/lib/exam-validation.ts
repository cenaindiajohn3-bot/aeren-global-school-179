export function requireExamAssignments(assignmentIds: readonly unknown[]): void {
  if (assignmentIds.length === 0) {
    throw new Error('Select at least one class subject. If none are listed, add a teacher assignment first.');
  }
}