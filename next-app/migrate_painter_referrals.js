const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Setting up referred painters records for Rajesh Kumar (b83ad898-0c6a-4c2c-8ab5-3343a4114401)...");
  try {
    // 1. Set referred_by for Mahendra (4405) and Hari (4407) to point to Rajesh
    await sql`
      UPDATE painters 
      SET referred_by = 'b83ad898-0c6a-4c2c-8ab5-3343a4114401'
      WHERE id IN ('b83ad898-0c6a-4c2c-8ab5-3343a4114405', 'b83ad898-0c6a-4c2c-8ab5-3343a4114407')
    `;
    console.log("✅ Set referred_by values successfully.");

    // 2. Add some specific referral entries if needed or just query them
    const list = await sql`
      SELECT id, name, phone, referred_by 
      FROM painters 
      WHERE referred_by = 'b83ad898-0c6a-4c2c-8ab5-3343a4114401'
    `;
    console.log("Referred Painters under Rajesh Kumar:");
    console.log(list);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
