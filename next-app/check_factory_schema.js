const { createClient } = require("@supabase/supabase-js");

const url = "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cWpkaHdsZnV3aHlzbHF0cHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI3MTM4NCwiZXhwIjoyMDk3ODQ3Mzg0fQ.mEGksxqqi98VIkHf4avPBsoo6DcXDZRL6bMlyvuFTao";
const supabase = createClient(url, key);

async function run() {
  const tables = ["factory_expenses", "production_batches", "raw_materials", "factory_labor", "labor_attendance"];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        console.log(`Table ${table} error: ${error.message}`);
      } else {
        console.log(`Table ${table} exists! Sample record:`, data);
      }
    } catch (e) {
      console.log(`Exception on ${table}: ${e.message}`);
    }
  }
}

run();
