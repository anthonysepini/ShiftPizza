import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DemoService } from './demo.service';
import { DemoResetGuard } from './demo-reset.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(
    private readonly demoService: DemoService,
    private readonly config: ConfigService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Informa se o reset da demonstração está disponível',
  })
  status() {
    return {
      resetEnabled:
        this.config.get<string>('APP_MODE') === 'isolated-demo' &&
        this.config.get<string>('DEMO_RESET_ENABLED') === 'true',
    };
  }

  @Post('reset')
  @UseGuards(ThrottlerGuard, DemoResetGuard)
  @Throttle({ default: { limit: 1, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetar sistema demo — apaga tudo e restaura os dados originais',
  })
  reset() {
    return this.demoService.reset();
  }
}
