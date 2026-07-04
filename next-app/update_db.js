const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Adding total_tokens to painters...");
  await client.query(`
    ALTER TABLE painters ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0;
  `);

  console.log("Adding qr_range to invoices...");
  await client.query(`
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS qr_range TEXT;
  `);

  console.log("Creating qr_registry table...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS qr_registry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      qr_code TEXT UNIQUE NOT NULL,
      invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
      dealer_id UUID,
      status TEXT DEFAULT 'AVAILABLE',
      scanned_by UUID REFERENCES painters(id) ON DELETE SET NULL,
      scanned_at TIMESTAMP WITH TIME ZONE,
      token_value INTEGER DEFAULT 10
    );
  `);

  console.log("Creating withdrawal_history table...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS withdrawal_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      painter_id UUID REFERENCES painters(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database schema updated successfully!");
  await client.end();
}
run().catch(console.error);
