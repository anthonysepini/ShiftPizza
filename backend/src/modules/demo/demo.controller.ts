import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DemoService } from './demo.service';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetar sistema demo — apaga tudo e restaura os dados originais',
  })
  reset() {
    return this.demoService.reset();
  }
}
