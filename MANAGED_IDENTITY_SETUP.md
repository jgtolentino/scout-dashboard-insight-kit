# Managed Identity Setup Guide

This guide walks you through setting up Azure Managed Identity for production deployment, eliminating the need for connection strings and secrets.

## Overview

Managed Identity provides Azure services with an automatically managed identity in Azure AD. This eliminates the need to store credentials in your code or configuration.

## Benefits

- **No Secrets**: No connection strings or keys in your configuration
- **Automatic Rotation**: Azure handles credential rotation automatically
- **Least Privilege**: Grant only the permissions your app needs
- **Audit Trail**: All access is logged and auditable

## Setup Steps

### 1. Create User-Assigned Managed Identity

```bash
# Create the managed identity
az identity create \
  --name "scout-dashboard-identity" \
  --resource-group "RG-TBWA-ProjectScout-Data"

# Get the identity details
IDENTITY_ID=$(az identity show \
  --name "scout-dashboard-identity" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --query id -o tsv)

IDENTITY_CLIENT_ID=$(az identity show \
  --name "scout-dashboard-identity" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --query clientId -o tsv)

echo "Identity ID: $IDENTITY_ID"
echo "Client ID: $IDENTITY_CLIENT_ID"
```

### 2. Assign Identity to App Service

```bash
# Assign the managed identity to your App Service
az webapp identity assign \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --identities $IDENTITY_ID
```

### 3. Grant Storage Permissions

```bash
# Get storage account resource ID
STORAGE_ID=$(az storage account show \
  --name "projectscoutdata" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --query id -o tsv)

# Grant Storage Blob Data Contributor role
az role assignment create \
  --assignee $IDENTITY_CLIENT_ID \
  --role "Storage Blob Data Contributor" \
  --scope $STORAGE_ID

# Optional: Grant additional roles if needed
# Storage Blob Data Reader (read-only access)
# Storage Blob Data Owner (full access including ACLs)
```

### 4. Update App Service Configuration

```bash
# Set environment variables for Managed Identity
az webapp config appsettings set \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --settings \
    VITE_USE_MANAGED_IDENTITY=true \
    VITE_AZURE_CLIENT_ID=$IDENTITY_CLIENT_ID \
    VITE_STORAGE_ACCOUNT=projectscoutdata
```

### 5. Remove Connection String (Optional)

Once Managed Identity is working, you can remove the connection string:

```bash
# Remove the connection string setting
az webapp config appsettings delete \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data" \
  --setting-names VITE_STORAGE_CONNECTION_STRING
```

## Local Development

For local development, you can still use the connection string approach or use Azure CLI authentication:

### Option 1: Keep Connection String for Local Dev

In your `.env.local`:
```dotenv
VITE_USE_MANAGED_IDENTITY=false
VITE_STORAGE_CONNECTION_STRING="your-connection-string"
```

### Option 2: Use Azure CLI for Local Dev

```bash
# Login with Azure CLI
az login

# Set environment for local development
export VITE_USE_MANAGED_IDENTITY=true
export VITE_STORAGE_ACCOUNT=projectscoutdata
```

## Verification

### Test the Setup

1. **Deploy your app** with the new configuration
2. **Check the logs** for successful authentication:
   ```bash
   az webapp log tail --name "scout-analytics-dashboard" --resource-group "RG-TBWA-ProjectScout-Data"
   ```
3. **Test storage operations** through your app's `/azure-storage` demo page

### Expected Log Messages

Look for these messages in your app logs:
- `🔐 Initializing Azure Storage with Managed Identity...`
- `✅ Azure Storage initialized with Managed Identity`

### Troubleshooting

**Common Issues:**

1. **"Authentication failed"**
   - Verify the managed identity is assigned to the App Service
   - Check that the role assignment was successful
   - Ensure the client ID is correct

2. **"Access denied"**
   - Verify the role assignment scope (should be the storage account)
   - Check that the role is "Storage Blob Data Contributor" or higher

3. **"Identity not found"**
   - Ensure the managed identity exists in the same tenant
   - Verify the client ID in your app configuration

**Debug Commands:**

```bash
# Check role assignments
az role assignment list --assignee $IDENTITY_CLIENT_ID

# Verify App Service identity
az webapp identity show \
  --name "scout-analytics-dashboard" \
  --resource-group "RG-TBWA-ProjectScout-Data"

# Check storage account permissions
az storage account show \
  --name "projectscoutdata" \
  --resource-group "RG-TBWA-ProjectScout-Data"
```

## Security Best Practices

1. **Least Privilege**: Only grant the minimum required permissions
2. **Scope Properly**: Assign roles at the resource level, not subscription level
3. **Monitor Access**: Use Azure Monitor to track storage access
4. **Regular Audits**: Review role assignments periodically

## Role Permissions

| Role | Permissions | Use Case |
|------|-------------|----------|
| Storage Blob Data Reader | Read blobs and containers | Read-only access |
| Storage Blob Data Contributor | Read, write, delete blobs | Full blob operations |
| Storage Blob Data Owner | Full access including ACLs | Administrative access |

## Migration Checklist

- [ ] Create User-Assigned Managed Identity
- [ ] Assign identity to App Service
- [ ] Grant storage permissions
- [ ] Update App Service configuration
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Verify functionality
- [ ] Remove connection string (optional)
- [ ] Update documentation
- [ ] Train team on new authentication method

## Additional Resources

- [Azure Managed Identity Documentation](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/)
- [Azure Storage RBAC Roles](https://docs.microsoft.com/en-us/azure/storage/common/storage-auth-aad-rbac-portal)
- [DefaultAzureCredential Documentation](https://docs.microsoft.com/en-us/dotnet/api/azure.identity.defaultazurecredential)
