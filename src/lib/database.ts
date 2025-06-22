// Database client wrapper for direct SQL connections
// This replaces Supabase with direct database access

import { getDatabaseConfig, buildConnectionString } from '@/config/database';

export interface QueryResult<T = any> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}

export class DatabaseClient {
  private config = getDatabaseConfig();
  private connectionString = buildConnectionString(this.config);

  // Query executor - in production, you'd use a proper SQL client library
  // For now, this is a template showing the structure
  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      // In production, you would use:
      // - For PostgreSQL: pg library
      // - For MySQL: mysql2 library
      
      console.log('Executing query:', sql);
      console.log('With params:', params);
      
      // Mock response for development
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        return {
          data: [] as T[],
          error: null
        };
      }

      // Real database connection would go here
      throw new Error('Database client not implemented. Install pg for PostgreSQL or mysql2 for MySQL.');
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  // Helper methods matching Supabase API
  from(table: string) {
    return new QueryBuilder(this, table);
  }
}

// Query builder to match Supabase-like API
class QueryBuilder<T = any> {
  private client: DatabaseClient;
  private table: string;
  private whereClause: string[] = [];
  private selectColumns: string = '*';
  private orderByClause: string = '';
  private limitValue?: number;
  private params: any[] = [];

  constructor(client: DatabaseClient, table: string) {
    this.client = client;
    this.table = table;
  }

  select(columns: string = '*') {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.whereClause.push(`${column} = $${this.params.length + 1}`);
    this.params.push(value);
    return this;
  }

  gte(column: string, value: any) {
    this.whereClause.push(`${column} >= $${this.params.length + 1}`);
    this.params.push(value);
    return this;
  }

  lte(column: string, value: any) {
    this.whereClause.push(`${column} <= $${this.params.length + 1}`);
    this.params.push(value);
    return this;
  }

  in(column: string, values: any[]) {
    const placeholders = values.map((_, i) => `$${this.params.length + i + 1}`).join(',');
    this.whereClause.push(`${column} IN (${placeholders})`);
    this.params.push(...values);
    return this;
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderByClause = `ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  async execute(): Promise<QueryResult<T>> {
    let sql = `SELECT ${this.selectColumns} FROM ${this.table}`;
    
    if (this.whereClause.length > 0) {
      sql += ` WHERE ${this.whereClause.join(' AND ')}`;
    }
    
    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }
    
    if (this.limitValue) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    return this.client.query<T>(sql, this.params);
  }

  // Aliases for Supabase compatibility
  then(resolve: (result: QueryResult<T>) => void, reject?: (error: Error) => void) {
    this.execute().then(resolve).catch(reject || (() => {}));
  }
}

// Export a singleton instance
export const db = new DatabaseClient();

// RPC function compatibility
export async function rpc(functionName: string, params?: any): Promise<QueryResult> {
  // Map RPC functions to SQL queries
  const rpcQueries: Record<string, (params: any) => { sql: string; params: any[] }> = {
    get_hourly_volume: (p) => ({
      sql: `
        SELECT 
          DATE_FORMAT(created_at, '%H:00') as hour,
          COUNT(*) as count,
          SUM(total_amount) as sum_amount
        FROM transactions
        WHERE created_at >= $1 AND created_at <= $2
        ${p.store_id ? 'AND store_id = $3' : ''}
        GROUP BY hour
        ORDER BY hour
      `,
      params: [p.start_date, p.end_date, ...(p.store_id ? [p.store_id] : [])]
    }),
    
    get_category_mix: (p) => ({
      sql: `
        SELECT 
          p.category,
          COUNT(DISTINCT ti.transaction_id) as count,
          (COUNT(DISTINCT ti.transaction_id) * 100.0 / 
            (SELECT COUNT(DISTINCT transaction_id) FROM transaction_items)) as share
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        JOIN transactions t ON ti.transaction_id = t.transaction_id
        WHERE t.created_at >= $1 AND t.created_at <= $2
        GROUP BY p.category
        ORDER BY count DESC
      `,
      params: [p.start_date, p.end_date]
    })
  };

  const queryBuilder = rpcQueries[functionName];
  if (!queryBuilder) {
    return { data: null, error: new Error(`RPC function ${functionName} not implemented`) };
  }

  const { sql, params: queryParams } = queryBuilder(params);
  return db.query(sql, queryParams);
}