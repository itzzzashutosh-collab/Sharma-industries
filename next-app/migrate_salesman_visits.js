const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Salesman Visits and Route Database Schema...");
  try {
    // 1. Ensure sales_visits table has necessary rows
    const countVisits = await sql`SELECT count(*) FROM sales_visits`;
    if (parseInt(countVisits[0].count) === 0) {
      await sql`
        INSERT INTO sales_visits (id, salesman_id, dealer_name, location, visit_date, purpose, status)
        VALUES 
          ('VISIT_1', 'SM-101', 'Shree Ram Paints', 'Store Outlet', CURRENT_DATE, 'Collect outstanding payment balance', 'Pending'),
          ('VISIT_2', 'SM-101', 'Mahadev Paints & Sanitary', 'Store Outlet', CURRENT_DATE, 'Routine check-in & order collection', 'Pending')
      `;
      console.log("✅ Initial sales visits seeded.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
