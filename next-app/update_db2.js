const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Adding token_value to products...");
  await client.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS token_value INTEGER DEFAULT 10;
  `);

  console.log("Adding product_id to qr_registry...");
  await client.query(`
    ALTER TABLE qr_registry ADD COLUMN IF NOT EXISTS product_id TEXT REFERENCES products(id) ON DELETE SET NULL;
  `);

  console.log("Database schema updated!");
  await client.end();
}
run().catch(console.error);
