import api from './api';

export const demoService = {
  async getStatus(): Promise<{ resetEnabled: boolean }> {
    const { data } = await api.get<{ resetEnabled: boolean }>('/demo/status');
    return data;
  },
  async reset(): Promise<{ message: string; restored: string[] }> {
    const { data } = await api.post<{ message: string; restored: string[] }>('/demo/reset');
    return data;
  },
};
