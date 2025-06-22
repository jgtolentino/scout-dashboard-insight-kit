#!/bin/bash

PLATFORM=${1:-"vercel"}

echo "🚀 Deploying Scout Analytics to $PLATFORM..."

# Verify build works first
echo "🏗️ Building application..."
npm run build || {
    echo "❌ Build failed! Attempting recovery..."
    npm run recover
    npm run build || {
        echo "❌ Build still failing after recovery. Aborting deployment."
        exit 1
    }
}

case $PLATFORM in
  "vercel")
    echo "📦 Deploying to Vercel..."
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod --confirm || vercel deploy --prod
    
    echo "✅ Vercel deployment complete!"
    echo "🔗 Check: https://scout-dashboard-insight-kit.vercel.app"
    ;;
    
  "netlify")
    echo "📦 Deploying to Netlify..."
    
    # Install Netlify CLI if not present
    if ! command -v netlify &> /dev/null; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy
    netlify deploy --prod --dir=dist || netlify deploy --prod --dir=dist --auth $NETLIFY_AUTH_TOKEN
    
    echo "✅ Netlify deployment complete!"
    ;;
    
  "azure-swa")
    echo "📦 Deploying to Azure Static Web Apps..."
    
    # Install Azure CLI if not present
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI required. Install from: https://docs.microsoft.com/en-us/cli/azure/"
        exit 1
    fi
    
    # Deploy using Azure Static Web Apps CLI
    if ! command -v swa &> /dev/null; then
        echo "Installing Azure Static Web Apps CLI..."
        npm install -g @azure/static-web-apps-cli
    fi
    
    swa deploy ./dist --env production
    
    echo "✅ Azure Static Web Apps deployment complete!"
    ;;
    
  "azure-app-service")
    echo "📦 Deploying to Azure App Service (via GitHub Actions)..."
    
    # Commit and push to trigger GitHub Actions
    git add -A
    git commit -m "deploy: Trigger Azure App Service deployment

🚀 Automated deployment from deploy-multi-platform.sh script
📦 Build verified locally before deployment
🔗 Platform: Azure App Service" || echo "No changes to commit"
    
    git push origin $(git branch --show-current)
    
    echo "✅ Triggered Azure App Service deployment via GitHub Actions!"
    echo "🔗 Monitor: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]//;s/.git$//')/actions"
    ;;
    
  "github-pages")
    echo "📦 Deploying to GitHub Pages..."
    
    # Install gh-pages if not present
    if ! npm list gh-pages &> /dev/null; then
        echo "Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Deploy
    npx gh-pages -d dist
    
    echo "✅ GitHub Pages deployment complete!"
    ;;
    
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo ""
    echo "Usage: $0 [platform]"
    echo ""
    echo "Available platforms:"
    echo "  vercel          - Deploy to Vercel (recommended)"
    echo "  netlify         - Deploy to Netlify"
    echo "  azure-swa       - Deploy to Azure Static Web Apps"
    echo "  azure-app-service - Deploy via GitHub Actions to Azure App Service"
    echo "  github-pages    - Deploy to GitHub Pages"
    echo ""
    echo "Examples:"
    echo "  $0 vercel"
    echo "  $0 netlify"
    echo "  $0 azure-swa"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Deployment Summary:"
echo "- Platform: $PLATFORM"
echo "- Build: ✅ Successful"
echo "- API URL: Auto-detected based on platform"
echo "- Routing: Configured for SPA + API proxy"
echo ""
echo "🔍 Next steps:"
echo "1. Wait for DNS propagation (1-2 minutes)"
echo "2. Test the deployed site"
echo "3. Verify API connectivity"
echo "4. Check deployment logs if needed"