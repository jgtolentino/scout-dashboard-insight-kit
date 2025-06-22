# Azure Storage Setup Guide

This guide explains how to configure Azure Storage using a single connection string approach, as recommended by Microsoft Azure.

## Overview

Instead of managing individual endpoint URLs for different Azure Storage services (Blob, File, Queue, Table, Data Lake Gen2), you can use a **single connection string** that contains all the necessary endpoints. Azure's SDK automatically routes requests to the appropriate service endpoints.

## Environment Configuration

### 1. Get Your Azure Storage Credentials

Use the Azure CLI to fetch your storage account connection string:

```bash
# Get the connection string
AZ_STORAGE_CONN=$(az storage account show-connection-string \
  --name projectscoutdata \
  --resource-group RG-TBWA-ProjectScout-Data \
  --query connectionString -o tsv)

# Get other Azure credentials if needed
AZ_OPENAI_KEY=$(az cognitiveservices account keys list \
  --name ces-openai-20250609 \
  --resource-group RG-TBWA-ProjectScout-Data \
  --query key1 -o tsv)
```

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```dotenv
# ▶️ Azure Storage
VITE_STORAGE_ACCOUNT=projectscoutdata
VITE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=projectscoutdata;AccountKey=...;EndpointSuffix=core.windows.net"

# ▶️ Other Azure services
VITE_OPENAI_ENDPOINT=https://ces-openai-20250609.openai.azure.com/
VITE_OPENAI_KEY=${AZ_OPENAI_KEY}

# ▶️ Application settings
VITE_API_URL=https://scout-analytics-dashboard.azurewebsites.net
VITE_USE_MOCKS=false
VITE_DISABLE_AUTH=false
```

### 3. Ensure `.env.local` is Ignored

Make sure `.env.local` is in your `.gitignore` file (it already is via the `*.local` pattern).

## How It Works

### Single Connection String Benefits

1. **Simplified Configuration**: One connection string handles all storage services
2. **Automatic Endpoint Resolution**: Azure SDK automatically routes to the correct endpoints
3. **No Manual URL Management**: No need to hardcode individual service URLs

### Available Endpoints (Auto-Generated)

When you provide the connection string, Azure automatically provides access to:

- **Blob Storage**: `https://projectscoutdata.blob.core.windows.net`
- **File Storage**: `https://projectscoutdata.file.core.windows.net`
- **Queue Storage**: `https://projectscoutdata.queue.core.windows.net`
- **Table Storage**: `https://projectscoutdata.table.core.windows.net`
- **Data Lake Gen2**: `https://projectscoutdata.dfs.core.windows.net`
- **Static Website**: `https://projectscoutdata.z13.web.core.windows.net`

## Usage Examples

### Basic Blob Operations

```typescript
import { azureStorageService } from '../services/azureStorageService';

// Upload a file
const url = await azureStorageService.uploadBlob({
  containerName: 'my-container',
  blobName: 'my-file.txt',
  data: file, // File object from input
  contentType: 'text/plain'
});

// Download a file
const blob = await azureStorageService.downloadBlob({
  containerName: 'my-container',
  blobName: 'my-file.txt'
});

// List files
const files = await azureStorageService.listBlobs({
  containerName: 'my-container',
  maxResults: 10
});

// Delete a file
await azureStorageService.deleteBlob({
  containerName: 'my-container',
  blobName: 'my-file.txt'
});
```

### Data Lake Gen2 Operations

```typescript
// Upload to Data Lake (for analytics workloads)
await azureStorageService.uploadToDataLake(
  'analytics-filesystem',
  'data/2025/01/transactions.json',
  JSON.stringify(analyticsData)
);
```

### Check Configuration

```typescript
const accountInfo = azureStorageService.getAccountInfo();
console.log('Storage Account:', accountInfo.accountName);
console.log('Is Configured:', accountInfo.isConfigured);
```

## When You Might Need Direct Endpoints

While the connection string approach works for 99% of cases, you might need direct endpoint URLs for:

1. **Static Website Hosting**: Point CDN or custom domain to the web endpoint
2. **SAS Token URLs**: Combine with SAS tokens for temporary access
3. **Direct REST API Calls**: When not using the Azure SDK

