#!/bin/bash

# Test Scout Analytics Access
echo "🧪 Testing Scout Analytics access..."

# Set subscription
az account set --subscription c03c092c-443c-4f25-9efe-33f092621251

echo "1️⃣ Testing subscription access..."
az account show --query "{Name:name, State:state}" --output table

echo ""
echo "2️⃣ Testing storage account access..."
az storage account show \
  --name scoutanalyticsdata \
  --resource-group scout-dashboard-rg \
  --query "{Name:name, Location:location, Kind:kind}" \
  --output table

echo ""
echo "3️⃣ Testing Gold layer access..."
az storage blob list \
  --container-name gold \
  --account-name scoutanalyticsdata \
  --output table

echo ""
echo "✅ Access test complete!"
