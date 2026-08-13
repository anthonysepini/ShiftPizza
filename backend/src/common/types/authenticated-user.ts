import { Role } from '../enums/role.enum';

export interface AuthenticatedUser {
  id: string;
  employeeId: string;
  fullName: string;
  role: Role;
}
