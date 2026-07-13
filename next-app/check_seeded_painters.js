const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const list = await sql`SELECT id, name, phone, total_tokens, total_redeemed FROM painters LIMIT 5`;
    console.log("--- Seeded Painters ---");
    console.log(list);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
