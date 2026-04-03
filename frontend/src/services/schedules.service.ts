import api from './api';
import type { ScheduleDay, GenerateMonthDto, UpdateDayDto } from '../types';

export const schedulesService = {
  async generateMonth(dto: GenerateMonthDto) {
    const { data } = await api.post<{ message: string; year: number; month: number; created: number }>('/schedules/generate', dto);
    return data;
  },
  async getMonthSchedule(year: number, month: number, employeeId?: string): Promise<ScheduleDay[]> {
    const params: Record<string, unknown> = { year, month };
    if (employeeId) params.employeeId = employeeId;
    const { data } = await api.get<ScheduleDay[]>('/schedules/month', { params });
    return data;
  },
  async updateDay(id: string, dto: UpdateDayDto): Promise<ScheduleDay> {
    const { data } = await api.patch<ScheduleDay>(`/schedules/day/${id}`, dto);
    return data;
  },
  async getMySchedule(year: number, month: number): Promise<ScheduleDay[]> {
    const { data } = await api.get<ScheduleDay[]>(`/schedules/my/${year}/${month}`);
    return data;
  },
};
