#!/bin/bash
# Deploy Scout Analytics Dashboard to Azure App Service
# Run this script from your local machine where you're authenticated with Azure CLI

set -euo pipefail

# Configuration
SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
RESOURCE_GROUP="scout-dashboard-rg"
LOCATION="West US 2"
FRONTEND_APP_NAME="scout-analytics-dashboard"
FRONTEND_APP_SERVICE_PLAN="scout-dashboard-plan"

echo "🚀 Deploying Scout Analytics Dashboard to Azure App Service..."

# Set the subscription
az account set --subscription "$SUBSCRIPTION_ID"

# Check if resource group exists, create if not
echo "📋 Ensuring resource group exists: $RESOURCE_GROUP"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --subscription "$SUBSCRIPTION_ID" || echo "Resource group may already exist"

# Create App Service Plan for Frontend (if it doesn't exist)
echo "📋 Creating App Service Plan: $FRONTEND_APP_SERVICE_PLAN"
az appservice plan create \
  --name "$FRONTEND_APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux \
  --subscription "$SUBSCRIPTION_ID" || echo "App Service Plan may already exist"

# Create Web App for Frontend
echo "🌐 Creating Web App: $FRONTEND_APP_NAME"
az webapp create \
  --name "$FRONTEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$FRONTEND_APP_SERVICE_PLAN" \
  --runtime "NODE|20-lts" \
  --subscription "$SUBSCRIPTION_ID" || echo "Web App may already exist"

# Configure startup command for React app
echo "⚙️ Configuring startup command..."
az webapp config set \
  --name "$FRONTEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --startup-file "pm2 serve /home/site/wwwroot/dist --no-daemon --spa"

# Build the React app locally
echo "🔨 Building React application..."
cd scout-analytics-dashboard
npm run build
cd ..

# Create deployment package
echo "📦 Preparing deployment package..."
cd scout-analytics-dashboard/dist
zip -r ../../scout-dashboard-deploy.zip . 
cd ../..

echo "🚀 Deploying code to Azure..."
az webapp deployment source config-zip \
  --name "$FRONTEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --src "scout-dashboard-deploy.zip"

# Get the URL
FRONTEND_URL=$(az webapp show \
  --name "$FRONTEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --query "defaultHostName" -o tsv)

echo "✅ Dashboard deployed successfully!"
echo "🌐 Dashboard URL: https://$FRONTEND_URL"
echo "📊 Access your Scout Analytics Dashboard at the URL above"

# Clean up
rm -f scout-dashboard-deploy.zip
echo "🧹 Cleanup completed"

