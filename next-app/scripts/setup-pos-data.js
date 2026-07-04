const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  // Create painters table
  await client.query(`
    CREATE TABLE IF NOT EXISTS painters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      dealer_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `);
  console.log("Painters table created/verified.");

  // Insert dummy painters
  await client.query(`
    INSERT INTO painters (name, phone, dealer_id) 
    VALUES 
      ('Raju Painter', '9911223344', 'USR_DLR_002'),
      ('Suresh Colors', '9911223355', 'USR_DLR_002')
    ON CONFLICT (phone) DO NOTHING;
  `);
  console.log("Dummy painters inserted.");

  // Insert dummy products into the existing products table
  // Checking if products table is empty
  const res = await client.query('SELECT count(*) FROM products');
  if (parseInt(res.rows[0].count) === 0) {
    await client.query(`
      INSERT INTO products (id, name, sku, purchase_price, selling_price, stock, category) 
      VALUES 
        ('PRD-001', 'Rustic Royale Emulsion 20L', 'RR-EMU-20', 3200, 4500, 50, 'Emulsion'),
        ('PRD-002', 'Premium Gloss Enamel 4L', 'PG-ENM-04', 1100, 1650, 120, 'Enamel'),
        ('PRD-003', 'WeatherGuard Exterior 10L', 'WG-EXT-10', 2100, 3100, 80, 'Exterior'),
        ('PRD-004', 'SmoothWall Primer 20L', 'SW-PRM-20', 1800, 2600, 200, 'Primer')
    `);
    console.log("Dummy products inserted.");
  } else {
    console.log("Products already exist.");
  }

  await client.end();
}

main().catch(console.error);
