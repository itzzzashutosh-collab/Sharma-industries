const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  const getColumns = async (table) => {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    return res.rows;
  };

  console.log("products:", await getColumns('products'));
  console.log("material_logs:", await getColumns('material_logs'));
  console.log("stock_logs:", await getColumns('stock_logs'));

  await client.end();
}

main().catch(console.error);
