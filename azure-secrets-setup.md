# Azure Credentials Setup for GitHub Secrets

## Complete Azure Infrastructure Configuration

Based on the existing project infrastructure, here are the **actual values** for setting up GitHub Secrets:

### 🔑 **Required GitHub Secrets**

#### 1. **Azure Subscription & Authentication**
```
AZURE_SUBSCRIPTION_ID = c03c092c-443c-4f25-9efe-33f092621251
AZURE_TENANT_ID = [TBWA Azure AD Tenant ID - needs to be obtained]
AZURE_CLIENT_ID = [Service Principal Application ID - needs to be created]
AZURE_CLIENT_SECRET = [Service Principal Secret - needs to be created]
```

#### 2. **Azure Resource Groups** (Choose based on deployment target)
```
AZURE_RESOURCE_GROUP = RG-TBWA-ProjectScout-Compute
```
*Alternative options:*
- `RG-TBWA-ProjectScout-Data` (for data services)
- `scout-dashboard-rg` (for dashboard-specific deployment)

#### 3. **Azure Container Registry**
```
ACR_NAME = projectscoutacr
ACR_REGISTRY = projectscoutacr.azurecr.io
ACR_PASSWORD = [ACR Admin Password - obtain from Azure portal]
```

#### 4. **Additional Configuration**
```
AZURE_LOCATION = eastus
DATABASE_URL = [Connection string to SQL Database or use SQLite for testing]
AZURE_STACK_NAME = AzureStack
```

### 🏗️ **Existing Azure Infrastructure**

#### **Live Services**
- **API Backend**: https://scout-analytics-api.azurewebsites.net
- **Dashboard**: https://scout-analytics-dashboard.azurewebsites.net
- **SQL Server**: sqltbwaprojectscoutserver.database.windows.net
- **Storage Account**: projectscoutdata
- **Key Vault**: kv-projectscout-prod

#### **Azure OpenAI Integration**
- **Service**: ces-openai-20250609
- **Endpoint**: https://ces-openai-20250609.openai.azure.com/
- **API Key**: 31119320b14e4ff4bccefa768f4adaa8

### 📋 **Setup Instructions**

#### **Step 1: Create Service Principal**
```bash
# Login to Azure CLI
az login

# Set subscription
az account set --subscription c03c092c-443c-4f25-9efe-33f092621251

# Create service principal
az ad sp create-for-rbac --name "scout-dashboard-ci-cd" \
  --role contributor \
  --scopes /subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/RG-TBWA-ProjectScout-Compute \
  --sdk-auth
```

This will output JSON with the required credentials:
```json
{
  "clientId": "[Use for AZURE_CLIENT_ID]",
  "clientSecret": "[Use for AZURE_CLIENT_SECRET]",
  "subscriptionId": "c03c092c-443c-4f25-9efe-33f092621251",
  "tenantId": "[Use for AZURE_TENANT_ID]"
}
```

#### **Step 2: Create/Configure Azure Container Registry**
```bash
# Create ACR if it doesn't exist
az acr create --resource-group RG-TBWA-ProjectScout-Compute \
  --name projectscoutacr --sku Basic --location eastus

# Enable admin user
az acr update --name projectscoutacr --admin-enabled true

# Get ACR password
az acr credential show --name projectscoutacr --query passwords[0].value -o tsv
```

#### **Step 3: Set GitHub Secrets**

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CLIENT_ID` | From service principal JSON |
| `AZURE_CLIENT_SECRET` | From service principal JSON |
| `AZURE_TENANT_ID` | From service principal JSON |
| `AZURE_SUBSCRIPTION_ID` | `c03c092c-443c-4f25-9efe-33f092621251` |
| `AZURE_RESOURCE_GROUP` | `RG-TBWA-ProjectScout-Compute` |
| `ACR_NAME` | `projectscoutacr` |
| `ACR_PASSWORD` | From ACR credential command |
| `DATABASE_URL` | SQL connection string or SQLite for testing |

### 🚀 **Deployment Commands**

#### **Local Testing**
```bash
# Set environment variables
export AZURE_CLIENT_ID="[your-client-id]"
export AZURE_CLIENT_SECRET="[your-client-secret]"
export AZURE_TENANT_ID="[your-tenant-id]"
export AZURE_SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
export AZURE_RESOURCE_GROUP="RG-TBWA-ProjectScout-Compute"
export ACR_NAME="projectscoutacr"

# Run deployment
./deploy-azure-stack.sh
```

#### **Docker Compose Testing**
```bash
# Development
docker-compose up

# Production-like testing
docker-compose --profile production up app
```

### 🔒 **Security Notes**

1. **Service Principal Permissions**: The service principal should have minimum required permissions (Contributor role on the resource group)
2. **Secret Rotation**: Regularly rotate the client secret and ACR password
3. **Network Security**: Consider using private endpoints for production deployment
4. **Key Vault**: Store sensitive production secrets in Azure Key Vault

### 📊 **Resource Allocation**

Based on existing infrastructure:
- **CPU**: 2 cores per container (API and App)
- **Memory**: 4GB per container
- **Storage**: Shared volume for SQLite or connection to SQL Database
- **Networking**: Public endpoints with custom DNS names

This configuration leverages the existing TBWA Project Scout Azure infrastructure and provides a complete production-ready deployment pipeline.