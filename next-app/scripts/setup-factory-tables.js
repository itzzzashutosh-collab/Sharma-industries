const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS factory_expenses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      expense_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS factory_assets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      purchase_value NUMERIC NOT NULL,
      current_value NUMERIC NOT NULL,
      purchase_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log("Factory tables created successfully.");
  await client.end();
}

main().catch(console.error);
