# Scout Analytics - Environment & Configuration Fixes

# 1. Create proper .env files
echo "🔧 Setting up environment configurations..."

# .env.example
cat > .env.example << 'EOF'
# Scout Analytics Environment Configuration

# Application
NODE_ENV=development
VITE_APP_TITLE=Scout Analytics Dashboard
VITE_APP_VERSION=3.0.0
VITE_BYPASS_AZURE_AUTH=true
VITE_USE_MOCKS=true

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_API_TIMEOUT=30000

# Azure Services
AZURE_OPENAI_ENDPOINT=https://ces-openai-20250609.openai.azure.com
AZURE_OPENAI_API_KEY=your_openai_api_key_here
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Database
VITE_SQL_SERVER=sqltbwaprojectscoutserver.database.windows.net
VITE_SQL_DATABASE=SQL-TBWA-ProjectScout-Reporting-Prod
VITE_SQL_USERNAME=your_sql_username
VITE_SQL_PASSWORD=your_sql_password

# Azure Databricks
DATABRICKS_WORKSPACE_URL=https://adb-2769038304082127.7.azuredatabricks.net
DATABRICKS_WORKSPACE_NAME=tbwa-juicer-databricks
DATABRICKS_TOKEN=your_databricks_token

# Storage
AZURE_STORAGE_ACCOUNT=projectscoutdata
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string

# Development
VITE_DEV_MODE=true
VITE_DEBUG=true
EOF

# .env.production  
cat > .env.production << 'EOF'
# Scout Analytics Production Environment

NODE_ENV=production
VITE_APP_TITLE=Scout Analytics Dashboard
VITE_APP_VERSION=3.0.0
VITE_BYPASS_AZURE_AUTH=true
VITE_USE_MOCKS=true

# Production API
VITE_API_BASE_URL=https://white-cliff-0f5160b0f.2.azurestaticapps.net/api/v1
VITE_API_TIMEOUT=10000

# Azure OpenAI (Production)
AZURE_OPENAI_ENDPOINT=https://ces-openai-20250609.openai.azure.com
AZURE_OPENAI_API_KEY=31119320b14e4ff4bccefa768f4adaa8
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Production Database
VITE_SQL_SERVER=sqltbwaprojectscoutserver.database.windows.net
VITE_SQL_DATABASE=SQL-TBWA-ProjectScout-Reporting-Prod

# Databricks Production
DATABRICKS_WORKSPACE_URL=https://adb-2769038304082127.7.azuredatabricks.net
DATABRICKS_WORKSPACE_NAME=tbwa-juicer-databricks

# Production Settings
VITE_DEV_MODE=false
VITE_DEBUG=false
EOF

# 2. Fix package.json scripts
echo "📦 Fixing package.json scripts..."
cat > package_scripts.json << 'EOF'
{
  "scripts": {
    "dev": "vite --host",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\"",
    "build": "tsc && vite build",
    "build:production": "NODE_ENV=production tsc && vite build --mode production",
    "preview": "vite preview --host",
    "server": "cd server && npm run dev",
    "setup:bypass": "echo 'VITE_BYPASS_AZURE_AUTH=true' > .env.local",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "clean": "rm -rf dist node_modules/.vite",
    "clean:install": "npm run clean && npm install --legacy-peer-deps",
    "deploy:azure": "npm run build:production && swa deploy"
  }
}
EOF

# Apply package.json script fixes
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const scripts = JSON.parse(fs.readFileSync('package_scripts.json', 'utf8')).scripts;
pkg.scripts = { ...pkg.scripts, ...scripts };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Package.json scripts updated');
"

# 3. Create Azure Static Web Apps configuration
echo "☁️ Creating Azure Static Web Apps configuration..."
cat > staticwebapp.config.json << 'EOF'
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": [
      "/assets/*", 
      "/api/*", 
      "*.{css,scss,sass,js,ts,tsx,jsx,json,ico,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot,map}"
    ]
  },
  "mimeTypes": {
    ".js": "application/javascript",
    ".mjs": "application/javascript", 
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".map": "application/json"
  },
  "globalHeaders": {
    "Cache-Control": "public, max-age=31536000, immutable"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
EOF

# 4. Fix Vite configuration
echo "⚡ Creating optimized Vite configuration..."
cat > vite.config.ts << 'EOF'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        // Fix React refresh issues
        fastRefresh: true,
        babel: {
          plugins: [
            // Fix React context warnings
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      })
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
          require('tailwindcss'),
          require('autoprefixer')
        ]
      }
    },
    
    // Environment variable prefix
    envPrefix: ['VITE_'],
    
    // Logging
    logLevel: mode === 'development' ? 'info' : 'warn'
  }
})
EOF

# 5. Create TypeScript configuration fixes
echo "📝 Fixing TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "allowJs": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    },
    
    /* Additional options */
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*",
    "src/**/*.tsx",
    "src/**/*.ts",
    "vite.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "coverage"
  ],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
EOF

# 6. Create ESLint configuration
echo "🔍 Setting up ESLint configuration..."
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime"
  ],
  "ignorePatterns": [
    "dist",
    ".eslintrc.cjs",
    "node_modules",
    "coverage"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "react-refresh",
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
EOF

# 7. Create Prettier configuration
echo "💅 Setting up Prettier configuration..."
cat > .prettierrc << 'EOF'
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "quoteProps": "as-needed"
}
EOF

# 8. Create .gitignore
echo "📁 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist/
build/
*.local

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs/
*.log

# Coverage
coverage/
*.lcov

# Cache
.cache/
.parcel-cache/
.npm/
.eslintcache
.stylelintcache

# Temporary files
*.tmp
*.temp

# OS files
Thumbs.db
.DS_Store

# Azure
.azure/

# Database
*.db
*.sqlite

# Testing
test-results/
playwright-report/
playwright/.cache/
EOF

# 9. Install or update dependencies with proper flags
echo "📦 Installing/updating dependencies..."
npm install --legacy-peer-deps --no-optional

# 10. Clear caches and rebuild
echo "🧹 Clearing caches and rebuilding..."
npm cache clean --force
rm -rf node_modules/.vite
rm -rf dist

# Build to test
echo "🏗️ Testing build process..."
npm run build

echo ""
echo "✅ All environment and configuration fixes applied!"
echo ""
echo "🚀 Next steps:"
echo "1. Review and update .env files with your actual credentials"
echo "2. Test the application locally: npm run dev"
echo "3. Test the build process: npm run build"
echo "4. Deploy to Azure: npm run deploy:azure"
echo ""
echo "🔧 If you encounter issues:"
echo "- Check the browser console for runtime errors"
echo "- Review GitHub Actions logs for deployment issues"
echo "- Verify all environment variables are correctly set"
echo "- Ensure Azure services are properly configured"