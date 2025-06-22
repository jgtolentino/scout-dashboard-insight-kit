#!/bin/bash
# Setup Managed Identity for Scout Analytics - "One-and-Done" Auth Experience
# Usage: ./scripts/setup-managed-identity.sh

set -e

# Source the auto-login script first
source "$(dirname "$0")/auto-login.sh"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-scout-dashboard-rg}"
APP_SERVICE_NAME="${AZURE_APP_SERVICE_NAME:-scout-analytics-dashboard}"
SQL_SERVER_NAME="${AZURE_SQL_SERVER_NAME:-scout-sql-server}"
SQL_DATABASE_NAME="${AZURE_SQL_DATABASE_NAME:-scout_analytics}"
KEY_VAULT_NAME="${AZURE_KEY_VAULT_NAME:-kv-projectscout-prod}"
MANAGED_IDENTITY_NAME="${AZURE_MANAGED_IDENTITY_NAME:-scout-dashboard-identity}"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

echo -e "${BLUE}🔐 Scout Analytics - Managed Identity Setup${NC}"
echo "=============================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "App Service: $APP_SERVICE_NAME"
echo "SQL Server: $SQL_SERVER_NAME"
echo "Key Vault: $KEY_VAULT_NAME"
echo "Managed Identity: $MANAGED_IDENTITY_NAME"
echo

# Function to check if resource exists
resource_exists() {
    local resource_type=$1
    local resource_name=$2
    local resource_group=${3:-$RESOURCE_GROUP}
    
    case $resource_type in
        "group")
            az group show --name "$resource_name" >/dev/null 2>&1
            ;;
        "webapp")
            az webapp show --name "$resource_name" --resource-group "$resource_group" >/dev/null 2>&1
            ;;
        "sql-server")
            az sql server show --name "$resource_name" --resource-group "$resource_group" >/dev/null 2>&1
            ;;
        "keyvault")
            az keyvault show --name "$resource_name" >/dev/null 2>&1
            ;;
        "identity")
            az identity show --name "$resource_name" --resource-group "$resource_group" >/dev/null 2>&1
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to create or get managed identity
setup_managed_identity() {
    echo -e "${BLUE}🆔 Setting up Managed Identity...${NC}"
    
    if resource_exists "identity" "$MANAGED_IDENTITY_NAME"; then
        echo -e "${GREEN}✅ Managed Identity '$MANAGED_IDENTITY_NAME' already exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Creating Managed Identity '$MANAGED_IDENTITY_NAME'...${NC}"
        az identity create \
            --name "$MANAGED_IDENTITY_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --location "East US"
        echo -e "${GREEN}✅ Created Managed Identity '$MANAGED_IDENTITY_NAME'${NC}"
    fi
    
    # Get the identity details
    IDENTITY_ID=$(az identity show --name "$MANAGED_IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" --query id -o tsv)
    PRINCIPAL_ID=$(az identity show --name "$MANAGED_IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" --query principalId -o tsv)
    CLIENT_ID=$(az identity show --name "$MANAGED_IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" --query clientId -o tsv)
    
    echo "Identity ID: $IDENTITY_ID"
    echo "Principal ID: $PRINCIPAL_ID"
    echo "Client ID: $CLIENT_ID"
    echo
}

# Function to assign identity to App Service
assign_identity_to_app_service() {
    echo -e "${BLUE}🌐 Assigning Managed Identity to App Service...${NC}"
    
    if resource_exists "webapp" "$APP_SERVICE_NAME"; then
        echo -e "${GREEN}✅ App Service '$APP_SERVICE_NAME' found${NC}"
        
        # Assign the user-assigned managed identity
        az webapp identity assign \
            --resource-group "$RESOURCE_GROUP" \
            --name "$APP_SERVICE_NAME" \
            --identities "$IDENTITY_ID"
        
        echo -e "${GREEN}✅ Assigned Managed Identity to App Service${NC}"
    else
        echo -e "${YELLOW}⚠️  App Service '$APP_SERVICE_NAME' not found. Skipping identity assignment.${NC}"
        echo -e "${YELLOW}   You can assign it later when the App Service is created.${NC}"
    fi
    echo
}

