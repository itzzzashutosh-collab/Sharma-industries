const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  await client.connect();

  const bcryptHash = '$2b$10$WDeLotC7QUdb02t7wdA5nOUuPhA54ohOr1mPlcLZU8p8Br7xNXG7u'; // admin123
  
  // Ensure we have a salesman
  await client.query(`
    INSERT INTO users (id, phone, password_hash, name, role, is_active, is_approved)
    VALUES ('USR_SLS_001', '7777777777', $1, 'Amit Sales', 'salesman', true, true)
    ON CONFLICT (phone) DO NOTHING;
  `, [bcryptHash]);
  
  console.log('Inserted Salesman: 7777777777 / admin123');
  
  await client.end();
}

main().catch(console.error);
