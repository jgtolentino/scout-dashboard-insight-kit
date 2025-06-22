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
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    copy({
      targets: [
        { src: 'public/favicon.ico', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'analytics.client-CWr-exsP': path.resolve(__dirname, "./src/stubs/emptyAnalytics.js"),
    },
  },
}));