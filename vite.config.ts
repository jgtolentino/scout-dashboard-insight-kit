import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      fs: { strict: false },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Redirect generated analytics & GitHub clients to empty stubs
        "analytics.client-CWr-exsP.js": path.resolve(__dirname, "./src/stubs/emptyAnalytics.js"),
        "github-DEL0KHVL.js": path.resolve(__dirname, "./src/stubs/emptyAnalytics.js"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            ui: [
              '@radix-ui/react-select',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-toast',
              'lucide-react'
            ],
            charts: ['recharts', 'd3', 'd3-scale'],
            maps: ['mapbox-gl'],
            azure: [
              '@azure/storage-blob',
              '@azure/identity',
              '@azure/keyvault-secrets'
            ],
            utils: ['axios', 'clsx', 'tailwind-merge', 'date-fns'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'recharts',
        'axios',
        'clsx',
        'tailwind-merge'
      ],
      exclude: ['@rollup/rollup-linux-x64-gnu'],
    },
    define: {
      global: 'globalThis',
    },
    esbuild: {
      target: 'es2020',
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'dist/',
          'coverage/',
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },
    },
  };
});
