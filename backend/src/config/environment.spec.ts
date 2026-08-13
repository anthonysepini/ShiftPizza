import { parseCorsOrigins, validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  const valid = {
    DATABASE_URL: 'postgresql://localhost:5432/shiftpizza_test',
    JWT_SECRET: 'a-secure-test-secret-with-32-characters',
  };

  it('fails when DATABASE_URL is missing', () => {
    expect(() => validateEnvironment({ JWT_SECRET: valid.JWT_SECRET })).toThrow(
      'DATABASE_URL',
    );
  });

  it('fails when JWT_SECRET is missing or too short', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: valid.DATABASE_URL }),
    ).toThrow('JWT_SECRET');
    expect(() =>
      validateEnvironment({ ...valid, JWT_SECRET: 'shiftpizza_secret' }),
    ).toThrow('at least 32');
  });

  it('defaults demo reset to disabled', () => {
    expect(validateEnvironment(valid).DEMO_RESET_ENABLED).toBe('false');
    expect(validateEnvironment(valid).APP_MODE).toBe('standard');
  });

  it('allows destructive demo reset only in isolated demo mode', () => {
    expect(() =>
      validateEnvironment({ ...valid, DEMO_RESET_ENABLED: 'true' }),
    ).toThrow('APP_MODE');

    expect(
      validateEnvironment({
        ...valid,
        APP_MODE: 'isolated-demo',
        DEMO_RESET_ENABLED: 'true',
      }).DEMO_RESET_ENABLED,
    ).toBe('true');

    expect(() =>
      validateEnvironment({ ...valid, APP_MODE: 'preview' }),
    ).toThrow('APP_MODE');
  });

  it('defaults the business timezone and rejects invalid IANA zones', () => {
    expect(validateEnvironment(valid).BUSINESS_TIME_ZONE).toBe(
      'America/Sao_Paulo',
    );
    expect(() =>
      validateEnvironment({ ...valid, BUSINESS_TIME_ZONE: 'Mars/Olympus' }),
    ).toThrow('BUSINESS_TIME_ZONE');
  });

  it('rejects invalid boolean configuration', () => {
    expect(() =>
      validateEnvironment({ ...valid, DEMO_RESET_ENABLED: 'yes' }),
    ).toThrow('DEMO_RESET_ENABLED');
  });

  it('requires explicit CORS origins in production', () => {
    expect(() =>
      validateEnvironment({ ...valid, NODE_ENV: 'production' }),
    ).toThrow('CORS_ORIGIN');
  });

  it('normalizes supported NODE_ENV values and rejects unknown modes', () => {
    expect(
      validateEnvironment({
        ...valid,
        NODE_ENV: ' Production ',
        CORS_ORIGIN: 'https://app.example.com',
      }).NODE_ENV,
    ).toBe('production');

    expect(() => validateEnvironment({ ...valid, NODE_ENV: 'stagin' })).toThrow(
      'NODE_ENV',
    );
  });

  it('normalizes PORT to a valid TCP port', () => {
    expect(validateEnvironment(valid).PORT).toBe(3000);
    expect(validateEnvironment({ ...valid, PORT: '3100' }).PORT).toBe(3100);
    expect(() => validateEnvironment({ ...valid, PORT: 'not-a-port' })).toThrow(
      'PORT',
    );
    expect(() => validateEnvironment({ ...valid, PORT: '70000' })).toThrow(
      'PORT',
    );
  });
});

describe('parseCorsOrigins', () => {
  it('trims and removes duplicate origins', () => {
    expect(
      parseCorsOrigins(
        'http://localhost:5173, http://127.0.0.1:5173,http://localhost:5173',
      ),
    ).toEqual(['http://localhost:5173', 'http://127.0.0.1:5173']);
  });

  it('normalizes trailing slashes and rejects unsafe origin values', () => {
    expect(parseCorsOrigins('https://app.example.com/')).toEqual([
      'https://app.example.com',
    ]);
    expect(() => parseCorsOrigins('*')).toThrow('CORS_ORIGIN');
    expect(() => parseCorsOrigins('javascript:alert(1)')).toThrow(
      'CORS_ORIGIN',
    );
    expect(() => parseCorsOrigins('https://app.example.com/path')).toThrow(
      'CORS_ORIGIN',
    );
  });
});
