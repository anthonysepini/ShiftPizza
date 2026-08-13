import type { AuthUser } from '../../types';

export const AUTH_TOKEN_KEY = 'sp_token';
export const AUTH_USER_KEY = 'sp_user';

export interface SessionStoragePort {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.fullName) &&
    (candidate.role === 'ADMIN' || candidate.role === 'EMPLOYEE') &&
    isNonEmptyString(candidate.employeeId)
  );
}

export function clearStoredSession(storage: SessionStoragePort): void {
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(AUTH_USER_KEY);
}

export function storeSession(
  storage: SessionStoragePort,
  session: AuthSession,
): void {
  storage.setItem(AUTH_TOKEN_KEY, session.token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function loadStoredSession(
  storage: SessionStoragePort,
): AuthSession | null {
  try {
    const token = storage.getItem(AUTH_TOKEN_KEY);
    const rawUser = storage.getItem(AUTH_USER_KEY);
    const user: unknown = rawUser ? JSON.parse(rawUser) : null;

    if (!isNonEmptyString(token) || !isAuthUser(user)) {
      clearStoredSession(storage);
      return null;
    }

    return { token, user };
  } catch {
    clearStoredSession(storage);
    return null;
  }
}
