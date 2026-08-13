import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DemoResetGuard } from './demo-reset.guard';

describe('DemoResetGuard', () => {
  it('hides the reset endpoint unless it is explicitly enabled', () => {
    const guard = new DemoResetGuard(
      new ConfigService({ DEMO_RESET_ENABLED: 'false' }),
    );

    expect(() => guard.canActivate()).toThrow(NotFoundException);
  });

  it('allows reset in an explicitly enabled demo environment', () => {
    const guard = new DemoResetGuard(
      new ConfigService({
        APP_MODE: 'isolated-demo',
        DEMO_RESET_ENABLED: 'true',
      }),
    );

    expect(guard.canActivate()).toBe(true);
  });

  it('keeps reset hidden when the flag is set outside isolated demo mode', () => {
    const guard = new DemoResetGuard(
      new ConfigService({
        APP_MODE: 'standard',
        DEMO_RESET_ENABLED: 'true',
      }),
    );

    expect(() => guard.canActivate()).toThrow(NotFoundException);
  });
});
