#!/bin/bash

# AdsBot Deployment Script for TBWA Project Scout
# This script sets up and deploys the AI-powered marketing dashboard

set -e

echo "🚀 AdsBot Deployment for TBWA Project Scout"
echo "==========================================="

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI is not installed"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    echo "✅ All prerequisites met"
}

# Create project structure
create_project_structure() {
    echo "📁 Creating project structure..."
    
    mkdir -p adsbot-dashboard/{src,public,components,pages,api,agents,styles,utils,hooks}
    mkdir -p adsbot-dashboard/src/{components,pages,hooks,utils,services}
    mkdir -p adsbot-dashboard/public/assets
    
    cd adsbot-dashboard
}

# Initialize package.json
init_project() {
    echo "📦 Initializing project..."
    
    cat > package.json << 'EOF'
{
  "name": "adsbot-tbwa-dashboard",
  "version": "1.0.0",
  "description": "AI-powered marketing intelligence dashboard for TBWA Project Scout",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "analyze": "ANALYZE=true next build",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "recharts": "^2.10.3",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.13.4",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^10.16.16",
    "openai": "^4.24.1",
    "zod": "^3.22.4",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "@typescript-eslint/parser": "^6.14.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0"
  }
}
EOF

    # Install dependencies
    echo "📥 Installing dependencies..."
    npm install
}

# Create TypeScript config
create_tsconfig() {
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
}

# Create Next.js config
create_nextconfig() {
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'sql-tbwa-projectscout-prod.database.windows.net'],
  },
  env: {
    AZURE_SQL_SERVER: process.env.AZURE_SQL_SERVER,
    AZURE_SQL_DATABASE: process.env.AZURE_SQL_DATABASE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig
EOF
}

# Create Tailwind config
create_tailwind_config() {
    cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          850: '#1a1a2e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

export default config
EOF

    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
}

# Create main layout and pages
create_app_structure() {
    echo "🎨 Creating app structure..."
    
    # Create app directory structure
    mkdir -p src/app/{api,dashboard,ai}
    
    # Create layout
    cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AdsBot - TBWA Project Scout Dashboard',
  description: 'AI-powered marketing intelligence dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
EOF

    # Create globals.css
    cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer components {
  .dashboard-card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
  
  .metric-value {
    @apply text-3xl font-bold text-gray-900;
  }
  
  .metric-label {
    @apply text-sm text-gray-500 uppercase tracking-wide;
  }
}
EOF
}

# Create environment template
create_env_template() {
    cat > .env.example << 'EOF'
# Azure SQL Database
AZURE_SQL_SERVER=sql-tbwa-projectscout-prod.database.windows.net
AZURE_SQL_DATABASE=SQL-TBWA-ProjectScout-Reporting-Prod
AZURE_SQL_USERNAME=
AZURE_SQL_PASSWORD=

# OpenAI API for ScoutBot
OPENAI_API_KEY=

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Vercel (auto-populated during deployment)
VERCEL_URL=
EOF
}

# Create Vercel configuration
create_vercel_config() {
    cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["sin1"],
  "env": {
    "AZURE_SQL_SERVER": "@azure-sql-server",
    "AZURE_SQL_DATABASE": "@azure-sql-database",
    "AZURE_SQL_USERNAME": "@azure-sql-username",
    "AZURE_SQL_PASSWORD": "@azure-sql-password",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
EOF
}

# Deploy to Vercel
deploy_to_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    # Set up Vercel project
    vercel link --yes
    
    # Set environment variables
    echo "Setting environment variables..."
    vercel env add AZURE_SQL_SERVER production
    vercel env add AZURE_SQL_DATABASE production
    vercel env add AZURE_SQL_USERNAME production
    vercel env add AZURE_SQL_PASSWORD production
    vercel env add OPENAI_API_KEY production
    
    # Deploy
    vercel --prod
}

# Main execution
main() {
    check_prerequisites
    create_project_structure
    init_project
    create_tsconfig
    create_nextconfig
    create_tailwind_config
    create_app_structure
    create_env_template
    create_vercel_config
    
    echo ""
    echo "✅ AdsBot project structure created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.example to .env.local and fill in your credentials"
    echo "2. Run 'npm run dev' to start development server"
    echo "3. Run './deploy-adsbot.sh deploy' to deploy to Vercel"
    echo ""
    echo "📁 Project location: $(pwd)"
}

# Handle command line arguments
if [ "$1" == "deploy" ]; then
    cd adsbot-dashboard
    deploy_to_vercel
else
    main
fi
EOF

chmod +x deploy-adsbot.sh