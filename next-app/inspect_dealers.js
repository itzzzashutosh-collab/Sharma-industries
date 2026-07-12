const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    const dList = await sql`SELECT * FROM dealers LIMIT 3`;
    console.log("Dealers sample records:");
    console.log(dList);

    const uList = await sql`SELECT * FROM users WHERE role = 'dealer' LIMIT 3`;
    console.log("Dealer users sample records:");
    console.log(uList);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
