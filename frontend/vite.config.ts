import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // الـ SPA Routing (history API) يخدم تلقائياً في Vite 
  },
  base: '/', 
});