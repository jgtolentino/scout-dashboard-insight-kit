import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import copy from "rollup-plugin-copy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Remove proxy when using MSW - let MSW handle all API calls
    ...(process.env.VITE_USE_MOCKS !== 'true' && {
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    })
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    copy({
      targets: [
        { src: 'public/mockServiceWorker.js', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ].filter(Boolean),
  optimizeDeps: {
    include: ['msw']
  },
  ssr: {
    noExternal: ['msw']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));