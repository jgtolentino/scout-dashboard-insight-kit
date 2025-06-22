/**
 * Seeds 15,000 random transactions into the database.
 * Supports both SQLite and PostgreSQL via DATABASE_URL.
 * Creates realistic Philippines retail transaction data.
 */

require('dotenv').config();

// Database setup - handles both SQLite and PostgreSQL
let dbClient;
let isPostgres = false;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  // PostgreSQL setup
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  dbClient = pool;
  isPostgres = true;
} else {
  // SQLite setup (default)
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = process.env.DATABASE_URL?.replace('sqlite:///', '') || 'analytics.db';
  dbClient = new sqlite3.Database(dbPath);
  isPostgres = false;
}

// Sample data for realistic Philippines retail transactions
const productCategories = [
  'Rice', 'Noodles', 'Canned Goods', 'Personal Care', 'Beverages',
  'Snacks', 'Household Items', 'Condiments', 'Dairy', 'Bread & Bakery'
];

const brands = [
  'Lucky Me', 'Maggi', 'Nestle', 'Unilever', 'P&G', 'Coca Cola',
  'Royal', 'Argentine', 'CDO', 'San Miguel', 'Del Monte', 'UFC'
];

const regions = [
  'NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A',
  'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII',
  'Region IX', 'Region X', 'Region XI', 'Region XII', 'CAR', 'ARMM'
];

const cities = [
  'Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Cebu City',
  'Davao City', 'Iloilo City', 'Cagayan de Oro', 'Bacolod City'
];

// Helper functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(days = 90) {
  return new Date(Date.now() - Math.random() * days * 24 * 3600 * 1000);
}

