require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    await client.query(`DROP TABLE IF EXISTS public.competitor_products CASCADE;`);
    
    await client.query(`
      CREATE TABLE public.competitor_products (
        id TEXT PRIMARY KEY,
        brand TEXT,
        category TEXT,
        subcategory TEXT,
        product_name TEXT,
        description TEXT,
        pack_size TEXT,
        mrp NUMERIC,
        finish TEXT,
        coverage TEXT,
        drying_time TEXT,
        recoat_time TEXT,
        application_area TEXT,
        recommended_surface JSONB,
        features JSONB,
        benefits JSONB,
        available_colours JSONB,
        technology TEXT,
        warranty TEXT,
        interior_exterior TEXT,
        washability TEXT,
        voc TEXT,
        sheen TEXT,
        texture TEXT,
        source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('Table competitor_products recreated successfully.');
  } catch (err) {
    console.error('Error recreating table:', err);
  } finally {
    await client.end();
  }
}

run();
