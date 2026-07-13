const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Painter Portfolio tables (painter_projects and painter_reviews)...");
  try {
    // 1. painter_projects table
    await sql`
      CREATE TABLE IF NOT EXISTS painter_projects (
        id SERIAL PRIMARY KEY,
        painter_id UUID REFERENCES painters(id),
        project_name TEXT NOT NULL,
        customer_name TEXT,
        project_type TEXT NOT NULL,
        area_sqft NUMERIC,
        description TEXT,
        status TEXT DEFAULT 'Pending',
        rating NUMERIC DEFAULT 5,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'painter_projects' created/verified.");

    // 2. painter_reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS painter_reviews (
        id SERIAL PRIMARY KEY,
        painter_id UUID REFERENCES painters(id),
        reviewer_name TEXT NOT NULL,
        rating NUMERIC NOT NULL,
        review_text TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'painter_reviews' created/verified.");

    // Seed if empty
    const countProjs = await sql`SELECT count(*) FROM painter_projects`;
    if (parseInt(countProjs[0].count) === 0) {
      // Find a valid painter ID to link
      const painter = await sql`SELECT id FROM painters LIMIT 1`;
      if (painter.length > 0) {
        await sql`
          INSERT INTO painter_projects (painter_id, project_name, customer_name, project_type, area_sqft, description, status, rating)
          VALUES 
            (${painter[0].id}, 'Royale Velvet Master Bedroom', 'Rahul Sharma', 'Residential Flat', 450, 'Finished with Royale Luxury Emulsion', 'Verified', 5),
            (${painter[0].id}, 'Exterior Weather Protection Villa', 'Sunita Gupta', 'Villa', 1800, 'Dual coat silicon exterior paints', 'Verified', 4.8)
        `;
        console.log("✅ Initial projects seeded.");
      }
    }

    const countReviews = await sql`SELECT count(*) FROM painter_reviews`;
    if (parseInt(countReviews[0].count) === 0) {
      const painter = await sql`SELECT id FROM painters LIMIT 1`;
      if (painter.length > 0) {
        await sql`
          INSERT INTO painter_reviews (painter_id, reviewer_name, rating, review_text)
          VALUES 
            (${painter[0].id}, 'Rahul Sharma', 5, 'Highly skilled, perfect texture finishing and extremely polite.'),
            (${painter[0].id}, 'Sunita Gupta', 4.8, 'Very efficient waterproofing work. Recommended!')
        `;
        console.log("✅ Initial reviews seeded.");
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
