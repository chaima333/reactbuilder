import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // الـ SPA Routing (history API) يخدم تلقائياً في Vite 
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        app: fileURLToPath(
          new URL('./index.html', import.meta.url)
        ),
        visitorAuthExportRuntime:
          fileURLToPath(
            new URL(
              './src/modules/pageBuilder/export/visitorAuthRuntime.tsx',
              import.meta.url
            )
          ),
      },
    },
  },
  base: '/', 
});
