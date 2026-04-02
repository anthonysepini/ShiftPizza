import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite requisições do frontend
  app.enableCors();

  // Valida automaticamente todos os campos recebidos na API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentação automática da API
  const config = new DocumentBuilder()
    .setTitle('ShiftPizza API')
    .setDescription('API de gestão de escalas para pequenas equipes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🍕 ShiftPizza API rodando em: http://localhost:${port}`);
  console.log(`📖 Swagger (docs): http://localhost:${port}/api\n`);
}
void bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
