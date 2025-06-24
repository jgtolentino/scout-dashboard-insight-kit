# 🤖 Codex Integration Guide

This document provides instructions for setting up the Scout Analytics Dashboard in a Codex environment.

## 📋 Prerequisites

- GitHub repository with the Scout Analytics codebase
- Azure OpenAI access (already configured)
- Azure SQL Database (already configured)
- Azure Databricks workspace (already configured)

## 🚀 Quick Setup

### 1. Automatic Setup (Recommended)

The repository includes a `.codexenv.yaml` file that automatically configures the Codex environment:

```bash
# Simply point Codex to this repository - no manual UI setup needed!
# The .codexenv.yaml file will auto-load all configuration
```

### 2. Manual Verification

If you want to verify the setup locally first:

```bash
# Run the setup script
./setup-codex-env.sh
```

## 📁 Environment Files

### `.codexenv.yaml` (Committed to repo)
- **Purpose**: Codex environment configuration
- **Contains**: Environment variables, setup scripts, domain permissions
- **Status**: ✅ Already configured with production values

### `.env.local` (Local development only)
- **Purpose**: Local development environment
- **Contains**: Same variables as `.codexenv.yaml` for local parity
- **Status**: ⚠️ Update with your actual credentials (don't commit!)

## 🔧 Configured Services

### Azure OpenAI
- **Endpoint**: `https://ces-openai-20250609.openai.azure.com`
- **Deployment**: `gpt-4`
- **Purpose**: Powers ScoutBot AI assistant

### Azure SQL Database
- **Server**: `sqltbwaprojectscoutserver.database.windows.net`
- **Database**: `SQL-TBWA-ProjectScout-Reporting-Prod`
- **Purpose**: Production data storage

### Azure Databricks
- **Workspace**: `https://adb-2769038304082127.7.azuredatabricks.net`
- **Name**: `tbwa-juicer-databricks`
- **Purpose**: Data processing and ML models

### Azure Storage
- **Account**: `projectscoutdata`
- **Purpose**: File storage and data lake

## 🌐 Allowed Domains

The Codex environment has internet access to:
- `openai.com` - OpenAI API
- `azure.com` - Azure services
- `azurestaticapps.net` - Deployment platform
- `databricks.net` - Databricks workspace
- `windows.net` - Azure SQL Database
- `githubusercontent.com` - GitHub assets

## 📝 Available Commands

Once the environment is set up, you can use these commands:

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run type-check       # TypeScript type checking

# Deployment
npm run deploy:azure     # Deploy to Azure Static Web Apps

# Utilities
npm run lint             # Code linting
npm run format           # Code formatting
npm run clean            # Clean build artifacts
```

## 🚦 Feature Flags

The environment includes these feature flags for advanced functionality:

- `VITE_REAL_TIME_STREAMING=true` - Real-time data streaming
- `VITE_ADVANCED_ANALYTICS=true` - Advanced analytics features
- `VITE_ML_PREDICTIONS=true` - Machine learning predictions
- `VITE_BYPASS_AZURE_AUTH=true` - Development auth bypass

## 🔗 URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://white-cliff-0f5160b0f.2.azurestaticapps.net`

## 🛠 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   npm run clean
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Development Server Won't Start**
   ```bash
   # Check if port 3000 is available
   lsof -ti:3000 | xargs kill -9
   npm run dev
   ```

3. **TypeScript Errors**
   ```bash
   npm run type-check
   # Fix any type errors shown
   ```

### Environment Variables Missing

If you see errors about missing environment variables:

1. Check that `.env.local` exists and has the correct values
2. Verify `.codexenv.yaml` is in the repo root
3. Restart the Codex environment

## 📞 Support

For issues specific to:
- **Codex Environment**: Contact Codex support
- **Azure Services**: Check Azure portal logs
- **Application Code**: Review the main README.md

## 🎯 Next Steps

1. ✅ Files are ready - `.codexenv.yaml` and `.env.local` created
2. ✅ Setup script tested and working
3. 📤 Commit `.codexenv.yaml` to repository
4. 🔑 Update actual credentials in `.env.local`
5. 🚀 Point Codex to this repository
6. ⚡ Environment will auto-configure!

---

**Last Updated**: January 2025  
**Environment Version**: 1.0  
**Scout Analytics Version**: 3.0.0