# 🏗️ Scout Analytics Dashboard v3.0 - Monorepo Structure

## 📁 Complete Project Structure for Deployment

```
scout-dashboard-insight-kit/
├── 🎨 Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                  # AI components
│   │   │   │   └── ScoutBot.tsx    # Renamed from RetailBot
│   │   │   ├── auth/                # Authentication
│   │   │   │   └── MockLoginSelector.tsx  # NEW: Bypass mode login
│   │   │   ├── analytics/           # Analytics widgets
│   │   │   ├── charts/              # Data visualizations
│   │   │   ├── maps/                # Geographic components
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── lib/
│   │   │   ├── auth/
│   │   │   │   └── authFallback.ts # NEW: Mock auth system
│   │   │   └── azure/
│   │   │       └── azureBypass.ts  # NEW: Direct API calls
│   │   ├── pages/                   # Route components
│   │   │   ├── Overview.tsx
│   │   │   ├── ProductMix.tsx
│   │   │   ├── TransactionTrends.tsx
│   │   │   ├── ConsumerBehavior.tsx
│   │   │   ├── RegionalAnalytics.tsx
│   │   │   └── ScoutBotPage.tsx    # Renamed from RetailBotInsights
│   │   ├── services/                # API services
│   │   │   ├── apiService.ts
│   │   │   └── azureStorageService.ts
│   │   ├── stores/                  # State management
│   │   │   └── filterStore.ts      # Zustand store
│   │   └── types/                   # TypeScript types
│   ├── public/                      # Static assets
│   ├── index.html                   # Entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.ts              # Vite configuration
│   └── tsconfig.json               # TypeScript config
│
├── 🖥️ Backend (Node.js + Express + TypeScript)
│   └── backend/
│       ├── src/
│       │   ├── config/             # Configuration
│       │   │   └── index.js        # Centralized config
│       │   ├── services/           # Business logic
│       │   │   └── medallionAPI.ts # Azure integration
│       │   └── routes/             # API endpoints
│       ├── package.json            # Backend dependencies
│       └── tsconfig.json          # TypeScript config
│
├── 🔧 Scripts (Automation & Setup)
│   └── scripts/
│       ├── setup-azure-dev.sh               # Azure CLI setup
│       ├── setup-databricks.sh              # Databricks CLI
│       ├── create-app-registration.sh       # App registration
│       ├── add-tbwa-team-roles.sh          # Team access
│       └── manual-app-registration-instructions.md  # Manual guide
│
├── 🚀 Deployment Configurations
│   ├── vercel.json                 # Vercel deployment
│   ├── netlify.toml                # Netlify deployment
│   ├── staticwebapp.config.json    # Azure Static Web Apps
│   ├── azure-pipelines.yml         # Azure DevOps CI/CD
│   └── .github/
│       └── workflows/
│           └── deploy.yml          # GitHub Actions
│
├── 📊 Data Pipeline
│   ├── medallion-config.yaml       # Medallion architecture
│   └── pipelines/
│       └── medallion-etl-pipeline.py  # ETL processes
│
├── 🧪 Testing
│   ├── e2e/                        # Playwright E2E tests
│   ├── src/test/                   # Unit tests
│   └── playwright.config.ts        # Playwright config
│
├── 📝 Environment & Configuration
│   ├── .env.local                  # Current environment (bypass mode)
│   ├── .env.bypass.template        # NEW: Bypass mode template
│   ├── .env.production             # Production template
│   └── credentials.json            # Structured credentials
│
└── 📚 Documentation
    ├── README.md                   # Main documentation
    ├── DEPLOYMENT_READY.md         # NEW: Deployment guide
    ├── MEDALLION_ARCHITECTURE.md   # Data architecture
    └── PRODUCTION_DEPLOYMENT_GUIDE.md  # Production guide
```

## 🎯 Key Files for Monorepo Deployment

### 🚀 **Immediate Deployment (Bypass Mode)**
```bash
# Core files that enable bypass mode:
src/lib/auth/authFallback.ts        # Mock authentication system
src/lib/azure/azureBypass.ts        # Direct Azure API calls
src/components/auth/MockLoginSelector.tsx  # Dev login UI
.env.bypass.template                # Ready-to-use environment
```

### 🔐 **Production Mode (Future)**
```bash
# Files ready for Azure AD integration:
scripts/create-app-registration.sh   # App registration script
scripts/add-tbwa-team-roles.sh      # Team access script
backend/src/services/medallionAPI.ts # Toggleable auth
```

## 📦 Deployment Commands

### **Development**
```bash
# Quick start with bypass mode
npm run setup:bypass
npm run dev:full

# Individual services
npm run dev          # Frontend only (port 3000)
npm run server       # Backend only (port 3001)
```

### **Production Build**
```bash
# Build for deployment
npm run build        # Frontend build
npm run build:azure  # Azure-optimized build
npm run build:vercel # Vercel-optimized build
```

### **Deployment Platforms**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Azure Static Web Apps
swa deploy

# Docker
docker build -t scout-dashboard .
docker run -p 3000:3000 scout-dashboard
```

## 🔄 Environment Modes

### **Bypass Mode (Current)**
```env
VITE_BYPASS_AZURE_AUTH=true
VITE_USE_MOCKS=true
```
- ✅ No Azure App Registration needed
- ✅ Mock users available
- ✅ Direct API authentication

### **Production Mode**
```env
VITE_BYPASS_AZURE_AUTH=false
VITE_USE_MOCKS=false
```
- 🔐 Real Azure AD authentication
- 🔐 Managed identities
- 🔐 Full RBAC support

## 🏗️ Monorepo Benefits

1. **Single Repository**: All code in one place
2. **Shared Dependencies**: Common packages installed once
3. **Unified Deployment**: Single build process
4. **Consistent Configuration**: Shared environment variables
5. **Cross-Component Testing**: Test full stack together

## 🎯 Current Status

| Component | Location | Status |
|-----------|----------|--------|
| Frontend | `/src` | ✅ Ready |
| Backend | `/backend` | ✅ Ready |
| Scripts | `/scripts` | ✅ Ready |
| Auth Bypass | `/src/lib/auth` | ✅ Ready |
| Mock Users | 4 TBWA members | ✅ Ready |
| Deployment | Multiple platforms | ✅ Ready |

## 🚀 Next Steps

1. **Start Development**
   ```bash
   npm run dev:full
   ```

2. **Test Mock Authentication**
   - Use MockLoginSelector
   - Switch between team members

3. **Deploy to Production**
   ```bash
   npm run build
   # Deploy to your platform
   ```

4. **Enable Real Auth (When Ready)**
   - Create Azure App Registration
   - Update .env.local
   - Toggle VITE_BYPASS_AZURE_AUTH=false