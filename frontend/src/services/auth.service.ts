import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  async login(cpf: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { cpf, password });
    return data;
  },
};
