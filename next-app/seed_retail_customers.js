const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Seeding retail customers...");
  try {
    await sql`
      INSERT INTO customers (id, name, gstin, address, city, state, pincode, phone, email, created_at)
      VALUES 
        ('CUST_001', 'Rajesh Verma', '08AABCS9911D1Z2', 'Malviya Nagar Sector 3', 'Alwar', 'Rajasthan', '301001', '9911223344', 'rajesh@verma.com', now()),
        ('CUST_002', 'Sanjay Mehta', '08AABCS9955E2Z3', 'C-Scheme, Near Park', 'Jaipur', 'Rajasthan', '302001', '9955667788', 'sanjay@mehta.com', now()),
        ('CUST_003', 'Amit Sharma', '08AABCS9811F3Z4', 'Ashiana Greens Phase 1', 'Bhiwadi', 'Rajasthan', '301019', '9811002233', 'amit@sharma.com', now())
      ON CONFLICT (id) DO NOTHING
    `;
    console.log("✅ Retail customers seeded successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
