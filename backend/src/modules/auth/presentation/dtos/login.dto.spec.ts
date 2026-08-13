import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('normalizes formatted CPFs', async () => {
    const dto = plainToInstance(LoginDto, {
      cpf: '529.982.247-25',
      password: 'secret1',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.cpf).toBe('52998224725');
  });

  it('rejects malformed CPFs and oversized passwords', async () => {
    const dto = plainToInstance(LoginDto, {
      cpf: '123',
      password: 'a'.repeat(129),
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['cpf', 'password']),
    );
  });
});
