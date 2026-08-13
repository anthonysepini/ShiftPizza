import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';

describe('CreateEmployeeDto', () => {
  it('rejects duplicate weekdays before they reach the database constraint', async () => {
    const dto = plainToInstance(CreateEmployeeDto, {
      fullName: 'Maria Souza',
      cpf: '52998224725',
      position: 'Caixa',
      password: 'senha123',
      workDays: [1, 1],
    });

    const errors = await validate(dto);
    const workDaysError = errors.find((error) => error.property === 'workDays');

    expect(workDaysError?.constraints).toHaveProperty('arrayUnique');
  });
});
