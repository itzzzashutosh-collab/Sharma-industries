const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Seeding dealer metadata records...");
  try {
    await sql`
      INSERT INTO dealers (id, name, address, localities, designation, gst_number, created_at)
      VALUES 
        ('d3b07384-d113-4ec5-a5d6-ec2c5f78a221', 'Shree Ram Paints', 'Shop 12, Main Bazar, Alwar', 'Alwar', 'Owner', '08AABCS1234D1Z5', now()),
        ('d3b07384-d113-4ec5-a5d6-ec2c5f78a222', 'Agarwal Building Materials', 'Shed 4, Industrial Area, Bhiwadi', 'Bhiwadi', 'Partner', '08AABCS5678E2Z6', now()),
        ('d3b07384-d113-4ec5-a5d6-ec2c5f78a223', 'Krishna Traders', 'Station Road, Jaipur', 'Jaipur', 'Proprietor', '08AABCS9012F3Z7', now())
      ON CONFLICT (id) DO NOTHING
    `;
    console.log("✅ Dealer records seeded successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
