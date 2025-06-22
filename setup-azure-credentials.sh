#!/bin/bash

# Azure Credentials Setup Script
# This script creates the necessary Azure resources and outputs the GitHub Secrets values

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Using existing TBWA Project Scout infrastructure
SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
RESOURCE_GROUP="RG-TBWA-ProjectScout-Compute"
ACR_NAME="projectscoutacr"
LOCATION="eastus"
SP_NAME="scout-dashboard-ci-cd"

print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Azure CLI is installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI not found. Please install Azure CLI"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq not found. Install jq for better JSON parsing"
    fi
    
    print_status "Prerequisites check passed!"
}

# Login and set subscription
azure_login() {
    print_header "Azure Login and Subscription Setup"
    
    print_status "Checking Azure login status..."
    if ! az account show &> /dev/null; then
        print_status "Not logged in. Starting Azure login..."
        az login
    else
        print_status "Already logged in to Azure"
    fi
    
    print_status "Setting subscription to: $SUBSCRIPTION_ID"
    az account set --subscription "$SUBSCRIPTION_ID"
    
    # Verify subscription
    CURRENT_SUB=$(az account show --query id -o tsv)
    if [[ "$CURRENT_SUB" != "$SUBSCRIPTION_ID" ]]; then
        print_error "Failed to set subscription. Current: $CURRENT_SUB, Expected: $SUBSCRIPTION_ID"
        exit 1
    fi
    
    print_status "Successfully set subscription to TBWA-ProjectScout-Prod"
}

# Get tenant ID
get_tenant_id() {
    print_status "Getting tenant ID..."
    TENANT_ID=$(az account show --query tenantId -o tsv)
    echo -e "${GREEN}TENANT_ID: $TENANT_ID${NC}"
}

# Create or get service principal
create_service_principal() {
    print_header "Service Principal Setup"
    
    print_status "Checking if service principal '$SP_NAME' exists..."
    
    # Check if SP already exists
    SP_APP_ID=$(az ad sp list --display-name "$SP_NAME" --query [0].appId -o tsv 2>/dev/null || echo "")
    
    if [[ -n "$SP_APP_ID" && "$SP_APP_ID" != "null" ]]; then
        print_status "Service principal already exists with App ID: $SP_APP_ID"
        CLIENT_ID="$SP_APP_ID"
        
        print_status "Creating new client secret..."
        SP_SECRET=$(az ad sp credential reset --id "$SP_APP_ID" --query password -o tsv)
    else
        print_status "Creating new service principal..."
        
        # Create service principal with contributor role on resource group
        SP_JSON=$(az ad sp create-for-rbac --name "$SP_NAME" \
            --role contributor \
            --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
            --sdk-auth)
        
        CLIENT_ID=$(echo "$SP_JSON" | jq -r .clientId)
        SP_SECRET=$(echo "$SP_JSON" | jq -r .clientSecret)
        
        print_status "Service principal created successfully!"
    fi
    
    echo -e "${GREEN}CLIENT_ID: $CLIENT_ID${NC}"
    echo -e "${GREEN}CLIENT_SECRET: $SP_SECRET${NC}"
}

# Create or configure Azure Container Registry
setup_acr() {
    print_header "Azure Container Registry Setup"
    
    print_status "Checking if ACR '$ACR_NAME' exists..."
    
    if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        print_status "ACR already exists"
    else
        print_status "Creating Azure Container Registry..."
        az acr create --resource-group "$RESOURCE_GROUP" \
            --name "$ACR_NAME" \
            --sku Basic \
            --location "$LOCATION"
    fi
    
    print_status "Enabling admin user for ACR..."
    az acr update --name "$ACR_NAME" --admin-enabled true
    
    print_status "Getting ACR credentials..."
    ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)
    ACR_REGISTRY="${ACR_NAME}.azurecr.io"
    
    echo -e "${GREEN}ACR_NAME: $ACR_NAME${NC}"
    echo -e "${GREEN}ACR_REGISTRY: $ACR_REGISTRY${NC}"
    echo -e "${GREEN}ACR_PASSWORD: $ACR_PASSWORD${NC}"
}

# Create database URL (using existing SQL Database)
setup_database_url() {
    print_header "Database Configuration"
    
    print_status "Using existing SQL Database configuration..."
    
    # Using the existing SQL Database from the project
    SQL_SERVER="sqltbwaprojectscoutserver.database.windows.net"
    SQL_DATABASE="SQL-TBWA-ProjectScout-Reporting-Prod"
    
    # For development, we'll use SQLite, for production they can configure SQL Server
    DATABASE_URL_DEV="sqlite:///analytics.db"
    DATABASE_URL_PROD="mssql+pyodbc://username:password@${SQL_SERVER}/${SQL_DATABASE}?driver=ODBC+Driver+17+for+SQL+Server"
    
    echo -e "${GREEN}DATABASE_URL (Development): $DATABASE_URL_DEV${NC}"
    echo -e "${YELLOW}DATABASE_URL (Production): $DATABASE_URL_PROD${NC}"
    echo -e "${YELLOW}Note: Update username and password for production SQL Database${NC}"
}

# Output final summary
output_github_secrets() {
    print_header "GitHub Secrets Configuration"
    
    echo ""
    echo "Copy these values to your GitHub repository secrets:"
    echo "Repository Settings > Secrets and variables > Actions > New repository secret"
    echo ""
    echo -e "${BLUE}Required GitHub Secrets:${NC}"
    echo "========================"
    echo "AZURE_CLIENT_ID = $CLIENT_ID"
    echo "AZURE_CLIENT_SECRET = $SP_SECRET"
    echo "AZURE_TENANT_ID = $TENANT_ID"
    echo "AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
    echo "AZURE_RESOURCE_GROUP = $RESOURCE_GROUP"
    echo "ACR_NAME = $ACR_NAME"
    echo "ACR_PASSWORD = $ACR_PASSWORD"
    echo "DATABASE_URL = $DATABASE_URL_DEV"
    echo ""
    echo -e "${BLUE}Optional Environment Variables:${NC}"
    echo "=============================="
    echo "AZURE_LOCATION = $LOCATION"
    echo "AZURE_STACK_NAME = AzureStack"
    echo ""
    
    # Save to file
    cat > github-secrets.txt << EOF
# GitHub Secrets for Scout Dashboard Insight Kit
# Generated on $(date)

AZURE_CLIENT_ID=$CLIENT_ID
AZURE_CLIENT_SECRET=$SP_SECRET
AZURE_TENANT_ID=$TENANT_ID
AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
AZURE_RESOURCE_GROUP=$RESOURCE_GROUP
ACR_NAME=$ACR_NAME
ACR_PASSWORD=$ACR_PASSWORD
DATABASE_URL=$DATABASE_URL_DEV

# Optional
AZURE_LOCATION=$LOCATION
AZURE_STACK_NAME=AzureStack
EOF
    
    print_status "Secrets saved to 'github-secrets.txt'"
    
    echo ""
    echo -e "${GREEN}✅ Azure credentials setup completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Add the above secrets to your GitHub repository"
    echo "2. Test deployment: ./deploy-azure-stack.sh"
    echo "3. Monitor CI/CD pipeline execution"
    echo "4. Verify deployment: https://[your-app-url]/health"
}

# Main execution
main() {
    print_header "Scout Dashboard Azure Credentials Setup"
    
    check_prerequisites
    azure_login
    get_tenant_id
    create_service_principal
    setup_acr
    setup_database_url
    output_github_secrets
}

# Run main function
main "$@"