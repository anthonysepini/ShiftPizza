import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser } from '../../types';
import { authService } from '../../services/auth.service';

interface AuthCtx {
  user: AuthUser | null;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
