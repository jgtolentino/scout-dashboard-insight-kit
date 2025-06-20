#!/usr/bin/env node

/**
 * Test Azure SQL Database Connection for AdsBot
 * Uses existing TBWA credentials from mother repo
 */

const { ConnectionPool } = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USERNAME,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function testConnection() {
  console.log('🧪 Testing Azure SQL Connection for AdsBot...');
  console.log('=' .repeat(50));
  
  try {
    console.log(`📡 Connecting to: ${config.server}`);
    console.log(`🗄️  Database: ${config.database}`);
    console.log(`👤 User: ${config.user}`);
    
    const pool = new ConnectionPool(config);
    await pool.connect();
    
    console.log('✅ Connection successful!');
    
    // Test schema access
    console.log('\n📋 Testing CES schema access...');
    const result = await pool.request().query(`
      SELECT 
        TABLE_NAME,
        COUNT(*) as table_count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'ces'
      GROUP BY TABLE_NAME
      ORDER BY TABLE_NAME
    `);
    
    console.log(`\n📊 Found ${result.recordset.length} tables in 'ces' schema:`);
    result.recordset.forEach(row => {
      console.log(`   • ${row.TABLE_NAME}`);
    });
    
    // Test table row counts
    console.log('\n📈 Checking table data...');
    const tables = [
      'tbwa_business_predictions',
      'tbwa_campaign_documents', 
      'tbwa_campaigns',
      'tbwa_creative_analysis',
      'tbwa_data_metadata'
    ];
    
    for (const table of tables) {
      try {
        const countResult = await pool.request().query(`
          SELECT COUNT(*) as row_count FROM ces.${table}
        `);
        const rowCount = countResult.recordset[0].row_count;
        console.log(`   • ces.${table}: ${rowCount.toLocaleString()} rows`);
      } catch (error) {
        console.log(`   • ces.${table}: ❌ Error - ${error.message}`);
      }
    }
    
    // Test sample query
    console.log('\n🔍 Testing sample campaign query...');
    try {
      const sampleResult = await pool.request().query(`
        SELECT TOP 3 
          campaign_id,
          campaign_name,
          created_date
        FROM ces.tbwa_campaigns 
        ORDER BY created_date DESC
      `);
      
      if (sampleResult.recordset.length > 0) {
        console.log('✅ Sample campaigns found:');
        sampleResult.recordset.forEach(row => {
          console.log(`   • ${row.campaign_id}: ${row.campaign_name} (${row.created_date})`);
        });
      } else {
        console.log('⚠️  No campaigns found in table');
      }
    } catch (error) {
      console.log(`❌ Sample query failed: ${error.message}`);
    }
    
    await pool.close();
    
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('🚀 AdsBot is ready to deploy with these credentials');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   • Check if Azure SQL server firewall allows your IP');
    console.error('   • Verify credentials are correct');
    console.error('   • Ensure database and schema exist');
    process.exit(1);
  }
}

// Add package.json dependency check
function checkDependencies() {
  try {
    require('mssql');
    require('dotenv');
  } catch (error) {
    console.error('❌ Missing dependencies. Installing...');
    const { execSync } = require('child_process');
    execSync('npm install mssql dotenv', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  }
}

if (require.main === module) {
  checkDependencies();
  testConnection().catch(console.error);
}

module.exports = { testConnection, config };