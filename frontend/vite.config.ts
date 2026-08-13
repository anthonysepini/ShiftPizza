import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolveApiBaseUrl } from './src/config/api-url.ts';

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    resolveApiBaseUrl(process.env.VITE_API_URL ?? env.VITE_API_URL, false);
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
