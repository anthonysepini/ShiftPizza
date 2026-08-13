import type { Role } from '../../types';

export type RoleHome = '/admin' | '/employee';

export function getRoleHome(role: Role): RoleHome {
  return role === 'ADMIN' ? '/admin' : '/employee';
}

export function getWrongRoleRedirect(
  actualRole: Role,
  requiredRole: Role,
): RoleHome | null {
  return actualRole === requiredRole ? null : getRoleHome(actualRole);
}
