const DEVELOPMENT_API_URL = 'http://localhost:3000';

const INVALID_API_URL_MESSAGE =
  'VITE_API_URL must be an HTTP(S) URL without credentials';

export function resolveApiBaseUrl(
  configuredUrl: string | undefined,
  isDevelopment: boolean,
): string {
  const value = configuredUrl?.trim();

  if (!value) {
    if (isDevelopment) return DEVELOPMENT_API_URL;
    throw new Error('VITE_API_URL is required outside development');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(INVALID_API_URL_MESSAGE);
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username !== '' ||
    url.password !== ''
  ) {
    throw new Error(INVALID_API_URL_MESSAGE);
  }

  const pathname = url.pathname.replace(/\/+$/, '');
  return `${url.origin}${pathname}${url.search}${url.hash}`;
}
