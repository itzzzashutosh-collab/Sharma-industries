const { createClient } = require("@supabase/supabase-js");

const url = "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cWpkaHdsZnV3aHlzbHF0cHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI3MTM4NCwiZXhwIjoyMDk3ODQ3Mzg0fQ.mEGksxqqi98VIkHf4avPBsoo6DcXDZRL6bMlyvuFTao";
const supabase = createClient(url, key);

async function run() {
  const tables = [
    "invoices",
    "users",
    "factory_expenses",
    "finance_transactions",
    "purchase_master",
    "salary_payments",
    "dealer_expenses",
    "dealers",
    "painters",
    "sales_executives",
    "salesman",
    "fleet_status",
    "routes",
    "dispatches"
  ];

  console.log("Checking tables existence and row count...");
  for (const table of tables) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) {
        console.log(`❌ Table '${table}': does NOT exist or error (${error.message})`);
      } else {
        console.log(`✅ Table '${table}': exists, rows count = ${count}`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}': threw exception (${e.message})`);
    }
  }
}

run();