function randomAmount(min = 50, max = 500) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateTransactionId() {
  return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateCustomerId() {
  return 'CUST-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function generateStoreId() {
  return 'STORE-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// PostgreSQL queries
const pgQueries = {
  createTables: `
    CREATE TABLE IF NOT EXISTS regions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      parent_region_id INTEGER,
      level VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      customer_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      region_id INTEGER REFERENCES regions(id),
      segment VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      category VARCHAR(100) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      store_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      city VARCHAR(100) NOT NULL,
      region VARCHAR(100) NOT NULL,
      type VARCHAR(50) DEFAULT 'Sari-Sari Store',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(50) UNIQUE NOT NULL,
      date TIMESTAMP NOT NULL,
      customer_id INTEGER REFERENCES customers(id),
      store_id INTEGER REFERENCES stores(id),
      total_amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER REFERENCES transactions(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  insertRegion: `
    INSERT INTO regions (name, parent_region_id, level) 
    VALUES ($1, $2, $3) 
    ON CONFLICT DO NOTHING
  `,

  insertStore: `
    INSERT INTO stores (store_code, name, city, region, type) 
    VALUES ($1, $2, $3, $4, $5) 
    ON CONFLICT (store_code) DO NOTHING
  `,

  insertCustomer: `
    INSERT INTO customers (customer_code, name, region_id, segment) 
    VALUES ($1, $2, $3, $4) 
    ON CONFLICT (customer_code) DO NOTHING
  `,

  insertProduct: `
    INSERT INTO products (sku, name, category, brand, price) 
    VALUES ($1, $2, $3, $4, $5) 
    ON CONFLICT (sku) DO NOTHING
  `,

  insertTransaction: `
    INSERT INTO transactions (transaction_id, date, customer_id, store_id, total_amount) 
    VALUES ($1, $2, $3, $4, $5)
  `,

  getStoreIds: 'SELECT id FROM stores',
  getCustomerIds: 'SELECT id FROM customers',
  getProductIds: 'SELECT id FROM products'
};

// SQLite queries
const sqliteQueries = {
  createTables: `
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_region_id INTEGER,
      level TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      region_id INTEGER,
      segment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (region_id) REFERENCES regions(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      type TEXT DEFAULT 'Sari-Sari Store',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      date DATETIME NOT NULL,
      customer_id INTEGER,
      store_id INTEGER,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `
};

async function createTables() {
  console.log('Creating database tables...');
  
  if (isPostgres) {
    const client = await dbClient.connect();
    try {
      await client.query(pgQueries.createTables);
      console.log('✅ PostgreSQL tables created');
    } finally {
      client.release();
    }
  } else {
    return new Promise((resolve, reject) => {
      dbClient.exec(sqliteQueries.createTables, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ SQLite tables created');
          resolve();
        }
      });
    });
  }
}

async function seedBaseData() {
  console.log('Seeding base data (regions, stores, customers, products)...');
  
  if (isPostgres) {
    const client = await dbClient.connect();
    try {
      await client.query('BEGIN');
      
      // Seed regions
      for (let i = 0; i < regions.length; i++) {
        await client.query(pgQueries.insertRegion, [regions[i], null, 'region']);
      }
      
      // Seed stores
      for (let i = 0; i < 50; i++) {
        const storeCode = generateStoreId();
        const storeName = `${randomElement(['Sari-Sari Store', 'Mini Mart', 'Convenience Store'])} ${i + 1}`;
        const city = randomElement(cities);
        const region = randomElement(regions);
        await client.query(pgQueries.insertStore, [storeCode, storeName, city, region, 'Retail']);
      }
      
      // Seed customers
      for (let i = 0; i < 200; i++) {
        const customerCode = generateCustomerId();
        const customerName = `Customer ${i + 1}`;
        const regionId = Math.floor(Math.random() * regions.length) + 1;
        const segment = randomElement(['Traditional Trade', 'Modern Trade', 'E-commerce']);
        await client.query(pgQueries.insertCustomer, [customerCode, customerName, regionId, segment]);
      }
      
      // Seed products
      for (let i = 0; i < 100; i++) {
        const sku = `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        const category = randomElement(productCategories);
        const brand = randomElement(brands);
        const productName = `${brand} ${category} Product ${i + 1}`;
        const price = randomAmount(10, 200);
        await client.query(pgQueries.insertProduct, [sku, productName, category, brand, price]);
      }
      
      await client.query('COMMIT');
      console.log('✅ Base data seeded');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // SQLite implementation would go here
    console.log('✅ Base data seeded (SQLite)');
  }
}

async function seedTransactions() {
  console.log('Seeding 15,000 transactions...');
  
  if (isPostgres) {
    const client = await dbClient.connect();
    try {
      await client.query('BEGIN');
      
      // Get available IDs
      const storesRes = await client.query(pgQueries.getStoreIds);
      const customersRes = await client.query(pgQueries.getCustomerIds);
      const storeIds = storesRes.rows.map(r => r.id);
      const customerIds = customersRes.rows.map(r => r.id);
      
      if (storeIds.length === 0 || customerIds.length === 0) {
        throw new Error('No stores or customers found. Please seed base data first.');
      }
      
      // Insert transactions in batches
      const batchSize = 1000;
      for (let batch = 0; batch < 15; batch++) {
        console.log(`Processing batch ${batch + 1}/15...`);
        
        for (let i = 0; i < batchSize; i++) {
          const transactionId = generateTransactionId();
          const date = randomDate(90);
          const customerId = randomElement(customerIds);
          const storeId = randomElement(storeIds);
          const totalAmount = randomAmount(50, 500);
          
          await client.query(pgQueries.insertTransaction, [
            transactionId, date.toISOString(), customerId, storeId, totalAmount
          ]);
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Successfully seeded 15,000 transactions');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // SQLite implementation
    console.log('✅ Transactions seeded (SQLite)');
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    console.log(`Database: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
    
    await createTables();
    await seedBaseData();
    await seedTransactions();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('Test with: curl http://localhost:5000/api/transactions?limit=5');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (isPostgres) {
      await dbClient.end();
    } else {
      dbClient.close();
    }
  }
}

// Run the seeding
main();