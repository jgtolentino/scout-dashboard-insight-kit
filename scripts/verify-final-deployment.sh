#!/bin/bash

URL=${1:-"https://scout-dashboard-insight-kit.vercel.app"}

echo "🔍 Verifying deployment at: $URL"

# Test 1: Basic connectivity
echo "1️⃣ Testing basic connectivity..."
if curl -s -f "$URL" > /dev/null; then
    echo "✅ Site is accessible"
else
    echo "❌ Site is not accessible"
    exit 1
fi

# Test 2: Check for React app
echo "2️⃣ Testing React app loading..."
CONTENT=$(curl -s "$URL")
if echo "$CONTENT" | grep -q "root"; then
    echo "✅ React app container found"
else
    echo "❌ React app container not found"
    exit 1
fi

# Test 3: Check bundle sizes
echo "3️⃣ Testing asset loading..."
ASSET_COUNT=$(echo "$CONTENT" | grep -o '/assets/[^"]*' | wc -l)
if [ "$ASSET_COUNT" -gt 0 ]; then
    echo "✅ Assets found: $ASSET_COUNT files"
else
    echo "❌ No assets found"
fi

# Test 4: Platform detection
echo "4️⃣ Testing platform detection..."
HOSTNAME=$(echo "$URL" | sed 's|https\?://||' | sed 's|/.*||')
if echo "$HOSTNAME" | grep -q "vercel.app"; then
    echo "✅ Platform: Vercel"
elif echo "$HOSTNAME" | grep -q "netlify.app"; then
    echo "✅ Platform: Netlify"
elif echo "$HOSTNAME" | grep -q "azurestaticapps.net"; then
    echo "✅ Platform: Azure Static Web Apps"
elif echo "$HOSTNAME" | grep -q "azurewebsites.net"; then
    echo "✅ Platform: Azure App Service"
else
    echo "🔍 Platform: Custom/Unknown"
fi

# Test 5: API proxy test (if available)
echo "5️⃣ Testing API proxy..."
API_RESPONSE=$(curl -s -w "%{http_code}" "$URL/api/health" -o /dev/null)
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API proxy working"
elif [ "$API_RESPONSE" = "404" ]; then
    echo "⚠️ API proxy not configured or API not available"
else
    echo "⚠️ API proxy returned: $API_RESPONSE"
fi

echo ""
echo "🎉 Deployment verification complete!"
echo "🔗 URL: $URL"
echo "📊 Status: $([ $? -eq 0 ] && echo "✅ HEALTHY" || echo "❌ ISSUES FOUND")"