const { createClient } = require("@supabase/supabase-js");

const url = "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cWpkaHdsZnV3aHlzbHF0cHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI3MTM4NCwiZXhwIjoyMDk3ODQ3Mzg0fQ.mEGksxqqi98VIkHf4avPBsoo6DcXDZRL6bMlyvuFTao";
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.rpc("exec_sql", {
    sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'finance_transactions'"
  });
  if (error) {
    console.error("Error executing RPC:", error);
  } else {
    console.log(data);
  }
}

run();
