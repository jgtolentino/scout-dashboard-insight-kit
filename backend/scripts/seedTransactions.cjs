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

async function seedSQLiteData() {
  console.log('Setting up SQLite database with sample data...');
  
  return new Promise((resolve, reject) => {
    // Create tables
    const createTablesSQL = `
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
    `;

    dbClient.exec(createTablesSQL, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('✅ Tables created');

      // Seed regions
      const regionStmt = dbClient.prepare("INSERT OR IGNORE INTO regions (name, parent_region_id, level) VALUES (?, ?, ?)");
      regions.forEach(region => {
        regionStmt.run(region, null, 'region');
      });
      regionStmt.finalize();

      // Seed stores
      const storeStmt = dbClient.prepare("INSERT OR IGNORE INTO stores (store_code, name, city, region, type) VALUES (?, ?, ?, ?, ?)");
      for (let i = 0; i < 50; i++) {
        const storeCode = generateStoreId();
        const storeName = `${randomElement(['Sari-Sari Store', 'Mini Mart', 'Convenience Store'])} ${i + 1}`;
        const city = randomElement(cities);
        const region = randomElement(regions);
        storeStmt.run(storeCode, storeName, city, region, 'Retail');
      }
      storeStmt.finalize();

      // Seed customers
      const customerStmt = dbClient.prepare("INSERT OR IGNORE INTO customers (customer_code, name, region_id, segment) VALUES (?, ?, ?, ?)");
      for (let i = 0; i < 200; i++) {
        const customerCode = generateCustomerId();
        const customerName = `Customer ${i + 1}`;
        const regionId = Math.floor(Math.random() * regions.length) + 1;
        const segment = randomElement(['Traditional Trade', 'Modern Trade', 'E-commerce']);
        customerStmt.run(customerCode, customerName, regionId, segment);
      }
      customerStmt.finalize();

      // Seed products
      const productStmt = dbClient.prepare("INSERT OR IGNORE INTO products (sku, name, category, brand, price) VALUES (?, ?, ?, ?, ?)");
      for (let i = 0; i < 100; i++) {
        const sku = `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        const category = randomElement(productCategories);
        const brand = randomElement(brands);
        const productName = `${brand} ${category} Product ${i + 1}`;
        const price = randomAmount(10, 200);
        productStmt.run(sku, productName, category, brand, price);
      }
      productStmt.finalize();

      console.log('✅ Base data seeded');

      // Get IDs for transactions
      dbClient.all("SELECT id FROM stores", (err, storeRows) => {
        if (err) {
          reject(err);
          return;
        }

        dbClient.all("SELECT id FROM customers", (err, customerRows) => {
          if (err) {
            reject(err);
            return;
          }

          const storeIds = storeRows.map(r => r.id);
          const customerIds = customerRows.map(r => r.id);

          // Seed transactions
          console.log('Seeding 15,000 transactions...');
          const transactionStmt = dbClient.prepare("INSERT INTO transactions (transaction_id, date, customer_id, store_id, total_amount) VALUES (?, ?, ?, ?, ?)");
          
          for (let i = 0; i < 15000; i++) {
            const transactionId = generateTransactionId();
            const date = randomDate(90);
            const customerId = randomElement(customerIds);
            const storeId = randomElement(storeIds);
            const totalAmount = randomAmount(50, 500);
            
            transactionStmt.run(transactionId, date.toISOString(), customerId, storeId, totalAmount);
            
            if (i % 1000 === 0) {
              console.log(`Progress: ${i + 1}/15000 transactions`);
            }
          }
          
          transactionStmt.finalize((err) => {
            if (err) {
              reject(err);
            } else {
              console.log('✅ Successfully seeded 15,000 transactions');
              resolve();
            }
          });
        });
      });
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    console.log(`Database: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
    
    if (isPostgres) {
      console.log('PostgreSQL seeding not implemented yet. Using SQLite...');
      process.exit(1);
    } else {
      await seedSQLiteData();
    }
    
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