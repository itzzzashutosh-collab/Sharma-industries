const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers'
    `;
    console.log("--- customers Columns ---");
    cols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
