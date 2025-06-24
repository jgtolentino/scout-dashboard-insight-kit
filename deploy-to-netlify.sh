#!/bin/bash

echo "🚀 Deploying Scout Dashboard Insight Kit to Netlify..."

# Build first (if not already built)
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
fi

# Create new site and deploy
echo "🌐 Creating new Netlify site..."
netlify init --manual

# Or if you want to deploy without prompts:
# netlify deploy --prod --dir=dist --site-name="scout-dashboard-insight-kit"

echo "✅ Deployment complete!"
echo "Visit your Netlify dashboard to see the deployed site."