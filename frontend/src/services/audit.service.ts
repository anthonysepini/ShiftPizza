import api from './api';
import type { AuditLog } from '../types';

export const auditService = {
  async findAll(limit = 50): Promise<AuditLog[]> {
    const { data } = await api.get<AuditLog[]>('/audit', { params: { limit } });
    return data;
  },
};
