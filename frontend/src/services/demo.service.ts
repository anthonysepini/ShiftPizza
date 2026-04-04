import api from './api';

export const demoService = {
  async reset(): Promise<{ message: string; restored: string[] }> {
    const { data } = await api.post<{ message: string; restored: string[] }>('/demo/reset');
    return data;
  },
};
