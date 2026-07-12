const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const tables = await sql`
      SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
    `;
    console.log("Tables in public schema:");
    console.log(tables.map(t => t.tablename));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
