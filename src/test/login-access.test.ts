import { expect, it } from 'vitest';
import { schoolWorkspace } from '../lib/login-access';
it('sends students to results', () => expect(schoolWorkspace('student')).toBe('/reports'));
it('sends teachers to marks entry', () => expect(schoolWorkspace('teacher')).toBe('/marks'));
it('sends administrators to their dashboard', () => expect(schoolWorkspace('super_admin')).toBe('/dashboard'));
it('rejects an unassigned school account', () => expect(() => schoolWorkspace('')).toThrow());