import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);

  console.log(`\nShiftPizza API: http://localhost:${port}`);
  if (configService.get<string>('NODE_ENV') !== 'production') {
    console.log(`Swagger: http://localhost:${port}/api`);
  }
  console.log();
}

void bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
