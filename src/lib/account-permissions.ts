// The server must pass its verified has_role result, never client-supplied state.
export function canManageSchoolAccounts(activeSuperAdmin: unknown): boolean {
  return activeSuperAdmin === true;
}

export function canUseAccountControls(role: string): boolean {
  return role === 'super_admin';
}