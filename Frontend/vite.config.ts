import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Spring Boot backend only allows CORS from http://localhost:4200,
// so the dev server is pinned to that port (same as the old Angular app).
export default defineConfig({
  plugins: [react()],
  server: { port: 4200, strictPort: true, open: true },
  css: { preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'mixed-decls'] } } },
});
