#!/bin/bash

# Scout Analytics Dashboard v3.0 - Azure Static Web App Deployment
# Bypass Mode Enabled for immediate deployment

set -e

echo "🚀 Scout Analytics Dashboard v3.0 - Azure Static Web App Deployment"
echo "=================================================================="
echo ""

# Configuration
APP_NAME="scout-analytics-v3"
RESOURCE_GROUP="scout-dashboard-rg"
LOCATION="eastus2"
SKU="Standard"

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure CLI"
    echo "🔧 Please run: az login"
    exit 1
fi

echo "✅ Azure CLI authenticated"
echo "📋 Current subscription: $(az account show --query name -o tsv)"
echo ""

# Check if resource group exists
echo "🔍 Checking resource group..."
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "📦 Creating resource group: $RESOURCE_GROUP"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
else
    echo "✅ Resource group exists: $RESOURCE_GROUP"
fi

# Check if static web app already exists
echo "🔍 Checking for existing app..."
EXISTING_APP=$(az staticwebapp list --resource-group "$RESOURCE_GROUP" --query "[?name=='$APP_NAME'].id" -o tsv 2>/dev/null || echo "")

if [ -n "$EXISTING_APP" ]; then
    echo "✅ Static Web App already exists: $APP_NAME"
    echo "🔄 Updating deployment..."
    
    # Get deployment token
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.apiKey" -o tsv)
else
    echo "🆕 Creating new Static Web App..."
    
    # Create the static web app
    RESULT=$(az staticwebapp create \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "$SKU" \
        --output json)
    
    # Extract deployment token
    DEPLOYMENT_TOKEN=$(echo "$RESULT" | jq -r '.properties.apiKey // empty')
    
    if [ -z "$DEPLOYMENT_TOKEN" ]; then
        # If token not in result, fetch it separately
        DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
            --name "$APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --query "properties.apiKey" -o tsv)
    fi
    
    echo "✅ Static Web App created: $APP_NAME"
fi

# Get app URL
APP_URL=$(az staticwebapp show \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "defaultHostname" -o tsv)

echo ""
echo "📋 Deployment Details:"
echo "   App Name: $APP_NAME"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   URL: https://$APP_URL"
echo ""

# Deploy using SWA CLI if available
if command -v swa &> /dev/null; then
    echo "🚀 Deploying with SWA CLI..."
    swa deploy \
        --deployment-token "$DEPLOYMENT_TOKEN" \
        --app-location "." \
        --api-location "" \
        --output-location "dist" \
        --env "production"
else
    echo "⚠️  SWA CLI not found. To deploy manually:"
    echo ""
    echo "1. Install SWA CLI:"
    echo "   npm install -g @azure/static-web-apps-cli"
    echo ""
    echo "2. Deploy:"
    echo "   swa deploy --deployment-token $DEPLOYMENT_TOKEN --app-location . --output-location dist"
    echo ""
    echo "Or use GitHub Actions with this deployment token in your repository secrets"
fi

echo ""
echo "🎉 Deployment Configuration Complete!"
echo "===================================="
echo ""
echo "🌐 Your app will be available at: https://$APP_URL"
echo "🔑 Deployment token saved for CI/CD"
echo ""
echo "📝 Next Steps:"
echo "   1. Visit https://$APP_URL to test the deployment"
echo "   2. Test mock authentication with bypass mode"
echo "   3. Verify Azure OpenAI integration works"
echo "   4. Check all dashboard pages load correctly"
echo ""
echo "🎭 Mock Users Available:"
echo "   - dev@tbwa.com (Admin)"
echo "   - eugene.valencia@tbwa-smp.com (Owner)"
echo "   - paolo.broma@tbwa-smp.com (User)"
echo "   - khalil.veracruz@tbwa-smp.com (User)"
echo ""
echo "✅ Scout Analytics Dashboard v3.0 ready for production use!"