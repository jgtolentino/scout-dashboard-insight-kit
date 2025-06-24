/**
 * Scout Analytics Dashboard v3.0 - Azure SDK Bypass
 * Direct REST API calls when App Registration is not available
 */

import { shouldBypassAuth } from '../auth/authFallback';

/**
 * Azure OpenAI Direct API Call (bypass SDK)
 */
export async function callAzureOpenAI(
  messages: any[],
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}
) {
  const endpoint = import.meta.env.AZURE_OPENAI_ENDPOINT || import.meta.env.VITE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.AZURE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_KEY;
  const deploymentName = import.meta.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
  const apiVersion = import.meta.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI credentials not configured');
  }

  const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * SQL Server Direct Connection (bypass Azure auth)
 */
export function getSqlConnectionConfig() {
  return {
    server: import.meta.env.SQL_SERVER || import.meta.env.VITE_SQL_SERVER,
    database: import.meta.env.SQL_DATABASE || import.meta.env.VITE_SQL_DATABASE,
    user: import.meta.env.SQL_USERNAME || import.meta.env.VITE_SQL_USER,
    password: import.meta.env.SQL_PASSWORD || import.meta.env.VITE_SQL_PASSWORD,
    port: 1433,
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true
    }
  };
}

/**
 * Databricks Direct API Call (bypass SDK)
 */
export async function callDatabricksAPI(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
  } = {}
) {
  const workspaceUrl = import.meta.env.DATABRICKS_WORKSPACE_URL;
  const token = import.meta.env.DATABRICKS_TOKEN;

  if (!workspaceUrl || !token) {
    // Return mock data for development
    console.warn('Databricks not configured, returning mock data');
    return getMockDatabricksResponse(endpoint);
  }

  const url = `${workspaceUrl}/api/2.0${endpoint}`;

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Databricks API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Mock Databricks responses for development
 */
function getMockDatabricksResponse(endpoint: string) {
  const mockResponses: Record<string, any> = {
    '/clusters/list': {
      clusters: [
        {
          cluster_id: 'mock-cluster-001',
          cluster_name: 'scout-analytics-cluster',
          state: 'RUNNING',
          node_type_id: 'Standard_DS3_v2',
          num_workers: 2
        }
      ]
    },
    '/workspace/list': {
      objects: [
        {
          path: '/scout-analytics',
          object_type: 'DIRECTORY',
          language: null
        }
      ]
    }
  };

  return Promise.resolve(mockResponses[endpoint] || { mock: true, endpoint });
}

/**
 * Azure Storage Direct API (bypass SDK)
 */
export async function callAzureStorage(
  containerName: string,
  blobName?: string,
  options: {
    method?: string;
    body?: any;
  } = {}
) {
  const accountName = import.meta.env.AZURE_STORAGE_ACCOUNT_NAME || 'projectscoutdata';
  const connectionString = import.meta.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('Azure Storage not configured, returning mock data');
    return getMockStorageResponse(containerName, blobName);
  }

  // Parse connection string to extract account key
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
  if (!accountKeyMatch) {
    throw new Error('Invalid Azure Storage connection string');
  }

  // For now, return mock data until proper SAS token implementation
  return getMockStorageResponse(containerName, blobName);
}

/**
 * Mock Azure Storage responses
 */
function getMockStorageResponse(containerName: string, blobName?: string) {
  if (blobName) {
    return Promise.resolve({
      name: blobName,
      container: containerName,
      size: 1024,
      lastModified: new Date().toISOString(),
      contentType: 'application/json',
      mock: true
    });
  }

  return Promise.resolve({
    blobs: [
      {
        name: 'bronze/sales_data.parquet',
        size: 2048,
        lastModified: new Date().toISOString()
      },
      {
        name: 'silver/processed_sales.parquet',
        size: 1536,
        lastModified: new Date().toISOString()
      }
    ],
    container: containerName,
    mock: true
  });
}

/**
 * Main bypass checker - returns appropriate client based on configuration
 */
export function getAzureClient(service: 'openai' | 'storage' | 'databricks') {
  const useMocks = shouldBypassAuth();

  switch (service) {
    case 'openai':
      return {
        chat: {
          completions: {
            create: callAzureOpenAI
          }
        },
        isMock: useMocks
      };

    case 'storage':
      return {
        listBlobs: (container: string) => callAzureStorage(container),
        getBlob: (container: string, blob: string) => callAzureStorage(container, blob),
        isMock: useMocks
      };

    case 'databricks':
      return {
        clusters: {
          list: () => callDatabricksAPI('/clusters/list')
        },
        workspace: {
          list: () => callDatabricksAPI('/workspace/list')
        },
        isMock: useMocks
      };

    default:
      throw new Error(`Unknown Azure service: ${service}`);
  }
}