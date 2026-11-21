import { expect, it } from 'vitest';
import { canUploadPyqs, validatePyqFile } from '../lib/pyqs';
it('allows Admin and teacher uploads', () => {
  expect(canUploadPyqs('super_admin')).toBe(true);
  expect(canUploadPyqs('teacher')).toBe(true);
});
it('denies student and unassigned uploads', () => {
  expect(canUploadPyqs('student')).toBe(false);
  expect(canUploadPyqs('')).toBe(false);
});
it('accepts PDF files at the 10 MB limit', () => expect(() => validatePyqFile({ name: 'paper.pdf', size: 10485760 })).not.toThrow());
it('rejects oversized files', () => expect(() => validatePyqFile({ name: 'paper.pdf', size: 10485761 })).toThrow());
it('rejects non-PDF files', () => expect(() => validatePyqFile({ name: 'paper.exe', size: 100 })).toThrow());