import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DemoController } from './demo.controller';
import { DemoResetGuard } from './demo-reset.guard';
import { DemoService } from './demo.service';

@Module({
  imports: [PrismaModule],
  controllers: [DemoController],
  providers: [DemoService, DemoResetGuard],
})
export class DemoModule {}