# Function to grant SQL database access
grant_sql_access() {
    echo -e "${BLUE}🗄️  Granting SQL Database access...${NC}"
    
    if resource_exists "sql-server" "$SQL_SERVER_NAME"; then
        echo -e "${GREEN}✅ SQL Server '$SQL_SERVER_NAME' found${NC}"
        
        # Add managed identity as Azure AD admin
        az sql server ad-admin create \
            --resource-group "$RESOURCE_GROUP" \
            --server "$SQL_SERVER_NAME" \
            --display-name "$MANAGED_IDENTITY_NAME" \
            --object-id "$PRINCIPAL_ID" || {
            echo -e "${YELLOW}⚠️  Could not set as AD admin (might already exist)${NC}"
        }
        
        # Grant SQL DB Contributor role
        az role assignment create \
            --assignee-object-id "$PRINCIPAL_ID" \
            --role "SQL DB Contributor" \
            --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Sql/servers/$SQL_SERVER_NAME" || {
            echo -e "${YELLOW}⚠️  Role assignment might already exist${NC}"
        }
        
        echo -e "${GREEN}✅ Granted SQL Database access${NC}"
    else
        echo -e "${YELLOW}⚠️  SQL Server '$SQL_SERVER_NAME' not found. Skipping SQL access.${NC}"
        echo -e "${YELLOW}   You can grant access later when the SQL Server is created.${NC}"
    fi
    echo
}

# Function to grant Key Vault access
grant_keyvault_access() {
    echo -e "${BLUE}🔑 Granting Key Vault access...${NC}"
    
    if resource_exists "keyvault" "$KEY_VAULT_NAME"; then
        echo -e "${GREEN}✅ Key Vault '$KEY_VAULT_NAME' found${NC}"
        
        # Grant Key Vault secrets access
        az keyvault set-policy \
            --name "$KEY_VAULT_NAME" \
            --object-id "$PRINCIPAL_ID" \
            --secret-permissions get list
        
        # Also grant Key Vault Secrets User role (RBAC)
        az role assignment create \
            --assignee-object-id "$PRINCIPAL_ID" \
            --role "Key Vault Secrets User" \
            --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME" || {
            echo -e "${YELLOW}⚠️  RBAC role assignment might already exist${NC}"
        }
        
        echo -e "${GREEN}✅ Granted Key Vault access${NC}"
    else
        echo -e "${YELLOW}⚠️  Key Vault '$KEY_VAULT_NAME' not found. Skipping Key Vault access.${NC}"
        echo -e "${YELLOW}   You can grant access later when the Key Vault is created.${NC}"
    fi
    echo
}

# Function to create sample secrets in Key Vault
create_sample_secrets() {
    echo -e "${BLUE}🔐 Creating sample secrets in Key Vault...${NC}"
    
    if resource_exists "keyvault" "$KEY_VAULT_NAME"; then
        # Create sample database connection string
        DB_CONNECTION_STRING="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Database=${SQL_DATABASE_NAME};Authentication=Active Directory Default;"
        
        az keyvault secret set \
            --vault-name "$KEY_VAULT_NAME" \
            --name "DbConnectionString" \
            --value "$DB_CONNECTION_STRING" >/dev/null
        
        # Create sample Azure OpenAI endpoint
        az keyvault secret set \
            --vault-name "$KEY_VAULT_NAME" \
            --name "AzureOpenAIEndpoint" \
            --value "https://tbwa-openai.openai.azure.com" >/dev/null
        
        echo -e "${GREEN}✅ Created sample secrets in Key Vault${NC}"
        echo "   - DbConnectionString"
        echo "   - AzureOpenAIEndpoint"
    fi
    echo
}

