const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";

const client = new Client({ connectionString });

async function initDb() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres database successfully.");

    const sql = `
      -- 1. PAINTERS TABLE
      CREATE TABLE IF NOT EXISTS painters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE painters ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'Verified';
      ALTER TABLE painters ADD COLUMN IF NOT EXISTS total_tokens NUMERIC DEFAULT 0;
      ALTER TABLE painters ADD COLUMN IF NOT EXISTS total_redeemed NUMERIC DEFAULT 0;
      ALTER TABLE painters ADD COLUMN IF NOT EXISTS upi_id TEXT;
      ALTER TABLE painters ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES painters(id) ON DELETE SET NULL;

      -- 2. PAINTER COUPONS TABLE
      CREATE TABLE IF NOT EXISTS painter_coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        painter_id UUID REFERENCES painters(id) ON DELETE CASCADE,
        coupon_code TEXT NOT NULL,
        points NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Approved',
        remarks TEXT,
        scanned_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. PAINTER PROJECTS TABLE (PORTFOLIO SHOWCASE)
      CREATE TABLE IF NOT EXISTS painter_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        painter_id UUID REFERENCES painters(id) ON DELETE CASCADE,
        project_name TEXT NOT NULL,
        customer_name TEXT,
        project_type TEXT DEFAULT 'Residential House',
        area_sqft NUMERIC DEFAULT 0,
        description TEXT,
        status TEXT DEFAULT 'Completed',
        rating NUMERIC DEFAULT 5,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 4. PAINTER ESTIMATIONS TABLE (MATERIAL CALCULATOR)
      CREATE TABLE IF NOT EXISTS painter_estimations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        painter_id UUID REFERENCES painters(id) ON DELETE CASCADE,
        customer_name TEXT NOT NULL,
        project_name TEXT NOT NULL,
        area_sqft NUMERIC DEFAULT 0,
        material_cost NUMERIC DEFAULT 0,
        labour_cost NUMERIC DEFAULT 0,
        total_cost NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Saved',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 5. PAINTER LEDGER TABLE (POINTS & CASH TRANSACTIONS)
      CREATE TABLE IF NOT EXISTS painter_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        painter_id UUID REFERENCES painters(id) ON DELETE CASCADE,
        transaction_type TEXT NOT NULL,
        amount NUMERIC DEFAULT 0,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 6. PAINTER MEETINGS TABLE (WORKSHOPS & CONTRACTOR MEETS)
      CREATE TABLE IF NOT EXISTS painter_meetings (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        venue TEXT NOT NULL,
        meeting_date TEXT NOT NULL,
        meeting_time TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE painter_meetings ADD COLUMN IF NOT EXISTS organizer TEXT DEFAULT 'Shree Ram Paints & Swatch Zonal Depot';
      ALTER TABLE painter_meetings ADD COLUMN IF NOT EXISTS reward_points NUMERIC DEFAULT 500;
      ALTER TABLE painter_meetings ADD COLUMN IF NOT EXISTS perks TEXT;

      -- 7. SCHEMES TABLE (LOYALTY SLABS & TARGET BONUSES)
      CREATE TABLE IF NOT EXISTS schemes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE DEFAULT CURRENT_DATE,
        end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '60 days'),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE schemes ADD COLUMN IF NOT EXISTS target_buckets NUMERIC DEFAULT 15;
      ALTER TABLE schemes ADD COLUMN IF NOT EXISTS reward TEXT;

      -- 8. COMPETITIONS TABLE (MASTER APPLICATOR CHAMPIONSHIPS)
      CREATE TABLE IF NOT EXISTS competitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE DEFAULT CURRENT_DATE,
        end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '45 days'),
        reward_pool TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 9. REWARDS CATALOG TABLE
      CREATE TABLE IF NOT EXISTS rewards_catalog (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        points NUMERIC NOT NULL,
        category TEXT DEFAULT 'Tools & Safety',
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Seed default master painter Rajesh Kumar if not existing
      INSERT INTO painters (id, name, phone, address, total_tokens, kyc_status, upi_id)
      VALUES ('b83ad898-0c6a-4c2c-8ab5-3343a4114401', 'Rajesh Kumar', '9876543210', 'Malviya Nagar, Jaipur', 14850, 'Verified', 'rajesh.kumar@upi')
      ON CONFLICT (phone) DO UPDATE SET total_tokens = 14850;

      -- Seed sample painter meeting
      INSERT INTO painter_meetings (id, title, venue, meeting_date, meeting_time, organizer, reward_points, perks)
      VALUES 
        (1, 'Jaipur Zonal Swatch Master Painter Meet 2026', 'Hotel Marriott (Tonk Road, Jaipur)', '2026-08-15', '5:00 PM - 8:30 PM', 'Shree Ram Paints & Swatch Zonal Depot', 500, 'FREE Swatch Master Safety Apron Kit + 1.5x Multiplier'),
        (2, 'Swatch Damp Kicker Waterproofing Technical Workshop', 'Swatch Technical Zonal Hub (Malviya Nagar)', '2026-08-22', '10:00 AM - 1:00 PM', 'Swatch Technical Training Team', 300, 'Swatch Hydro-Lok Certification + FREE Demo Kit')
      ON CONFLICT (id) DO NOTHING;
    `;

    await client.query(sql);
    console.log("🎉 Successfully initialized and verified all Painter Mode & CEO Mode Supabase schemas!");
  } catch (err) {
    console.error("Database initialization error:", err);
  } finally {
    await client.end();
  }
}

initDb();
