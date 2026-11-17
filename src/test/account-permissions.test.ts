import { describe, expect, it } from 'vitest';
import { canManageSchoolAccounts, canUseAccountControls } from '../lib/account-permissions';

describe('Super Admin-only school credentials', () => {
  it('requires a verified active Super Admin for account creation', () => {
    expect(canManageSchoolAccounts(true)).toBe(true);
    for (const value of [false, null, undefined, 'true', 'teacher', 'student']) {
      expect(canManageSchoolAccounts(value)).toBe(false);
    }
  });
  it('allows UID creation and password controls only for Super Admin', () => {
    expect(canUseAccountControls('super_admin')).toBe(true);
    expect(canUseAccountControls('teacher')).toBe(false);
    expect(canUseAccountControls('student')).toBe(false);
  });
});