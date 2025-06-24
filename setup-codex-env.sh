#!/bin/bash

echo "🚀 Setting up Scout Analytics Codex Environment..."

# Check if required files exist
if [ ! -f ".codexenv.yaml" ]; then
    echo "❌ .codexenv.yaml not found!"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

echo "✅ Environment files found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Test build
echo "🏗️ Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Test development server
echo "🧪 Testing development server..."
npm run dev &
DEV_PID=$!
sleep 5

# Check if server is responding
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server is working!"
    kill $DEV_PID
else
    echo "❌ Development server failed!"
    kill $DEV_PID
    exit 1
fi

echo ""
echo "🎉 Scout Analytics Codex Environment Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Commit .codexenv.yaml to your repo root"
echo "2. Update actual credentials in .env.local (don't commit this file)"
echo "3. Push to GitHub"
echo "4. In Codex UI, point to the repo - it will auto-load the config"
echo ""
echo "🔧 Available commands:"
echo "- npm run dev          # Start development server"
echo "- npm run build        # Build for production"
echo "- npm run preview      # Preview production build"
echo "- npm run deploy:azure # Deploy to Azure Static Web Apps"
echo ""
echo "🔗 Production URL: https://white-cliff-0f5160b0f.2.azurestaticapps.net"