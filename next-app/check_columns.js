const { createClient } = require("@supabase/supabase-js");

const url = "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cWpkaHdsZnV3aHlzbHF0cHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI3MTM4NCwiZXhwIjoyMDk3ODQ3Mzg0fQ.mEGksxqqi98VIkHf4avPBsoo6DcXDZRL6bMlyvuFTao";
const supabase = createClient(url, key);

async function run() {
  const tables = ["invoices", "factory_expenses", "purchase_master", "finance_transactions"];
  for (const table of tables) {
    console.log(`--- Columns for ${table} ---`);
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.error(error);
    } else if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log("No data rows found. Try getting columns from metadata/RPC or querying catalog.");
    }
  }
}

run();
