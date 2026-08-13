import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// Supertest uses `export =`; this import form is required with this CommonJS
// tsconfig and avoids the undefined `.default` emitted by a default import.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { configureApp } from './../src/configure-app';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './../src/modules/health/presentation/controllers/health.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, {
      enableShutdownHooks: false,
      enableSwagger: false,
    });
    await app.init();
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    const body: unknown = response.body;

    expect(body).toMatchObject({
      status: 'ok',
      service: 'ShiftPizza API',
    });
    expect(
      typeof body === 'object' && body !== null && 'timestamp' in body
        ? typeof body.timestamp
        : 'missing',
    ).toBe('string');
  });

  it('sets baseline security headers', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('/demo/reset is hidden by default', () => {
    return request(app.getHttpServer()).post('/demo/reset').expect(404);
  });

  it('rate-limits the hidden destructive endpoint before evaluating availability', async () => {
    await request(app.getHttpServer()).post('/demo/reset').expect(404);
    await request(app.getHttpServer()).post('/demo/reset').expect(429);
  });

  it('keeps Swagger absent and Helmet CSP enabled in production mode', async () => {
    const productionModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService({
            NODE_ENV: 'production',
            CORS_ORIGIN: 'https://app.example.com',
          }),
        },
      ],
    }).compile();
    const productionApp: INestApplication<App> =
      productionModule.createNestApplication();
    configureApp(productionApp, { enableShutdownHooks: false });
    await productionApp.init();

    try {
      await request(productionApp.getHttpServer()).get('/api').expect(404);
      const response = await request(productionApp.getHttpServer())
        .get('/health')
        .expect(200);
      expect(response.headers['content-security-policy']).toContain(
        "default-src 'self'",
      );
    } finally {
      await productionApp.close();
    }
  });

  it('uses the production validation policy', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf: '12345678909', password: 'secret1', unexpected: true })
      .expect(400);
  });

  it('rate-limits repeated login attempts', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ unexpected: true })
        .expect(400);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ unexpected: true })
      .expect(429);
  });

  afterEach(async () => {
    await app.close();
  });
});
