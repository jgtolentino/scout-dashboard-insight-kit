# Scout Analytics MVP - Azure Deployment Guide

## 🎯 Overview

This package contains everything needed to deploy the complete Scout Analytics MVP to Azure App Service, including:

- **Flask API Backend** with Azure OpenAI integration
- **React Dashboard Frontend** with AI-powered RetailBot
- **Real Philippine retail data** (18,000+ transactions)
- **Complete deployment automation**

## 📦 Package Contents

```
scout-analytics-mvp/
├── scout-analytics-api/          # Flask API backend
│   ├── src/                      # Source code
│   ├── requirements.txt          # Python dependencies
│   ├── app.py                    # Azure entry point
│   ├── Procfile                  # Azure process file
│   └── runtime.txt               # Python version
├── scout-analytics-dashboard/    # React frontend
│   ├── src/                      # Source code
│   ├── dist/                     # Built files (after npm run build)
│   └── package.json              # Node dependencies
├── deploy-api.sh                 # API deployment script
├── deploy-frontend.sh            # Frontend deployment script
├── deploy-complete.sh            # Complete deployment script
└── README-DEPLOYMENT.md          # This file
```

## 🚀 Quick Deployment

### Prerequisites

1. **Azure CLI installed** and authenticated
2. **Node.js 18+** installed
3. **Access to TBWA-ProjectScout-Prod subscription**

### One-Command Deployment

```bash
chmod +x deploy-complete.sh
./deploy-complete.sh
```

This will deploy both the API and frontend automatically.

## 🔧 Manual Deployment Steps

### Step 1: Deploy API Backend

```bash
chmod +x deploy-api.sh
./deploy-api.sh
```

**What this does:**
- Creates App Service Plan: `scout-api-plan`
- Creates Web App: `scout-analytics-api`
- Configures Azure OpenAI environment variables
- Enables CORS for frontend access
- Deploys Flask application code

### Step 2: Deploy Frontend Dashboard

```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

**What this does:**
- Creates/updates App Service Plan: `scout-dashboard-plan`
- Creates/updates Web App: `scout-analytics-dashboard`
- Builds React application
- Deploys static files to Azure

## 🌐 Deployed URLs

After successful deployment:

- **API Backend**: `https://scout-analytics-api.azurewebsites.net`
- **Dashboard Frontend**: `https://scout-analytics-dashboard.azurewebsites.net`

## 🧪 Testing Deployment

### API Endpoints

```bash
# Test basic API
curl https://scout-analytics-api.azurewebsites.net/api/transactions

# Test ScoutBot AI
curl -X POST https://scout-analytics-api.azurewebsites.net/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the top selling categories?"}'

# Test SQL execution
curl -X POST https://scout-analytics-api.azurewebsites.net/api/sql \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT COUNT(*) as total FROM transactions"}'
```

### Dashboard Features

Visit `https://scout-analytics-dashboard.azurewebsites.net` and test:

1. **Overview Page** - KPI cards and charts
2. **Transaction Trends** - Time series analysis
3. **Product Mix** - Category distribution
4. **Consumer Insights** - Demographics
5. **RetailBot & AdBot** - AI assistant chat

## 🔐 Environment Variables

The API deployment includes these Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY=31119320b14e4ff4bccefa768f4adaa8
AZURE_OPENAI_ENDPOINT=https://ces-openai-20250609.openai.azure.com/
AZURE_DEPLOYMENT_NAME=gpt-4
AZURE_API_VERSION=2024-02-15-preview
```

## 📊 Azure Resources Created

### Resource Groups
- `RG-TBWA-ProjectScout-Compute` (API backend)
- `scout-dashboard-rg` (Frontend dashboard)

### App Services
- `scout-analytics-api` (Python 3.11, B1 tier)
- `scout-analytics-dashboard` (Node 20-lts, B1 tier)

### App Service Plans
- `scout-api-plan` (Linux, B1)
- `scout-dashboard-plan` (Linux, B1)

## 🔄 Updates and Maintenance

### Updating API Code
```bash
cd scout-analytics-api
# Make your changes
./deploy-api.sh
```

### Updating Dashboard Code
```bash
cd scout-analytics-dashboard
# Make your changes
npm run build
./deploy-frontend.sh
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   az login
   az account set --subscription "c03c092c-443c-4f25-9efe-33f092621251"
   ```

2. **Build Failures**
   ```bash
   cd scout-analytics-dashboard
   npm install
   npm run build
   ```

3. **API Not Responding**
   - Check Azure App Service logs
   - Verify environment variables are set
   - Ensure CORS is enabled

### Viewing Logs

```bash
# API logs
az webapp log tail --name scout-analytics-api --resource-group RG-TBWA-ProjectScout-Compute

# Frontend logs
az webapp log tail --name scout-analytics-dashboard --resource-group scout-dashboard-rg
```

## 🎯 Features Deployed

### AI-Powered Analytics
- **ScoutBot Assistant** with natural language queries
- **Azure OpenAI integration** (GPT-4)
- **SQL query generation** from natural language
- **Philippine retail context** understanding

### Dashboard Capabilities
- **Real-time data visualization** with Recharts
- **Interactive drill-down** functionality
- **Global filtering** system
- **Mobile-responsive** design
- **Professional UI** with Tailwind CSS

### Data & API
- **18,000+ Philippine transactions**
- **RESTful API endpoints**
- **SQLite database** with retail schema
- **CORS-enabled** for frontend integration

## 📈 Cost Estimation

**Monthly Azure costs (approximate):**
- App Service Plan (B1): ~$13/month each
- Total estimated: ~$26/month for both services

## 🔗 Integration

The deployed services are fully integrated:
- Frontend automatically connects to API backend
- CORS configured for cross-origin requests
- Environment-based API URL configuration
- Production-ready build optimization

## ✅ Success Criteria

Deployment is successful when:
1. ✅ API responds at `/api/transactions`
2. ✅ ScoutBot AI responds at `/api/ask`
3. ✅ Dashboard loads and displays data
4. ✅ RetailBot chat interface works
5. ✅ All navigation and filtering functions

---

**🎉 Your Scout Analytics MVP is now live on Azure with full AI capabilities!**

