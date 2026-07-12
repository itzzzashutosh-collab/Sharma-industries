const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const list = await sql`SELECT * FROM customers LIMIT 5`;
    console.log("Customers in DB:");
    console.log(list);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
