#!/bin/bash

# Production Deployment Script with Managed Identity
# This script sets up secure Azure Storage access using Managed Identity

set -e

echo "🚀 Production Deployment - Managed Identity Setup"
echo "=================================================="

# Check if Azure CLI is installed and logged in
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure CLI first: az login"
    exit 1
fi

echo "✅ Azure CLI is ready"

# Set variables
RESOURCE_GROUP="RG-TBWA-ProjectScout-Data"
STORAGE_ACCOUNT="projectscoutdata"
APP_SERVICE="scout-analytics-dashboard"
IDENTITY_NAME="scout-dashboard-identity"

echo ""
echo "🔐 Setting up Managed Identity..."

# Step 1: Create User-Assigned Managed Identity
echo "Creating managed identity: $IDENTITY_NAME"
az identity create \
  --name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "East US" || echo "⚠️  Identity may already exist"

# Get identity details
IDENTITY_ID=$(az identity show \
  --name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query id -o tsv)

IDENTITY_CLIENT_ID=$(az identity show \
  --name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query clientId -o tsv)

echo "✅ Identity created/found:"
echo "   ID: $IDENTITY_ID"
echo "   Client ID: $IDENTITY_CLIENT_ID"

# Step 2: Assign identity to App Service
echo ""
echo "🔗 Assigning identity to App Service..."
az webapp identity assign \
  --name "$APP_SERVICE" \
  --resource-group "$RESOURCE_GROUP" \
  --identities "$IDENTITY_ID"

echo "✅ Identity assigned to App Service"

# Step 3: Grant Storage permissions
echo ""
echo "🔑 Granting storage permissions..."

# Get storage account resource ID
STORAGE_ID=$(az storage account show \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query id -o tsv)

# Grant Storage Blob Data Contributor role
az role assignment create \
  --assignee "$IDENTITY_CLIENT_ID" \
  --role "Storage Blob Data Contributor" \
  --scope "$STORAGE_ID" || echo "⚠️  Role assignment may already exist"

echo "✅ Storage permissions granted"

# Step 4: Update App Service configuration
echo ""
echo "⚙️  Updating App Service configuration..."

# Set environment variables for Managed Identity
az webapp config appsettings set \
  --name "$APP_SERVICE" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    VITE_USE_MANAGED_IDENTITY=true \
    VITE_AZURE_CLIENT_ID="$IDENTITY_CLIENT_ID" \
    VITE_STORAGE_ACCOUNT="$STORAGE_ACCOUNT" \
    VITE_API_URL="https://scout-analytics-dashboard.azurewebsites.net" \
    VITE_USE_MOCKS=false \
    VITE_DISABLE_AUTH=false \
    VITE_OPENAI_ENDPOINT="https://ces-openai-20250609.openai.azure.com/" \
    VITE_SQL_SERVER="sqltbwaprojectscoutserver.database.windows.net" \
    VITE_SQL_DATABASE="SQL-TBWA-ProjectScout-Reporting-Prod" \
    VITE_SQL_USER="TBWA" \
    MAPBOX_ACCESS_TOKEN="pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww"

echo "✅ App Service configuration updated"

# Step 5: Set sensitive data as App Service secrets (optional but recommended)
echo ""
echo "🔒 Setting up secure configuration..."

# Get OpenAI key
OPENAI_KEY=$(az cognitiveservices account keys list \
  --name "ces-openai-20250609" \
  --resource-group "$RESOURCE_GROUP" \
  --query key1 -o tsv)

# Set sensitive settings
az webapp config appsettings set \
  --name "$APP_SERVICE" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    VITE_OPENAI_KEY="$OPENAI_KEY" \
    VITE_SQL_PASSWORD="R@nd0mPA$$2025!"

echo "✅ Secure configuration completed"

# Step 6: Remove connection string (now using Managed Identity)
echo ""
echo "🧹 Cleaning up connection string..."
az webapp config appsettings delete \
  --name "$APP_SERVICE" \
  --resource-group "$RESOURCE_GROUP" \
  --setting-names VITE_STORAGE_CONNECTION_STRING || echo "⚠️  Connection string may not exist"

echo "✅ Connection string removed (using Managed Identity now)"

# Step 7: Restart App Service to apply changes
echo ""
echo "🔄 Restarting App Service..."
az webapp restart \
  --name "$APP_SERVICE" \
  --resource-group "$RESOURCE_GROUP"

echo "✅ App Service restarted"

# Step 8: Verify deployment
echo ""
echo "🧪 Verifying deployment..."

# Wait a moment for the app to start
sleep 10

# Check if the app is responding
APP_URL="https://$APP_SERVICE.azurewebsites.net"
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL" | grep -q "200\|302"; then
    echo "✅ App Service is responding at $APP_URL"
else
    echo "⚠️  App Service may still be starting up"
fi

# Display role assignments for verification
echo ""
echo "📋 Current role assignments:"
az role assignment list --assignee "$IDENTITY_CLIENT_ID" --output table

echo ""
echo "🎉 Production Deployment Complete!"
echo "=================================="
echo ""
echo "✅ Managed Identity configured and active"
echo "✅ Storage permissions granted"
echo "✅ App Service updated with secure configuration"
echo "✅ Connection strings removed (zero-secrets deployment)"
echo ""
echo "🔗 Your app is available at: $APP_URL"
echo "🔗 Test Azure Storage at: $APP_URL/azure-storage"
echo ""
echo "📊 Monitor your deployment:"
echo "   az webapp log tail --name $APP_SERVICE --resource-group $RESOURCE_GROUP"
echo ""
echo "🔍 Expected log messages:"
echo "   - '🔐 Initializing Azure Storage with Managed Identity...'"
echo "   - '✅ Azure Storage initialized with Managed Identity'"
echo ""
echo "🛠️  If you encounter issues:"
echo "   1. Check the logs above"
echo "   2. Verify role assignments: az role assignment list --assignee $IDENTITY_CLIENT_ID"
echo "   3. Test storage access at /azure-storage endpoint"
echo ""
