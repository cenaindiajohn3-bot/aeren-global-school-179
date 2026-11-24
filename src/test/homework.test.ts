import { expect, it } from 'vitest';
import { canPostHomework, homeworkError } from '../lib/homework';
it('lets teachers and Admin post assignments', () => {
  expect(canPostHomework('teacher')).toBe(true);
  expect(canPostHomework('super_admin')).toBe(true);
});
it('stops students from posting assignments', () => expect(canPostHomework('student')).toBe(false));
it('rejects a past due date', () => expect(homeworkError('Chapter 2', '2026-11-23', '2026-11-24')).not.toBe(''));
it('accepts a due date of today', () => expect(homeworkError('Chapter 2', '2026-11-24', '2026-11-24')).toBe(''));