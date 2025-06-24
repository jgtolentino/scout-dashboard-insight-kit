#!/bin/bash

# Scout Analytics Dashboard v3.0 - Databricks CLI Setup
# Automated setup for TBWA Project Scout Databricks workspace

set -e

echo "🧠 Scout Analytics Dashboard v3.0 - Databricks Setup"
echo "===================================================="

DATABRICKS_WORKSPACE_URL="https://adb-2769038304082127.7.azuredatabricks.net"
WORKSPACE_NAME="tbwa-juicer-databricks"

# Check if databricks CLI is installed
if ! command -v databricks &> /dev/null; then
    echo "❌ Databricks CLI not found. Installing..."
    
    # Try different installation methods
    if command -v pip &> /dev/null; then
        echo "📦 Installing via pip..."
        pip install databricks-cli
    elif command -v pip3 &> /dev/null; then
        echo "📦 Installing via pip3..."
        pip3 install databricks-cli
    else
        echo "📦 Installing via curl..."
        curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
        
        # Add to PATH if not already there
        if [[ ":$PATH:" != *":$HOME/.databricks/bin:"* ]]; then
            echo 'export PATH="$HOME/.databricks/bin:$PATH"' >> ~/.bashrc
            echo 'export PATH="$HOME/.databricks/bin:$PATH"' >> ~/.zshrc
            export PATH="$HOME/.databricks/bin:$PATH"
        fi
    fi
    
    # Verify installation
    if command -v databricks &> /dev/null; then
        echo "✅ Databricks CLI installed successfully"
    else
        echo "❌ Databricks CLI installation failed"
        echo "🔧 Manual installation options:"
        echo "   1. pip install databricks-cli"
        echo "   2. curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh"
        exit 1
    fi
else
    echo "✅ Databricks CLI found"
fi

# Check current configuration
if [ -f ~/.databrickscfg ]; then
    echo "📋 Existing Databricks configuration found"
    
    # Test current configuration
    if databricks workspace list &> /dev/null; then
        echo "✅ Current Databricks configuration is working"
        
        # Show current profile info
        CURRENT_HOST=$(grep -A 10 '\[DEFAULT\]' ~/.databrickscfg | grep 'host' | cut -d'=' -f2 | xargs)
        if [ "$CURRENT_HOST" = "$DATABRICKS_WORKSPACE_URL" ]; then
            echo "✅ Already configured for correct workspace: $WORKSPACE_NAME"
        else
            echo "⚠️  Current workspace: $CURRENT_HOST"
            echo "⚠️  Expected workspace: $DATABRICKS_WORKSPACE_URL"
            
            read -p "🔄 Reconfigure for Project Scout workspace? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                RECONFIGURE=true
            else
                RECONFIGURE=false
            fi
        fi
    else
        echo "❌ Current Databricks configuration is not working (token may be expired)"
        RECONFIGURE=true
    fi
else
    echo "📝 No Databricks configuration found"
    RECONFIGURE=true
fi

# Configure Databricks CLI if needed
if [ "$RECONFIGURE" = true ]; then
    echo "🔧 Configuring Databricks CLI for Project Scout workspace..."
    echo ""
    echo "📋 Configuration details:"
    echo "   Workspace: $WORKSPACE_NAME"
    echo "   Host: $DATABRICKS_WORKSPACE_URL"
    echo ""
    echo "🔑 To get your access token:"
    echo "   1. Open: $DATABRICKS_WORKSPACE_URL"
    echo "   2. Click your profile (top right) → Settings"
    echo "   3. Go to Developer → Access Tokens"
    echo "   4. Click 'Generate new token'"
    echo "   5. Set a description (e.g., 'Scout Analytics CLI')"
    echo "   6. Copy the generated token"
    echo ""
    
    # Interactive configuration
    databricks configure --token
    
    # Verify configuration
    if databricks workspace list &> /dev/null; then
        echo "✅ Databricks CLI configured successfully"
    else
        echo "❌ Databricks CLI configuration failed"
        echo "🔧 Please check your token and try again"
        exit 1
    fi
fi

# Test workspace access and gather information
echo "🧪 Testing workspace access..."

# List workspaces
echo "📁 Available workspace paths:"
databricks workspace list

