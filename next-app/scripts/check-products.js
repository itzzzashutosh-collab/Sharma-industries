const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  const res = await client.query(`
    SELECT id, name, is_master_product 
    FROM products
  `);
  
  console.log("Current Products:", res.rows);

  if (res.rows.length > 0 && !res.rows.some(r => r.is_master_product)) {
    // Make them master products if none are
    await client.query(`UPDATE products SET is_master_product = true`);
    console.log("Updated existing products to be master products.");
  } else if (res.rows.length === 0) {
    // Seed some products
    await client.query(`
      INSERT INTO products (name, sku, unit, purchase_price, selling_price, stock, min_stock, is_master_product) VALUES
      ('Rustic Royale Emulsion 20L', 'RR-20L', 'Buckets', 1200, 1800, 500, 100, true),
      ('WeatherGuard Exterior 20L', 'WG-20L', 'Buckets', 1500, 2200, 300, 50, true),
      ('SmoothFinish Primer 10L', 'SF-10L', 'Buckets', 600, 950, 800, 200, true);
    `);
    console.log("Seeded master products.");
  }

  await client.end();
}

main().catch(console.error);
