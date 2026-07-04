const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  const getColumns = async (table) => {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    return res.rows;
  };

  const materials = await getColumns('materials');
  const bills = await getColumns('material_bills');
  
  console.log("materials:", materials.length > 0 ? materials : "NOT FOUND");
  console.log("material_bills:", bills.length > 0 ? bills : "NOT FOUND");

  // If not found, let's create them!
  if (materials.length === 0) {
    await client.query(`
      CREATE TABLE materials (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        stock_quantity NUMERIC DEFAULT 0,
        min_stock NUMERIC DEFAULT 0,
        unit TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE material_bills (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        material_id UUID REFERENCES materials(id),
        supplier_name TEXT NOT NULL,
        quantity NUMERIC NOT NULL,
        rate NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        bill_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Seed some initial data
      INSERT INTO materials (name, category, stock_quantity, min_stock, unit) VALUES
      ('Titanium Dioxide (TiO2)', 'Chemicals', 450, 500, 'kg'),
      ('Acrylic Emulsion Binder', 'Emulsions', 1200, 1000, 'L'),
      ('Defoamer', 'Additives', 45, 50, 'L'),
      ('Calcium Carbonate', 'Extenders', 8000, 5000, 'kg'),
      ('10L Empty Buckets', 'Packaging', 150, 300, 'pcs'),
      ('20L Empty Buckets', 'Packaging', 400, 200, 'pcs');
    `);
    console.log("Created and seeded tables!");
  }

  await client.end();
}

main().catch(console.error);
