const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Dealer Expenses table (dealer_expenses)...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_expenses (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        expense_name TEXT NOT NULL,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_expenses' created/verified.");

    // Seed if empty
    const countLogs = await sql`SELECT count(*) FROM dealer_expenses`;
    if (parseInt(countLogs[0].count) === 0) {
      await sql`
        INSERT INTO dealer_expenses (category, amount, expense_name, remarks)
        VALUES 
          ('Rent', 15000, 'Shop Rent July', 'Paid to landlord'),
          ('Utilities', 1800, 'Electricity Bill', 'July meter charges'),
          ('Refreshments', 450, 'Tea & Snacks', 'Customer refreshments')
      `;
      console.log("✅ Initial dealer expenses seeded.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
