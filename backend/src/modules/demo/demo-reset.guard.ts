import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DemoResetGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(): boolean {
    if (
      this.config.get<string>('APP_MODE') !== 'isolated-demo' ||
      this.config.get<string>('DEMO_RESET_ENABLED') !== 'true'
    ) {
      throw new NotFoundException('Recurso de demonstração indisponível');
    }
    return true;
  }
}
