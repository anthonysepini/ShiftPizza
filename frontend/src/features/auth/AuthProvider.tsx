import { useState, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../../services/auth.service';
import type { AuthUser } from '../../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('sp_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  const login = useCallback(async (cpf: string, password: string) => {
    const res = await authService.login(cpf, password);
    setUser(res.user);
    localStorage.setItem('sp_token', res.accessToken);
    localStorage.setItem('sp_user', JSON.stringify(res.user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!localStorage.getItem('sp_token'),
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
