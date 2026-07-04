const { Client } = require('pg');
const fs = require('fs');
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
}

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Seeding pending registration users...");
  const pwdHash = '$2a$10$e0myzmaGQx7X4W0V.Q.mQeO69a6jW.9bYI/DkUu.6bN2/D.g5/uWq'; // dummy bcrypt hash

  const pendingUsers = [
    {
      id: 'd2c8f1a1-2d7c-4c28-98e3-5c21f11a8b21',
      name: 'Maruti Paints & Hardware',
      phone: '9111111111',
      role: 'dealer'
    },
    {
      id: 'd2c8f1a2-2d7c-4c28-98e3-5c21f11a8b22',
      name: 'Apex Decors',
      phone: '9111111112',
      role: 'dealer'
    },
    {
      id: 'd2c8f1a3-2d7c-4c28-98e3-5c21f11a8b23',
      name: 'Karan Johar',
      phone: '9222222221',
      role: 'painter'
    },
    {
      id: 'd2c8f1a4-2d7c-4c28-98e3-5c21f11a8b24',
      name: 'Vikram Rathore',
      phone: '9222222222',
      role: 'painter'
    },
    {
      id: 'd2c8f1a5-2d7c-4c28-98e3-5c21f11a8b25',
      name: 'Rahul Verma',
      phone: '9333333331',
      role: 'salesman'
    },
    {
      id: 'd2c8f1a6-2d7c-4c28-98e3-5c21f11a8b26',
      name: 'Deepak Sharma',
      phone: '9333333332',
      role: 'salesman'
    }
  ];

  for (const pu of pendingUsers) {
    await client.query(`
      INSERT INTO users (id, name, phone, password_hash, role, status, is_approved, is_active)
      VALUES ($1, $2, $3, $4, $5, 'PENDING', false, true)
      ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        status = 'PENDING',
        is_approved = false,
        is_active = true;
    `, [pu.id, pu.name, pu.phone, pwdHash, pu.role]);
  }

  console.log("Pending users seeded successfully!");
  await client.end();
}
run().catch(console.error);
