import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    return { host, json, status };
  };

  it.each([
    ['P2002', HttpStatus.CONFLICT, 'Registro já existente'],
    ['P2025', HttpStatus.NOT_FOUND, 'Registro não encontrado'],
  ])('maps %s to a stable HTTP response', (code, httpStatus, message) => {
    const { host, json, status } = createHost();
    const exception = { code } as Prisma.PrismaClientKnownRequestError;

    new PrismaExceptionFilter().catch(exception, host);

    expect(status).toHaveBeenCalledWith(httpStatus);
    expect(json).toHaveBeenCalledWith({
      statusCode: httpStatus,
      message,
    });
  });
});
