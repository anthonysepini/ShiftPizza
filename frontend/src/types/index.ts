export type Role = 'ADMIN' | 'EMPLOYEE';

export type ScheduleStatus =
  | 'SCHEDULED'
  | 'ABSENT'
  | 'EXTRA_SHIFT'
  | 'DAY_OFF'
  | 'REMOVED_SHIFT';

export type ScheduleSource = 'AUTO' | 'MANUAL';

export interface WeeklyRule {
  id: string;
  employeeId: string;
  weekday: number;
  shouldWork: boolean;
}

export interface UserInfo {
  id: string;
  role: Role;
}

export interface Employee {
  id: string;
  fullName: string;
  cpf: string;
  phone?: string;
  position: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserInfo;
  weeklyRules: WeeklyRule[];
}

export interface AuthUser {
  id: string;
  fullName: string;
  role: Role;
  employeeId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ScheduleDay {
  id: string;
  employeeId: string;
  date: string;
  status: ScheduleStatus;
  source: ScheduleSource;
  note?: string;
  changedByUserId?: string;
  createdAt: string;
  updatedAt: string;
  employee?: { fullName: string; position: string };
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor: { employee: { fullName: string } };
}

export interface CreateEmployeeDto {
  fullName: string;
  cpf: string;
  phone?: string;
  position: string;
  password: string;
  workDays: number[];
}

export interface UpdateEmployeeDto {
  fullName?: string;
  phone?: string;
  position?: string;
  workDays?: number[];
}

export interface GenerateMonthDto {
  year: number;
  month: number;
}

export interface UpdateDayDto {
  status: ScheduleStatus;
  note?: string;
}
