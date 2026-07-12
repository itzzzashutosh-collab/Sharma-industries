const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Dealer Logistics tables (dealer_dispatches and dealer_complaints)...");
  try {
    // 1. dealer_dispatches table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_dispatches (
        id SERIAL PRIMARY KEY,
        dispatch_no TEXT NOT NULL,
        vehicle_no TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        carrier_name TEXT NOT NULL,
        lr_no TEXT NOT NULL,
        status TEXT DEFAULT 'In Transit',
        estimated_arrival DATE,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_dispatches' created/verified.");

    // 2. dealer_complaints table
    await sql`
      CREATE TABLE IF NOT EXISTS dealer_complaints (
        id SERIAL PRIMARY KEY,
        complaint_no TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        project_name TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'dealer_complaints' created/verified.");

    // Seed initial dispatches if empty
    const countDisp = await sql`SELECT count(*) FROM dealer_dispatches`;
    if (parseInt(countDisp[0].count) === 0) {
      await sql`
        INSERT INTO dealer_dispatches (dispatch_no, vehicle_no, driver_name, carrier_name, lr_no, status, estimated_arrival, remarks)
        VALUES 
          ('DISP-1092', 'RJ-14-GD-4812', 'Ramesh Yadav', 'Jaipur Express Cargo', 'LR-90284', 'In Transit', '2026-07-15', 'Urgent emulsions consignment'),
          ('DISP-1093', 'MH-12-PQ-9082', 'Satish Sawant', 'Gati Logistics Co', 'LR-90285', 'Delivered', '2026-07-10', 'Delivered intact')
      `;
      console.log("✅ Initial dispatches seeded.");
    }

    // Seed initial complaints if empty
    const countComp = await sql`SELECT count(*) FROM dealer_complaints`;
    if (parseInt(countComp[0].count) === 0) {
      await sql`
        INSERT INTO dealer_complaints (complaint_no, customer_name, project_name, issue_type, priority, status, remarks)
        VALUES 
          ('COMP-801', 'Rahul Verma', 'Civil Lines Villa', 'Quality Issue', 'Medium', 'Open', 'Coverage of Royale emulsion is slightly low'),
          ('COMP-802', 'Sunita Mehta', 'Malviya Nagar Apt', 'Transport Damage', 'High', 'Investigating', 'Leakage in one bucket of waterproofing primer')
      `;
      console.log("✅ Initial complaints seeded.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
