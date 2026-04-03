import { createContext } from 'react';
import type { AuthUser } from '../../types';

export interface AuthCtx {
  user: AuthUser | null;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthCtx | null>(null);
