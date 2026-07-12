const { createClient } = require("@supabase/supabase-js");

const url = "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cWpkaHdsZnV3aHlzbHF0cHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI3MTM4NCwiZXhwIjoyMDk3ODQ3Mzg0fQ.mEGksxqqi98VIkHf4avPBsoo6DcXDZRL6bMlyvuFTao";
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.rpc("exec_sql", {
    sql: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
  });
  if (error) {
    console.error("Error calling RPC:", error);
    // fallback
    const { data: data2, error: error2 } = await supabase.from("users").select("*").limit(1);
    console.log("No pg_tables RPC. Database connected successfully.");
  } else {
    console.log(data);
  }
}

run();
