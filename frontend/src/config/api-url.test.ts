import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './api-url';

describe('resolveApiBaseUrl', () => {
  it('uses localhost only when running in development', () => {
    expect(resolveApiBaseUrl(undefined, true)).toBe('http://localhost:3000');
  });

  it('requires an explicit URL outside development', () => {
    expect(() => resolveApiBaseUrl(undefined, false)).toThrow(
      'VITE_API_URL is required outside development',
    );
  });

  it('accepts HTTP URLs and preserves a configured path', () => {
    expect(resolveApiBaseUrl(' https://api.example.com/shiftpizza/v1/ ', false)).toBe(
      'https://api.example.com/shiftpizza/v1',
    );
  });

  it.each([
    'ftp://api.example.com',
    'https://user:password@api.example.com',
    'not-a-url',
  ])('rejects an unsafe API URL: %s', (value) => {
    expect(() => resolveApiBaseUrl(value, false)).toThrow(
      'VITE_API_URL must be an HTTP(S) URL without credentials',
    );
  });
});
