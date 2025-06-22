# Production Deployment Guide - Azure Storage with Managed Identity

This guide provides step-by-step instructions for deploying your Scout Analytics dashboard to production with secure Managed Identity authentication.

## 🚀 Quick Start

### For Immediate Production Deployment:

```bash
# Run the automated production deployment script
./scripts/deploy-production-managed-identity.sh
```

This script will:
- ✅ Create and configure Managed Identity
- ✅ Assign storage permissions
- ✅ Update App Service configuration
- ✅ Remove connection strings (zero-secrets deployment)
- ✅ Restart and verify the deployment

## 📋 Pre-Deployment Checklist

Before running the production deployment:

- [ ] **Azure CLI installed and authenticated** (`az login`)
- [ ] **Permissions to modify** App Service and create identities
- [ ] **Local development tested** with the setup script
- [ ] **Code deployed** to your App Service
- [ ] **Backup taken** of current App Service configuration

## 🔄 Deployment Process

### Step 1: Local Development Setup (Already Complete)
```bash
# This was completed with your setup script
./scripts/setup-azure-storage.sh
```

### Step 2: Production Deployment with Managed Identity
```bash
# Deploy to production with secure authentication
./scripts/deploy-production-managed-identity.sh
```

### Step 3: Verification
1. **Check App Service**: Visit `https://scout-analytics-dashboard.azurewebsites.net`
2. **Test Storage**: Navigate to `/azure-storage` endpoint
3. **Monitor Logs**: `az webapp log tail --name scout-analytics-dashboard --resource-group RG-TBWA-ProjectScout-Data`

## 🔐 Security Benefits of Managed Identity

| Feature | Connection String | Managed Identity |
|---------|------------------|------------------|
| **Secrets in Config** | ❌ Yes | ✅ No |
| **Automatic Rotation** | ❌ Manual | ✅ Automatic |
| **Audit Trail** | ⚠️ Limited | ✅ Complete |
| **Least Privilege** | ⚠️ Full Access | ✅ Scoped |
| **Zero Trust** | ❌ No | ✅ Yes |

## 📊 What Gets Configured

### App Service Settings (Production)
```bash
VITE_USE_MANAGED_IDENTITY=true
VITE_AZURE_CLIENT_ID=<managed-identity-client-id>
VITE_STORAGE_ACCOUNT=projectscoutdata
VITE_API_URL=https://scout-analytics-dashboard.azurewebsites.net
VITE_USE_MOCKS=false
VITE_DISABLE_AUTH=false
```

### Removed Settings (Security)
```bash
# These are removed in production for security
VITE_STORAGE_CONNECTION_STRING=<removed>
```

### Azure Resources Created
- **User-Assigned Managed Identity**: `scout-dashboard-identity`
- **Role Assignment**: `Storage Blob Data Contributor` on `projectscoutdata`
- **App Service Identity**: Linked to the managed identity

## 🔍 Verification Steps

### 1. Check Managed Identity
```bash
az identity show \
  --name "scout-dashboard-identity" \
  --resource-group "RG-TBWA-ProjectScout-Data"
```

### 2. Verify Role Assignments
```bash
IDENTITY_CLIENT_ID=$(az identity show \
  --name "scout-dashboard-identity" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --query clientId -o tsv)

az role assignment list --assignee $IDENTITY_CLIENT_ID
```

### 3. Test Application
```bash
# Check app health
curl -I https://scout-analytics-dashboard.azurewebsites.net

# Test storage endpoint
curl -I https://scout-analytics-dashboard.azurewebsites.net/azure-storage
```

### 4. Monitor Logs
```bash
az webapp log tail \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"
```

**Expected Log Messages:**
- `🔐 Initializing Azure Storage with Managed Identity...`
- `✅ Azure Storage initialized with Managed Identity`

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Authentication failed"
**Symptoms**: 401 errors when accessing storage
**Solutions**:
```bash
# Check if identity is assigned to App Service
az webapp identity show \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"

# Verify role assignment
az role assignment list --assignee $IDENTITY_CLIENT_ID
```

#### 2. "Access denied"
**Symptoms**: 403 errors on storage operations
**Solutions**:
```bash
# Re-assign storage role
az role assignment create \
  --assignee $IDENTITY_CLIENT_ID \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/<subscription-id>/resourceGroups/RG-TBWA-ProjectScout-Data/providers/Microsoft.Storage/storageAccounts/projectscoutdata"
```

#### 3. "App not starting"
**Symptoms**: App Service shows errors on startup
**Solutions**:
```bash
# Check configuration
az webapp config appsettings list \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"

# Restart app service
az webapp restart \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"
```

### Debug Commands

```bash
# Get all app settings
az webapp config appsettings list \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --output table

# Check identity details
az webapp identity show \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"

# List all role assignments for the identity
az role assignment list \
  --assignee $IDENTITY_CLIENT_ID \
  --output table
```

## 🔄 Rollback Plan

If you need to rollback to connection string authentication:

```bash
# Get the original connection string
AZ_STORAGE_CONN=$(az storage account show-connection-string \
  --name projectscoutdata \
  --resource-group RG-TBWA-ProjectScout-Data \
  --query connectionString -o tsv)

# Update app settings
az webapp config appsettings set \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --settings \
    VITE_USE_MANAGED_IDENTITY=false \
    VITE_STORAGE_CONNECTION_STRING="$AZ_STORAGE_CONN"

# Restart app
az webapp restart \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"
```

## 📈 Monitoring & Maintenance

### Regular Checks
- **Monthly**: Review role assignments and permissions
- **Quarterly**: Audit access logs and usage patterns
- **Annually**: Review and update security policies

### Monitoring Commands
```bash
# Check app health
az webapp show \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --query "state"

# Monitor storage usage
az storage account show-usage \
  --account-name "projectscoutdata"

# Check recent deployments
az webapp deployment list \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"
```

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ **App loads** at `https://scout-analytics-dashboard.azurewebsites.net`
- ✅ **Storage demo works** at `/azure-storage` endpoint
- ✅ **Logs show** Managed Identity initialization
- ✅ **No connection strings** in App Service configuration
- ✅ **Role assignments** are properly configured
- ✅ **All Azure services** (Storage, OpenAI, SQL) are accessible

## 📞 Support

If you encounter issues:

1. **Check the logs** using the monitoring commands above
2. **Verify configuration** with the debug commands
3. **Test locally** to isolate the issue
4. **Review the troubleshooting section** for common solutions

---

**🎉 Congratulations!** Your Scout Analytics dashboard is now deployed with enterprise-grade security using Azure Managed Identity!
