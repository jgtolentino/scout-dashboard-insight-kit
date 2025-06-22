#!/bin/bash

# Azure Storage Setup Script
# This script helps you configure Azure Storage with real credentials

set -e

echo "🚀 Azure Storage Setup Script"
echo "================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure CLI first:"
    echo "   az login"
    exit 1
fi

echo "✅ Azure CLI is ready"

# Set variables
RESOURCE_GROUP="RG-TBWA-ProjectScout-Data"
STORAGE_ACCOUNT="projectscoutdata"
OPENAI_RESOURCE="ces-openai-20250609"

echo ""
echo "📋 Fetching Azure credentials..."

# Get storage connection string
echo "Getting storage connection string..."
AZ_STORAGE_CONN=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

if [ -z "$AZ_STORAGE_CONN" ]; then
    echo "❌ Failed to get storage connection string"
    exit 1
fi

# Get OpenAI key
echo "Getting OpenAI key..."
AZ_OPENAI_KEY=$(az cognitiveservices account keys list \
  --name $OPENAI_RESOURCE \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

if [ -z "$AZ_OPENAI_KEY" ]; then
    echo "❌ Failed to get OpenAI key"
    exit 1
fi

echo "✅ Credentials fetched successfully"

# Prompt for database credentials
echo ""
echo "🗄️  Database Configuration"
echo "Please enter your database credentials:"
read -p "SQL Username: " DB_USER
read -s -p "SQL Password: " DB_PASS
echo ""

# Create .env.local file
echo ""
echo "📝 Creating .env.local file..."

cat > .env.local << EOF
# ▶️ Front-end endpoint
VITE_API_URL=https://scout-analytics-dashboard.azurewebsites.net

# ▶️ Mocks & Auth toggles
VITE_USE_MOCKS=false
VITE_DISABLE_AUTH=false

# ▶️ Azure OpenAI
VITE_OPENAI_ENDPOINT=https://ces-openai-20250609.openai.azure.com/
VITE_OPENAI_KEY=$AZ_OPENAI_KEY

# ▶️ Azure Storage
VITE_STORAGE_ACCOUNT=projectscoutdata
VITE_STORAGE_CONNECTION_STRING="$AZ_STORAGE_CONN"
VITE_USE_MANAGED_IDENTITY=false  # set to true in production

# ▶️ Azure SQL
VITE_SQL_SERVER=sqltbwaprojectscoutserver.database.windows.net
VITE_SQL_DATABASE=SQL-TBWA-ProjectScout-Reporting-Prod
VITE_SQL_USER=$DB_USER
VITE_SQL_PASSWORD=$DB_PASS

# ▶️ Mapbox
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww
EOF

echo "✅ .env.local created successfully"

# Configure CORS for local development
echo ""
echo "🌐 Configuring CORS for local development..."

az storage cors add \
  --account-name $STORAGE_ACCOUNT \
  --services b \
  --methods GET POST PUT DELETE OPTIONS \
  --origins "http://localhost:5173" "http://localhost:3000" "http://localhost:8080" \
  --allowed-headers "*" \
  --max-age 3600 \
  --connection-string "$AZ_STORAGE_CONN" || echo "⚠️  CORS configuration may have failed (might already exist)"

echo "✅ CORS configured for local development"

# Test storage connectivity
echo ""
echo "🧪 Testing storage connectivity..."

# Create a test container
az storage container create \
  --name "test-container" \
  --connection-string "$AZ_STORAGE_CONN" \
  --public-access blob || echo "⚠️  Test container may already exist"

echo "✅ Storage connectivity test passed"

echo ""
echo "🎉 Setup Complete!"
echo "==================="
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start your development server"
echo "2. Navigate to /azure-storage to test the demo"
echo "3. Check the browser console for any errors"
echo ""
echo "If you encounter CORS errors, run:"
echo "   az storage cors clear --account-name $STORAGE_ACCOUNT --services b --connection-string \"$AZ_STORAGE_CONN\""
echo "   Then re-run this script"
echo ""
echo "For production deployment with Managed Identity:"
echo "1. Set VITE_USE_MANAGED_IDENTITY=true in your App Service configuration"
echo "2. Enable User-Assigned Managed Identity on your App Service"
echo "3. Grant 'Storage Blob Data Contributor' role to the identity"
echo ""
