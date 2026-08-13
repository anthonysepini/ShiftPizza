import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

interface HttpResponse {
  status(code: number): {
    json(body: { statusCode: number; message: string }): void;
  };
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const mapped = this.mapException(exception.code);

    response.status(mapped.statusCode).json(mapped);
  }

  private mapException(code: string): {
    statusCode: number;
    message: string;
  } {
    if (code === 'P2002') {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Registro já existente',
      };
    }

    if (code === 'P2025') {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Registro não encontrado',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Falha ao processar os dados',
    };
  }
}
