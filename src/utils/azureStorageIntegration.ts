// Integration utilities for using Azure Storage in dashboard components
// This shows how to integrate storage operations with your existing analytics

import { azureStorageService } from '../services/azureStorageService';
import { enhancedAzureStorageService } from '../services/azureStorageServiceWithManagedIdentity';

// Choose which service to use based on environment
const storageService = import.meta.env.VITE_USE_MANAGED_IDENTITY === 'true' 
  ? enhancedAzureStorageService 
  : azureStorageService;

/**
 * Export analytics data to Azure Storage
 */
export async function exportAnalyticsReport(
  reportType: string,
  data: any,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${reportType}-${timestamp}.${format}`;
  
  let fileContent: string;
  let contentType: string;
  
  if (format === 'json') {
    fileContent = JSON.stringify(data, null, 2);
    contentType = 'application/json';
  } else {
    // Convert to CSV (simplified)
    fileContent = convertToCSV(data);
    contentType = 'text/csv';
  }
  
  const url = await storageService.uploadBlob({
    containerName: 'reports',
    blobName: fileName,
    data: fileContent,
    contentType,
    metadata: {
      reportType,
      generatedAt: new Date().toISOString(),
      format
    }
  });
  
  return url;
}

/**
 * Load saved reports from Azure Storage
 */
export async function loadSavedReports(reportType?: string): Promise<Array<{
  name: string;
  url: string;
  size?: number;
  lastModified?: Date;
  reportType?: string;
}>> {
  const blobs = await storageService.listBlobs({
    containerName: 'reports',
    prefix: reportType ? `${reportType}-` : undefined,
    maxResults: 50
  });
  
  return blobs.map(blob => ({
    ...blob,
    reportType: blob.name.split('-')[0]
  }));
}

/**
 * Download a report from Azure Storage
 */
export async function downloadReport(fileName: string): Promise<Blob> {
  return await storageService.downloadBlob({
    containerName: 'reports',
    blobName: fileName
  });
}

/**
 * Upload user data files (CSV imports, etc.)
 */
export async function uploadDataFile(
  file: File,
  category: 'transactions' | 'products' | 'customers' | 'other' = 'other'
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${category}/${timestamp}-${file.name}`;
  
  const url = await storageService.uploadBlob({
    containerName: 'uploads',
    blobName: fileName,
    data: file,
    contentType: file.type,
    metadata: {
      originalName: file.name,
      category,
      uploadedAt: new Date().toISOString(),
      size: file.size.toString()
    }
  });
  
  return url;
}

/**
 * Store dashboard configuration/state
 */
export async function saveDashboardConfig(
  userId: string,
  configName: string,
  config: any
): Promise<string> {
  const fileName = `configs/${userId}/${configName}.json`;
  
  const url = await storageService.uploadBlob({
    containerName: 'user-data',
    blobName: fileName,
    data: JSON.stringify(config, null, 2),
    contentType: 'application/json',
    metadata: {
      userId,
      configName,
      savedAt: new Date().toISOString()
    }
  });
  
  return url;
}

/**
 * Load dashboard configuration
 */
export async function loadDashboardConfig(
  userId: string,
  configName: string
): Promise<any> {
  try {
    const blob = await storageService.downloadBlob({
      containerName: 'user-data',
      blobName: `configs/${userId}/${configName}.json`
    });
    
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.warn(`Config ${configName} not found for user ${userId}`);
    return null;
  }
}

/**
 * Store analytics cache data
 */
export async function cacheAnalyticsData(
  cacheKey: string,
  data: any,
  expiryHours: number = 24
): Promise<void> {
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + expiryHours);
  
  await storageService.uploadBlob({
    containerName: 'cache',
    blobName: `${cacheKey}.json`,
    data: JSON.stringify({
      data,
      cachedAt: new Date().toISOString(),
      expiresAt: expiryTime.toISOString()
    }),
    contentType: 'application/json',
    metadata: {
      cacheKey,
      expiresAt: expiryTime.toISOString()
    }
  });
}

/**
 * Load cached analytics data
 */
export async function loadCachedAnalyticsData(cacheKey: string): Promise<any> {
  try {
    const blob = await storageService.downloadBlob({
      containerName: 'cache',
      blobName: `${cacheKey}.json`
    });
    
    const text = await blob.text();
    const cached = JSON.parse(text);
    
    // Check if cache is expired
    const expiryTime = new Date(cached.expiresAt);
    if (new Date() > expiryTime) {
      console.log(`Cache ${cacheKey} expired, removing...`);
      await storageService.deleteBlob({
        containerName: 'cache',
        blobName: `${cacheKey}.json`
      });
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.warn(`Cache ${cacheKey} not found or invalid`);
    return null;
  }
}

/**
 * Check storage service status
 */
export async function checkStorageStatus(): Promise<{
  isConfigured: boolean;
  accountName: string;
  authMethod?: string;
  connectionTest?: { success: boolean; message: string };
}> {
  const accountInfo = storageService.getAccountInfo();
  
  let connectionTest;
  if ('testConnection' in storageService) {
    connectionTest = await (storageService as any).testConnection();
  }
  
  return {
    ...accountInfo,
    connectionTest
  };
}

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

// Export the storage service for direct use
export { storageService };
