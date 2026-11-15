import { describe, expect, it } from 'vitest';
import { passwordError } from '../lib/password';

describe('Private password setup', () => {
  it('requires matching confirmation', () => {
    expect(passwordError('Example-only-123', 'Different-only-123')).toBe('Passwords do not match.');
    expect(passwordError('Example-only-123', 'Example-only-123')).toBe('');
  });
  it('enforces the existing eight-character minimum', () => {
    expect(passwordError('1234567', '1234567')).toBe('Use at least 8 characters.');
    expect(passwordError('12345678', '12345678')).toBe('');
  });
});