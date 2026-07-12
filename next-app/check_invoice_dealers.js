const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const invDealers = await sql`SELECT DISTINCT dealer_id FROM invoices LIMIT 5`;
    console.log("Distinct dealer_id in invoices:");
    console.log(invDealers);

    const ordDealers = await sql`SELECT DISTINCT dealer_id, dealer_name FROM orders LIMIT 5`;
    console.log("Distinct dealer_id in orders:");
    console.log(ordDealers);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
