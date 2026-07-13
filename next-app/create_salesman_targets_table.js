const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Creating and seeding salesman_targets table...");
  try {
    // 1. Create table
    await sql`
      CREATE TABLE IF NOT EXISTS salesman_targets (
        salesman_id TEXT PRIMARY KEY,
        salesman_name TEXT NOT NULL,
        target_revenue NUMERIC DEFAULT 500000,
        target_collections NUMERIC DEFAULT 150000,
        assigned_territory TEXT DEFAULT 'Rajasthan East',
        target_painters INTEGER DEFAULT 10,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Table salesman_targets created.");

    // 2. Seed initial data
    await sql`
      INSERT INTO salesman_targets (salesman_id, salesman_name, target_revenue, target_collections, assigned_territory, target_painters)
      VALUES ('SM-101', 'Rajesh Kumar', 500000, 150000, 'Rajasthan East', 10)
      ON CONFLICT (salesman_id) DO NOTHING
    `;
    console.log("✅ Seeded Rajesh Kumar targets.");

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
