const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    console.log("--- Column Schema for sales_visits ---");
    const colsVisits = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sales_visits'
    `;
    console.log(colsVisits.map(c => `${c.column_name}: ${c.data_type}`));

    console.log("\n--- Column Schema for sales_activities ---");
    const colsAct = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sales_activities'
    `;
    console.log(colsAct.map(c => `${c.column_name}: ${c.data_type}`));

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
