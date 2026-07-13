const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const list = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log("--- Public Tables ---");
    console.log(list.map(t => t.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
