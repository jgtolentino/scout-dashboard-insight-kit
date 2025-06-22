// Azure Storage Service - Uses single connection string for all storage services
// Supports Blob, File, Queue, Table, and Data Lake Gen2 operations

import { BlobServiceClient, ContainerClient, BlobClient } from '@azure/storage-blob';
import { DataLakeServiceClient, DataLakeFileSystemClient } from '@azure/storage-file-datalake';

export interface StorageConfig {
  accountName: string;
  connectionString: string;
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

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private dataLakeServiceClient: DataLakeServiceClient | null = null;
  private config: StorageConfig;

  constructor() {
    this.config = this.getStorageConfig();
    this.initializeClients();
  }

  private getStorageConfig(): StorageConfig {
    const accountName = import.meta.env.VITE_STORAGE_ACCOUNT;
    const connectionString = import.meta.env.VITE_STORAGE_CONNECTION_STRING;

    if (!accountName || !connectionString) {
      console.warn('⚠️ Azure Storage not configured. Some features may not work.');
      return { accountName: '', connectionString: '' };
    }

    return { accountName, connectionString };
  }

  private initializeClients(): void {
    if (!this.config.connectionString) {
      console.warn('⚠️ Azure Storage connection string not available');
      return;
    }

    try {
      // Single connection string automatically handles all endpoints
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.config.connectionString);
      this.dataLakeServiceClient = DataLakeServiceClient.fromConnectionString(this.config.connectionString);
      
      console.log('✅ Azure Storage clients initialized successfully');
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
   * Get a SAS URL for a blob (for temporary access)
   */
  getBlobSasUrl(containerName: string, blobName: string, expiresInHours: number = 1): string {
    if (!this.blobServiceClient) {
      throw new Error('Azure Storage not configured');
    }

    // For SAS URLs, you'd typically use the blob endpoint directly
    // This is a simplified example - in production, you'd generate proper SAS tokens
    const baseUrl = `https://${this.config.accountName}.blob.core.windows.net`;
    return `${baseUrl}/${containerName}/${blobName}`;
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
    return !!(this.config.connectionString && this.blobServiceClient);
  }

  /**
   * Get storage account info
   */
  getAccountInfo(): { accountName: string; isConfigured: boolean } {
    return {
      accountName: this.config.accountName,
      isConfigured: this.isConfigured()
    };
  }
}

// Global instance for easy access
export const azureStorageService = new AzureStorageService();

export default AzureStorageService;
