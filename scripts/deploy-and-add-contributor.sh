#!/bin/bash
# Deploy Scout Analytics and manage contributors

set -e

echo "🚀 Scout Analytics Deployment & Contributor Management"
echo ""

# Deployment Section
echo "1️⃣ Deploying to Production..."

# Check if we have Vercel installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Deploy to Vercel (if configured)
if [ -f "vercel.json" ]; then
    echo "Deploying to Vercel..."
    vercel --prod --yes
else
    echo "No vercel.json found, skipping Vercel deployment"
fi

# Deploy to Azure (if configured)
if [ -f ".env.production" ] && grep -q "AZURE_CLIENT_ID" .env.production; then
    echo "Deploying to Azure..."
    npm run build
    
    # Use Azure CLI to deploy
    if command -v az &> /dev/null; then
        az webapp deployment source config-zip \
            --resource-group scout-analytics-rg \
            --name scout-analytics-app \
            --src dist.zip
    else
        echo "Azure CLI not found, skipping Azure deployment"
    fi
fi

# GitHub Contributor Section
echo ""
echo "2️⃣ GitHub Repository Info..."

# Get repository info
REPO_OWNER="jgtolentino"
REPO_NAME="scout-dashboard-insight-kit"
GITHUB_USER="jgtolentinoas"

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Adding contributor: $GITHUB_USER"

# Note about GitHub permissions
cat << EOF

📝 To add $GITHUB_USER as a contributor:

Since this is a GitHub repository, contributors need to be added through GitHub's web interface:

1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/access
2. Click "Add people"
3. Search for: $GITHUB_USER
4. Select permission level:
   - Read: Can view code
   - Triage: Can manage issues
   - Write: Can push code (recommended for contributors)
   - Maintain: Can manage repository settings
   - Admin: Full control

Or use GitHub CLI if installed:
gh api repos/$REPO_OWNER/$REPO_NAME/collaborators/$GITHUB_USER -X PUT -f permission=push

EOF

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "3️⃣ Attempting to add contributor via GitHub CLI..."
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        # Add collaborator
        echo "Adding $GITHUB_USER as collaborator with write access..."
        gh api repos/$REPO_OWNER/$REPO_NAME/collaborators/$GITHUB_USER \
            -X PUT \
            -f permission=push \
            && echo "✅ Successfully added $GITHUB_USER as contributor!" \
            || echo "❌ Failed to add contributor (you may need admin access)"
    else
        echo "⚠️  GitHub CLI not authenticated. Run: gh auth login"
    fi
else
    echo "⚠️  GitHub CLI not installed. Install with: brew install gh"
fi

# Azure Contributor Section
echo ""
echo "4️⃣ Azure Contributor Setup..."

if command -v az &> /dev/null && [ -f ".env.production" ]; then
    # Get subscription ID
    SUBSCRIPTION_ID=$(grep AZURE_SUBSCRIPTION_ID .env.production | cut -d'=' -f2)
    RESOURCE_GROUP="scout-analytics-rg"
    
    cat << EOF

To add s224670304@deakin.edu.au as Azure contributor:

az role assignment create \
    --assignee "s224670304@deakin.edu.au" \
    --role "Contributor" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"

EOF
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Summary:"
echo "- Code pushed to GitHub ✅"
echo "- To add GitHub contributor: Visit settings or use gh CLI"
echo "- To add Azure contributor: Use az role assignment"