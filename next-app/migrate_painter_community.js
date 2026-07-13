const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Migrating Painter Community database schema...");
  try {
    // 1. painter_meetings table
    await sql`
      CREATE TABLE IF NOT EXISTS painter_meetings (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        venue TEXT NOT NULL,
        meeting_date DATE NOT NULL,
        meeting_time TEXT NOT NULL,
        organizer TEXT NOT NULL,
        status TEXT DEFAULT 'Scheduled',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'painter_meetings' created/verified.");

    // Seed some meetings if empty
    const countMeet = await sql`SELECT count(*) FROM painter_meetings`;
    if (parseInt(countMeet[0].count) === 0) {
      await sql`
        INSERT INTO painter_meetings (title, venue, meeting_date, meeting_time, organizer, status)
        VALUES 
          ('Waterproofing Advanced Workshop', 'Shree Ram Paints Hall', '2026-07-20', '11:00 AM', 'Rajesh Gupta (Dealer)', 'Scheduled'),
          ('Monsoon Paint Launch Meetup', 'Hotel Royal Palace Jaipur', '2026-08-05', '04:00 PM', 'Swatch Regional Office', 'Scheduled')
      `;
      console.log("✅ Initial meetings seeded.");
    }

    // Seed schemes if empty
    const countSchemes = await sql`SELECT count(*) FROM schemes`;
    if (parseInt(countSchemes[0].count) === 0) {
      await sql`
        INSERT INTO schemes (title, description, start_date, end_date, active)
        VALUES 
          ('Monsoon Waterproofing Special', 'Earn 2x reward token points on scanning selected waterproofing buckets during July-August.', '2026-07-01', '2026-08-31', true),
          ('Festive Season Sparkle Emulsion', 'Scan 10 emulsion buckets and unlock an additional ₹1,500 cash wallet bonus.', '2026-09-01', '2026-10-31', true)
      `;
      console.log("✅ Initial schemes seeded.");
    }

    // Seed competitions if empty
    const countComp = await sql`SELECT count(*) FROM competitions`;
    if (parseInt(countComp[0].count) === 0) {
      await sql`
        INSERT INTO competitions (name, description, start_date, end_date, reward_pool)
        VALUES 
          ('Jaipur Luxury Finish Champion', 'Top painter with highest verified luxury emulsion usage in Jaipur wins ₹25,000.', '2026-07-01', '2026-07-31', '₹25,000 Cash Pool'),
          ('National Monsoon Waterproofing Titan', 'National level leaderboard competition for waterproofing coupon scans.', '2026-07-01', '2026-08-31', 'Diamond Level certification + ₹50,000')
      `;
      console.log("✅ Initial competitions seeded.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
