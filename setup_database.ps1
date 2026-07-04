$ErrorActionPreference = "Stop"

$nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
$zipPath = Join-Path $PSScriptRoot "node.zip"
$extractPath = Join-Path $PSScriptRoot "node-portable"
$nodeDir = Join-Path $extractPath "node-v20.11.0-win-x64"
$nodeExe = Join-Path $nodeDir "node.exe"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Sharma Industries Supabase Database Seeder  " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Download Node.js zip if not already downloaded
if (-not (Test-Path $nodeExe)) {
    Write-Host "Downloading portable Node.js (approx 30MB)..." -ForegroundColor Yellow
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath
    
    Write-Host "Extracting Node.js..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    
    # Clean up zip
    Remove-Item $zipPath -Force
} else {
    Write-Host "Portable Node.js already available." -ForegroundColor Green
}

# 2. Initialize temporary node project and install 'pg'
Write-Host "Installing PostgreSQL client driver..." -ForegroundColor Yellow
Set-Location -Path $nodeDir

# Check if pg is already installed
if (-not (Test-Path (Join-Path $nodeDir "node_modules\pg"))) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm install pg" -NoNewWindow -Wait
}
Write-Host "PostgreSQL client driver installed." -ForegroundColor Green

# 3. Create the setup-db.js script using literal single-quoted Here-String
$sqlScript = @'
const { Client } = require('pg');

// URL encode the password to handle the '@' symbol in connection string
const connectionString = 'postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = `
-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gstin TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    sku TEXT,
    hsn_code TEXT,
    unit TEXT,
    purchase_price NUMERIC(15, 2) DEFAULT 0,
    selling_price NUMERIC(15, 2) DEFAULT 0,
    stock NUMERIC(15, 2) DEFAULT 0,
    min_stock NUMERIC(15, 2) DEFAULT 10,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT NOT NULL,
    date TEXT NOT NULL,
    due_date TEXT,
    tax_type TEXT DEFAULT 'exclusive',
    supply_type TEXT DEFAULT 'intra',
    template TEXT DEFAULT 'classic',
    payment_mode TEXT DEFAULT 'Cash',
    payment_status TEXT DEFAULT 'Unpaid',
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    total_taxable NUMERIC(15, 2) DEFAULT 0,
    total_gst NUMERIC(15, 2) DEFAULT 0,
    cgst NUMERIC(15, 2) DEFAULT 0,
    sgst NUMERIC(15, 2) DEFAULT 0,
    igst NUMERIC(15, 2) DEFAULT 0,
    freight NUMERIC(15, 2) DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    round_off NUMERIC(15, 2) DEFAULT 0,
    advance NUMERIC(15, 2) DEFAULT 0,
    grand_total NUMERIC(15, 2) DEFAULT 0,
    balance_due NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    seller JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_mode TEXT NOT NULL,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Stock Logs Table
CREATE TABLE IF NOT EXISTS stock_logs (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    qty NUMERIC(15, 2) NOT NULL,
    reference TEXT,
    reason TEXT,
    notes TEXT,
    resulting_stock NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_single_row CHECK (id = 1)
);

-- Create Materials Table
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    sku TEXT,
    hsn_code TEXT,
    unit TEXT,
    purchase_price NUMERIC(15, 2) DEFAULT 0,
    stock NUMERIC(15, 2) DEFAULT 0,
    min_stock NUMERIC(15, 2) DEFAULT 10,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Material Logs Table
CREATE TABLE IF NOT EXISTS material_logs (
    id TEXT PRIMARY KEY,
    material_id TEXT REFERENCES materials(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    qty NUMERIC(15, 2) NOT NULL,
    reference TEXT,
    reason TEXT,
    resulting_stock NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Material Bills Table
CREATE TABLE IF NOT EXISTS material_bills (
    id TEXT PRIMARY KEY,
    bill_no TEXT NOT NULL,
    date TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 18,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    grand_total NUMERIC(15, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'Paid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT DEFAULT 'Debit',
    payment_mode TEXT DEFAULT 'Bank',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    salary NUMERIC(15, 2) NOT NULL,
    joining_date TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Salary Advances Table
CREATE TABLE IF NOT EXISTS salary_advances (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_mode TEXT DEFAULT 'Bank',
    status TEXT DEFAULT 'Paid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Salary Payments Table
CREATE TABLE IF NOT EXISTS salary_payments (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    base_salary NUMERIC(15, 2) NOT NULL,
    days_present NUMERIC(5, 2) NOT NULL,
    gross_salary NUMERIC(15, 2) NOT NULL,
    advances_deducted NUMERIC(15, 2) NOT NULL,
    net_paid NUMERIC(15, 2) NOT NULL,
    payment_mode TEXT DEFAULT 'Bank',
    payment_date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    quotation_no TEXT NOT NULL,
    date TEXT NOT NULL,
    valid_until TEXT,
    tax_type TEXT DEFAULT 'exclusive',
    supply_type TEXT DEFAULT 'intra',
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    total_taxable NUMERIC(15, 2) DEFAULT 0,
    total_gst NUMERIC(15, 2) DEFAULT 0,
    cgst NUMERIC(15, 2) DEFAULT 0,
    sgst NUMERIC(15, 2) DEFAULT 0,
    igst NUMERIC(15, 2) DEFAULT 0,
    freight NUMERIC(15, 2) DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    round_off NUMERIC(15, 2) DEFAULT 0,
    grand_total NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Alter Employees Table to support legal documents if not exists
ALTER TABLE employees ADD COLUMN IF NOT EXISTS aadhaar_front TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS aadhaar_back TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pan_card TEXT;
`;

async function main() {
  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');
  
  console.log('Executing database DDL SQL schema script...');
  await client.query(sql);
  console.log('All tables and columns created successfully in Supabase!');
  
  await client.end();
}

main().catch(err => {
  console.error('Database Setup Failed:', err);
  process.exit(1);
});
'@

$scriptPath = Join-Path $nodeDir "setup-db.js"
$sqlScript | Out-File $scriptPath -Encoding UTF8

# 4. Run the setup script using portable Node
Write-Host "Executing database setup script..." -ForegroundColor Yellow
$result = & $nodeExe $scriptPath
Write-Host $result

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Database Schema Successfully Initialized!     " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
