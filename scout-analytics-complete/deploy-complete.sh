#!/bin/bash
# Complete deployment script for Scout Analytics MVP to Azure
# This script deploys both the API backend and React frontend

set -euo pipefail

echo "🚀 Starting complete Scout Analytics MVP deployment to Azure..."
echo "📅 $(date)"

# Step 1: Deploy API Backend
echo ""
echo "=== STEP 1: Deploying API Backend ==="
chmod +x deploy-api.sh
./deploy-api.sh

# Wait for API deployment to complete
echo "⏳ Waiting 30 seconds for API to fully initialize..."
sleep 30

# Step 2: Deploy Frontend Dashboard
echo ""
echo "=== STEP 2: Deploying Frontend Dashboard ==="
chmod +x deploy-frontend.sh
./deploy-frontend.sh

echo ""
echo "🎉 Complete deployment finished!"
echo "📊 Your Scout Analytics MVP is now live on Azure!"
echo ""
echo "🔗 API Backend: https://scout-analytics-api.azurewebsites.net"
echo "🔗 Dashboard Frontend: https://scout-analytics-dashboard.azurewebsites.net"
echo ""
echo "🧪 Test endpoints:"
echo "   • API Health: https://scout-analytics-api.azurewebsites.net/api/transactions"
echo "   • ScoutBot AI: https://scout-analytics-api.azurewebsites.net/api/ask"
echo "   • Dashboard: https://scout-analytics-dashboard.azurewebsites.net"
echo ""
echo "✅ Deployment complete!"

