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
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Missing DATABASE_URL in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  console.log("Adding columns to painters table...");
  await client.query(`
    ALTER TABLE painters ADD COLUMN IF NOT EXISTS swatch_id TEXT;
    ALTER TABLE painters ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE painters ADD COLUMN IF NOT EXISTS aadhar_no TEXT;
    ALTER TABLE painters ADD COLUMN IF NOT EXISTS locality TEXT;
    ALTER TABLE painters ADD COLUMN IF NOT EXISTS total_redeemed INTEGER DEFAULT 0;
    
    -- Change dealer_id in qr_registry to TEXT to match users.id type
    ALTER TABLE qr_registry ALTER COLUMN dealer_id TYPE TEXT;
  `);

  console.log("Checking and inserting dummy painters...");

  const pwdHash = '$2a$10$e0myzmaGQx7X4W0V.Q.mQeO69a6jW.9bYI/DkUu.6bN2/D.g5/uWq'; // dummy bcrypt hash

  const dummyPainters = [
    {
      id: 'd1c8f1a1-2d7c-4c28-98e3-5c21f11a8b11',
      name: 'Rajesh Kumar',
      phone: '9000000001',
      swatch_id: 'SW-RAJ-101',
      aadhar_no: '1234 5678 9012',
      locality: 'Koramangala, Bangalore',
      address: '12, 4th Cross, Koramangala 5th Block, Bangalore - 560034',
      total_tokens: 350,
      total_redeemed: 120
    },
    {
      id: 'd1c8f1a2-2d7c-4c28-98e3-5c21f11a8b12',
      name: 'Amit Singh',
      phone: '9000000002',
      swatch_id: 'SW-AMI-202',
      aadhar_no: '9876 5432 1098',
      locality: 'Whitefield, Bangalore',
      address: '74, ITPL Main Road, Whitefield, Bangalore - 560066',
      total_tokens: 580,
      total_redeemed: 200
    },
    {
      id: 'd1c8f1a3-2d7c-4c28-98e3-5c21f11a8b13',
      name: 'Sanjay Dutta',
      phone: '9000000003',
      swatch_id: 'SW-SAN-303',
      aadhar_no: '4567 8901 2345',
      locality: 'Indiranagar, Bangalore',
      address: '405, 100 Feet Road, Indiranagar, Bangalore - 560038',
      total_tokens: 150,
      total_redeemed: 50
    },
    {
      id: 'd1c8f1a4-2d7c-4c28-98e3-5c21f11a8b14',
      name: 'Vijay Yadav',
      phone: '9000000004',
      swatch_id: 'SW-VIJ-404',
      aadhar_no: '7890 1234 5678',
      locality: 'Jayanagar, Bangalore',
      address: '99, 9th Main, 4th Block Jayanagar, Bangalore - 560011',
      total_tokens: 820,
      total_redeemed: 450
    },
    {
      id: 'd1c8f1a5-2d7c-4c28-98e3-5c21f11a8b15',
      name: 'Ramesh Patel',
      phone: '9000000005',
      swatch_id: 'SW-RAM-505',
      aadhar_no: '2345 6789 0123',
      locality: 'Hebbal, Bangalore',
      address: '33, Bellary Road, Hebbal, Bangalore - 560024',
      total_tokens: 240,
      total_redeemed: 100
    }
  ];

  for (const dp of dummyPainters) {
    // 1. Insert into users table
    await client.query(`
      INSERT INTO users (id, name, phone, password_hash, role, status, is_approved, is_active)
      VALUES ($1, $2, $3, $4, 'painter', 'APPROVED', true, true)
      ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name,
        status = 'APPROVED',
        is_approved = true,
        is_active = true
      RETURNING id;
    `, [dp.id, dp.name, dp.phone, pwdHash]);

    // 2. Fetch the actual user ID (in case conflict update returned a different ID)
    const res = await client.query(`SELECT id FROM users WHERE phone = $1`, [dp.phone]);
    const userId = res.rows[0].id;

    // 3. Insert into painters table
    await client.query(`
      INSERT INTO painters (id, name, phone, swatch_id, address, aadhar_no, locality, total_tokens, total_redeemed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        swatch_id = EXCLUDED.swatch_id,
        address = EXCLUDED.address,
        aadhar_no = EXCLUDED.aadhar_no,
        locality = EXCLUDED.locality,
        total_tokens = EXCLUDED.total_tokens,
        total_redeemed = EXCLUDED.total_redeemed;
    `, [userId, dp.name, dp.phone, dp.swatch_id, dp.address, dp.aadhar_no, dp.locality, dp.total_tokens, dp.total_redeemed]);
  }

  const dealersRes = await client.query(`SELECT id, name FROM users WHERE role = 'dealer' LIMIT 2`);
  const productsRes = await client.query(`SELECT id, product_name FROM products LIMIT 2`);

  if (dealersRes.rows.length > 0 && productsRes.rows.length > 0) {
    const dealerId1 = dealersRes.rows[0].id;
    const dealerId2 = dealersRes.rows[1] ? dealersRes.rows[1].id : dealerId1;
    
    const prodId1 = productsRes.rows[0].id;
    const prodId2 = productsRes.rows[1] ? productsRes.rows[1].id : prodId1;

    console.log("Seeding some scanned QR codes for these dummy painters...");
    const scanSeeds = [
      { code: 'SP-MOCK-1', painter: dummyPainters[0].id, dealer: dealerId1, product: prodId1, val: 20 },
      { code: 'SP-MOCK-2', painter: dummyPainters[0].id, dealer: dealerId2, product: prodId2, val: 30 },
      { code: 'SP-MOCK-3', painter: dummyPainters[1].id, dealer: dealerId1, product: prodId2, val: 15 },
      { code: 'SP-MOCK-4', painter: dummyPainters[2].id, dealer: dealerId2, product: prodId1, val: 40 },
      { code: 'SP-MOCK-5', painter: dummyPainters[3].id, dealer: dealerId1, product: prodId1, val: 25 },
      { code: 'SP-MOCK-6', painter: dummyPainters[4].id, dealer: dealerId2, product: prodId2, val: 35 }
    ];

    for (const ss of scanSeeds) {
      const userCheck = await client.query(`SELECT id FROM users WHERE id = $1`, [ss.painter]);
      if (userCheck.rows.length > 0) {
        await client.query(`
          INSERT INTO qr_registry (qr_code, status, is_scanned, scanned_by, scanned_at, dealer_id, product_id, token_value)
          VALUES ($1, 'SCANNED', true, $2, CURRENT_TIMESTAMP - INTERVAL '1 day', $3, $4, $5)
          ON CONFLICT (qr_code) DO UPDATE SET
            status = 'SCANNED',
            is_scanned = true,
            scanned_by = EXCLUDED.scanned_by,
            scanned_at = CURRENT_TIMESTAMP - INTERVAL '1 day',
            dealer_id = EXCLUDED.dealer_id,
            product_id = EXCLUDED.product_id,
            token_value = EXCLUDED.token_value;
        `, [ss.code, ss.painter, ss.dealer, ss.product, ss.val]);
      }
    }
  }

  console.log("Painters table modified and seeded successfully!");
  await client.end();
}

run().catch(console.error);
