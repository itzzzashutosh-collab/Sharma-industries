const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Dealer Finance tables (dealer_wages and dealer_bank_accounts)...");
  try {
    // 1. dealer_wages table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_wages (
        id SERIAL PRIMARY KEY,
        worker_name TEXT NOT NULL,
        category TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        payment_mode TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_wages' created/verified.");

    // 2. dealer_bank_accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_bank_accounts (
        id SERIAL PRIMARY KEY,
        bank_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        ifsc TEXT NOT NULL,
        upi_id TEXT,
        current_balance NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_bank_accounts' created/verified.");

    // Seed if empty
    const countWages = await sql`SELECT count(*) FROM dealer_wages`;
    if (parseInt(countWages[0].count) === 0) {
      await sql`
        INSERT INTO dealer_wages (worker_name, category, amount, payment_mode, status)
        VALUES 
          ('Manoj Kumar', 'Loading/Unloading', 600, 'Cash', 'Paid'),
          ('Rajesh Sharma', 'Painter Assistant', 850, 'UPI', 'Pending')
      `;
      console.log("✅ Initial wages seeded.");
    }

    const countBanks = await sql`SELECT count(*) FROM dealer_bank_accounts`;
    if (parseInt(countBanks[0].count) === 0) {
      await sql`
        INSERT INTO dealer_bank_accounts (bank_name, account_number, ifsc, upi_id, current_balance)
        VALUES 
          ('State Bank of India', '30245892341', 'SBIN0001283', 'shreerampaints@sbi', 145000),
          ('HDFC Bank', '501004829381', 'HDFC0000293', 'shreerampaints@hdfc', 85000)
      `;
      console.log("✅ Initial bank accounts seeded.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
