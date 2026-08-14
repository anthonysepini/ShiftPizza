import { Module } from '@nestjs/common';
import { HealthService } from './application/health.service';
import { HealthController } from './presentation/controllers/health.controller';
import { ReadinessController } from './presentation/controllers/readiness.controller';

@Module({
  controllers: [HealthController, ReadinessController],
  providers: [HealthService],
})
export class HealthModule {}
