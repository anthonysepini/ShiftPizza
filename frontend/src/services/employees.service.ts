import api from './api';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../types';

export const employeesService = {
  async findAll(): Promise<Employee[]> {
    const { data } = await api.get<Employee[]>('/employees');
    return data;
  },
  async findOne(id: string): Promise<Employee> {
    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
  },
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const { data } = await api.post<Employee>('/employees', dto);
    return data;
  },
  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const { data } = await api.patch<Employee>(`/employees/${id}`, dto);
    return data;
  },
  async toggleActive(id: string, isActive: boolean) {
    const { data } = await api.patch(`/employees/${id}/active`, { isActive });
    return data;
  },
};
