import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react()
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    define: {
      // Expose env variables to client
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor splitting for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'charts-vendor': ['recharts', 'd3'],
            'maps-vendor': ['mapbox-gl'],
            'azure-vendor': ['@azure/identity', '@azure/storage-blob'],
            'ai-vendor': ['openai', 'ai'],
            'ui-vendor': ['@radix-ui/react-select', '@radix-ui/react-dialog', 'lucide-react'],
            'utils-vendor': ['zustand', 'clsx', 'tailwind-merge', 'date-fns']
          },
          // Consistent naming
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext || '')) {
              return `assets/css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          }
        },
        
        // External dependencies (don't bundle these)
        external: mode === 'development' ? [] : [
          // Add any dependencies you want to load from CDN
        ]
      },
      
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Optimize assets
      assetsInlineLimit: 4096
    },
    
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      
      // Proxy API calls during development
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    
    preview: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true
    },
    
    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom', 
        'zustand',
        'recharts',
        'mapbox-gl',
        'lucide-react'
      ],
      exclude: ['@azure/msal-browser'] // Exclude problematic deps
    },
    
    // CSS preprocessing
    css: {
      devSourcemap: mode === 'development',
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer
        ]
      }
    },
    
    // Environment variable prefix
    envPrefix: ['VITE_'],
    
    // Logging
    logLevel: mode === 'development' ? 'info' : 'warn'
  }
})
