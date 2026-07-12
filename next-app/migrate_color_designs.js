const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Dealer Color Studio table (dealer_color_designs)...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_color_designs (
        id SERIAL PRIMARY KEY,
        customer_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        image_url TEXT,
        selected_colors JSONB,
        estimated_cost NUMERIC,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_color_designs' created/verified.");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
