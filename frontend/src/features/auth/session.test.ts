import { describe, expect, it } from 'vitest';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  loadStoredSession,
  type SessionStoragePort,
} from './session';

class MemoryStorage implements SessionStoragePort {
  private readonly values = new Map<string, string>();

  constructor(initial: Record<string, string> = {}) {
    Object.entries(initial).forEach(([key, value]) => this.values.set(key, value));
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const validUser = {
  id: 'user-1',
  fullName: 'João Silva',
  role: 'EMPLOYEE' as const,
  employeeId: 'employee-1',
};

describe('loadStoredSession', () => {
  it('hydrates a complete validated session', () => {
    const storage = new MemoryStorage({
      [AUTH_TOKEN_KEY]: 'token-1',
      [AUTH_USER_KEY]: JSON.stringify(validUser),
    });

    expect(loadStoredSession(storage)).toEqual({
      token: 'token-1',
      user: validUser,
    });
  });

  it('clears corrupt JSON instead of throwing', () => {
    const storage = new MemoryStorage({
      [AUTH_TOKEN_KEY]: 'token-1',
      [AUTH_USER_KEY]: '{invalid-json',
    });

    expect(() => loadStoredSession(storage)).not.toThrow();
    expect(loadStoredSession(storage)).toBeNull();
    expect(storage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(storage.getItem(AUTH_USER_KEY)).toBeNull();
  });

  it('rejects and clears a token without a matching user', () => {
    const storage = new MemoryStorage({ [AUTH_TOKEN_KEY]: 'token-1' });

    expect(loadStoredSession(storage)).toBeNull();
    expect(storage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('rejects a stored user with an unknown role', () => {
    const storage = new MemoryStorage({
      [AUTH_TOKEN_KEY]: 'token-1',
      [AUTH_USER_KEY]: JSON.stringify({ ...validUser, role: 'OWNER' }),
    });

    expect(loadStoredSession(storage)).toBeNull();
  });
});
