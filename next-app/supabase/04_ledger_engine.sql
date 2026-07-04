-- Ensure clients table exists with TEXT id
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    gstin TEXT,
    address TEXT,
    state_code TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Ensure company_details table exists with TEXT id
CREATE TABLE IF NOT EXISTS company_details (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    state_code TEXT NOT NULL,
    gstin TEXT,
    phone TEXT,
    bank_details JSONB,
    signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Ensure invoices uses TEXT for id and client_id
-- We alter existing to ensure compliance, ignoring if already text
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
    ALTER TABLE IF EXISTS invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
    
    ALTER TABLE IF EXISTS invoices ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE IF EXISTS invoices ALTER COLUMN id TYPE TEXT USING id::TEXT;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_id') THEN
        ALTER TABLE invoices ALTER COLUMN client_id TYPE TEXT USING client_id::TEXT;
    ELSE
        ALTER TABLE invoices ADD COLUMN client_id TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_details') THEN
        -- already exists
    ELSE
        ALTER TABLE invoices ADD COLUMN client_details JSONB;
    END IF;
END $$;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey_new;
ALTER TABLE invoices ADD CONSTRAINT invoices_client_id_fkey_new FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Alter products just in case
ALTER TABLE IF EXISTS products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS products ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_mode TEXT NOT NULL,
    reference_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ledger_entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    debit NUMERIC(15, 2) DEFAULT 0,
    credit NUMERIC(15, 2) DEFAULT 0,
    balance NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
