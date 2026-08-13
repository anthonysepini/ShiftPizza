import { describe, expect, it } from 'vitest';
import type { RouteObject } from 'react-router-dom';
import { appRoutes, SAFE_FALLBACK_PATH } from './routes';

function findRoute(path: string): RouteObject | undefined {
  const visit = (routes: RouteObject[], parentPath = ''): RouteObject | undefined => {
    for (const route of routes) {
      const routePath = route.index
        ? parentPath
        : `${parentPath}/${route.path ?? ''}`.replace(/\/+/g, '/');
      if (routePath === path) {
        return route.children?.find((childRoute) => childRoute.index) ?? route;
      }
      const child = route.children && visit(route.children, routePath);
      if (child) return child;
    }
    return undefined;
  };

  return visit(appRoutes);
}

describe('application routes', () => {
  it.each([
    '/login',
    '/admin',
    '/admin/employees',
    '/admin/schedule',
    '/admin/audit',
    '/employee',
    '/employee/calendar',
    '/employee/profile',
  ])('lazy-loads the page for %s', (path) => {
    expect(findRoute(path)?.lazy).toEqual(expect.any(Function));
  });

  it('redirects unknown URLs to the safe login entry point', () => {
    const fallback = appRoutes.find((route) => route.path === '*');
    expect(SAFE_FALLBACK_PATH).toBe('/login');
    expect(fallback?.element).toMatchObject({
      props: { to: SAFE_FALLBACK_PATH, replace: true },
    });
  });

  it.each(['/login', '/admin', '/employee'])(
    'provides a loading fallback for initial lazy navigation to %s',
    (path) => {
      const route = appRoutes.find((candidate) => candidate.path === path);
      expect(route?.hydrateFallbackElement).toBeTruthy();
    },
  );
});
