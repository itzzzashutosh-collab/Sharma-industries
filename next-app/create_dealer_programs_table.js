const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Creating and seeding dealer_growth_programs table...");
  try {
    // 1. Create table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_growth_programs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        details TEXT NOT NULL,
        criteria TEXT NOT NULL,
        eligibility TEXT NOT NULL,
        rewards TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Table dealer_growth_programs created.");

    // 2. Seed initial data
    await sql`
      INSERT INTO dealer_growth_programs (id, name, details, criteria, eligibility, rewards, status)
      VALUES 
        ('PROG_1', 'Gold Partner Club', 'Premium rewards program for high-volume dealers with exclusive quarterly payouts.', 'Achieve sales value of ₹5 Lakh in 90 days.', 'All active dealers with verified GSTIN and shop branding.', 'Flat 5% extra cashback on all emulsion product orders.', 'Active'),
        ('PROG_2', 'Monsoon Volume Booster', 'Seasonal volume boost incentive to stock waterproofing materials early.', 'Purchase 100 buckets of Swatch Waterproofing before August.', 'Open to all tier-1 and tier-2 distribution network partners.', 'Additional ₹150 incentive per bucket, credited to dealer ledger.', 'Active')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log("✅ Seeded initial programs.");

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
