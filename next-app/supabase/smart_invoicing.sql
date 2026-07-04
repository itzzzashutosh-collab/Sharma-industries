-- 1. Company Details Table
CREATE TABLE IF NOT EXISTS company_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    state_code TEXT NOT NULL,
    gstin TEXT,
    phone TEXT,
    bank_details JSONB, -- { bank_name, ac_number, ifsc, upi_id }
    signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Clients Table (New CRM feature)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    gstin TEXT,
    address TEXT,
    state_code TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Invoices Table (Drop and Recreate with client_id FK)
DROP TABLE IF EXISTS invoices CASCADE;

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_details JSONB NOT NULL, -- snapshot of { name, phone, gstin, address, state_code, pincode }
    items JSONB NOT NULL, -- Array of items
    tax_breakdown JSONB,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_tax_inclusive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);
