-- Phase 1 Migration: Zero UUIDs & Ledger Accounts

-- 1. Drop existing Foreign Key constraints to safely alter types
ALTER TABLE IF EXISTS invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
ALTER TABLE IF EXISTS invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey; -- just in case

-- 2. Alter clients
ALTER TABLE IF EXISTS clients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS clients ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 3. Alter company_details
ALTER TABLE IF EXISTS company_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS company_details ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 4. Alter products (ensure it's text)
ALTER TABLE IF EXISTS products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS products ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 5. Alter invoices
ALTER TABLE IF EXISTS invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS invoices ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE IF EXISTS invoices ALTER COLUMN client_id TYPE TEXT USING client_id::TEXT;

-- 6. Restore Foreign Key
ALTER TABLE IF EXISTS invoices ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- 7. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_mode TEXT NOT NULL,
    reference_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create ledger_entries table
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
