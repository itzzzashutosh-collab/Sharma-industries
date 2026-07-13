const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  try {
    console.log("--- Column Schema for painter_ledger ---");
    const colsLedger = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'painter_ledger'
    `;
    console.log(colsLedger.map(c => `${c.column_name}: ${c.data_type}`));

    console.log("\n--- Column Schema for rewards_catalog ---");
    const colsCatalog = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rewards_catalog'
    `;
    console.log(colsCatalog.map(c => `${c.column_name}: ${c.data_type}`));

    console.log("\n--- Column Schema for withdrawal_history ---");
    const colsWithdrawal = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'withdrawal_history'
    `;
    console.log(colsWithdrawal.map(c => `${c.column_name}: ${c.data_type}`));

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
