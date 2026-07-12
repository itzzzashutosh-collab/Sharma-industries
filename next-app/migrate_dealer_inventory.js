const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Dealer Inventory tables (dealer_stock_register)...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_stock_register (
        id SERIAL PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        qty_change NUMERIC NOT NULL,
        movement_type TEXT NOT NULL,
        reference_no TEXT,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_stock_register' created/verified.");

    // Seed initial stock logs if empty
    const countLogs = await sql`SELECT count(*) FROM dealer_stock_register`;
    if (parseInt(countLogs[0].count) === 0) {
      console.log("Seeding initial stock movements...");
      // Let's query products to link actual ids
      const products = await sql`SELECT id, product_name FROM products LIMIT 3`;
      if (products.length > 0) {
        await sql`
          INSERT INTO dealer_stock_register (product_id, product_name, qty_change, movement_type, reference_no, remarks)
          VALUES 
            (${products[0].id}, ${products[0].product_name}, 100, 'Factory Purchase', 'ORD-9824', 'Stock replenishment from factory'),
            (${products[0].id}, ${products[0].product_name}, -5, 'Customer Sale', 'INV-1024', 'Retail customer sale'),
            (${products[1]?.id || products[0].id}, ${products[1]?.product_name || products[0].product_name}, 50, 'Factory Purchase', 'ORD-9825', 'Initial stock setup')
        `;
        console.log("✅ Initial stock movements seeded.");
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
