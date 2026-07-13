const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Painter Estimations database schema...");
  try {
    // 1. painter_estimations table
    await sql`
      CREATE TABLE IF NOT EXISTS painter_estimations (
        id SERIAL PRIMARY KEY,
        painter_id UUID REFERENCES painters(id),
        customer_name TEXT NOT NULL,
        project_name TEXT NOT NULL,
        area_sqft NUMERIC NOT NULL,
        material_cost NUMERIC DEFAULT 0,
        labour_cost NUMERIC DEFAULT 0,
        total_cost NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Draft',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'painter_estimations' created/verified.");

    // Seed some estimations if empty
    const countEst = await sql`SELECT count(*) FROM painter_estimations`;
    if (parseInt(countEst[0].count) === 0) {
      const painter = await sql`SELECT id FROM painters LIMIT 1`;
      if (painter.length > 0) {
        await sql`
          INSERT INTO painter_estimations (painter_id, customer_name, project_name, area_sqft, material_cost, labour_cost, total_cost, status)
          VALUES 
            (${painter[0].id}, 'Harish Mehta', 'Mehta Villa Waterproofing', 1200, 24000, 18000, 42000, 'Saved'),
            (${painter[0].id}, 'Deepak Johar', 'Johar Apartment Texture Wall', 450, 9500, 6000, 15500, 'Draft')
        `;
        console.log("✅ Initial estimations seeded.");
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
