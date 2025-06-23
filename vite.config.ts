import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Platform detection for enterprise deployment strategy
  const isVercel = mode === 'vercel' || env.VERCEL === '1';
  const isAzure = mode === 'azure' || env.AZURE_CLIENT_ID;
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production' || isVercel || isAzure;
  
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
      isDevelopment && componentTagger(),
    ].filter(Boolean),
    define: {
      global: 'globalThis',
      __PLATFORM__: JSON.stringify(isVercel ? 'vercel' : isAzure ? 'azure' : 'development'),
      __IS_ENTERPRISE__: JSON.stringify(isProduction),
    },
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
      sourcemap: !isVercel && isDevelopment, // Disable sourcemaps on Vercel for performance
      minify: isProduction ? 'terser' : false,
      target: 'es2020',
      rollupOptions: {
        external: isVercel ? [] : ['@azure/msal-node'], // Azure-specific externals only for non-Vercel
        output: {
          manualChunks: (id) => {
            // Enterprise-optimized chunking strategy
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@azure') && !isVercel) {
                return 'azure-vendor'; // Only create Azure chunk when not on Vercel
              }
              if (id.includes('shadcn') || id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor';
              }
              if (id.includes('mapbox-gl')) {
                return 'maps-vendor';
              }
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: isVercel ? 500 : 1000, // Stricter limits for Vercel
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
