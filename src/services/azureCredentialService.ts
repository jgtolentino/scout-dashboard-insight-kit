// Azure Credential Service - "One-and-Done" Authentication
// Uses DefaultAzureCredential for seamless local dev and cloud authentication

import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export interface AzureConfig {
  keyVaultName?: string;
  tenantId?: string;
  clientId?: string;
  sqlServer?: string;
  sqlDatabase?: string;
}

export class AzureCredentialService {
  private credential: DefaultAzureCredential;
  private secretClient: SecretClient | null = null;
  private config: AzureConfig;

  constructor(config: AzureConfig = {}) {
    // Initialize DefaultAzureCredential - works locally with 'az login' and in Azure with Managed Identity
    this.credential = new DefaultAzureCredential({
      managedIdentityClientId: config.clientId || process.env.AZURE_CLIENT_ID,
      tenantId: config.tenantId || process.env.AZURE_TENANT_ID
    });

    this.config = {
      keyVaultName: config.keyVaultName || process.env.KEY_VAULT_NAME || 'kv-projectscout-prod',
      tenantId: config.tenantId || process.env.AZURE_TENANT_ID,
      clientId: config.clientId || process.env.AZURE_CLIENT_ID,
      sqlServer: config.sqlServer || process.env.AZURE_SQL_SERVER || 'scout-sql-server.database.windows.net',
      sqlDatabase: config.sqlDatabase || process.env.AZURE_SQL_DATABASE || 'scout_analytics'
    };

    // Initialize Key Vault client if name is provided
    if (this.config.keyVaultName) {
      const keyVaultUrl = `https://${this.config.keyVaultName}.vault.azure.net`;
      this.secretClient = new SecretClient(keyVaultUrl, this.credential);
    }
  }

  /**
   * Get a secret from Key Vault
   */
  async getSecret(secretName: string): Promise<string | undefined> {
    if (!this.secretClient) {
      console.warn('Key Vault client not initialized. Using environment variables as fallback.');
      return process.env[secretName];
    }

    try {
      const secret = await this.secretClient.getSecret(secretName);
      return secret.value;
    } catch (error) {
      console.warn(`Failed to get secret '${secretName}' from Key Vault:`, error);
      
      // Fallback to environment variables
      const envValue = process.env[secretName] || process.env[`VITE_${secretName}`];
      if (envValue) {
        console.log(`Using environment variable fallback for '${secretName}'`);
        return envValue;
      }
      
      return undefined;
    }
  }

  /**
   * Get database connection string with Managed Identity authentication
   */
  async getDatabaseConnectionString(): Promise<string> {
    // Try to get from Key Vault first
    const kvConnectionString = await this.getSecret('DbConnectionString');
    if (kvConnectionString) {
      return kvConnectionString;
    }

    // Generate connection string with Managed Identity
    const connectionString = `Server=tcp:${this.config.sqlServer},1433;Database=${this.config.sqlDatabase};Authentication=Active Directory Default;`;
    
    console.log('Using Managed Identity database connection');
    return connectionString;
  }

  /**
   * Get Azure OpenAI configuration from Key Vault or environment
   */
  async getAzureOpenAIConfig(): Promise<{
    endpoint: string;
    apiKey?: string;
    deployment: string;
    apiVersion: string;
  }> {
    const endpoint = await this.getSecret('AzureOpenAIEndpoint') || 
                     await this.getSecret('VITE_AZURE_OPENAI_ENDPOINT') ||
                     'https://tbwa-openai.openai.azure.com';
    
    const apiKey = await this.getSecret('AzureOpenAIKey') || 
                   await this.getSecret('VITE_AZURE_OPENAI_KEY');
    
    const deployment = await this.getSecret('AzureOpenAIDeployment') || 
                       await this.getSecret('VITE_AZURE_OPENAI_DEPLOYMENT') ||
                       'gpt-4';
    
    const apiVersion = await this.getSecret('AzureOpenAIAPIVersion') || 
                       await this.getSecret('VITE_AZURE_OPENAI_API_VERSION') ||
                       '2024-02-15-preview';

    return {
      endpoint,
      apiKey,
      deployment,
      apiVersion
    };
  }

  /**
   * Get access token for a specific Azure resource
   */
  async getAccessToken(scope: string): Promise<string | null> {
    try {
      const tokenResponse = await this.credential.getToken(scope);
      return tokenResponse?.token || null;
    } catch (error) {
      console.warn(`Failed to get access token for scope '${scope}':`, error);
      return null;
    }
  }

  /**
   * Get SQL Database access token
   */
  async getSQLAccessToken(): Promise<string | null> {
    return this.getAccessToken('https://database.windows.net/');
  }

  /**
   * Test the credential and connections
   */
  async testConnections(): Promise<{
    credentialWorking: boolean;
    keyVaultAccess: boolean;
    sqlTokenAvailable: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let credentialWorking = false;
    let keyVaultAccess = false;
    let sqlTokenAvailable = false;

    // Test basic credential
    try {
      const token = await this.credential.getToken('https://management.azure.com/');
      credentialWorking = !!token;
    } catch (error) {
      errors.push(`Credential test failed: ${error}`);
    }

    // Test Key Vault access
    if (this.secretClient) {
      try {
        await this.getSecret('test-secret-that-does-not-exist');
        keyVaultAccess = true; // If no error, we have access (even if secret doesn't exist)
      } catch (error) {
        // Check if it's a "secret not found" error vs access denied
        const errorMessage = error?.toString() || '';
        if (errorMessage.includes('NotFound')) {
          keyVaultAccess = true; // We have access, secret just doesn't exist
        } else {
          errors.push(`Key Vault access failed: ${error}`);
        }
      }
    }

    // Test SQL token
    try {
      const sqlToken = await this.getSQLAccessToken();
      sqlTokenAvailable = !!sqlToken;
    } catch (error) {
      errors.push(`SQL token acquisition failed: ${error}`);
    }

    return {
      credentialWorking,
      keyVaultAccess,
      sqlTokenAvailable,
      errors
    };
  }

  /**
   * Get configuration summary
   */
  getConfigSummary(): AzureConfig & { keyVaultUrl?: string } {
    return {
      ...this.config,
      keyVaultUrl: this.config.keyVaultName ? `https://${this.config.keyVaultName}.vault.azure.net` : undefined
    };
  }
}

// Global instance for easy access
export const azureCredentialService = new AzureCredentialService();

// Utility function to check if we're running in Azure
export const isRunningInAzure = (): boolean => {
  return !!(
    process.env.WEBSITE_SITE_NAME || // Azure App Service
    process.env.AZURE_CLIENT_ID ||   // Managed Identity
    process.env.MSI_ENDPOINT        // Azure VM with Managed Identity
  );
};

// Utility function to check if Azure CLI is available locally
export const isAzureCLIAvailable = (): boolean => {
  return !!(
    process.env.AZURE_CLIENT_ID && 
    process.env.AZURE_TENANT_ID &&
    !isRunningInAzure()
  );
};

export default AzureCredentialService;