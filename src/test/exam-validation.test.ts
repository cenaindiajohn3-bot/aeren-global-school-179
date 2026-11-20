import { describe, expect, it } from 'vitest';
import { requireExamAssignments } from '../lib/exam-validation';

describe('examination subject selection', () => {
  it('rejects an exam with zero selected class subjects', () => {
    expect(() => requireExamAssignments([])).toThrow('Select at least one class subject.');
  });
  it('accepts an exam with one selected class subject', () => {
    expect(() => requireExamAssignments(['80d6ca71-84a8-491a-a98a-bbb4a456a684'])).not.toThrow();
  });
});