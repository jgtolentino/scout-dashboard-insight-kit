// Database configuration for direct SQL connections
// Supports both PostgreSQL and MySQL

export interface DatabaseConfig {
  type: 'postgres' | 'mysql';
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

// Parse connection string or use individual parameters
export function getDatabaseConfig(): DatabaseConfig {
  const connectionString = import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
  const dbType = (import.meta.env.VITE_DB_TYPE || process.env.DB_TYPE || 'postgres') as 'postgres' | 'mysql';

  if (connectionString) {
    return {
      type: dbType,
      connectionString,
      ssl: import.meta.env.PROD ? { rejectUnauthorized: false } : false
    };
  }

  // Fallback to individual environment variables
  return {
    type: dbType,
    host: import.meta.env.VITE_DB_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_DB_PORT || process.env.DB_PORT || (dbType === 'postgres' ? '5432' : '3306')),
    user: import.meta.env.VITE_DB_USER || process.env.DB_USER,
    password: import.meta.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD,
    database: import.meta.env.VITE_DB_NAME || process.env.DB_NAME,
    ssl: import.meta.env.PROD ? { rejectUnauthorized: false } : false
  };
}

// Helper to build connection string from parts
export function buildConnectionString(config: DatabaseConfig): string {
  if (config.connectionString) {
    return config.connectionString;
  }

  const { type, host, port, user, password, database } = config;
  
  if (!host || !user || !database) {
    throw new Error('Missing required database configuration');
  }

  const protocol = type === 'postgres' ? 'postgresql' : 'mysql';
  const auth = password ? `${user}:${password}` : user;
  
  return `${protocol}://${auth}@${host}:${port}/${database}`;
}