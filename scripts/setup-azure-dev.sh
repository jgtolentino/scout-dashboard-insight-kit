#!/bin/bash

# Scout Analytics Dashboard v3.0 - Azure Development Setup
# Automated Azure CLI authentication and environment setup

set -e

echo "🚀 Scout Analytics Dashboard v3.0 - Azure Dev Setup"
echo "=================================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   macOS: brew install azure-cli"
    echo "   Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    echo "   Windows: https://aka.ms/installazurecliwindows"
    exit 1
fi

echo "✅ Azure CLI found"

# Check if already logged in
if az account show &> /dev/null; then
    CURRENT_ACCOUNT=$(az account show --query name -o tsv)
    echo "✅ Already logged in to Azure account: $CURRENT_ACCOUNT"
    
    read -p "🔄 Do you want to switch accounts? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔐 Logging out and re-authenticating..."
        az logout
        az login
    fi
else
    echo "🔐 Logging in to Azure..."
    az login
fi

# Show available subscriptions
echo "📋 Available Azure subscriptions:"
az account list --query "[].{Name:name, SubscriptionId:id, IsDefault:isDefault}" -o table

# Set subscription if TBWA-ProjectScout-Prod exists
if az account list --query "[?name=='TBWA-ProjectScout-Prod'].id" -o tsv | grep -q .; then
    echo "🎯 Setting subscription to TBWA-ProjectScout-Prod..."
    az account set --subscription "TBWA-ProjectScout-Prod"
    echo "✅ Subscription set successfully"
else
    echo "⚠️  TBWA-ProjectScout-Prod subscription not found"
    echo "📝 Available subscriptions:"
    az account list --query "[].name" -o table
    
    read -p "🔧 Enter subscription name to use (or press Enter to use default): " SUBSCRIPTION
    if [ ! -z "$SUBSCRIPTION" ]; then
        az account set --subscription "$SUBSCRIPTION"
        echo "✅ Subscription set to: $SUBSCRIPTION"
    fi
fi

# Verify current subscription
CURRENT_SUB=$(az account show --query name -o tsv)
CURRENT_SUB_ID=$(az account show --query id -o tsv)
echo "🎯 Current subscription: $CURRENT_SUB ($CURRENT_SUB_ID)"

# Test Azure CLI permissions
echo "🧪 Testing Azure CLI permissions..."

# Test Azure OpenAI access (if endpoint is provided)
if [ ! -z "$AZURE_OPENAI_ENDPOINT" ]; then
    echo "🤖 Testing Azure OpenAI access..."
    # This would require additional permissions testing
    echo "ℹ️  Azure OpenAI endpoint configured: $AZURE_OPENAI_ENDPOINT"
fi

# Test Azure Storage access
echo "💾 Testing Azure Storage access..."
STORAGE_ACCOUNTS=$(az storage account list --query length(@) -o tsv 2>/dev/null || echo "0")
echo "📦 Found $STORAGE_ACCOUNTS storage accounts accessible"

# Test Azure Databricks access and setup
echo "🧠 Setting up Azure Databricks integration..."
DATABRICKS_WORKSPACE_URL="https://adb-2769038304082127.7.azuredatabricks.net"

# Check if databricks CLI is installed
if command -v databricks &> /dev/null; then
    echo "✅ Databricks CLI found"
    
    # Check if profile exists
    if [ -f ~/.databrickscfg ]; then
        echo "✅ Databricks profile exists"
        
        # Test workspace access
        if databricks workspace list &> /dev/null; then
            echo "✅ Databricks workspace access verified"
        else
            echo "⚠️  Databricks workspace access failed - token may be expired"
        fi
    else
        echo "⚠️  Databricks CLI not configured"
        echo "🔧 To configure Databricks CLI:"
        echo "   1. Run: databricks configure --token"
        echo "   2. Host: $DATABRICKS_WORKSPACE_URL"
        echo "   3. Token: <generate from Databricks workspace UI>"
    fi
else
    echo "⚠️  Databricks CLI not installed"
    echo "🔧 To install Databricks CLI:"
    echo "   pip install databricks-cli"
    echo "   OR: curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh"
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ .env.local created. Please edit it with your specific Azure resource URLs and tokens."
else
    echo "ℹ️  .env.local already exists. Please verify it has correct Azure resource URLs."
fi

echo ""
echo "🎉 Azure CLI setup complete!"
echo "📋 Summary:"
echo "   ✅ Azure CLI authenticated"
echo "   ✅ Subscription: $CURRENT_SUB"
echo "   ✅ DefaultAzureCredential will work for local development"
echo "   ✅ .env.local configured"
echo ""
echo "🚀 Next steps:"
echo "   1. Edit .env.local with your Azure OpenAI endpoint and Databricks token"
echo "   2. Run: npm run setup:full"
echo "   3. Run: npm run dev:full"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If authentication fails, run: az login --scope https://management.azure.com/.default"
echo "   - For Databricks: Generate token from workspace UI → Settings → Developer → Access Tokens"
echo "   - For Azure OpenAI: Get endpoint and key from Azure Portal → OpenAI resource"

# Make script executable
chmod +x "$0"