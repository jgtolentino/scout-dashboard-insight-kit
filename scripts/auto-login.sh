#!/bin/bash
# Auto-login script for Azure CLI - enables "one-and-done" auth experience
# Usage: source ./scripts/auto-login.sh

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEV_SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-scout-dashboard-rg}"
TENANT_ID="${AZURE_TENANT_ID:-}"

echo -e "${BLUE}🔐 Scout Analytics - Azure Authentication Setup${NC}"
echo "================================================"

# Function to check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI not found. Please install it first:${NC}"
        echo "   macOS: brew install azure-cli"
        echo "   Windows: winget install Microsoft.AzureCLI"
        echo "   Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
        exit 1
    fi
    echo -e "${GREEN}✅ Azure CLI found${NC}"
}

# Function to check if user is logged in
check_login_status() {
    echo -e "${BLUE}🔍 Checking login status...${NC}"
    
    if az account show >/dev/null 2>&1; then
        CURRENT_USER=$(az account show --query user.name -o tsv 2>/dev/null || echo "unknown")
        CURRENT_SUBSCRIPTION=$(az account show --query name -o tsv 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Already logged in as: ${CURRENT_USER}${NC}"
        echo -e "${GREEN}   Current subscription: ${CURRENT_SUBSCRIPTION}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Not logged in to Azure CLI${NC}"
        return 1
    fi
}

# Function to perform Azure login
perform_login() {
    echo -e "${BLUE}🚀 Starting Azure login...${NC}"
    
    # Try device code login for better compatibility
    if az login --use-device-code; then
        echo -e "${GREEN}✅ Login successful!${NC}"
        
        # Show current account info
        CURRENT_USER=$(az account show --query user.name -o tsv)
        echo -e "${GREEN}   Logged in as: ${CURRENT_USER}${NC}"
    else
        echo -e "${RED}❌ Login failed${NC}"
        exit 1
    fi
}

# Function to set subscription
set_subscription() {
    if [ -n "$DEV_SUBSCRIPTION_ID" ]; then
        echo -e "${BLUE}🎯 Setting subscription to: ${DEV_SUBSCRIPTION_ID}${NC}"
        
        if az account set --subscription "$DEV_SUBSCRIPTION_ID"; then
            SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
            echo -e "${GREEN}✅ Subscription set to: ${SUBSCRIPTION_NAME}${NC}"
        else
            echo -e "${RED}❌ Failed to set subscription. Please check the subscription ID.${NC}"
            echo -e "${YELLOW}   Available subscriptions:${NC}"
            az account list --query "[].{Name:name, SubscriptionId:id}" -o table
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  AZURE_SUBSCRIPTION_ID not set. Using current subscription.${NC}"
        CURRENT_SUBSCRIPTION=$(az account show --query name -o tsv)
        echo -e "${BLUE}   Current: ${CURRENT_SUBSCRIPTION}${NC}"
    fi
}

# Function to verify resource group access
verify_access() {
    echo -e "${BLUE}🔒 Verifying access to resource group: ${RESOURCE_GROUP}${NC}"
    
    if az group show --name "$RESOURCE_GROUP" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Access confirmed to resource group: ${RESOURCE_GROUP}${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot access resource group: ${RESOURCE_GROUP}${NC}"
        echo -e "${YELLOW}   This might be expected if it doesn't exist yet.${NC}"
    fi
}

# Function to export environment variables
export_env_vars() {
    echo -e "${BLUE}📝 Setting up environment variables...${NC}"
    
    # Get current account info
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    TENANT_ID_CURRENT=$(az account show --query tenantId -o tsv)
    USER_OBJECT_ID=$(az ad signed-in-user show --query id -o tsv 2>/dev/null || echo "")
    
    # Export variables
    export AZURE_SUBSCRIPTION_ID="$SUBSCRIPTION_ID"
    export AZURE_TENANT_ID="$TENANT_ID_CURRENT"
    export AZURE_RESOURCE_GROUP="$RESOURCE_GROUP"
    
    if [ -n "$USER_OBJECT_ID" ]; then
        export AZURE_USER_OBJECT_ID="$USER_OBJECT_ID"
    fi
    
    echo -e "${GREEN}✅ Environment variables set:${NC}"
    echo "   AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
    echo "   AZURE_TENANT_ID=$TENANT_ID_CURRENT"
    echo "   AZURE_RESOURCE_GROUP=$RESOURCE_GROUP"
    
    if [ -n "$USER_OBJECT_ID" ]; then
        echo "   AZURE_USER_OBJECT_ID=$USER_OBJECT_ID"
    fi
}

# Function to create .env.local with Azure settings
create_env_file() {
    echo -e "${BLUE}📄 Creating/updating .env.local...${NC}"
    
    ENV_FILE=".env.local"
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    TENANT_ID_CURRENT=$(az account show --query tenantId -o tsv)
    
    # Create backup if file exists
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}   Backed up existing .env.local${NC}"
    fi
    
    # Update or add Azure settings
    {
        echo "# Azure Authentication Settings"
        echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
        echo "AZURE_TENANT_ID=$TENANT_ID_CURRENT"
        echo "AZURE_RESOURCE_GROUP=$RESOURCE_GROUP"
        echo ""
        echo "# Azure OpenAI Configuration (configure these manually)"
        echo "VITE_AZURE_OPENAI_ENDPOINT=https://tbwa-openai.openai.azure.com"
        echo "VITE_AZURE_OPENAI_KEY=your-azure-openai-api-key"
        echo "VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4"
        echo "VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview"
        echo ""
        echo "# Database Configuration (will be auto-configured with Managed Identity)"
        echo "# AZURE_SQL_SERVER=your-sql-server.database.windows.net"
        echo "# AZURE_SQL_DATABASE=scout_analytics"
        echo ""
    } > "$ENV_FILE"
    
    echo -e "${GREEN}✅ Created/updated .env.local with Azure settings${NC}"
}

# Main execution
main() {
    echo
    check_azure_cli
    echo
    
    if ! check_login_status; then
        echo
        perform_login
        echo
    fi
    
    set_subscription
    echo
    verify_access
    echo
    export_env_vars
    echo
    create_env_file
    echo
    
    echo -e "${GREEN}🎉 Azure authentication setup complete!${NC}"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Run: source ./scripts/setup-managed-identity.sh"
    echo "2. Configure Azure OpenAI API keys in .env.local"
    echo "3. Run: npm run dev"
    echo
    echo -e "${YELLOW}💡 This login will persist across terminal sessions.${NC}"
    echo -e "${YELLOW}   You won't need to login again unless tokens expire.${NC}"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi