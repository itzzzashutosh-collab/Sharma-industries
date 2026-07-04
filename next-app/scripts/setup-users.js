const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected!');

  // Drop old users table if it exists (fresh start for auth)
  console.log('Dropping old users table if exists...');
  await client.query('DROP TABLE IF EXISTS users CASCADE;');

  // Create fresh users table
  console.log('Creating users table...');
  await client.query(`
    CREATE TABLE users (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ceo', 'salesman', 'dealer')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE
    );
  `);
  console.log('Users table created!');

  // Enable RLS
  console.log('Enabling RLS...');
  await client.query('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');

  // Create RLS policy
  console.log('Creating RLS policy...');
  await client.query(`
    CREATE POLICY "Allow anon read for login" ON users
        FOR SELECT TO anon
        USING (true);
  `);

  // Create index
  console.log('Creating index...');
  await client.query('CREATE INDEX idx_users_phone ON users(phone);');

  // Insert default CEO user (password: admin123)
  const bcryptHash = '$2b$10$WDeLotC7QUdb02t7wdA5nOUuPhA54ohOr1mPlcLZU8p8Br7xNXG7u';
  
  console.log('Inserting default CEO user...');
  await client.query(`
    INSERT INTO users (id, phone, password_hash, name, role)
    VALUES ('USR_CEO_001', '9999999999', $1, 'Ashutosh Sharma', 'ceo');
  `, [bcryptHash]);

  console.log('=============================================');
  console.log('  Users Table Setup Complete!');
  console.log('  Default Login: Phone=9999999999 Pass=admin123');
  console.log('=============================================');

  await client.end();
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
