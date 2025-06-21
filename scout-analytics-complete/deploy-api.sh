#!/bin/bash
# Deploy Scout Analytics API to Azure App Service
# Run this script from your local machine where you're authenticated with Azure CLI

set -euo pipefail

# Configuration
SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
RESOURCE_GROUP="RG-TBWA-ProjectScout-Compute"
LOCATION="East US"
API_APP_NAME="scout-analytics-api"
API_APP_SERVICE_PLAN="scout-api-plan"

echo "🚀 Deploying Scout Analytics API to Azure App Service..."

# Set the subscription
az account set --subscription "$SUBSCRIPTION_ID"

# Create App Service Plan for API (if it doesn't exist)
echo "📋 Creating App Service Plan: $API_APP_SERVICE_PLAN"
az appservice plan create \
  --name "$API_APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux \
  --subscription "$SUBSCRIPTION_ID" || echo "App Service Plan may already exist"

# Create Web App for API
echo "🌐 Creating Web App: $API_APP_NAME"
az webapp create \
  --name "$API_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$API_APP_SERVICE_PLAN" \
  --runtime "PYTHON|3.11" \
  --subscription "$SUBSCRIPTION_ID"

# Configure environment variables
echo "⚙️ Setting environment variables..."
az webapp config appsettings set \
  --name "$API_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --settings \
    AZURE_OPENAI_API_KEY="31119320b14e4ff4bccefa768f4adaa8" \
    AZURE_OPENAI_ENDPOINT="https://ces-openai-20250609.openai.azure.com/" \
    AZURE_DEPLOYMENT_NAME="gpt-4" \
    AZURE_API_VERSION="2024-02-15-preview" \
    FLASK_ENV="production" \
    SECRET_KEY="asdf#FGSgvasgf$5$WGT"

# Enable CORS for all origins
echo "🔗 Enabling CORS..."
az webapp cors add \
  --name "$API_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --allowed-origins "*"

# Deploy the code (you'll need to zip the scout-analytics-api folder first)
echo "📦 Preparing deployment package..."
cd scout-analytics-api
zip -r ../scout-api-deploy.zip . -x "venv/*" "__pycache__/*" "*.pyc" ".git/*"
cd ..

echo "🚀 Deploying code to Azure..."
az webapp deployment source config-zip \
  --name "$API_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --src "scout-api-deploy.zip"

# Get the URL
API_URL=$(az webapp show \
  --name "$API_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --query "defaultHostName" -o tsv)

echo "✅ API deployed successfully!"
echo "🌐 API URL: https://$API_URL"
echo "🔗 Test endpoint: https://$API_URL/api/transactions"
echo "🤖 ScoutBot endpoint: https://$API_URL/api/ask"

# Save the API URL for frontend deployment
echo "https://$API_URL" > api-url.txt
echo "📝 API URL saved to api-url.txt for frontend deployment"

