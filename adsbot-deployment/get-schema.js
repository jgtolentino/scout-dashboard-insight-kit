#!/usr/bin/env node

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
  },
};

async function getTableSchema() {
  const pool = new ConnectionPool(config);
  await pool.connect();
  
  const tables = [
    'tbwa_business_predictions',
    'tbwa_campaign_documents', 
    'tbwa_campaigns',
    'tbwa_creative_analysis',
    'tbwa_data_metadata'
  ];
  
  const schema = {};
  
  for (const table of tables) {
    console.log(`\n📋 ${table.toUpperCase()}`);
    console.log('=' .repeat(50));
    
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ces' AND TABLE_NAME = '${table}'
      ORDER BY ORDINAL_POSITION
    `);
    
    schema[table] = result.recordset;
    
    result.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}${length} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get sample data
    try {
      const sampleResult = await pool.request().query(`SELECT TOP 2 * FROM ces.${table}`);
      if (sampleResult.recordset.length > 0) {
        console.log('\nSample data:');
        console.log(JSON.stringify(sampleResult.recordset[0], null, 2));
      }
    } catch (error) {
      console.log(`Error getting sample: ${error.message}`);
    }
  }
  
  await pool.close();
  
  // Save schema to file
  require('fs').writeFileSync('schema.json', JSON.stringify(schema, null, 2));
  console.log('\n✅ Schema saved to schema.json');
}

getTableSchema().catch(console.error);