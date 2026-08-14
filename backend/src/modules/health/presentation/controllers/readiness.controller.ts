import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../../application/health.service';

@ApiTags('health')
@Controller('health')
export class ReadinessController {
  constructor(private readonly healthService: HealthService) {}

  @Get('ready')
  @ApiOperation({
    summary: 'Verifica se a API está pronta para receber tráfego',
  })
  readiness() {
    return this.healthService.checkReadiness();
  }
}
