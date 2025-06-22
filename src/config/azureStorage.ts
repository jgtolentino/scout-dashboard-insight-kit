// Azure Storage configuration
// Uses single connection string for all storage services (Blob, File, Queue, Table, Data Lake Gen2)

export interface AzureStorageConfig {
  accountName: string;
  connectionString: string;
  isConfigured: boolean;
}

/**
 * Get Azure Storage configuration from environment variables
 * Uses the single connection string approach as recommended by Azure
 */
export function getAzureStorageConfig(): AzureStorageConfig {
  const accountName = import.meta.env.VITE_STORAGE_ACCOUNT || '';
  const connectionString = import.meta.env.VITE_STORAGE_CONNECTION_STRING || '';

  return {
    accountName,
    connectionString,
    isConfigured: !!(accountName && connectionString)
  };
}

/**
 * Get individual endpoint URLs (for reference or direct REST API calls)
 * These are automatically derived from the storage account name
 */
export function getStorageEndpoints(accountName: string) {
  if (!accountName) {
    return null;
  }

  return {
    // Primary endpoints that Azure SDK uses automatically
    blob: `https://${accountName}.blob.core.windows.net`,
    file: `https://${accountName}.file.core.windows.net`,
    queue: `https://${accountName}.queue.core.windows.net`,
    table: `https://${accountName}.table.core.windows.net`,
    dfs: `https://${accountName}.dfs.core.windows.net`, // Data Lake Gen2
    web: `https://${accountName}.z13.web.core.windows.net` // Static website (if enabled)
  };
}

/**
 * Helper to build SAS URL for direct access
 * Note: In production, SAS tokens should be generated server-side for security
 */
export function buildSasUrl(accountName: string, containerName: string, blobName: string, sasToken: string): string {
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

export default getAzureStorageConfig;
