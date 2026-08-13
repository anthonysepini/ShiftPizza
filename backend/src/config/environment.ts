import {
  DEFAULT_BUSINESS_TIME_ZONE,
  validateTimeZone,
} from '../common/date/civil-date';

const DEVELOPMENT_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173';

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

export function parseCorsOrigins(value: string): string[] {
  const configuredOrigins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [
    ...new Set(
      configuredOrigins.map((configuredOrigin) => {
        let url: URL;
        try {
          url = new URL(configuredOrigin);
        } catch {
          throw new Error('CORS_ORIGIN must contain valid HTTP(S) origins');
        }

        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.username !== '' ||
          url.password !== '' ||
          (url.pathname !== '' && url.pathname !== '/') ||
          url.search !== '' ||
          url.hash !== ''
        ) {
          throw new Error('CORS_ORIGIN must contain valid HTTP(S) origins');
        }

        return url.origin;
      }),
    ),
  ];
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const databaseUrl = requiredString(config, 'DATABASE_URL');
  const jwtSecret = requiredString(config, 'JWT_SECRET');

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  const nodeEnv =
    typeof config.NODE_ENV === 'string'
      ? config.NODE_ENV.trim().toLowerCase()
      : 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }
  const configuredCors =
    typeof config.CORS_ORIGIN === 'string' ? config.CORS_ORIGIN.trim() : '';
  const configuredBusinessTimeZone =
    typeof config.BUSINESS_TIME_ZONE === 'string'
      ? config.BUSINESS_TIME_ZONE.trim()
      : '';
  let businessTimeZone: string;

  try {
    businessTimeZone = validateTimeZone(
      configuredBusinessTimeZone || DEFAULT_BUSINESS_TIME_ZONE,
    );
  } catch {
    throw new Error('BUSINESS_TIME_ZONE must be a valid IANA time zone');
  }

  if (nodeEnv === 'production' && configuredCors === '') {
    throw new Error('CORS_ORIGIN is required in production');
  }

  const demoReset =
    typeof config.DEMO_RESET_ENABLED === 'string'
      ? config.DEMO_RESET_ENABLED.trim().toLowerCase()
      : 'false';
  if (demoReset !== 'true' && demoReset !== 'false') {
    throw new Error('DEMO_RESET_ENABLED must be true or false');
  }

  const appMode =
    typeof config.APP_MODE === 'string'
      ? config.APP_MODE.trim().toLowerCase()
      : 'standard';
  if (appMode !== 'standard' && appMode !== 'isolated-demo') {
    throw new Error('APP_MODE must be standard or isolated-demo');
  }
  if (demoReset === 'true' && appMode !== 'isolated-demo') {
    throw new Error('DEMO_RESET_ENABLED=true requires APP_MODE=isolated-demo');
  }

  const port = Number(config.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const corsOrigin = configuredCors || DEVELOPMENT_ORIGINS;
  if (parseCorsOrigins(corsOrigin).length === 0) {
    throw new Error('CORS_ORIGIN must contain at least one origin');
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    PORT: port,
    CORS_ORIGIN: corsOrigin,
    BUSINESS_TIME_ZONE: businessTimeZone,
    APP_MODE: appMode,
    DEMO_RESET_ENABLED: demoReset,
  };
}
