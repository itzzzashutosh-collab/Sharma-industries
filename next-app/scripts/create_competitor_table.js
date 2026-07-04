require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.competitor_products (
        id TEXT PRIMARY KEY,
        competitor_brand TEXT NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT,
        pack_size TEXT,
        mrp NUMERIC,
        dealer_price NUMERIC,
        scheme_details TEXT,
        last_updated DATE,
        sentiment TEXT
      );
    `);
    
    // Check if the table is created
    console.log('Table competitor_products created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

run();
