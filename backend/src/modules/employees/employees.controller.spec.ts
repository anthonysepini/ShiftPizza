import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { EmployeesController } from './employees.controller';

describe('EmployeesController.findOne', () => {
  const employee = { id: 'employee-2', fullName: 'Maria' };
  const service = { findOne: jest.fn().mockResolvedValue(employee) };
  const controller = new EmployeesController(service as never);

  beforeEach(() => service.findOne.mockClear());

  it('allows an employee to read their own profile', async () => {
    await expect(
      controller.findOne('employee-2', {
        id: 'user-2',
        employeeId: 'employee-2',
        fullName: 'Maria',
        role: Role.EMPLOYEE,
      }),
    ).resolves.toEqual(employee);
  });

  it('denies an employee reading another profile', () => {
    expect(() =>
      controller.findOne('employee-2', {
        id: 'user-1',
        employeeId: 'employee-1',
        fullName: 'Joao',
        role: Role.EMPLOYEE,
      }),
    ).toThrow(ForbiddenException);
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('allows an admin to read any profile', async () => {
    await expect(
      controller.findOne('employee-2', {
        id: 'admin-1',
        employeeId: 'employee-admin',
        fullName: 'Admin',
        role: Role.ADMIN,
      }),
    ).resolves.toEqual(employee);
  });
});
