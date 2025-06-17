# 🚀 Scout Dashboard v4.0 - One-Click Vercel Deployment Guide

**Status: ✅ READY FOR ONE-CLICK VERCEL DEPLOYMENT**

---

## 🎯 Quick Start - One-Click Deployment

### Step 1: Import GitHub Repository to Vercel
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Import Project"**
3. **Select GitHub repository**: `scout-mvp-v1`
4. **Choose branch**: `main`
5. **Vercel will auto-detect**: Next.js framework ✅

### Step 2: Configure Environment Variables
In **Vercel Project → Settings → Environment Variables**, add these exact keys:

```bash
# Database Connection (KeyKey will inject at build time)
DATABASE_URL=postgresql://scout_admin:R@nd0mPA$$2025!@sqltbwaprojectscoutserver.postgres.database.azure.com:5432/scout?sslmode=require

# Azure Configuration
AZURE_RESOURCE_GROUP=RG-TBWA-ProjectScout-Data
AZURE_SQL_SERVER=sqltbwaprojectscoutserver
AZURE_KEY_VAULT=kv-projectscout-prod
AZURE_STORAGE_ACCOUNT=projectscoutdata

# Data Layer (if using)
NEXT_PUBLIC_DAL_HOST=your-dal-host
NEXT_PUBLIC_DAL_TOKEN=your-dal-token

# AI Services
OPENAI_API_KEY=your-openai-key

# Databricks (if using)
DATABRICKS_HOST=your-databricks-host
DATABRICKS_TOKEN=your-databricks-token


# Application
NEXT_PUBLIC_SITE_NAME=Scout Analytics Dashboard v4.0
NEXT_PUBLIC_VERSION=4.0.0
```

### Step 3: Deploy
**Option A: Via Vercel Dashboard**
- Click **"Deploy"** in Vercel dashboard
- Vercel will automatically build and deploy

**Option B: Via CLI**
```bash
npx vercel --prod
```

**Option C: Via Git Push**
```bash
git push origin main
# GitHub Actions will trigger Vercel deployment
```

---

## 📊 Expected Results

### Deployment URLs
- **Production**: `https://scout-mvp-v1.vercel.app`
- **Preview**: `https://scout-mvp-v1-git-main.vercel.app`

### Build Process
1. **Install dependencies**: `npm ci`
2. **KeyKey secret injection**: DATABASE_URL from Azure Key Vault
3. **Next.js build**: `npm run build`
4. **Deploy to Vercel**: Automatic deployment
5. **Live with Azure data**: Real-time dashboard

---

## 🔍 Verification & Testing

### Smoke Test Commands
```bash
# Check if site is live
curl -I https://scout-mvp-v1.vercel.app

# Test API endpoints
curl https://scout-mvp-v1.vercel.app/api/kpi/overview
curl https://scout-mvp-v1.vercel.app/api/health

# Check database connection
curl https://scout-mvp-v1.vercel.app/api/db/status
```

### Expected API Responses
```json
// /api/kpi/overview
{
  "revenue": 1234567.89,
  "orders": 5432,
  "aov": 227.45,
  "timestamp": "2025-06-18T07:36:00Z"
}

// /api/health
{
  "status": "healthy",
  "database": "connected",
  "azure": "integrated",
  "version": "4.0.0"
}
```

---

## 🔧 Advanced Configuration

### Custom vercel.json (Already Included)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "env": {
    "DATABASE_URL": "@DATABASE_URL",
    "OPENAI_API_KEY": "@OPENAI_API_KEY"
  },
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### GitHub Actions Integration (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🎯 Production Checklist

### ✅ Pre-Deployment
- [x] GitHub repository: https://github.com/jgtolentino/scout-mvp-v1.git
- [x] Vercel configuration: `vercel.json` created
- [x] Environment variables: Documented and ready
- [x] Azure integration: KeyKey configured
- [x] Database connection: Tested with fallback password

### ✅ During Deployment
- [ ] Import repository to Vercel
- [ ] Configure environment variables
- [ ] Trigger deployment
- [ ] Monitor build logs
- [ ] Verify successful deployment

### ✅ Post-Deployment
- [ ] Test production URLs
- [ ] Verify API endpoints
- [ ] Check database connectivity
- [ ] Monitor performance metrics
- [ ] Set up monitoring alerts

---

## 🚨 Troubleshooting

### Common Issues & Solutions

**Build Fails - Missing Environment Variables**
```bash
# Solution: Add all required environment variables in Vercel dashboard
# Check: Project → Settings → Environment Variables
```

**Database Connection Fails**
```bash
# Solution: Verify DATABASE_URL format
# Check: Azure Key Vault has correct password
# Fallback: Use provided password R@nd0mPA$$2025!
```

**API Routes Return 500**
```bash
# Solution: Check Vercel function logs
# Check: Environment variables are properly set
# Verify: Database connection string is correct
```

**KeyKey Not Working**
```bash
# Solution: Ensure KeyKey agent is properly configured
# Check: agents/keykey/agent.yaml points to correct vault
# Verify: Azure permissions are set correctly
```

### Debug Commands
```bash
# Check Vercel deployment logs
vercel logs https://scout-mvp-v1.vercel.app

# Test local development
npm run dev
open http://localhost:3000

# Verify environment variables
vercel env ls
```

---

## 📈 Performance Optimization

### Vercel Configuration
- **Region**: `iad1` (East US) - Close to Azure resources
- **Function timeout**: 30 seconds for API routes
- **Auto-scaling**: Enabled by default
- **CDN**: Global edge network

### Database Optimization
- **Connection pooling**: Recommended for production
- **Query optimization**: Use indexes for dashboard queries
- **Caching**: Implement Redis for frequently accessed data

---

## 🎉 Success Criteria

### ✅ Deployment Success When:
- [ ] Vercel build completes without errors
- [ ] Production URL returns 200 status
- [ ] API endpoints return valid JSON
- [ ] Database queries execute successfully
- [ ] Dashboard loads with real Azure data

### 🚀 Production Ready When:
- [ ] All environment variables configured
- [ ] Database connection established
- [ ] API endpoints responding correctly
- [ ] Dashboard displays live data
- [ ] Performance metrics within targets
- [ ] Monitoring and alerts configured

---

## 🔗 Quick Links

### Deployment Resources
- **GitHub Repository**: https://github.com/jgtolentino/scout-mvp-v1
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Production URL**: https://scout-mvp-v1.vercel.app (after deployment)

### Documentation
- **Integration Guide**: `AZURE_INTEGRATION_COMPLETE.md`
- **CLI Commands**: `CLAUDE_CODE_CLI_HANDOFF.md`
- **Deployment Success**: `DEPLOYMENT_SUCCESS.md`

---

**🎯 Ready for One-Click Vercel Deployment!**

*Follow the steps above to deploy Scout Dashboard v4.0 with live Azure data in minutes.*

*Deployment guide created: June 18, 2025 at 7:36 AM Manila Time*  
*Repository: https://github.com/jgtolentino/scout-mvp-v1.git*  
*Status: READY FOR VERCEL DEPLOYMENT! 🚀*
