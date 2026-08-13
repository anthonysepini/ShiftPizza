import { describe, expect, it } from 'vitest';
import { getRoleHome, getWrongRoleRedirect } from './route-access';

describe('role route access', () => {
  it('resolves the stable home for each role', () => {
    expect(getRoleHome('ADMIN')).toBe('/admin');
    expect(getRoleHome('EMPLOYEE')).toBe('/employee');
  });

  it('redirects an employee away from the admin route tree', () => {
    expect(getWrongRoleRedirect('EMPLOYEE', 'ADMIN')).toBe('/employee');
  });

  it('redirects an admin away from the employee route tree', () => {
    expect(getWrongRoleRedirect('ADMIN', 'EMPLOYEE')).toBe('/admin');
  });

  it('allows the matching role without a redirect', () => {
    expect(getWrongRoleRedirect('ADMIN', 'ADMIN')).toBeNull();
    expect(getWrongRoleRedirect('EMPLOYEE', 'EMPLOYEE')).toBeNull();
  });
});
