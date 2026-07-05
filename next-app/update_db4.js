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

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Adding profile columns to public.users table...");
  await client.query(`
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_name TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_name TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_no TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aadhaar_no TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pan_no TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pan_front_url TEXT;
  `);

  console.log("Creating profile_change_requests table...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.profile_change_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      requested_changes JSONB NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
      reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE
    );

    -- Enable RLS if not already enabled
    ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any to avoid duplicates
    DROP POLICY IF EXISTS "Allow users to read their own requests" ON public.profile_change_requests;
    DROP POLICY IF EXISTS "Allow users to insert their own requests" ON public.profile_change_requests;
    DROP POLICY IF EXISTS "Allow admin/ceo to read all requests" ON public.profile_change_requests;
    DROP POLICY IF EXISTS "Allow admin/ceo to update requests" ON public.profile_change_requests;
    DROP POLICY IF EXISTS "Public access to change requests" ON public.profile_change_requests;

    -- Create fresh policy allowing public/all operations for rapid prototype/anonymous operations if needed:
    CREATE POLICY "Public access to change requests" ON public.profile_change_requests
      FOR ALL TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  `);

  console.log("Inserting some sample data for salesman USR_SLS_001 if they don't have it...");
  await client.query(`
    UPDATE public.users 
    SET 
      emergency_contact = '+91 9876543220 (Spouse)',
      bank_name = 'HDFC Bank',
      account_name = 'Amit Sales',
      account_no = '501002938475',
      ifsc_code = 'HDFC0000123',
      aadhaar_no = '5555 4444 3333 2222',
      pan_no = 'ABCDE1234F',
      aadhaar_front_url = 'https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/company_assets/employees/sample_aadhaar_front.jpg',
      aadhaar_back_url = 'https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/company_assets/employees/sample_aadhaar_back.jpg',
      pan_front_url = 'https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/company_assets/employees/sample_pan.jpg'
    WHERE id = 'USR_SLS_001' AND bank_name IS NULL;
  `);

  console.log("Database updated successfully!");
  await client.end();
}

run().catch(console.error);
