import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkReadiness() {
    const timestamp = new Date().toISOString();

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp,
        service: 'ShiftPizza API',
        database: 'reachable',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp,
        service: 'ShiftPizza API',
        database: 'unreachable',
      });
    }
  }
}
