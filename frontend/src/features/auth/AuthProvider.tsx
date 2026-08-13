import { useState, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../../services/auth.service';
import {
  clearStoredSession,
  loadStoredSession,
  storeSession,
  type AuthSession,
} from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadStoredSession(localStorage),
  );

  const login = useCallback(async (cpf: string, password: string) => {
    const res = await authService.login(cpf, password);
    const nextSession = { token: res.accessToken, user: res.user };
    storeSession(localStorage, nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession(localStorage);
    setSession(null);
  }, []);

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: session !== null,
        isAdmin: session?.user.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
