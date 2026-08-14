import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);

  logger.log(`ShiftPizza API listening on http://localhost:${port}`);
  if (configService.get<string>('NODE_ENV') !== 'production') {
    logger.log(`Swagger available at http://localhost:${port}/api`);
  }
}

void bootstrap().catch((error: unknown) => {
  if (error instanceof Error) {
    logger.error('Failed to start ShiftPizza API', error.stack);
  } else {
    logger.error(`Failed to start ShiftPizza API: ${String(error)}`);
  }

  process.exitCode = 1;
});
