const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Dealer CRM tables (dealer_projects and dealer_followups)...");
  try {
    // 1. dealer_projects table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_projects (
        id SERIAL PRIMARY KEY,
        customer_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        project_type TEXT DEFAULT 'Interior',
        estimated_area NUMERIC DEFAULT 0,
        expected_completion DATE,
        status TEXT DEFAULT 'New Inquiry',
        assigned_painter_id TEXT,
        estimated_paint NUMERIC DEFAULT 0,
        estimated_labor NUMERIC DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_projects' created/verified.");

    // 2. dealer_followups table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_followups (
        id SERIAL PRIMARY KEY,
        customer_id TEXT NOT NULL,
        type TEXT DEFAULT 'Call',
        followup_date DATE DEFAULT now(),
        followup_time TIME DEFAULT '12:00:00',
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_followups' created/verified.");

    // Seed dummy project and followups if empty
    const countProj = await sql`SELECT count(*) FROM dealer_projects`;
    if (parseInt(countProj[0].count) === 0) {
      console.log("Seeding initial CRM projects...");
      // Let's insert a dummy project linking to USR_DLR_17828851440382's default customer if exists or a general ID
      await sql`
        INSERT INTO dealer_projects (customer_id, project_name, project_type, estimated_area, expected_completion, status, notes)
        VALUES 
          ('CUST_001', 'Alwar Villa Renovation', 'Renovation', 2500, '2026-08-15', 'Work Started', 'Requires high luxury washable silk paints'),
          ('CUST_002', 'Jaipur Apartment Exterior', 'Exterior', 4000, '2026-09-01', 'Quotation Sent', 'Exterior waterproofing coating needed first')
      `;
      console.log("✅ Initial CRM projects seeded.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