# Get cluster information if available
echo "🖥️  Available clusters:"
if databricks clusters list &> /dev/null; then
    CLUSTERS=$(databricks clusters list --output json | jq -r '.clusters[] | "\(.cluster_id): \(.cluster_name) (\(.state))"' 2>/dev/null || echo "No clusters found or jq not available")
    echo "$CLUSTERS"
    
    # Try to get a default cluster ID
    DEFAULT_CLUSTER_ID=$(databricks clusters list --output json 2>/dev/null | jq -r '.clusters[0].cluster_id' 2>/dev/null || echo "")
    if [ ! -z "$DEFAULT_CLUSTER_ID" ] && [ "$DEFAULT_CLUSTER_ID" != "null" ]; then
        echo "🎯 Default cluster ID: $DEFAULT_CLUSTER_ID"
        
        # Update .env.local if it exists
        if [ -f .env.local ]; then
            echo "📝 Updating .env.local with cluster ID..."
            if grep -q "DATABRICKS_CLUSTER_ID=" .env.local; then
                sed -i.bak "s/DATABRICKS_CLUSTER_ID=.*/DATABRICKS_CLUSTER_ID=$DEFAULT_CLUSTER_ID/" .env.local
            else
                echo "DATABRICKS_CLUSTER_ID=$DEFAULT_CLUSTER_ID" >> .env.local
            fi
        fi
    fi
else
    echo "⚠️  Could not list clusters (may require additional permissions)"
fi

# Update .env.local with workspace URL and token info
if [ -f .env.local ]; then
    echo "📝 Updating .env.local with Databricks configuration..."
    
    # Update workspace URL
    if grep -q "DATABRICKS_WORKSPACE_URL=" .env.local; then
        sed -i.bak "s|DATABRICKS_WORKSPACE_URL=.*|DATABRICKS_WORKSPACE_URL=$DATABRICKS_WORKSPACE_URL|" .env.local
    else
        echo "DATABRICKS_WORKSPACE_URL=$DATABRICKS_WORKSPACE_URL" >> .env.local
    fi
    
    # Add token placeholder if not exists
    if ! grep -q "DATABRICKS_TOKEN=" .env.local; then
        echo "DATABRICKS_TOKEN=your-databricks-token-here" >> .env.local
        echo "⚠️  Please update DATABRICKS_TOKEN in .env.local with your actual token"
    fi
    
    echo "✅ .env.local updated"
else
    echo "📝 Creating .env.local with Databricks configuration..."
    cat > .env.local << EOF
# Databricks Configuration
DATABRICKS_WORKSPACE_URL=$DATABRICKS_WORKSPACE_URL
DATABRICKS_TOKEN=your-databricks-token-here
DATABRICKS_CLUSTER_ID=$DEFAULT_CLUSTER_ID
EOF
    echo "✅ .env.local created"
fi

# Optional: Upload token to Azure Key Vault
echo ""
read -p "🔐 Upload Databricks token to Azure Key Vault? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if Azure CLI is available and logged in
    if command -v az &> /dev/null && az account show &> /dev/null; then
        read -p "🔑 Enter Key Vault name (default: kv-projectscout-prod): " KEY_VAULT_NAME
        KEY_VAULT_NAME=${KEY_VAULT_NAME:-kv-projectscout-prod}
        
        read -s -p "🔐 Enter your Databricks token: " DATABRICKS_TOKEN
        echo
        
        if [ ! -z "$DATABRICKS_TOKEN" ]; then
            echo "📤 Uploading token to Azure Key Vault..."
            if az keyvault secret set \
                --vault-name "$KEY_VAULT_NAME" \
                --name "databricks-token" \
                --value "$DATABRICKS_TOKEN" > /dev/null; then
                echo "✅ Token uploaded to Key Vault successfully"
                
                # Update .env.local to use Key Vault reference
                if grep -q "DATABRICKS_TOKEN=" .env.local; then
                    sed -i.bak "s/DATABRICKS_TOKEN=.*/DATABRICKS_TOKEN=@Microsoft.KeyVault(VaultName=$KEY_VAULT_NAME;SecretName=databricks-token)/" .env.local
                fi
            else
                echo "❌ Failed to upload token to Key Vault"
            fi
        fi
    else
        echo "⚠️  Azure CLI not available or not logged in"
        echo "   Run 'az login' first to use Key Vault integration"
    fi
fi

echo ""
echo "🎉 Databricks setup complete!"
echo "📋 Summary:"
echo "   ✅ Databricks CLI configured"
echo "   ✅ Workspace: $WORKSPACE_NAME"
echo "   ✅ Host: $DATABRICKS_WORKSPACE_URL"
echo "   ✅ .env.local updated"
echo ""
echo "🚀 Next steps:"
echo "   1. Ensure DATABRICKS_TOKEN is set in .env.local"
echo "   2. Run: npm run dev:full"
echo "   3. Test ScoutBot AI features at http://localhost:3000/scoutbot"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If queries fail, check cluster is running in Databricks UI"
echo "   - If authentication fails, regenerate access token"
echo "   - For Key Vault access, ensure proper Azure permissions"