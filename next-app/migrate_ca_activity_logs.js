const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating ca_activity_logs table...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS ca_activity_logs (
        id SERIAL PRIMARY KEY,
        user_name TEXT,
        role TEXT,
        module TEXT,
        action TEXT,
        prev_value TEXT,
        new_value TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_activity_logs' created successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
