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
  console.log('Connected to DB');

  try {
    await client.query('ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT false;');
    console.log('Added is_approved column');
  } catch (err) {
    console.log('Column might already exist:', err.message);
  }

  // Update existing users to be approved
  await client.query('UPDATE users SET is_approved = true;');
  console.log('Updated existing users to is_approved = true');

  // Insert a dummy pending user for testing the dashboard
  const bcryptHash = '$2b$10$WDeLotC7QUdb02t7wdA5nOUuPhA54ohOr1mPlcLZU8p8Br7xNXG7u'; // admin123
  
  await client.query(`
    INSERT INTO users (id, phone, password_hash, name, role, is_approved)
    VALUES ('USR_DLR_002', '8888888888', $1, 'Ramesh Traders', 'dealer', false)
    ON CONFLICT (phone) DO NOTHING;
  `, [bcryptHash]);
  
  console.log('Inserted pending dealer: Ramesh Traders (8888888888)');

  await client.end();
}

main().catch(console.error);
