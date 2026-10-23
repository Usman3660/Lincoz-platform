import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function expressDevPlugin() {
  return {
    name: 'express-dev-plugin',
    async configureServer(server) {
      try {
        const { createServer } = await import('./server/src/server.js');
        const app = createServer();
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            return app(req, res, next);
          }
          next();
        });
        console.log('[Vite Express Plugin] Live PostgreSQL API endpoints active on /api');
      } catch (err) {
        console.warn('[Vite Express Plugin] Could not mount Express server:', err.message);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    expressDevPlugin(),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/canvas-confetti')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
