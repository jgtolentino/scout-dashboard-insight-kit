#!/bin/bash

# Azure Stack Deployment Script for Scout Analytics Platform
# This script handles the complete deployment to Azure Stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AZURE_STACK_NAME="${AZURE_STACK_NAME:-AzureStack}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP}"
ACR_NAME="${ACR_NAME}"
LOCATION="${AZURE_LOCATION:-local}"
APP_NAME="scout-analytics"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check required environment variables
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [[ -z "$AZURE_CLIENT_ID" || -z "$AZURE_CLIENT_SECRET" || -z "$AZURE_TENANT_ID" || -z "$AZURE_SUBSCRIPTION_ID" ]]; then
        print_error "Azure credentials not set. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, and AZURE_SUBSCRIPTION_ID"
        exit 1
    fi
    
    if [[ -z "$RESOURCE_GROUP" || -z "$ACR_NAME" ]]; then
        print_error "RESOURCE_GROUP and ACR_NAME must be set"
        exit 1
    fi
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI not found. Please install Azure CLI"
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker"
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Login to Azure Stack
azure_login() {
    print_status "Logging in to Azure Stack..."
    
    # Set Azure Stack environment
    az cloud set --name "$AZURE_STACK_NAME" --profile 2020-09-01-hybrid || {
        print_warning "Azure Stack environment not found, using default Azure"
        az cloud set --name AzureCloud
    }
    
    # Login with service principal
    az login --service-principal \
        --username "$AZURE_CLIENT_ID" \
        --password "$AZURE_CLIENT_SECRET" \
        --tenant "$AZURE_TENANT_ID"
    
    # Set subscription
    az account set --subscription "$AZURE_SUBSCRIPTION_ID"
    
    print_status "Azure login successful!"
}

# Create resource group if it doesn't exist
create_resource_group() {
    print_status "Checking resource group..."
    
    if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        print_status "Creating resource group $RESOURCE_GROUP..."
        az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
    else
        print_status "Resource group $RESOURCE_GROUP already exists"
    fi
}

# Create Azure Container Registry if it doesn't exist
create_acr() {
    print_status "Checking Azure Container Registry..."
    
    if ! az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        print_status "Creating Azure Container Registry $ACR_NAME..."
        az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Basic
        
        # Enable admin user
        az acr update --name "$ACR_NAME" --admin-enabled true
    else
        print_status "ACR $ACR_NAME already exists"
    fi
    
    # Get ACR credentials
    ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)
    ACR_REGISTRY="${ACR_NAME}.azurecr.io"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building Docker images..."
    
    # Login to ACR
    print_status "Logging in to ACR..."
    az acr login --name "$ACR_NAME"
    
    # Build images
    print_status "Building backend image..."
    docker build --target backend -t "${ACR_REGISTRY}/scout-api:latest" -t "${ACR_REGISTRY}/scout-api:${GITHUB_SHA:-latest}" .
    
    print_status "Building production image..."
    docker build --target production -t "${ACR_REGISTRY}/scout-app:latest" -t "${ACR_REGISTRY}/scout-app:${GITHUB_SHA:-latest}" .
    
    # Push images
    print_status "Pushing images to ACR..."
    docker push "${ACR_REGISTRY}/scout-api:latest"
    docker push "${ACR_REGISTRY}/scout-api:${GITHUB_SHA:-latest}"
    docker push "${ACR_REGISTRY}/scout-app:latest"
    docker push "${ACR_REGISTRY}/scout-app:${GITHUB_SHA:-latest}"
    
    print_status "Images pushed successfully!"
}

# Deploy containers to Azure Container Instances
deploy_containers() {
    print_status "Deploying containers to Azure Container Instances..."
    
    # Deploy API container
    print_status "Deploying API container..."
    az container create \
        --resource-group "$RESOURCE_GROUP" \
        --name "${APP_NAME}-api" \
        --image "${ACR_REGISTRY}/scout-api:latest" \
        --registry-login-server "$ACR_REGISTRY" \
        --registry-username "$ACR_NAME" \
        --registry-password "$ACR_PASSWORD" \
        --ports 5000 \
        --cpu 2 \
        --memory 4 \
        --environment-variables \
            FLASK_ENV=production \
            DATABASE_URL="${DATABASE_URL:-sqlite:///analytics.db}" \
        --restart-policy Always
    
    # Deploy App container
    print_status "Deploying App container..."
    az container create \
        --resource-group "$RESOURCE_GROUP" \
        --name "${APP_NAME}-app" \
        --image "${ACR_REGISTRY}/scout-app:latest" \
        --registry-login-server "$ACR_REGISTRY" \
        --registry-username "$ACR_NAME" \
        --registry-password "$ACR_PASSWORD" \
        --ports 80 443 \
        --cpu 2 \
        --memory 4 \
        --dns-name-label "$APP_NAME" \
        --restart-policy Always
    
    print_status "Containers deployed successfully!"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait for containers to start
    sleep 30
    
    # Get App FQDN
    APP_FQDN=$(az container show --resource-group "$RESOURCE_GROUP" --name "${APP_NAME}-app" --query ipAddress.fqdn -o tsv)
    
    if [[ -z "$APP_FQDN" ]]; then
        print_error "Failed to get application FQDN"
        exit 1
    fi
    
    print_status "Application FQDN: $APP_FQDN"
    
    # Check health endpoint
    if curl -f "http://$APP_FQDN/health" &> /dev/null; then
        print_status "Health check passed!"
    else
        print_warning "Health check failed, but container might still be starting..."
    fi
    
    # Print deployment information
    echo ""
    echo "======================================"
    echo "Deployment Summary:"
    echo "======================================"
    echo "Resource Group: $RESOURCE_GROUP"
    echo "ACR Name: $ACR_NAME"
    echo "API Container: ${APP_NAME}-api"
    echo "App Container: ${APP_NAME}-app"
    echo "Application URL: http://$APP_FQDN"
    echo "======================================"
    echo ""
    print_status "Deployment completed successfully!"
}

# Main execution
main() {
    print_status "Starting Azure Stack deployment..."
    
    check_prerequisites
    azure_login
    create_resource_group
    create_acr
    build_and_push_images
    deploy_containers
    verify_deployment
}

# Run main function
main "$@"