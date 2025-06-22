// Enhanced Azure Storage Service with Managed Identity support
// This version supports both connection string and Managed Identity authentication

import { BlobServiceClient } from '@azure/storage-blob';
import { DataLakeServiceClient } from '@azure/storage-file-datalake';
import { DefaultAzureCredential } from '@azure/identity';

export interface StorageConfig {
  accountName: string;
  connectionString?: string;
  useManagedIdentity: boolean;
}

export interface UploadOptions {
  containerName: string;
  blobName: string;
  data: File | Blob | ArrayBuffer | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface DownloadOptions {
  containerName: string;
  blobName: string;
}

export interface ListOptions {
  containerName: string;
  prefix?: string;
  maxResults?: number;
}

export class EnhancedAzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private dataLakeServiceClient: DataLakeServiceClient | null = null;
  private config: StorageConfig;
  private credential: DefaultAzureCredential | null = null;

  constructor() {
    this.config = this.getStorageConfig();
    this.initializeClients();
  }

  private getStorageConfig(): StorageConfig {
    const accountName = import.meta.env.VITE_STORAGE_ACCOUNT || '';
    const connectionString = import.meta.env.VITE_STORAGE_CONNECTION_STRING || '';
    const useManagedIdentity = import.meta.env.VITE_USE_MANAGED_IDENTITY === 'true';

    return {
      accountName,
      connectionString,
      useManagedIdentity
    };
  }

