# Direct Database Setup Guide

This guide explains how to configure Scout Analytics to connect directly to your SQL database instead of using Supabase.

## Supported Databases

- PostgreSQL (recommended)
- MySQL

## Quick Setup

### Option 1: Using Setup Script

```bash
./scripts/setup-database.sh
```

This interactive script will:
1. Prompt for your database type
2. Configure connection settings
3. Update your `.env` file
4. Optionally install database client libraries

### Option 2: Manual Configuration

1. **Install Database Client**

   For PostgreSQL:
   ```bash
   npm install pg @types/pg
   ```

   For MySQL:
   ```bash
   npm install mysql2
   ```

2. **Configure Environment Variables**

   Edit your `.env` file with either a connection string:

   ```env
   # PostgreSQL
   VITE_DATABASE_URL=postgresql://user:password@localhost:5432/scout_analytics
   
   # MySQL
   VITE_DATABASE_URL=mysql://user:password@localhost:3306/scout_analytics
   ```

   Or individual parameters:

   ```env
   VITE_DB_TYPE=postgres    # or 'mysql'
   VITE_DB_HOST=localhost
   VITE_DB_PORT=5432        # or 3306 for MySQL
   VITE_DB_USER=your_user
   VITE_DB_PASSWORD=your_password
   VITE_DB_NAME=scout_analytics
   ```

3. **Create Database Schema**

   Use the provided schema file to create tables:

   ```bash
   # PostgreSQL
   psql -U your_user -d scout_analytics < scout-analytics-complete/schema.sql
   
   # MySQL
   mysql -u your_user -p scout_analytics < scout-analytics-complete/schema.sql
   ```

## Database Schema

The Scout Analytics database includes the following tables:
- `transactions` - Sales transaction records
- `stores` - Store locations and metadata
- `devices` - POS device information
- `customers` - Customer profiles
- `products` - Product catalog
- `brands` - Brand information
- `transaction_items` - Line items for each transaction
- `request_behaviors` - Customer request patterns
- `substitutions` - Product substitution records

## Connection Security

### SSL/TLS Configuration

For production environments, enable SSL:

```env
VITE_DB_SSL=true
```

### Connection Pooling

The database client automatically handles connection pooling based on your database type.

## Migrating from Supabase

If you're migrating from Supabase:

1. Export your data from Supabase
2. Import into your database using the schema
3. Update API endpoints to use the new database client

## Troubleshooting

### Connection Refused
- Check database is running
- Verify host and port settings
- Ensure firewall allows connections

### Authentication Failed
- Verify username and password
- Check database user permissions
- Ensure database exists

### SSL Errors
- For development, you can disable SSL verification
- For production, ensure proper certificates are configured

## API Compatibility

The database client maintains API compatibility with Supabase:

```javascript
// Before (Supabase)
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('store_id', storeId);

// After (Direct SQL)
const { data, error } = await db
  .from('transactions')
  .select('*')
  .eq('store_id', storeId);
```

## Performance Optimization

1. **Indexes**: Create indexes on frequently queried columns
2. **Connection Pool**: Configure pool size based on load
3. **Query Optimization**: Use EXPLAIN to analyze slow queries

## Support

For database-specific issues:
- PostgreSQL: https://www.postgresql.org/docs/
- MySQL: https://dev.mysql.com/doc/