const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Painter Rewards and Coupons database schema...");
  try {
    // 1. painter_coupons table
    await sql`
      CREATE TABLE IF NOT EXISTS painter_coupons (
        id SERIAL PRIMARY KEY,
        painter_id UUID REFERENCES painters(id),
        coupon_code TEXT NOT NULL UNIQUE,
        points INTEGER DEFAULT 100,
        status TEXT DEFAULT 'Pending',
        scanned_at TIMESTAMPTZ DEFAULT now(),
        remarks TEXT
      )
    `;
    console.log("✅ Table 'painter_coupons' created/verified.");

    // Seed some coupons if empty
    const countCoupons = await sql`SELECT count(*) FROM painter_coupons`;
    if (parseInt(countCoupons[0].count) === 0) {
      const painter = await sql`SELECT id FROM painters LIMIT 1`;
      if (painter.length > 0) {
        await sql`
          INSERT INTO painter_coupons (painter_id, coupon_code, points, status, remarks)
          VALUES 
            (${painter[0].id}, 'COUP-500-MONSOON', 500, 'Approved', 'Waterproofing loyalty scheme reward'),
            (${painter[0].id}, 'COUP-200-WALLS', 200, 'Approved', 'Premium emulsion product scan'),
            (${painter[0].id}, 'COUP-200-PRIMER', 200, 'Pending', 'Awaiting dealer verify validation check')
        `;
        console.log("✅ Initial coupons seeded.");
      }
    }

    // Seed rewards_catalog if empty
    const countCatalog = await sql`SELECT count(*) FROM rewards_catalog`;
    if (parseInt(countCatalog[0].count) === 0) {
      await sql`
        INSERT INTO rewards_catalog (name, points, category)
        VALUES 
          ('Swatch Professional Apron & Mask Kit', 300, 'Merchandise'),
          ('Premium Texture Application Roller Kit', 500, 'Tools'),
          ('Swatch Brand Dry-Fit Polo T-Shirt', 400, 'Merchandise'),
          ('Waterproofing Training Masterclass Voucher', 600, 'Training'),
          ('Elite Painter Safety Helmet & Harness', 800, 'Safety')
      `;
      console.log("✅ Initial rewards catalog seeded.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