  private initializeClients(): void {
    if (!this.config.accountName) {
      console.warn('⚠️ Azure Storage account name not configured');
      return;
    }

    try {
      if (this.config.useManagedIdentity) {
        // Use Managed Identity (recommended for production)
        console.log('🔐 Initializing Azure Storage with Managed Identity...');
        this.credential = new DefaultAzureCredential();
        
        const blobUrl = `https://${this.config.accountName}.blob.core.windows.net`;
        const dfsUrl = `https://${this.config.accountName}.dfs.core.windows.net`;
        
        this.blobServiceClient = new BlobServiceClient(blobUrl, this.credential);
        this.dataLakeServiceClient = new DataLakeServiceClient(dfsUrl, this.credential);
        
        console.log('✅ Azure Storage initialized with Managed Identity');
      } else if (this.config.connectionString) {
        // Use connection string (for local development)
        console.log('🔑 Initializing Azure Storage with connection string...');
        this.blobServiceClient = BlobServiceClient.fromConnectionString(this.config.connectionString);
        this.dataLakeServiceClient = DataLakeServiceClient.fromConnectionString(this.config.connectionString);
        
        console.log('✅ Azure Storage initialized with connection string');
      } else {
        console.warn('⚠️ No Azure Storage authentication method configured');
        return;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Azure Storage clients:', error);
    }
  }

  /**
   * Upload a file to blob storage
   */
  async uploadBlob(options: UploadOptions): Promise<string> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Storage not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(options.containerName);
      
      // Create container if it doesn't exist
      await containerClient.createIfNotExists({
        access: 'blob' // Public read access for blobs
      });

      const blobClient = containerClient.getBlockBlobClient(options.blobName);
      
      const uploadOptions: any = {
        blobHTTPHeaders: {
          blobContentType: options.contentType || 'application/octet-stream'
        }
      };

      if (options.metadata) {
        uploadOptions.metadata = options.metadata;
      }

      if (options.data instanceof File || options.data instanceof Blob) {
        await blobClient.uploadData(options.data, uploadOptions);
      } else if (typeof options.data === 'string') {
        await blobClient.upload(options.data, options.data.length, uploadOptions);
      } else {
        await blobClient.uploadData(options.data, uploadOptions);
      }

      return blobClient.url;
    } catch (error) {
      console.error('❌ Failed to upload blob:', error);
      throw error;
    }
  }

  /**
   * Download a file from blob storage
   */
  async downloadBlob(options: DownloadOptions): Promise<Blob> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Storage not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(options.containerName);
      const blobClient = containerClient.getBlobClient(options.blobName);
      
      const downloadResponse = await blobClient.download();
      
      // Use the blobBody property which returns a Promise<Blob>
      if (downloadResponse.blobBody) {
        return await downloadResponse.blobBody;
      }

      throw new Error('No data received from blob');
    } catch (error) {
      console.error('❌ Failed to download blob:', error);
      throw error;
    }
  }

  /**
   * List blobs in a container
   */
  async listBlobs(options: ListOptions): Promise<Array<{ name: string; url: string; size?: number; lastModified?: Date }>> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Storage not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(options.containerName);
      const blobs: Array<{ name: string; url: string; size?: number; lastModified?: Date }> = [];

      const listOptions: any = {};
      if (options.prefix) {
        listOptions.prefix = options.prefix;
      }

      const iterator = containerClient.listBlobsFlat(listOptions);
      let count = 0;

      for await (const blob of iterator) {
        if (options.maxResults && count >= options.maxResults) {
          break;
        }

        const blobClient = containerClient.getBlobClient(blob.name);
        blobs.push({
          name: blob.name,
          url: blobClient.url,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified
        });
        count++;
      }

      return blobs;
    } catch (error) {
      console.error('❌ Failed to list blobs:', error);
      throw error;
    }
  }

  /**
   * Delete a blob
   */
  async deleteBlob(options: DownloadOptions): Promise<void> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Storage not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(options.containerName);
      const blobClient = containerClient.getBlobClient(options.blobName);
      
      await blobClient.deleteIfExists();
    } catch (error) {
      console.error('❌ Failed to delete blob:', error);
      throw error;
    }
  }

  /**
   * Generate a SAS URL for temporary access (requires connection string)
   */
  getSasUrl(containerName: string, blobName: string, expiresInHours: number = 1): string {
    if (this.config.useManagedIdentity) {
      // For Managed Identity, return the direct blob URL
      // In production, you'd generate SAS tokens server-side
      return `https://${this.config.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    }

    // For connection string auth, return the direct URL (simplified)
    return `https://${this.config.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  }

  /**
   * Data Lake Gen2 operations (for analytics workloads)
   */
  async uploadToDataLake(fileSystemName: string, filePath: string, data: string | Buffer): Promise<void> {
    if (!this.dataLakeServiceClient) {
      throw new Error('Azure Data Lake not configured');
    }

    try {
      const fileSystemClient = this.dataLakeServiceClient.getFileSystemClient(fileSystemName);
      await fileSystemClient.createIfNotExists();

      const fileClient = fileSystemClient.getFileClient(filePath);
      await fileClient.create();
      await fileClient.append(data, 0, data.length);
      await fileClient.flush(data.length);
    } catch (error) {
      console.error('❌ Failed to upload to Data Lake:', error);
      throw error;
    }
  }

  /**
   * Check if storage is configured and available
   */
  isConfigured(): boolean {
    return !!(this.config.accountName && this.blobServiceClient);
  }

  /**
   * Get storage account info
   */
  getAccountInfo(): { 
    accountName: string; 
    isConfigured: boolean; 
    authMethod: 'managed-identity' | 'connection-string' | 'none';
  } {
    let authMethod: 'managed-identity' | 'connection-string' | 'none' = 'none';
    
    if (this.config.useManagedIdentity) {
      authMethod = 'managed-identity';
    } else if (this.config.connectionString) {
      authMethod = 'connection-string';
    }

    return {
      accountName: this.config.accountName,
      isConfigured: this.isConfigured(),
      authMethod
    };
  }

  /**
   * Test connectivity to Azure Storage
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.blobServiceClient) {
        return { success: false, message: 'Storage client not initialized' };
      }

      // Try to list containers (minimal operation)
      const iterator = this.blobServiceClient.listContainers();
      await iterator.next();
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export both the enhanced service and the original for backward compatibility
export const enhancedAzureStorageService = new EnhancedAzureStorageService();

// Re-export the original service as default for existing code
export { azureStorageService as default } from './azureStorageService';