Example SAS URL construction:
```typescript
const sasUrl = `https://projectscoutdata.blob.core.windows.net/container/file.txt?${sasToken}`;
```

## Demo Component

A complete demo component is available at `src/components/AzureStorageExample.tsx` that shows:

- File upload with metadata
- File download
- Blob listing
- File deletion
- Error handling
- Loading states

## Security Notes

1. **Never commit `.env.local`** - it contains sensitive credentials
2. **Use SAS tokens** for temporary access instead of sharing connection strings
3. **Rotate keys regularly** using Azure Key Vault or Azure CLI
4. **Use Managed Identity** in production Azure environments

## Troubleshooting

### Common Issues

1. **"Azure Storage not configured"**
   - Check that `VITE_STORAGE_ACCOUNT` and `VITE_STORAGE_CONNECTION_STRING` are set
   - Verify the connection string format is correct

2. **CORS errors in browser**
   - Configure CORS settings in your Azure Storage account
   - Allow your domain in the CORS configuration

3. **Authentication errors**
   - Verify your connection string is current and valid
   - Check that the storage account key hasn't been rotated

### Getting Help

- Check the browser console for detailed error messages
- Use Azure Storage Explorer to verify your storage account setup
- Test connectivity using the demo component

## Files Created

This setup includes the following files:

### Core Implementation
- `.env.local` - Local environment configuration (not committed)
- `.env.template` - Template with all required variables including Managed Identity option
- `src/services/azureStorageService.ts` - Main storage service (connection string)
- `src/services/azureStorageServiceWithManagedIdentity.ts` - Enhanced service with Managed Identity support
- `src/config/azureStorage.ts` - Configuration utilities

### UI Components & Pages
- `src/components/AzureStorageExample.tsx` - Complete demo component
- `src/pages/AzureStoragePage.tsx` - Demo page wrapper
- Updated `src/App.tsx` - Added routing for `/azure-storage`
- Updated `src/components/AppSidebar.tsx` - Added navigation link

### Integration Utilities
- `src/utils/azureStorageIntegration.ts` - Helper functions for dashboard integration
- `AZURE_STORAGE_SETUP.md` - This comprehensive documentation

## Accessing the Demo

The Azure Storage demo is now available in your application:

1. **Via Navigation**: Click "Azure Storage" in the sidebar
2. **Direct URL**: Navigate to `/azure-storage` in your browser
3. **From Code**: Import and use the `AzureStorageExample` component

## Integration Examples

### Export Dashboard Reports

```typescript
import { exportAnalyticsReport } from '../utils/azureStorageIntegration';

// Export transaction data as CSV
const url = await exportAnalyticsReport('transaction-trends', transactionData, 'csv');
console.log('Report saved to:', url);
```

### Upload User Data Files

```typescript
import { uploadDataFile } from '../utils/azureStorageIntegration';

// Handle file upload in your components
const handleFileUpload = async (file: File) => {
  const url = await uploadDataFile(file, 'transactions');
  console.log('File uploaded to:', url);
};
```

### Cache Analytics Data

```typescript
import { cacheAnalyticsData, loadCachedAnalyticsData } from '../utils/azureStorageIntegration';

// Cache expensive analytics calculations
await cacheAnalyticsData('monthly-trends', calculatedData, 24); // 24 hours

// Load cached data
const cachedData = await loadCachedAnalyticsData('monthly-trends');
if (cachedData) {
  // Use cached data
} else {
  // Recalculate and cache
}
```

## Production Deployment with Managed Identity

For production, enable Managed Identity authentication:

1. **Set environment variable**: `VITE_USE_MANAGED_IDENTITY=true`
2. **Configure App Service**: Enable User-Assigned Managed Identity
3. **Grant permissions**: Assign "Storage Blob Data Contributor" role to the identity
4. **Remove connection string**: No longer needed with Managed Identity

## Next Steps

1. **Fill in real credentials** in `.env.local` using the CLI commands provided
2. **Test the demo** by navigating to `/azure-storage` in your app
3. **Configure CORS** in Azure Storage account if needed for browser access
4. **Integrate storage operations** into your existing dashboard components using the utility functions
5. **Consider Managed Identity** for production deployment for enhanced security
6. **Set up monitoring** and logging for storage operations in production
