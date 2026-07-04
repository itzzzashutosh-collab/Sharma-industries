-- Add Transport Logistics & Payment Terms to invoices table
DO $$ 
BEGIN
    -- Add transport_details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'transport_details') THEN
        ALTER TABLE invoices ADD COLUMN transport_details JSONB;
    END IF;

    -- Add payment_terms
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_terms') THEN
        ALTER TABLE invoices ADD COLUMN payment_terms JSONB;
    END IF;

    -- Ensure balance_due exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'balance_due') THEN
        ALTER TABLE invoices ADD COLUMN balance_due NUMERIC(15, 2) DEFAULT 0;
    END IF;
    
    -- Ensure is_tax_inclusive exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'is_tax_inclusive') THEN
        ALTER TABLE invoices ADD COLUMN is_tax_inclusive BOOLEAN DEFAULT false;
    END IF;
END $$;
