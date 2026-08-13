import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { parseCorsOrigins } from './config/environment';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import helmet from 'helmet';

interface ConfigureAppOptions {
  enableShutdownHooks?: boolean;
  enableSwagger?: boolean;
}

export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): void {
  const configService = app.get(ConfigService);
  const shouldEnableSwagger =
    options.enableSwagger ??
    configService.get<string>('NODE_ENV') !== 'production';

  app.use(
    shouldEnableSwagger ? helmet({ contentSecurityPolicy: false }) : helmet(),
  );
  app.enableCors({
    origin: parseCorsOrigins(configService.getOrThrow<string>('CORS_ORIGIN')),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  if (options.enableShutdownHooks !== false) {
    app.enableShutdownHooks();
  }

  if (shouldEnableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ShiftPizza API')
      .setDescription('API de gestão de escalas para pequenas equipes')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
}
