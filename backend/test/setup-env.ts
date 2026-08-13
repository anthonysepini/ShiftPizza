process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://localhost:5432/shiftpizza_test';
process.env.JWT_SECRET ??= 'a-secure-test-secret-with-32-characters';
process.env.DEMO_RESET_ENABLED = 'false';
