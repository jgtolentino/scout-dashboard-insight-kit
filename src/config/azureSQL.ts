// Azure SQL Database configuration
// Supports both direct connection and connection string approaches

export interface AzureSQLConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  connectionString?: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    connectionTimeout: number;
  };
}

/**
 * Get Azure SQL configuration from environment variables
 */
export function getAzureSQLConfig(): AzureSQLConfig {
  const server = import.meta.env.VITE_SQL_SERVER || '';
  const database = import.meta.env.VITE_SQL_DATABASE || '';
  const user = import.meta.env.VITE_SQL_USER || '';
  const password = import.meta.env.VITE_SQL_PASSWORD || '';

  return {
    server,
    database,
    user,
    password,
    options: {
      encrypt: true,
      trustServerCertificate: false,
      connectionTimeout: 30
    }
  };
}

/**
 * Build ODBC connection string for Azure SQL
 */
export function buildAzureSQLConnectionString(config: AzureSQLConfig): string {
  return [
    `Server=${config.server}`,
    `Database=${config.database}`,
    `Uid=${config.user}`,
    `Pwd=${config.password}`,
    `Encrypt=${config.options.encrypt ? 'yes' : 'no'}`,
    `TrustServerCertificate=${config.options.trustServerCertificate ? 'yes' : 'no'}`,
    `Connection Timeout=${config.options.connectionTimeout}`
  ].join(';') + ';';
}

/**
 * Build connection URL for various SQL libraries
 */
export function buildAzureSQLUrl(config: AzureSQLConfig): string {
  const encodedPassword = encodeURIComponent(config.password);
  return `mssql://${config.user}:${encodedPassword}@${config.server}/${config.database}?encrypt=true&trustServerCertificate=false`;
}

/**
 * Check if Azure SQL is configured
 */
export function isAzureSQLConfigured(): boolean {
  const config = getAzureSQLConfig();
  return !!(config.server && config.database && config.user && config.password);
}

export default getAzureSQLConfig;