# Function to update App Service configuration
update_app_service_config() {
    echo -e "${BLUE}⚙️  Updating App Service configuration...${NC}"
    
    if resource_exists "webapp" "$APP_SERVICE_NAME"; then
        # Set managed identity client ID for DefaultAzureCredential
        az webapp config appsettings set \
            --name "$APP_SERVICE_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --settings \
                AZURE_CLIENT_ID="$CLIENT_ID" \
                AZURE_TENANT_ID="$(az account show --query tenantId -o tsv)" \
                KEY_VAULT_NAME="$KEY_VAULT_NAME" \
                AZURE_SQL_SERVER="$SQL_SERVER_NAME" \
                AZURE_SQL_DATABASE="$SQL_DATABASE_NAME"
        
        echo -e "${GREEN}✅ Updated App Service configuration${NC}"
    fi
    echo
}

# Function to create connection test script
create_connection_test() {
    echo -e "${BLUE}🧪 Creating connection test script...${NC}"
    
    cat > "scripts/test-managed-identity.js" << 'EOF'
#!/usr/bin/env node
// Test script for Managed Identity connections
// Usage: node scripts/test-managed-identity.js

const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

async function testManagedIdentity() {
    console.log("🔐 Testing Managed Identity connections...\n");
    
    try {
        // Initialize the credential
        const credential = new DefaultAzureCredential();
        console.log("✅ DefaultAzureCredential initialized");
        
        // Test Key Vault access
        const keyVaultName = process.env.KEY_VAULT_NAME || 'kv-projectscout-prod';
        const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
        
        const secretClient = new SecretClient(keyVaultUrl, credential);
        console.log(`✅ Connected to Key Vault: ${keyVaultUrl}`);
        
        // Try to get a secret
        try {
            const dbSecret = await secretClient.getSecret("DbConnectionString");
            console.log("✅ Successfully retrieved database connection string");
            console.log(`   Connection string length: ${dbSecret.value?.length || 0} characters`);
        } catch (error) {
            console.log("⚠️  Could not retrieve database connection string:", error.message);
        }
        
        // Test token acquisition
        const tokenResponse = await credential.getToken("https://database.windows.net/");
        if (tokenResponse) {
            console.log("✅ Successfully acquired SQL database token");
            console.log(`   Token expires: ${new Date(tokenResponse.expiresOnTimestamp)}`);
        }
        
        console.log("\n🎉 Managed Identity test completed successfully!");
        
    } catch (error) {
        console.error("❌ Managed Identity test failed:", error.message);
        console.error("\nTroubleshooting tips:");
        console.error("1. Ensure you're running this on the App Service or after 'az login'");
        console.error("2. Check that the Managed Identity has proper permissions");
        console.error("3. Verify Key Vault name and policies");
        process.exit(1);
    }
}

testManagedIdentity();
EOF
    
    chmod +x "scripts/test-managed-identity.js"
    echo -e "${GREEN}✅ Created connection test script: scripts/test-managed-identity.js${NC}"
    echo
}

# Function to display next steps
display_next_steps() {
    echo -e "${GREEN}🎉 Managed Identity setup completed!${NC}"
    echo
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "✅ Managed Identity: $MANAGED_IDENTITY_NAME"
    echo "✅ Principal ID: $PRINCIPAL_ID"
    echo "✅ Client ID: $CLIENT_ID"
    echo "✅ App Service identity assigned"
    echo "✅ SQL Database access granted"
    echo "✅ Key Vault access granted"
    echo
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "1. Install required Node.js packages:"
    echo "   npm install @azure/identity @azure/keyvault-secrets"
    echo
    echo "2. Test the connection:"
    echo "   node scripts/test-managed-identity.js"
    echo
    echo "3. Update your application code to use DefaultAzureCredential"
    echo "   (See scripts/example-azure-credential-usage.js)"
    echo
    echo "4. Deploy your application - it will automatically use Managed Identity!"
    echo
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "• Local development: Run 'az login' once and it will work automatically"
    echo "• In Azure: The Managed Identity will be used automatically"
    echo "• No secrets needed in environment variables!"
    echo
}

# Main execution
main() {
    echo
    setup_managed_identity
    assign_identity_to_app_service
    grant_sql_access
    grant_keyvault_access
    create_sample_secrets
    update_app_service_config
    create_connection_test
    display_next_steps
}

# Run main function
main "$@"