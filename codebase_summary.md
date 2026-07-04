# Sharma Industries - Codebase Summary

## File: `.\index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sharma Industries — GST Invoice Manager</title>
  <meta name="description" content="Professional GST Invoice Management System for Sharma Industries manufacturing unit. Create invoices, manage products, track stock, generate GST-compliant bills.">

  <!-- Preconnect Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- App Stylesheet -->
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<div id="app">

  <!-- ===================== SIDEBAR ===================== -->
  <aside id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-icon">⚙️</div>
        <div class="logo-text">
          <h2>Sharma Industries</h2>
          <span>GST Invoice Manager</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>

      <div class="nav-item active" data-page="dashboard" onclick="App.navigate('dashboard')">
        <span class="nav-icon">🏠</span>
        <span>Dashboard</span>
      </div>

      <div class="nav-item" data-page="products" onclick="App.navigate('products')">
        <span class="nav-icon">📦</span>
        <span>Products</span>
      </div>

      <div class="nav-item" data-page="stock" onclick="App.navigate('stock')">
        <span class="nav-icon">📊</span>
        <span>Product Stock</span>
      </div>

      <div class="nav-item" data-page="inventory" onclick="App.navigate('inventory')">
        <span class="nav-icon">🧪</span>
        <span>Inventory (Materials)</span>
      </div>

      <div class="nav-item" data-page="employees" onclick="App.navigate('employees')">
        <span class="nav-icon">👤</span>
        <span>Employees & Attendance</span>
      </div>

      <div class="nav-section-label">Invoicing</div>

      <div class="nav-item" data-page="invoice-new" onclick="App.navigate('invoice-new')">
        <span class="nav-icon">➕</span>
        <span>New Invoice</span>
      </div>

      <div class="nav-item" data-page="invoices" onclick="App.navigate('invoices')">
        <span class="nav-icon">🧾</span>
        <span>All Invoices</span>
      </div>

      <div class="nav-item" data-page="quotations" onclick="App.navigate('quotations')">
        <span class="nav-icon">📝</span>
        <span>Quotations / Estimates</span>
      </div>

      <div class="nav-item" data-page="ledger" onclick="App.navigate('ledger')">
        <span class="nav-icon">📖</span>
        <span>Customer Ledger</span>
      </div>

      <div class="nav-item" data-page="financials" onclick="App.navigate('financials')">
        <span class="nav-icon">📈</span>
        <span>Balance Sheet & P&L</span>
      </div>

      <div class="nav-section-label">System</div>

      <div class="nav-item" data-page="settings" onclick="App.navigate('settings')">
        <span class="nav-icon">⚙️</span>
        <span>Settings</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="App.navigate('settings')">
        <div class="user-avatar">S</div>
        <div class="user-info">
          <strong>Sharma Industries</strong>
          <span>Manufacturing Unit</span>
        </div>
        <span style="color:var(--text-muted);font-size:14px;">⚙️</span>
      </div>
    </div>
  </aside>

  <!-- ===================== MAIN ===================== -->
  <main id="main">

    <!-- Topbar -->
    <header id="topbar">
      <button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>
      <h1 class="topbar-title" id="topbar-title">🏠 Dashboard</h1>
      <div class="topbar-actions">
        <button class="btn btn-primary btn-sm" onclick="App.navigate('invoice-new')">
          ➕ New Invoice
        </button>
      </div>
    </header>

    <!-- Page Content -->
    <div id="page-content">
      <!-- Content is rendered by JS router -->
      <div style="display:flex;align-items:center;justify-content:center;height:60vh;flex-direction:column;gap:12px;">
        <div style="font-size:48px;animation:pulse 1.5s infinite;">⚙️</div>
        <div style="font-size:16px;color:var(--text-secondary);">Loading Sharma Industries...</div>
      </div>
    </div>

  </main>

</div>

<!-- Toast Container -->
<div id="toast-container"></div>

<!-- ===================== SCRIPTS ===================== -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/db.js"></script>
<script src="js/print.js"></script>
<script src="js/products.js"></script>
<script src="js/invoice.js"></script>
<script src="js/invoiceList.js"></script>
<script src="js/settings.js"></script>
<script src="js/ledger.js"></script>
<script src="js/stock.js"></script>
<script src="js/inventory.js"></script>
<script src="js/financials.js"></script>
<script src="js/employees.js"></script>
<script src="js/quotations.js"></script>
<script src="js/app.js"></script>

</body>
</html>

```

## File: `.\server.js`
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalize URL path to resolve files relative to the current directory
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found, serve index.html for SPA router fallback if requested
        fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
          if (err) {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const { exec } = require('child_process');

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  
  console.log('Detecting and applying database schema updates...');
  exec('powershell.exe -ExecutionPolicy Bypass -File setup_database.ps1', (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to run database seeder on startup:', err);
    } else {
      console.log('Database schema successfully checked and synchronized!');
      console.log(stdout);
    }
  });
});

```

## File: `.\setup_database.ps1`
```ps1
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
const connectionString = 'postgresql://postgres:Ashutosh9784%40@db.ooyoyxjxavusiuabomzv.supabase.co:5432/postgres';

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

```

## File: `.\css\style.css`
```css
/* ============================================================
   style.css — Sharma Industries GST Invoice App
   Dark glassmorphism premium design system
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

/* ---- CSS Variables ---- */
:root {
  --bg-primary: #0a0b0f;
  --bg-secondary: #111318;
  --bg-card: rgba(255,255,255,0.04);
  --bg-card-hover: rgba(255,255,255,0.07);
  --bg-glass: rgba(255,255,255,0.05);
  --border: rgba(255,255,255,0.08);
  --border-active: rgba(255,255,255,0.18);

  --accent: #6366f1;
  --accent-light: #818cf8;
  --accent-glow: rgba(99,102,241,0.3);
  --accent-2: #06b6d4;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-light: rgba(239,68,68,0.15);

  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #475569;

  --sidebar-w: 260px;
  --header-h: 64px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 24px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 48px rgba(0,0,0,0.6);
  --shadow-accent: 0 4px 24px rgba(99,102,241,0.25);

  --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
}

/* ---- Reset ---- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; outline: none; }
input, textarea, select { font-family: inherit; outline: none; border: none; }
img { max-width: 100%; display: block; }
ul { list-style: none; }

/* ---- Background mesh ---- */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

/* ============================================================
   LAYOUT
   ============================================================ */
#app { display: flex; min-height: 100vh; position: relative; z-index: 1; }

/* ---- Sidebar ---- */
#sidebar {
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: transform var(--transition);
}

.sidebar-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  box-shadow: var(--shadow-accent);
  flex-shrink: 0;
}
.logo-text { flex: 1; overflow: hidden; }
.logo-text h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logo-text span {
  font-size: 11px;
  color: var(--accent-light);
  font-weight: 500;
}

.sidebar-nav { flex: 1; padding: 12px 12px; overflow-y: auto; }
.nav-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  text-transform: uppercase;
  padding: 8px 8px 4px;
  margin-top: 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  margin-bottom: 2px;
  position: relative;
}
.nav-item:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}
.nav-item.active {
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1));
  color: var(--accent-light);
  border: 1px solid rgba(99,102,241,0.25);
}
.nav-item.active .nav-icon { color: var(--accent-light); }
.nav-icon { font-size: 18px; flex-shrink: 0; width: 20px; text-align: center; }
.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
}
.sidebar-user:hover { background: var(--bg-card); }
.user-avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: white;
  flex-shrink: 0;
}
.user-info { flex: 1; overflow: hidden; }
.user-info strong { display: block; font-size: 13px; font-weight: 600; }
.user-info span { font-size: 11px; color: var(--text-muted); }

/* ---- Main Content ---- */
#main {
  margin-left: var(--sidebar-w);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ---- Topbar ---- */
#topbar {
  height: var(--header-h);
  background: rgba(10,11,15,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-title { font-size: 18px; font-weight: 700; flex: 1; }
.topbar-actions { display: flex; align-items: center; gap: 10px; }

/* ---- Page Content ---- */
#page-content {
  flex: 1;
  padding: 28px;
  max-width: 1400px;
  width: 100%;
}

/* ============================================================
   COMPONENTS
   ============================================================ */

/* ---- Buttons ---- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition);
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid transparent;
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent), #4f46e5);
  color: white;
  box-shadow: var(--shadow-accent);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 32px rgba(99,102,241,0.4);
}
.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border);
}
.btn-secondary:hover { background: var(--bg-card-hover); border-color: var(--border-active); }
.btn-success {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
}
.btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(16,185,129,0.3); }
.btn-danger {
  background: var(--danger-light);
  color: var(--danger);
  border-color: rgba(239,68,68,0.3);
}
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-lg { padding: 12px 24px; font-size: 15px; }
.btn-icon { padding: 8px; border-radius: var(--radius-sm); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

/* ---- Cards ---- */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: border-color var(--transition);
}
.card:hover { border-color: var(--border-active); }
.card-sm { padding: 16px; border-radius: var(--radius-md); }
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.card-title { font-size: 16px; font-weight: 700; }

/* ---- Stat Cards ---- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  opacity: 0;
  transition: opacity var(--transition);
}
.stat-card:hover { border-color: var(--border-active); transform: translateY(-2px); }
.stat-card:hover::before { opacity: 1; }
.stat-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.stat-icon.purple { background: rgba(99,102,241,0.15); }
.stat-icon.cyan { background: rgba(6,182,212,0.15); }
.stat-icon.green { background: rgba(16,185,129,0.15); }
.stat-icon.orange { background: rgba(245,158,11,0.15); }
.stat-icon.red { background: rgba(239,68,68,0.15); }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.stat-change { font-size: 11px; margin-top: 4px; }
.stat-change.up { color: var(--success); }
.stat-change.down { color: var(--danger); }

/* ---- Forms ---- */
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-label .required { color: var(--danger); margin-left: 2px; }
.form-control {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition);
  width: 100%;
}
.form-control:focus {
  border-color: var(--accent);
  background: rgba(99,102,241,0.05);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.form-control::placeholder { color: var(--text-muted); }
select.form-control { cursor: pointer; }
select.form-control option { background: #1e2130; color: var(--text-primary); }
textarea.form-control { resize: vertical; min-height: 80px; }
.form-hint { font-size: 11px; color: var(--text-muted); }

/* ---- Tables ---- */
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
thead th {
  background: rgba(255,255,255,0.03);
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background var(--transition);
}
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--bg-card-hover); }
tbody td {
  padding: 14px 16px;
  vertical-align: middle;
}
.td-mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; }

/* ---- Badges ---- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.badge-success { background: rgba(16,185,129,0.15); color: #10b981; }
.badge-warning { background: rgba(245,158,11,0.15); color: #f59e0b; }
.badge-danger { background: rgba(239,68,68,0.15); color: #ef4444; }
.badge-info { background: rgba(6,182,212,0.15); color: #06b6d4; }
.badge-purple { background: rgba(99,102,241,0.15); color: var(--accent-light); }
.badge-muted { background: rgba(255,255,255,0.06); color: var(--text-muted); }

/* ---- Search Bar ---- */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  transition: all var(--transition);
}
.search-bar:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.search-bar input {
  background: none;
  color: var(--text-primary);
  font-size: 14px;
  flex: 1;
}
.search-bar input::placeholder { color: var(--text-muted); }
.search-bar .search-icon { color: var(--text-muted); font-size: 16px; }

/* ---- Modal ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  background: #13151e;
  border: 1px solid var(--border-active);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.2s ease;
  box-shadow: var(--shadow-lg);
}
.modal-lg { max-width: 900px; }
.modal-xl { max-width: 1100px; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.modal-title { font-size: 18px; font-weight: 700; }
.modal-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  font-size: 18px;
  cursor: pointer;
  transition: all var(--transition);
}
.modal-close:hover { background: var(--danger-light); color: var(--danger); border-color: rgba(239,68,68,0.3); }

/* ---- Image Upload ---- */
.image-upload-area {
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}
.image-upload-area:hover, .image-upload-area.drag-over {
  border-color: var(--accent);
  background: rgba(99,102,241,0.05);
}
.image-upload-area input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.upload-preview {
  width: 120px; height: 120px;
  border-radius: var(--radius-md);
  object-fit: cover;
  margin: 0 auto 12px;
}
.upload-icon { font-size: 36px; margin-bottom: 8px; }
.upload-text { font-size: 14px; color: var(--text-secondary); }
.upload-hint { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* ---- Product Cards ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  border-color: var(--border-active);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.product-img-wrap {
  height: 180px;
  background: rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.product-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.product-card:hover .product-img { transform: scale(1.05); }
.product-img-placeholder {
  font-size: 48px;
  color: var(--text-muted);
}
.product-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
.product-category { font-size: 11px; color: var(--accent-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.product-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.product-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.product-meta-item { font-size: 11px; background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 4px; color: var(--text-secondary); }
.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.product-price { font-size: 18px; font-weight: 800; color: var(--accent-light); }
.product-price span { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.product-stock { font-size: 12px; font-weight: 600; }
.product-stock.low { color: var(--warning); }
.product-stock.critical { color: var(--danger); }
.product-stock.ok { color: var(--success); }
.product-actions { display: flex; gap: 6px; margin-top: 12px; }

/* ---- Invoice Items Table ---- */
.invoice-items-table { width: 100%; border-collapse: collapse; }
.invoice-items-table th {
  background: rgba(99,102,241,0.08);
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.invoice-items-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
.invoice-items-table tr:last-child td { border-bottom: none; }
.item-remove-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid rgba(239,68,68,0.2);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 14px;
}
.item-remove-btn:hover { background: rgba(239,68,68,0.3); }

/* ---- Tax Summary ---- */
.tax-summary {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.tax-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 14px;
}
.tax-row:last-child { border-bottom: none; }
.tax-row.total {
  background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05));
  font-size: 18px;
  font-weight: 800;
  padding: 14px 16px;
}
.tax-row.total .tax-label { color: var(--text-primary); }
.tax-row.total .tax-value { color: var(--accent-light); }
.tax-label { color: var(--text-secondary); }
.tax-value { font-weight: 600; font-family: 'JetBrains Mono', monospace; }

/* ---- Tabs ---- */
.tabs { display: flex; gap: 4px; background: var(--bg-card); border-radius: var(--radius-sm); padding: 4px; margin-bottom: 24px; border: 1px solid var(--border); }
.tab-btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  background: none;
  transition: all var(--transition);
  cursor: pointer;
}
.tab-btn.active {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-accent);
}
.tab-btn:hover:not(.active) { color: var(--text-primary); background: var(--bg-card-hover); }
.tab-content { display: none; }
.tab-content.active { display: block; }

/* ---- Toast Notifications ---- */
#toast-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  background: #1e2130;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 380px;
  box-shadow: var(--shadow-lg);
  animation: toastIn 0.3s ease;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.toast.success { border-left: 3px solid var(--success); }
.toast.error { border-left: 3px solid var(--danger); }
.toast.warning { border-left: 3px solid var(--warning); }
.toast-icon { font-size: 18px; flex-shrink: 0; }
.toast-text { flex: 1; font-size: 13px; font-weight: 500; }

/* ---- Empty State ---- */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
.empty-state .empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.5; }
.empty-state h3 { font-size: 18px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
.empty-state p { font-size: 14px; margin-bottom: 20px; }

/* ---- Page Header ---- */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header-left h1 { font-size: 24px; font-weight: 800; }
.page-header-left p { font-size: 14px; color: var(--text-secondary); margin-top: 2px; }

/* ---- Filter Bar ---- */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-bar .search-bar { flex: 1; min-width: 220px; }
.filter-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition);
}
.filter-select:focus { border-color: var(--accent); }
.filter-select option { background: #1e2130; }

/* ---- Divider ---- */
.divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

/* ---- Product Picker Dropdown ---- */
.product-picker-wrap { position: relative; }
.product-picker-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: #1a1d29;
  border: 1px solid var(--border-active);
  border-radius: var(--radius-md);
  max-height: 280px;
  overflow-y: auto;
  z-index: 200;
  box-shadow: var(--shadow-lg);
}
.picker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background var(--transition);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.picker-item:last-child { border-bottom: none; }
.picker-item:hover { background: var(--bg-card-hover); }
.picker-img {
  width: 40px; height: 40px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
}
.picker-info strong { display: block; font-size: 14px; }
.picker-info span { font-size: 12px; color: var(--text-muted); }

/* ---- Invoice Preview (Print) ---- */
.invoice-preview-wrap {
  background: white;
  color: #111;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 40px;
  border-radius: var(--radius-lg);
  font-size: 13px;
}

/* ---- Scrollbar ---- */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ---- Utility ---- */
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }
.text-warning { color: var(--warning); }
.text-accent { color: var(--accent-light); }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.font-bold { font-weight: 700; }
.hidden { display: none !important; }
.w-full { width: 100%; }

/* ---- Tax Type Toggle Cards ---- */
.tax-type-option {
  display: block;
  cursor: pointer;
  flex: 1;
  min-width: 220px;
}
.tax-type-option input[type="radio"] { display: none; }
.tax-type-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(255,255,255,0.03);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
}
.tax-type-card:hover {
  border-color: var(--border-active);
  background: rgba(255,255,255,0.06);
}
.tax-type-card.active {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06));
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}
.tt-icon { font-size: 28px; flex-shrink: 0; }
.tt-info { flex: 1; }
.tt-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
.tt-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.tt-example { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

/* ---- Animations ---- */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.pulse { animation: pulse 2s infinite; }

/* ---- Responsive ---- */
@media (max-width: 900px) {
  #sidebar { transform: translateX(-100%); }
  #sidebar.open { transform: translateX(0); }
  #main { margin-left: 0; }
  .form-grid-3 { grid-template-columns: 1fr 1fr; }
  #page-content { padding: 16px; }
  .mobile-menu-btn { display: flex !important; }
}
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
}

/* ---- Template Swatches in Invoice Creator ---- */
.tpl-swatch {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.02);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition);
  text-align: center;
}
.tpl-swatch:hover {
  border-color: var(--border-active);
  transform: translateY(-1px);
  background: rgba(255,255,255,0.05);
}
.tpl-swatch.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
  background: rgba(255,255,255,0.07);
}
.tpl-swatch-name {
  font-size: 9px;
  font-weight: 700;
  padding: 4px 2px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-swatch.active .tpl-swatch-name {
  color: var(--accent-light);
}

/* ============================================================
   PRINT STYLES
   ============================================================ */
@media print {
  body { background: white !important; color: #111 !important; }
  #sidebar, #topbar, .no-print { display: none !important; }
  #main { margin-left: 0 !important; }
  #page-content { padding: 0 !important; }
  .invoice-print-area {
    display: block !important;
    background: white !important;
    color: #111 !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}

```

## File: `.\js\app.js`
```javascript
// ============================================================
// app.js — Main App: Router + Dashboard + Utils
// ============================================================

const App = (() => {

  // ---- Router ----
  function navigate(page, param = null) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update topbar title
    const titles = {
      dashboard: '🏠 Dashboard',
      products: '📦 Products Catalog',
      stock: '📊 Product Stock Management',
      inventory: '🧪 Raw Materials & Chemicals',
      invoices: '🧾 Invoices',
      'invoice-new': '🧾 New Invoice',
      'invoice-edit': '✏️ Edit Invoice',
      settings: '⚙️ Settings',
      ledger: '📖 Customer Ledger',
      'ledger-detail': '📖 Ledger Statement',
      financials: '📈 Balance Sheet & P&L Statement',
      employees: '👤 Staff Directory & Payroll',
      quotations: '📝 Quotations & Estimates',
      'quotation-new': '📝 New Quotation',
      'quotation-edit': '✏️ Edit Quotation',
    };
    document.getElementById('topbar-title').textContent = titles[page] || 'Sharma Industries';

    // Render page
    switch (page) {
      case 'dashboard': renderDashboard(); break;
      case 'products': Products.render(param); break;
      case 'stock': Stock.render(); break;
      case 'inventory': Inventory.render(); break;
      case 'financials': Financials.render(); break;
      case 'invoices': InvoiceList.render(); break;
      case 'invoice-new': InvoiceCreator.render(null); break;
      case 'invoice-edit': InvoiceCreator.render(param); break;
      case 'settings': Settings.render(); break;
      case 'ledger': Ledger.render(); break;
      case 'ledger-detail': Ledger.renderDetail(param); break;
      case 'employees': EmployeesPage.render(); break;
      case 'quotations': QuotationsPage.render(); break;
      case 'quotation-new': QuotationsPage.renderForm(null); break;
      case 'quotation-edit': QuotationsPage.renderForm(param); break;
      default: renderDashboard();
    }

    // Update URL hash
    window.location.hash = param ? `#${page}/${param}` : `#${page}`;
  }

  // ---- Dashboard ----
  function renderDashboard() {
    const products = DB.getProducts();
    const invoices = DB.getInvoices();
    const settings = DB.getSettings();

    const totalRevenue = invoices.filter(i => i.paymentStatus === 'Paid').reduce((s, i) => s + (i.grandTotal || 0), 0);
    const pendingAmt = invoices.filter(i => i.paymentStatus === 'Unpaid').reduce((s, i) => s + (i.grandTotal || 0), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10)).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    // Monthly revenue chart data
    const monthlyMap = {};
    invoices.forEach(inv => {
      if (!inv.date) return;
      const m = inv.date.slice(0, 7);
      if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, count: 0 };
      if (inv.paymentStatus === 'Paid') monthlyMap[m].revenue += inv.grandTotal || 0;
      monthlyMap[m].count++;
    });
    const months = Object.keys(monthlyMap).sort().slice(-6);
    const maxRev = Math.max(...months.map(m => monthlyMap[m]?.revenue || 0), 1);

    const recentInvoices = invoices.slice(0, 6);
    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('page-content').innerHTML = `
      <!-- Welcome Banner -->
      <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.08));border:1px solid rgba(99,102,241,0.2);border-radius:var(--radius-xl);padding:28px 32px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <h2 style="font-size:22px;font-weight:800;margin-bottom:4px;">Welcome back! 👋</h2>
          <p style="color:var(--text-secondary);font-size:15px;">${settings.companyName} · ${new Date().toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
          ${settings.gstin ? `<p style="font-size:12px;color:var(--accent-light);margin-top:4px;font-family:monospace;">GSTIN: ${settings.gstin}</p>` : '<p style="font-size:12px;color:var(--warning);margin-top:4px;">⚠️ GSTIN not configured — go to Settings</p>'}
        </div>
        <div class="flex gap-3">
          <button class="btn btn-primary" onclick="App.navigate('invoice-new')">➕ New Invoice</button>
          <button class="btn btn-secondary" onclick="App.navigate('products')">📦 Manage Products</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stat-grid">
        <div class="stat-card" onclick="App.navigate('invoices')" style="cursor:pointer;">
          <div class="stat-icon purple">🧾</div>
          <div class="stat-info">
            <div class="stat-value">${invoices.length}</div>
            <div class="stat-label">Total Invoices</div>
          </div>
        </div>
        <div class="stat-card" onclick="App.navigate('invoices')" style="cursor:pointer;">
          <div class="stat-icon green">💰</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;">₹${fmt(totalRevenue)}</div>
            <div class="stat-label">Revenue Received</div>
          </div>
        </div>
        <div class="stat-card" onclick="App.navigate('invoices')" style="cursor:pointer;">
          <div class="stat-icon orange">⏳</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;">₹${fmt(pendingAmt)}</div>
            <div class="stat-label">Pending Payments</div>
          </div>
        </div>
        <div class="stat-card" onclick="App.navigate('products')" style="cursor:pointer;">
          <div class="stat-icon cyan">📦</div>
          <div class="stat-info">
            <div class="stat-value">${products.length}</div>
            <div class="stat-label">Products</div>
          </div>
        </div>
        ${lowStock + outOfStock > 0 ? `
        <div class="stat-card" onclick="App.navigate('products')" style="cursor:pointer;border-color:rgba(245,158,11,0.2);">
          <div class="stat-icon red">⚠️</div>
          <div class="stat-info">
            <div class="stat-value text-warning">${lowStock + outOfStock}</div>
            <div class="stat-label">Stock Alerts</div>
            <div class="stat-change down">${outOfStock} out · ${lowStock} low</div>
          </div>
        </div>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <!-- Revenue Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📊 Monthly Revenue (Last 6 Months)</h3>
          </div>
          ${months.length === 0
            ? `<div class="empty-state" style="padding:32px;"><div class="empty-icon">📊</div><p>No invoice data yet</p></div>`
            : `<div style="display:flex;align-items:flex-end;gap:10px;height:160px;padding:8px 0;">
                ${months.map(m => {
                  const rev = monthlyMap[m]?.revenue || 0;
                  const pct = maxRev > 0 ? (rev / maxRev) * 100 : 0;
                  const label = new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short' });
                  return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;">
                    <div style="font-size:10px;color:var(--text-muted);font-weight:600;">₹${(rev/1000).toFixed(0)}K</div>
                    <div style="width:100%;background:linear-gradient(180deg,var(--accent),var(--accent-2));border-radius:4px 4px 0 0;height:${Math.max(pct,4)}%;transition:height 0.5s ease;"></div>
                    <div style="font-size:10px;color:var(--text-muted);">${label}</div>
                  </div>`;
                }).join('')}
              </div>`}
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">⚡ Quick Actions</h3></div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="btn btn-primary w-full" onclick="App.navigate('invoice-new')">🧾 Create New Invoice</button>
            <button class="btn btn-secondary w-full" onclick="App.navigate('products', 'new')">➕ Add New Product</button>
            <button class="btn btn-secondary w-full" onclick="App.navigate('invoices')">📋 View All Invoices</button>
            <button class="btn btn-secondary w-full" onclick="App.navigate('settings')">⚙️ Configure Settings</button>
            ${!settings.gstin ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);padding:12px;font-size:13px;color:var(--warning);">
              ⚠️ Please add your GSTIN in Settings before creating invoices!
            </div>` : ''}
          </div>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div class="card" style="padding:0;">
        <div class="card-header" style="padding:20px 24px;">
          <h3 class="card-title">🕐 Recent Invoices</h3>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('invoices')">View All →</button>
        </div>
        <div class="table-wrapper" style="border:none;border-top:1px solid var(--border);">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentInvoices.length === 0
                ? `<tr><td colspan="6"><div class="empty-state" style="padding:32px;">
                    <div class="empty-icon">🧾</div>
                    <p>No invoices yet. <button class="btn btn-primary btn-sm" onclick="App.navigate('invoice-new')">Create one!</button></p>
                  </div></td></tr>`
                : recentInvoices.map(inv => {
                  const statusColors = { Paid: 'success', Unpaid: 'warning', Partial: 'info', Cancelled: 'danger' };
                  return `<tr>
                    <td class="td-mono font-bold">${inv.invoiceNo || '—'}</td>
                    <td>${inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : '—'}</td>
                    <td>${inv.customer?.name || '—'}</td>
                    <td class="td-mono font-bold">₹${fmt(inv.grandTotal)}</td>
                    <td><span class="badge badge-${statusColors[inv.paymentStatus] || 'muted'}">${inv.paymentStatus || 'Unpaid'}</span></td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" onclick="InvoiceList.previewInvoice('${inv.id}')">👁️ View</button>
                        <button class="btn btn-secondary btn-sm" onclick="App.navigate('invoice-edit','${inv.id}')">✏️</button>
                      </div>
                    </td>
                  </tr>`;
                }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Alert -->
      ${(lowStock > 0 || outOfStock > 0) ? `
      <div style="margin-top:20px;" class="card">
        <div class="card-header">
          <h3 class="card-title">⚠️ Stock Alerts</h3>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('products')">Manage Stock →</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
          ${products.filter(p => p.stock <= (p.minStock || 10)).slice(0, 6).map(p => `
            <div class="card-sm flex gap-3 items-center" style="background:${p.stock === 0 ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)'};border-color:${p.stock === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'};">
              <div style="font-size:28px;">${p.image ? `<img src="${p.image}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">` : '📦'}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div>
                <div class="${p.stock === 0 ? 'text-danger' : 'text-warning'}" style="font-size:12px;">${p.stock === 0 ? '❌ Out of Stock' : `⚠️ Only ${p.stock} ${p.unit || ''} left`}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>` : ''}
    `;
  }

  // ---- Toast Notifications ----
  function showToast(msg, type = 'success') {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  // ---- Update sidebar company name ----
  function updateSidebarCompanyName(name) {
    const el = document.querySelector('.logo-text h2');
    if (el) el.textContent = name || 'Sharma Industries';
  }

  // ---- Init ----
  function init() {
    DB.seedIfEmpty();

    // Parse hash route
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [page, param] = hash.split('/');
    navigate(page || 'dashboard', param || null);

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.slice(1) || 'dashboard';
      const [pg, pm] = h.split('/');
      navigate(pg, pm || null);
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.getElementById('main')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
    });

    console.log('%c Sharma Industries GST App ', 'background:#6366f1;color:white;font-size:14px;font-weight:700;padding:6px 12px;border-radius:4px;');
  }

  return { navigate, showToast, updateSidebarCompanyName, init };
})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);

```

## File: `.\js\db.js`
```javascript
// ============================================================
// db.js — localStorage + Supabase Hybrid Cloud Layer
// ============================================================

const DB = {
  // ---- Keys ----
  KEYS: {
    PRODUCTS: 'si_products',
    INVOICES: 'si_invoices',
    SETTINGS: 'si_settings',
    COUNTER: 'si_invoice_counter',
    CUSTOMERS: 'si_customers',
    PAYMENTS: 'si_payments',
    STOCK_LOG: 'si_stock_log',
    MATERIALS: 'si_materials',
    MATERIAL_LOG: 'si_material_logs',
    MATERIAL_BILL: 'si_material_bills',
    EXPENSE: 'si_expenses',
    EMPLOYEES: 'si_employees',
    ATTENDANCE: 'si_attendance',
    SALARY_ADVANCES: 'si_salary_advances',
    SALARY_PAYMENTS: 'si_salary_payments',
    QUOTATIONS: 'si_quotations',
    QUOTATION_COUNTER: 'si_quotation_counter',
  },

  // ---- Generic helpers ----
  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch { return null; }
  },
  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  // ============================================================
  // SETTINGS
  // ============================================================
  getSettings() {
    return this._get(this.KEYS.SETTINGS) || this._defaultSettings();
  },
  _defaultSettings() {
    return {
      companyName: 'Sharma Industries',
      gstin: '08FBZPS8721P1Z6',
      address: '00, Main road, Hospital ke Samne',
      city: 'Barodiya',
      state: 'Rajasthan',
      stateCode: '08',
      pincode: '323001',
      district: 'Bundi',
      phone: '',
      email: '',
      website: '',
      logo: '',
      signature: '',
      bankName: '',
      accountNo: '',
      ifscCode: '',
      accountHolder: '',
      invoicePrefix: 'SI',
      invoiceStartNo: 1,
      defaultTerms: 'Goods once sold will not be returned.\nPayment due within 30 days.\nSubject to local jurisdiction.',
      upiId: '',
      supabaseUrl: 'https://ooyoyxjxavusiuabomzv.supabase.co',
      supabaseKey: 'sb_publishable_FKX4AcZQFApmUY622XTUpA_Rnt13mC4',
    };
  },
  saveSettings(data) {
    this._set(this.KEYS.SETTINGS, data);
    this.initCloud(); // Re-initialize cloud in case credentials changed
    this.Cloud.pushSettings(data);
  },

  // ============================================================
  // PRODUCTS
  // ============================================================
  getProducts() {
    return this._get(this.KEYS.PRODUCTS) || [];
  },
  saveProducts(products) {
    this._set(this.KEYS.PRODUCTS, products);
  },
  getProduct(id) {
    return this.getProducts().find(p => p.id === id) || null;
  },
  addProduct(product) {
    const products = this.getProducts();
    product.id = 'PROD_' + Date.now();
    product.createdAt = new Date().toISOString();
    products.push(product);
    this.saveProducts(products);

    // Log initial stock
    if (Number(product.stock) > 0) {
      this.addStockAdjustment(product.id, 'INITIAL', Number(product.stock), 'Initial Setup', 'Initial Stock Seeding', 'Seeded initial inventory');
    }
    
    this.Cloud.pushProduct(product);
    return product;
  },
  updateProduct(id, updates) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveProducts(products);
    
    this.Cloud.pushProduct(products[idx]);
    return products[idx];
  },
  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
    
    // Clean up stock logs for this product to prevent orphaned logs
    const logs = this.getStockLogs().filter(log => log.productId !== id);
    this.saveStockLogs(logs);
    
    this.Cloud.deleteProduct(id);
  },

  // ============================================================
  // MATERIALS (RAW MATERIALS & CHEMICALS)
  // ============================================================
  getMaterials() {
    return this._get(this.KEYS.MATERIALS) || [];
  },
  saveMaterials(materials) {
    this._set(this.KEYS.MATERIALS, materials);
  },
  getMaterial(id) {
    return this.getMaterials().find(m => m.id === id) || null;
  },
  addMaterial(material) {
    const materials = this.getMaterials();
    material.id = 'MAT_' + Date.now();
    material.createdAt = new Date().toISOString();
    materials.push(material);
    this.saveMaterials(materials);

    // Log initial stock
    if (Number(material.stock) > 0) {
      this.addMaterialAdjustment(material.id, 'INITIAL', Number(material.stock), 'Initial Setup', 'Initial Stock Seeding', 'Seeded initial inventory');
    }
    
    this.Cloud.pushMaterial(material);
    return material;
  },
  updateMaterial(id, updates) {
    const materials = this.getMaterials();
    const idx = materials.findIndex(m => m.id === id);
    if (idx === -1) return null;
    materials[idx] = { ...materials[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveMaterials(materials);
    
    this.Cloud.pushMaterial(materials[idx]);
    return materials[idx];
  },
  deleteMaterial(id) {
    const materials = this.getMaterials().filter(m => m.id !== id);
    this.saveMaterials(materials);
    
    // Clean up stock logs for this material to prevent orphaned logs
    const logs = this.getMaterialLogs().filter(log => log.materialId !== id);
    this.saveMaterialLogs(logs);
    
    this.Cloud.deleteMaterial(id);
  },

  // ============================================================
  // MATERIAL STOCK LOGS
  // ============================================================
  getMaterialLogs() {
    return this._get(this.KEYS.MATERIAL_LOG) || [];
  },
  saveMaterialLogs(logs) {
    this._set(this.KEYS.MATERIAL_LOG, logs);
  },
  getMaterialStockLogs(materialId) {
    return this.getMaterialLogs().filter(log => log.materialId === materialId);
  },
  addMaterialAdjustment(materialId, type, qty, reference = '', reason = '', notes = '') {
    const logs = this.getMaterialLogs();
    const mat = this.getMaterial(materialId);
    if (!mat) return null;

    const currentStock = mat.stock || 0;
    const newStock = Math.max(0, currentStock + qty);

    // Create log entry
    const entry = {
      id: 'MLOG_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      materialId,
      date: new Date().toISOString().split('T')[0],
      type, // 'INITIAL', 'RESTOCK', 'DAMAGE', 'AUDIT'
      qty,  // positive or negative
      reference,
      reason,
      notes,
      resultingStock: newStock
    };

    logs.push(entry);
    this.saveMaterialLogs(logs);

    // Update the material stock field in si_materials
    const materials = this.getMaterials();
    const idx = materials.findIndex(m => m.id === materialId);
    if (idx !== -1) {
      materials[idx] = { ...materials[idx], stock: newStock, updatedAt: new Date().toISOString() };
      this.saveMaterials(materials);
      this.Cloud.pushMaterial(materials[idx]); // Sync material stock count
    }

    this.Cloud.pushMaterialLog(entry);
    return entry;
  },

  // ============================================================
  // MATERIAL BILLS (PURCHASE INVOICES)
  // ============================================================
  getMaterialBills() {
    return this._get(this.KEYS.MATERIAL_BILL) || [];
  },
  saveMaterialBills(bills) {
    this._set(this.KEYS.MATERIAL_BILL, bills);
  },
  addMaterialBill(bill) {
    const bills = this.getMaterialBills();
    bill.id = 'BILL_' + Date.now();
    bill.createdAt = new Date().toISOString();
    bills.unshift(bill);
    this.saveMaterialBills(bills);

    // Automatically increase stock of raw materials and log restock adjustments
    if (bill.items && Array.isArray(bill.items)) {
      bill.items.forEach(item => {
        if (item.materialId) {
          const qty = Number(item.qty || 0);
          this.addMaterialAdjustment(
            item.materialId,
            'RESTOCK',
            qty,
            bill.billNo || 'BILL',
            'Purchase Invoice Restock',
            `Received from supplier: ${bill.supplierName}`
          );
        }
      });
    }

    this.Cloud.pushMaterialBill(bill);
    return bill;
  },

  // ============================================================
  // BUSINESS CASH EXPENSES
  // ============================================================
  getExpenses() {
    return this._get(this.KEYS.EXPENSE) || [];
  },
  saveExpenses(expenses) {
    this._set(this.KEYS.EXPENSE, expenses);
  },
  addExpense(expense) {
    const expenses = this.getExpenses();
    expense.id = 'EXP_' + Date.now();
    expense.createdAt = new Date().toISOString();
    expenses.unshift(expense);
    this.saveExpenses(expenses);

    this.Cloud.pushExpense(expense);
    return expense;
  },
  deleteExpense(id) {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.saveExpenses(expenses);
    this.Cloud.deleteExpense(id);
  },

  // ============================================================
  // EMPLOYEES & STAFF
  // ============================================================
  getEmployees() {
    return this._get(this.KEYS.EMPLOYEES) || [];
  },
  saveEmployees(employees) {
    this._set(this.KEYS.EMPLOYEES, employees);
  },
  addEmployee(emp) {
    const employees = this.getEmployees();
    emp.id = 'EMP_' + Date.now();
    emp.status = emp.status || 'Active';
    emp.createdAt = new Date().toISOString();
    employees.push(emp);
    this.saveEmployees(employees);
    this.Cloud.pushEmployee(emp);
    return emp;
  },
  updateEmployee(id, updates) {
    const employees = this.getEmployees();
    const idx = employees.findIndex(e => e.id === id);
    if (idx === -1) return null;
    employees[idx] = { ...employees[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveEmployees(employees);
    this.Cloud.pushEmployee(employees[idx]);
    return employees[idx];
  },
  deleteEmployee(id) {
    const employees = this.getEmployees().filter(e => e.id !== id);
    this.saveEmployees(employees);
    // clean up logs, advances, payments for employee
    const att = this.getAttendance().filter(a => a.employeeId !== id);
    this.saveAttendance(att);
    const adv = this.getSalaryAdvances().filter(a => a.employeeId !== id);
    this.saveSalaryAdvances(adv);
    const pay = this.getSalaryPayments().filter(p => p.employeeId !== id);
    this.saveSalaryPayments(pay);
    this.Cloud.deleteEmployee(id);
  },

  // ============================================================
  // ATTENDANCE LOGS
  // ============================================================
  getAttendance() {
    return this._get(this.KEYS.ATTENDANCE) || [];
  },
  saveAttendance(attendance) {
    this._set(this.KEYS.ATTENDANCE, attendance);
  },
  logAttendance(employeeId, date, status) {
    const logs = this.getAttendance();
    // remove duplicate if exists
    const filtered = logs.filter(log => !(log.employeeId === employeeId && log.date === date));
    
    const entry = {
      id: 'ATT_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      employeeId,
      date,
      status, // 'Present', 'Absent', 'Half-Day', 'Leave'
      createdAt: new Date().toISOString()
    };
    filtered.push(entry);
    this.saveAttendance(filtered);
    this.Cloud.pushAttendance(entry);
    return entry;
  },

  // ============================================================
  // SALARY ADVANCES
  // ============================================================
  getSalaryAdvances() {
    return this._get(this.KEYS.SALARY_ADVANCES) || [];
  },
  saveSalaryAdvances(advances) {
    this._set(this.KEYS.SALARY_ADVANCES, advances);
  },
  addSalaryAdvance(adv) {
    const advances = this.getSalaryAdvances();
    adv.id = 'SADV_' + Date.now();
    adv.status = adv.status || 'Paid';
    adv.createdAt = new Date().toISOString();
    advances.unshift(adv);
    this.saveSalaryAdvances(advances);

    // Auto-create salaries cash expense
    const emp = this.getEmployees().find(e => e.id === adv.employeeId);
    const empName = emp ? emp.name : 'Staff';
    this.addExpense({
      date: adv.date,
      category: 'Salaries',
      description: `Advance Paid: ${empName} (Mid-month)`,
      amount: Number(adv.amount || 0),
      type: 'Debit',
      paymentMode: adv.paymentMode || 'Bank'
    });

    this.Cloud.pushSalaryAdvance(adv);
    return adv;
  },
  deleteSalaryAdvance(id) {
    // Delete local
    const advances = this.getSalaryAdvances();
    const adv = advances.find(a => a.id === id);
    if (!adv) return;
    const filtered = advances.filter(a => a.id !== id);
    this.saveSalaryAdvances(filtered);

    // Also delete expense if recorded automatically (search by description)
    const expenses = this.getExpenses();
    const emp = this.getEmployees().find(e => e.id === adv.employeeId);
    const empName = emp ? emp.name : 'Staff';
    const targetDesc = `Advance Paid: ${empName} (Mid-month)`;
    const matchedExpense = expenses.find(e => e.description === targetDesc && e.amount === adv.amount && e.date === adv.date);
    if (matchedExpense) {
      this.deleteExpense(matchedExpense.id);
    }

    this.Cloud.deleteSalaryAdvance(id);
  },

  // ============================================================
  // SALARY PAYMENTS (MONTHLY PAYROLL)
  // ============================================================
  getSalaryPayments() {
    return this._get(this.KEYS.SALARY_PAYMENTS) || [];
  },
  saveSalaryPayments(payments) {
    this._set(this.KEYS.SALARY_PAYMENTS, payments);
  },
  addSalaryPayment(pay) {
    const payments = this.getSalaryPayments();
    pay.id = 'SPAY_' + Date.now();
    pay.createdAt = new Date().toISOString();
    payments.unshift(pay);
    this.saveSalaryPayments(payments);

    // Auto-create Salaries cash expense for the Net Paid amount
    const emp = this.getEmployees().find(e => e.id === pay.employeeId);
    const empName = emp ? emp.name : 'Staff';
    this.addExpense({
      date: pay.paymentDate,
      category: 'Salaries',
      description: `Monthly Salary: ${empName} (${pay.month}) · Net Paid`,
      amount: Number(pay.netPaid || 0),
      type: 'Debit',
      paymentMode: pay.paymentMode || 'Bank'
    });

    // Mark corresponding advances for this employee as 'Deducted'
    if (Number(pay.advancesDeducted || 0) > 0) {
      const advances = this.getSalaryAdvances();
      advances.forEach(a => {
        if (a.employeeId === pay.employeeId && a.status === 'Paid') {
          a.status = 'Deducted';
          this.Cloud.pushSalaryAdvance(a);
        }
      });
      this.saveSalaryAdvances(advances);
    }

    this.Cloud.pushSalaryPayment(pay);
    return pay;
  },
  deleteSalaryPayment(id) {
    const payments = this.getSalaryPayments();
    const pay = payments.find(p => p.id === id);
    if (!pay) return;
    const filtered = payments.filter(p => p.id !== id);
    this.saveSalaryPayments(filtered);

    // Also delete automated expense
    const expenses = this.getExpenses();
    const emp = this.getEmployees().find(e => e.id === pay.employeeId);
    const empName = emp ? emp.name : 'Staff';
    const targetDesc = `Monthly Salary: ${empName} (${pay.month}) · Net Paid`;
    const matchedExpense = expenses.find(e => e.description === targetDesc && e.amount === pay.netPaid && e.date === pay.paymentDate);
    if (matchedExpense) {
      this.deleteExpense(matchedExpense.id);
    }

    // Revert corresponding advances status to 'Paid'
    if (Number(pay.advancesDeducted || 0) > 0) {
      const advances = this.getSalaryAdvances();
      advances.forEach(a => {
        if (a.employeeId === pay.employeeId && a.status === 'Deducted') {
          a.status = 'Paid';
          this.Cloud.pushSalaryAdvance(a);
        }
      });
      this.saveSalaryAdvances(advances);
    }

    this.Cloud.deleteSalaryPayment(id);
  },

  // ============================================================
  // QUOTATIONS & ESTIMATES
  // ============================================================
  getQuotations() {
    return this._get(this.KEYS.QUOTATIONS) || [];
  },
  saveQuotations(quotes) {
    this._set(this.KEYS.QUOTATIONS, quotes);
  },
  getQuotation(id) {
    return this.getQuotations().find(q => q.id === id) || null;
  },
  getNextQuotationNumber() {
    const settings = this.getSettings();
    let counter = this._get(this.KEYS.QUOTATION_COUNTER);
    if (counter === null) counter = settings.invoiceStartNo || 1;
    return counter;
  },
  addQuotation(quote) {
    const quotes = this.getQuotations();
    quote.id = 'QT_' + Date.now();
    quote.createdAt = new Date().toISOString();
    
    // bump counter
    const next = this.getNextQuotationNumber();
    this._set(this.KEYS.QUOTATION_COUNTER, next + 1);
    
    quotes.unshift(quote);
    this.saveQuotations(quotes);
    
    this.Cloud.pushQuotation(quote);
    return quote;
  },
  updateQuotation(id, updates) {
    const quotes = this.getQuotations();
    const idx = quotes.findIndex(q => q.id === id);
    if (idx === -1) return null;
    
    quotes[idx] = { ...quotes[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveQuotations(quotes);
    
    this.Cloud.pushQuotation(quotes[idx]);
    return quotes[idx];
  },
  deleteQuotation(id) {
    const filtered = this.getQuotations().filter(q => q.id !== id);
    this.saveQuotations(filtered);
    
    this.Cloud.deleteQuotation(id);
  },

  // ============================================================
  // INVOICES
  // ============================================================
  getInvoices() {
    return this._get(this.KEYS.INVOICES) || [];
  },
  saveInvoices(invoices) {
    this._set(this.KEYS.INVOICES, invoices);
  },
  getInvoice(id) {
    return this.getInvoices().find(inv => inv.id === id) || null;
  },
  getNextInvoiceNumber() {
    const settings = this.getSettings();
    let counter = this._get(this.KEYS.COUNTER);
    if (counter === null) counter = settings.invoiceStartNo || 1;
    return counter;
  },
  addInvoice(invoice) {
    const invoices = this.getInvoices();
    invoice.id = 'INV_' + Date.now();
    invoice.createdAt = new Date().toISOString();
    // bump counter
    const next = this.getNextInvoiceNumber();
    this._set(this.KEYS.COUNTER, next + 1);
    invoices.unshift(invoice);
    this.saveInvoices(invoices);
    
    // update stock and log it
    if (invoice.items) {
      invoice.items.forEach(item => {
        if (item.productId) {
          const prod = this.getProduct(item.productId);
          if (prod) {
            this.addStockAdjustment(item.productId, 'SALE', -Number(item.qty), invoice.invoiceNo, 'Invoice Sale', 'Automatic invoice deduction');
          }
        }
      });
    }
    
    this.Cloud.pushInvoice(invoice);
    return invoice;
  },
  updateInvoice(id, updates) {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx === -1) return null;

    const oldInvoice = invoices[idx];

    // 1. Restore old stock levels
    if (oldInvoice.items) {
      oldInvoice.items.forEach(item => {
        if (item.productId) {
          this.addStockAdjustment(item.productId, 'SALE_CANCELLED', Number(item.qty), oldInvoice.invoiceNo || '', 'Invoice Edit (Restore)', 'Restored stock levels before invoice modification');
        }
      });
    }

    // 2. Apply updates
    invoices[idx] = { ...invoices[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveInvoices(invoices);

    // 3. Deduct new stock levels
    const newInvoice = invoices[idx];
    if (newInvoice.items) {
      newInvoice.items.forEach(item => {
        if (item.productId) {
          this.addStockAdjustment(item.productId, 'SALE', -Number(item.qty), newInvoice.invoiceNo || '', 'Invoice Edit (Deduct)', 'Deducted stock levels after invoice modification');
        }
      });
    }

    this.Cloud.pushInvoice(newInvoice);
    return invoices[idx];
  },
  deleteInvoice(id) {
    const invoices = this.getInvoices();
    const inv = invoices.find(i => i.id === id);
    if (inv && inv.items) {
      // Restore stock levels and log cancellation
      inv.items.forEach(item => {
        if (item.productId) {
          this.addStockAdjustment(item.productId, 'SALE_CANCELLED', Number(item.qty), inv.invoiceNo || '', 'Sale Cancelled', 'Restored due to invoice cancellation');
        }
      });
    }
    const filtered = invoices.filter(inv => inv.id !== id);
    this.saveInvoices(filtered);
    
    this.Cloud.deleteInvoice(id);
  },

  // ============================================================
  // CUSTOMERS
  // ============================================================
  getCustomers() {
    return this._get(this.KEYS.CUSTOMERS) || [];
  },
  saveCustomers(customers) {
    this._set(this.KEYS.CUSTOMERS, customers);
  },
  getCustomer(id) {
    return this.getCustomers().find(c => c.id === id) || null;
  },
  getCustomerByName(name) {
    if (!name) return null;
    return this.getCustomers().find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  },
  addCustomer(customer) {
    const customers = this.getCustomers();
    customer.id = 'CUST_' + Date.now();
    customer.createdAt = new Date().toISOString();
    customers.push(customer);
    this.saveCustomers(customers);
    
    this.Cloud.pushCustomer(customer);
    return customer;
  },
  updateCustomer(id, updates) {
    const customers = this.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    customers[idx] = { ...customers[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveCustomers(customers);
    
    this.Cloud.pushCustomer(customers[idx]);
    return customers[idx];
  },
  deleteCustomer(id) {
    const customers = this.getCustomers().filter(c => c.id !== id);
    this.saveCustomers(customers);
    
    this.Cloud.deleteCustomer(id);
  },
  syncCustomerFromInvoice(invoiceData) {
    const custName = invoiceData.customer?.name;
    if (!custName) return null;
    let cust = this.getCustomerByName(custName);
    const updates = {
      name: custName,
      gstin: invoiceData.customer?.gstin || '',
      address: invoiceData.customer?.address || '',
      city: invoiceData.customer?.city || '',
      state: invoiceData.customer?.state || '',
      pincode: invoiceData.customer?.pincode || '',
      phone: invoiceData.customer?.phone || '',
      email: invoiceData.customer?.email || '',
    };
    if (cust) {
      this.updateCustomer(cust.id, updates);
      return cust.id;
    } else {
      const newCust = this.addCustomer(updates);
      return newCust.id;
    }
  },

  // ============================================================
  // PAYMENTS
  // ============================================================
  getPayments() {
    return this._get(this.KEYS.PAYMENTS) || [];
  },
  savePayments(payments) {
    this._set(this.KEYS.PAYMENTS, payments);
  },
  getPaymentsByCustomer(customerId) {
    return this.getPayments().filter(p => p.customerId === customerId);
  },
  addPayment(payment) {
    const payments = this.getPayments();
    payment.id = 'PAY_' + Date.now();
    payment.createdAt = new Date().toISOString();
    payments.push(payment);
    this.savePayments(payments);
    
    this.Cloud.pushPayment(payment);
    return payment;
  },
  deletePayment(id) {
    const payments = this.getPayments().filter(p => p.id !== id);
    this.savePayments(payments);
    
    this.Cloud.deletePayment(id);
  },

  // ============================================================
  // LEDGER
  // ============================================================
  getCustomerLedger(customerId) {
    const customer = this.getCustomer(customerId);
    if (!customer) return [];

    const ledgerRows = [];

    // 1. Debits: Get all Invoices for this customer ID (or match by name if guest invoice)
    const invoices = this.getInvoices().filter(inv => 
      inv.customerId === customerId || 
      (inv.customer && inv.customer.name.toLowerCase() === customer.name.toLowerCase())
    );

    invoices.forEach(inv => {
      // Debit: Grand Total
      ledgerRows.push({
        date: inv.date,
        type: 'Invoice',
        reference: inv.invoiceNo || 'INV',
        debit: Number(inv.grandTotal || 0),
        credit: 0,
        id: inv.id,
        isInvoice: true
      });

      // Credit: Advance paid (if any)
      if (inv.advance && Number(inv.advance) > 0) {
        ledgerRows.push({
          date: inv.date,
          type: 'Advance Paid',
          reference: `Advance for ${inv.invoiceNo || 'INV'}`,
          debit: 0,
          credit: Number(inv.advance),
          id: inv.id + '_adv',
          isAdvance: true
        });
      }
    });

    // 2. Credits: Get all independent receipts
    const payments = this.getPaymentsByCustomer(customerId);
    payments.forEach(pay => {
      ledgerRows.push({
        date: pay.date,
        type: 'Receipt',
        reference: `Receipt (${pay.paymentMode}) ${pay.reference ? '· ' + pay.reference : ''}`,
        debit: 0,
        credit: Number(pay.amount || 0),
        id: pay.id,
        isReceipt: true,
        notes: pay.notes
      });
    });

    // 3. Sort chronologically
    ledgerRows.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 4. Compute running balance
    let runningBalance = 0;
    ledgerRows.forEach(row => {
      runningBalance += (row.debit - row.credit);
      row.balance = runningBalance;
    });

    return ledgerRows;
  },

  // ============================================================
  // STOCK MANAGEMENT & INVENTORY LOGS
  // ============================================================
  getStockLogs() {
    return this._get(this.KEYS.STOCK_LOG) || [];
  },
  saveStockLogs(logs) {
    this._set(this.KEYS.STOCK_LOG, logs);
  },
  getProductStockLogs(productId) {
    return this.getStockLogs().filter(log => log.productId === productId);
  },
  addStockAdjustment(productId, type, qty, reference = '', reason = '', notes = '') {
    const logs = this.getStockLogs();
    const prod = this.getProduct(productId);
    if (!prod) return null;

    const currentStock = prod.stock || 0;
    const newStock = Math.max(0, currentStock + qty);

    // Create log entry
    const entry = {
      id: 'SLOG_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      productId,
      date: new Date().toISOString().split('T')[0],
      type, // 'INITIAL', 'SALE', 'SALE_CANCELLED', 'RESTOCK', 'DAMAGE', 'AUDIT'
      qty,  // positive or negative
      reference,
      reason,
      notes,
      resultingStock: newStock
    };

    logs.push(entry);
    this.saveStockLogs(logs);

    // Update the product stock field in si_products (disable auto-log in recursion)
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], stock: newStock, updatedAt: new Date().toISOString() };
      this.saveProducts(products);
      this.Cloud.pushProduct(products[idx]); // Sync product stock count
    }

    this.Cloud.pushStockLog(entry);
    return entry;
  },

  // ============================================================
  // CLOUD DATABASE INTEGRATION (SUPABASE)
  // ============================================================
  initCloud() {
    const settings = this.getSettings();
    if (settings.supabaseUrl && settings.supabaseKey) {
      try {
        if (typeof supabase !== 'undefined') {
          window.supabaseClient = supabase.createClient(settings.supabaseUrl, settings.supabaseKey);
          console.log('%c Supabase Client Initialized ', 'background:#10b981;color:white;font-weight:700;');
          return true;
        }
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      }
    }
    window.supabaseClient = null;
    return false;
  },

  Cloud: {
    isConnected() {
      return !!window.supabaseClient;
    },
    
    async pushProduct(p) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('products').upsert({
          id: p.id,
          name: p.name,
          category: p.category || '',
          description: p.description || '',
          sku: p.sku || '',
          hsn_code: p.hsnCode || '',
          unit: p.unit || 'Pcs',
          purchase_price: Number(p.purchasePrice) || 0,
          selling_price: Number(p.sellingPrice) || 0,
          stock: Number(p.stock) || 0,
          min_stock: Number(p.minStock) || 10,
          image: p.image || '',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushProduct):', err); }
    },
    
    async deleteProduct(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('products').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteProduct):', err); }
    },
    
    async pushMaterial(m) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('materials').upsert({
          id: m.id,
          name: m.name,
          category: m.category || '',
          description: m.description || '',
          sku: m.sku || '',
          hsn_code: m.hsnCode || '',
          unit: m.unit || 'Kg',
          purchase_price: Number(m.purchasePrice) || 0,
          stock: Number(m.stock) || 0,
          min_stock: Number(m.minStock) || 10,
          location: m.location || '',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushMaterial):', err); }
    },
    
    async deleteMaterial(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('materials').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteMaterial):', err); }
    },

    async pushMaterialLog(log) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('material_logs').upsert({
          id: log.id,
          material_id: log.materialId,
          date: log.date,
          type: log.type,
          qty: Number(log.qty) || 0,
          reference: log.reference || '',
          reason: log.reason || '',
          notes: log.notes || '',
          resulting_stock: Number(log.resultingStock) || 0
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushMaterialLog):', err); }
    },

    async deleteMaterialLog(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('material_logs').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteMaterialLog):', err); }
    },

    async pushMaterialBill(bill) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('material_bills').upsert({
          id: bill.id,
          bill_no: bill.billNo,
          date: bill.date,
          supplier_name: bill.supplierName,
          items: bill.items,
          subtotal: Number(bill.subtotal) || 0,
          tax_rate: Number(bill.taxRate) || 18,
          tax_amount: Number(bill.taxAmount) || 0,
          grand_total: Number(bill.grandTotal) || 0,
          payment_status: bill.paymentStatus || 'Paid',
          notes: bill.notes || '',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushMaterialBill):', err); }
    },

    async pushExpense(expense) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('expenses').upsert({
          id: expense.id,
          date: expense.date,
          category: expense.category,
          description: expense.description || '',
          amount: Number(expense.amount) || 0,
          type: expense.type || 'Debit',
          payment_mode: expense.paymentMode || 'Bank'
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushExpense):', err); }
    },
    async deleteExpense(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('expenses').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteExpense):', err); }
    },
    async pushEmployee(emp) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('employees').upsert({
          id: emp.id,
          name: emp.name,
          designation: emp.designation,
          salary: Number(emp.salary) || 0,
          joining_date: emp.joiningDate,
          status: emp.status || 'Active',
          aadhaar_front: emp.aadhaarFront || '',
          aadhaar_back: emp.aadhaarBack || '',
          pan_card: emp.panCard || '',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushEmployee):', err); }
    },
    async deleteEmployee(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('employees').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteEmployee):', err); }
    },
    async pushAttendance(log) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('attendance').upsert({
          id: log.id,
          employee_id: log.employeeId,
          date: log.date,
          status: log.status
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushAttendance):', err); }
    },
    async deleteAttendance(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('attendance').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteAttendance):', err); }
    },
    async pushSalaryAdvance(adv) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('salary_advances').upsert({
          id: adv.id,
          employee_id: adv.employeeId,
          date: adv.date,
          amount: Number(adv.amount) || 0,
          payment_mode: adv.paymentMode || 'Bank',
          status: adv.status || 'Paid',
          notes: adv.notes || ''
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushSalaryAdvance):', err); }
    },
    async deleteSalaryAdvance(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('salary_advances').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteSalaryAdvance):', err); }
    },
    async pushSalaryPayment(pay) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('salary_payments').upsert({
          id: pay.id,
          employee_id: pay.employeeId,
          month: pay.month,
          base_salary: Number(pay.baseSalary) || 0,
          days_present: Number(pay.daysPresent) || 0,
          gross_salary: Number(pay.grossSalary) || 0,
          advances_deducted: Number(pay.advancesDeducted) || 0,
          net_paid: Number(pay.netPaid) || 0,
          payment_mode: pay.paymentMode || 'Bank',
          payment_date: pay.paymentDate
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushSalaryPayment):', err); }
    },
    async deleteSalaryPayment(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('salary_payments').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteSalaryPayment):', err); }
    },
    async pushQuotation(quote) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('quotations').upsert({
          id: quote.id,
          quotation_no: quote.quotationNo,
          date: quote.date,
          valid_until: quote.validUntil || '',
          tax_type: quote.taxType || 'exclusive',
          supply_type: quote.supplyType || 'intra',
          customer: quote.customer,
          items: quote.items,
          subtotal: Number(quote.subtotal) || 0,
          total_taxable: Number(quote.totalTaxable) || 0,
          total_gst: Number(quote.totalGST) || 0,
          cgst: Number(quote.cgst) || 0,
          sgst: Number(quote.sgst) || 0,
          igst: Number(quote.igst) || 0,
          freight: Number(quote.freight) || 0,
          discount: Number(quote.discount) || 0,
          round_off: Number(quote.roundOff) || 0,
          grand_total: Number(quote.grandTotal) || 0,
          notes: quote.notes || '',
          status: quote.status || 'Draft',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushQuotation):', err); }
    },
    async deleteQuotation(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('quotations').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteQuotation):', err); }
    },
    
    async pushCustomer(c) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('customers').upsert({
          id: c.id,
          name: c.name,
          gstin: c.gstin || '',
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
          pincode: c.pincode || '',
          phone: c.phone || '',
          email: c.email || '',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushCustomer):', err); }
    },
    
    async deleteCustomer(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('customers').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteCustomer):', err); }
    },

    async pushInvoice(inv) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('invoices').upsert({
          id: inv.id,
          invoice_no: inv.invoiceNo,
          date: inv.date,
          due_date: inv.dueDate || '',
          tax_type: inv.taxType || 'exclusive',
          supply_type: inv.supplyType || 'intra',
          template: inv.template || 'classic',
          payment_mode: inv.paymentMode || 'Cash',
          payment_status: inv.paymentStatus || 'Unpaid',
          customer_id: inv.customerId || null,
          customer: inv.customer,
          items: inv.items,
          subtotal: Number(inv.subtotal) || 0,
          total_taxable: Number(inv.totalTaxable) || 0,
          total_gst: Number(inv.totalGST) || 0,
          cgst: Number(inv.cgst) || 0,
          sgst: Number(inv.sgst) || 0,
          igst: Number(inv.igst) || 0,
          freight: Number(inv.freight) || 0,
          discount: Number(inv.discount) || 0,
          round_off: Number(inv.roundOff) || 0,
          advance: Number(inv.advance) || 0,
          grand_total: Number(inv.grandTotal) || 0,
          balance_due: Number(inv.balanceDue) || 0,
          notes: inv.notes || '',
          seller: inv.seller,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushInvoice):', err); }
    },

    async deleteInvoice(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('invoices').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteInvoice):', err); }
    },

    async pushPayment(p) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('payments').upsert({
          id: p.id,
          customer_id: p.customerId,
          date: p.date,
          amount: Number(p.amount) || 0,
          payment_mode: p.paymentMode,
          reference: p.reference || '',
          notes: p.notes || ''
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushPayment):', err); }
    },

    async deletePayment(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('payments').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deletePayment):', err); }
    },

    async pushStockLog(log) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('stock_logs').upsert({
          id: log.id,
          product_id: log.productId,
          date: log.date,
          type: log.type,
          qty: Number(log.qty) || 0,
          reference: log.reference || '',
          reason: log.reason || '',
          notes: log.notes || '',
          resulting_stock: Number(log.resultingStock) || 0
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushStockLog):', err); }
    },

    async deleteStockLog(id) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('stock_logs').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (deleteStockLog):', err); }
    },

    async pushSettings(settings) {
      if (!this.isConnected()) return;
      try {
        const { error } = await window.supabaseClient.from('settings').upsert({
          id: 1,
          data: settings,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } catch (err) { console.error('Cloud Sync Error (pushSettings):', err); }
    },

    // BULK SEEDING & IMPORTING
    async pushAllLocalToCloud() {
      if (!this.isConnected()) throw new Error('Supabase client not connected');
      
      const settings = DB.getSettings();
      const products = DB.getProducts();
      const customers = DB.getCustomers();
      const invoices = DB.getInvoices();
      const payments = DB.getPayments();
      const logs = DB.getStockLogs();
      const quotations = DB.getQuotations();

      // 1. Settings
      await this.pushSettings(settings);

      // 2. Customers
      if (customers.length) {
        const payload = customers.map(c => ({
          id: c.id, name: c.name, gstin: c.gstin || '', address: c.address || '',
          city: c.city || '', state: c.state || '', pincode: c.pincode || '',
          phone: c.phone || '', email: c.email || '', updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('customers').upsert(payload);
        if (error) throw error;
      }

      // 3. Products
      if (products.length) {
        const payload = products.map(p => ({
          id: p.id, name: p.name, category: p.category || '', description: p.description || '',
          sku: p.sku || '', hsn_code: p.hsnCode || '', unit: p.unit || 'Pcs',
          purchase_price: Number(p.purchasePrice) || 0, selling_price: Number(p.sellingPrice) || 0,
          stock: Number(p.stock) || 0, min_stock: Number(p.minStock) || 10, image: p.image || '',
          updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('products').upsert(payload);
        if (error) throw error;
      }

      // 4. Invoices
      if (invoices.length) {
        const payload = invoices.map(inv => ({
          id: inv.id, invoice_no: inv.invoiceNo, date: inv.date, due_date: inv.dueDate || '',
          tax_type: inv.taxType || 'exclusive', supply_type: inv.supplyType || 'intra',
          template: inv.template || 'classic', payment_mode: inv.paymentMode || 'Cash',
          payment_status: inv.paymentStatus || 'Unpaid', customer_id: inv.customerId || null,
          customer: inv.customer, items: inv.items, subtotal: Number(inv.subtotal) || 0,
          total_taxable: Number(inv.totalTaxable) || 0, total_gst: Number(inv.totalGST) || 0,
          cgst: Number(inv.cgst) || 0, sgst: Number(inv.sgst) || 0, igst: Number(inv.igst) || 0,
          freight: Number(inv.freight) || 0, discount: Number(inv.discount) || 0,
          round_off: Number(inv.roundOff) || 0, advance: Number(inv.advance) || 0,
          grand_total: Number(inv.grandTotal) || 0, balance_due: Number(inv.balanceDue) || 0,
          notes: inv.notes || '', seller: inv.seller, updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('invoices').upsert(payload);
        if (error) throw error;
      }

      // 5. Payments
      if (payments.length) {
        const payload = payments.map(p => ({
          id: p.id, customer_id: p.customerId, date: p.date, amount: Number(p.amount) || 0,
          payment_mode: p.paymentMode, reference: p.reference || '', notes: p.notes || ''
        }));
        const { error } = await window.supabaseClient.from('payments').upsert(payload);
        if (error) throw error;
      }

      // 6. Stock Logs
      if (logs.length) {
        const payload = logs.map(log => ({
          id: log.id, product_id: log.productId, date: log.date, type: log.type,
          qty: Number(log.qty) || 0, reference: log.reference || '', reason: log.reason || '',
          notes: log.notes || '', resulting_stock: Number(log.resultingStock) || 0
        }));
        const { error } = await window.supabaseClient.from('stock_logs').upsert(payload);
        if (error) throw error;
      }

      // 7. Materials
      const materials = DB.getMaterials();
      if (materials.length) {
        const payload = materials.map(m => ({
          id: m.id, name: m.name, category: m.category || '', description: m.description || '',
          sku: m.sku || '', hsn_code: m.hsnCode || '', unit: m.unit || 'Kg',
          purchase_price: Number(m.purchasePrice) || 0, stock: Number(m.stock) || 0,
          min_stock: Number(m.minStock) || 10, location: m.location || '',
          updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('materials').upsert(payload);
        if (error) throw error;
      }

      // 8. Material Logs
      const materialLogs = DB.getMaterialLogs();
      if (materialLogs.length) {
        const payload = materialLogs.map(log => ({
          id: log.id, material_id: log.materialId, date: log.date, type: log.type,
          qty: Number(log.qty) || 0, reference: log.reference || '', reason: log.reason || '',
          notes: log.notes || '', resulting_stock: Number(log.resultingStock) || 0
        }));
        const { error } = await window.supabaseClient.from('material_logs').upsert(payload);
        if (error) throw error;
      }

      // 9. Material Bills
      const materialBills = DB.getMaterialBills();
      if (materialBills.length) {
        const payload = materialBills.map(b => ({
          id: b.id, bill_no: b.billNo, date: b.date, supplier_name: b.supplierName,
          items: b.items, subtotal: Number(b.subtotal) || 0, tax_rate: Number(b.taxRate) || 18,
          tax_amount: Number(b.taxAmount) || 0, grand_total: Number(b.grandTotal) || 0,
          payment_status: b.paymentStatus || 'Paid', notes: b.notes || '',
          updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('material_bills').upsert(payload);
        if (error) throw error;
      }

      // 10. Expenses
      const expenses = DB.getExpenses();
      if (expenses.length) {
        const payload = expenses.map(e => ({
          id: e.id, date: e.date, category: e.category, description: e.description || '',
          amount: Number(e.amount) || 0, type: e.type || 'Debit', payment_mode: e.paymentMode || 'Bank'
        }));
        const { error } = await window.supabaseClient.from('expenses').upsert(payload);
        if (error) throw error;
      }

      // 11. Employees
      const employees = DB.getEmployees();
      if (employees.length) {
        const payload = employees.map(emp => ({
          id: emp.id, name: emp.name, designation: emp.designation, salary: Number(emp.salary) || 0,
          joining_date: emp.joiningDate, status: emp.status || 'Active',
          aadhaar_front: emp.aadhaarFront || '',
          aadhaar_back: emp.aadhaarBack || '',
          pan_card: emp.panCard || '',
          updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('employees').upsert(payload);
        if (error) throw error;
      }

      // 12. Attendance
      const attendance = DB.getAttendance();
      if (attendance.length) {
        const payload = attendance.map(log => ({
          id: log.id, employee_id: log.employeeId, date: log.date, status: log.status
        }));
        const { error } = await window.supabaseClient.from('attendance').upsert(payload);
        if (error) throw error;
      }

      // 13. Salary Advances
      const advances = DB.getSalaryAdvances();
      if (advances.length) {
        const payload = advances.map(adv => ({
          id: adv.id, employee_id: adv.employeeId, date: adv.date, amount: Number(adv.amount) || 0,
          payment_mode: adv.paymentMode || 'Bank', status: adv.status || 'Paid', notes: adv.notes || ''
        }));
        const { error } = await window.supabaseClient.from('salary_advances').upsert(payload);
        if (error) throw error;
      }

      // 14. Salary Payments
      const salaryPayments = DB.getSalaryPayments();
      if (salaryPayments.length) {
        const payload = salaryPayments.map(pay => ({
          id: pay.id, employee_id: pay.employeeId, month: pay.month, base_salary: Number(pay.baseSalary) || 0,
          days_present: Number(pay.daysPresent) || 0, gross_salary: Number(pay.grossSalary) || 0,
          advances_deducted: Number(pay.advancesDeducted) || 0, net_paid: Number(pay.netPaid) || 0,
          payment_mode: pay.paymentMode || 'Bank', payment_date: pay.paymentDate
        }));
        const { error } = await window.supabaseClient.from('salary_payments').upsert(payload);
        if (error) throw error;
      }

      // 15. Quotations
      if (quotations.length) {
        const payload = quotations.map(q => ({
          id: q.id,
          quotation_no: q.quotationNo,
          date: q.date,
          valid_until: q.validUntil || '',
          tax_type: q.taxType || 'exclusive',
          supply_type: q.supplyType || 'intra',
          customer: q.customer,
          items: q.items,
          subtotal: Number(q.subtotal) || 0,
          total_taxable: Number(q.totalTaxable) || 0,
          total_gst: Number(q.totalGST) || 0,
          cgst: Number(q.cgst) || 0,
          sgst: Number(q.sgst) || 0,
          igst: Number(q.igst) || 0,
          freight: Number(q.freight) || 0,
          discount: Number(q.discount) || 0,
          round_off: Number(q.roundOff) || 0,
          grand_total: Number(q.grandTotal) || 0,
          notes: q.notes || '',
          status: q.status || 'Draft',
          updated_at: new Date().toISOString()
        }));
        const { error } = await window.supabaseClient.from('quotations').upsert(payload);
        if (error) throw error;
      }
    },

    async pullAllCloudToLocal() {
      if (!this.isConnected()) throw new Error('Supabase client not connected');

      // 1. Settings
      const { data: cloudSettings, error: sErr } = await window.supabaseClient.from('settings').select('*').eq('id', 1).single();
      if (!sErr && cloudSettings && cloudSettings.data) {
        DB._set(DB.KEYS.SETTINGS, cloudSettings.data);
      }

      // 2. Customers
      const { data: cloudCustomers, error: cErr } = await window.supabaseClient.from('customers').select('*');
      if (!cErr && cloudCustomers) {
        DB._set(DB.KEYS.CUSTOMERS, cloudCustomers);
      }

      // 3. Products
      const { data: cloudProducts, error: pErr } = await window.supabaseClient.from('products').select('*');
      if (!pErr && cloudProducts) {
        const mapped = cloudProducts.map(p => ({
          id: p.id, name: p.name, category: p.category, description: p.description,
          sku: p.sku, hsnCode: p.hsn_code, unit: p.unit, purchasePrice: Number(p.purchase_price) || 0,
          sellingPrice: Number(p.selling_price) || 0, stock: Number(p.stock) || 0,
          minStock: Number(p.min_stock) || 10, image: p.image, createdAt: p.created_at, updatedAt: p.updated_at
        }));
        DB._set(DB.KEYS.PRODUCTS, mapped);
      }

      // 4. Invoices
      const { data: cloudInvoices, error: iErr } = await window.supabaseClient.from('invoices').select('*');
      if (!iErr && cloudInvoices) {
        const mapped = cloudInvoices.map(inv => ({
          id: inv.id, invoiceNo: inv.invoice_no, date: inv.date, dueDate: inv.due_date,
          taxType: inv.tax_type, supplyType: inv.supply_type, template: inv.template,
          paymentMode: inv.payment_mode, paymentStatus: inv.payment_status, customerId: inv.customer_id,
          customer: inv.customer, items: inv.items, subtotal: Number(inv.subtotal) || 0,
          totalTaxable: Number(inv.total_taxable) || 0, totalGST: Number(inv.total_gst) || 0,
          cgst: Number(inv.cgst) || 0, sgst: Number(inv.sgst) || 0, igst: Number(inv.igst) || 0,
          freight: Number(inv.freight) || 0, discount: Number(inv.discount) || 0,
          roundOff: Number(inv.round_off) || 0, advance: Number(inv.advance) || 0,
          grandTotal: Number(inv.grand_total) || 0, balanceDue: Number(inv.balance_due) || 0,
          notes: inv.notes, seller: inv.seller, createdAt: inv.created_at, updatedAt: inv.updated_at
        }));
        DB._set(DB.KEYS.INVOICES, mapped);
      }

      // 5. Payments
      const { data: cloudPayments, error: payErr } = await window.supabaseClient.from('payments').select('*');
      if (!payErr && cloudPayments) {
        const mapped = cloudPayments.map(p => ({
          id: p.id, customerId: p.customer_id, date: p.date, amount: Number(p.amount) || 0,
          paymentMode: p.payment_mode, reference: p.reference, notes: p.notes, createdAt: p.created_at
        }));
        DB._set(DB.KEYS.PAYMENTS, mapped);
      }

      // 6. Stock Logs
      const { data: cloudLogs, error: logErr } = await window.supabaseClient.from('stock_logs').select('*');
      if (!logErr && cloudLogs) {
        const mapped = cloudLogs.map(log => ({
          id: log.id, productId: log.product_id, date: log.date, type: log.type,
          qty: Number(log.qty) || 0, reference: log.reference, reason: log.reason,
          notes: log.notes, resultingStock: Number(log.resulting_stock), createdAt: log.created_at
        }));
        DB._set(DB.KEYS.STOCK_LOG, mapped);
      }

      // 7. Materials
      const { data: cloudMaterials, error: mErr } = await window.supabaseClient.from('materials').select('*');
      if (!mErr && cloudMaterials) {
        const mapped = cloudMaterials.map(m => ({
          id: m.id, name: m.name, category: m.category, description: m.description,
          sku: m.sku, hsnCode: m.hsn_code, unit: m.unit, purchasePrice: Number(m.purchase_price) || 0,
          stock: Number(m.stock) || 0, minStock: Number(m.min_stock) || 10,
          location: m.location, createdAt: m.created_at, updatedAt: m.updated_at
        }));
        DB._set(DB.KEYS.MATERIALS, mapped);
      }

      // 8. Material Logs
      const { data: cloudMaterialLogs, error: mlErr } = await window.supabaseClient.from('material_logs').select('*');
      if (!mlErr && cloudMaterialLogs) {
        const mapped = cloudMaterialLogs.map(log => ({
          id: log.id, materialId: log.material_id, date: log.date, type: log.type,
          qty: Number(log.qty) || 0, reference: log.reference, reason: log.reason,
          notes: log.notes, resultingStock: Number(log.resulting_stock), createdAt: log.created_at
        }));
        DB._set(DB.KEYS.MATERIAL_LOG, mapped);
      }

      // 9. Material Bills
      const { data: cloudMaterialBills, error: mbErr } = await window.supabaseClient.from('material_bills').select('*');
      if (!mbErr && cloudMaterialBills) {
        const mapped = cloudMaterialBills.map(b => ({
          id: b.id, billNo: b.bill_no, date: b.date, supplierName: b.supplier_name,
          items: b.items, subtotal: Number(b.subtotal) || 0, taxRate: Number(b.tax_rate) || 18,
          taxAmount: Number(b.tax_amount) || 0, grandTotal: Number(b.grand_total) || 0,
          paymentStatus: b.payment_status || 'Paid', notes: b.notes, createdAt: b.created_at, updatedAt: b.updated_at
        }));
        DB._set(DB.KEYS.MATERIAL_BILL, mapped);
      }

      // 10. Expenses
      const { data: cloudExpenses, error: eErr } = await window.supabaseClient.from('expenses').select('*');
      if (!eErr && cloudExpenses) {
        const mapped = cloudExpenses.map(e => ({
          id: e.id, date: e.date, category: e.category, description: e.description,
          amount: Number(e.amount) || 0, type: e.type || 'Debit', paymentMode: e.payment_mode, createdAt: e.created_at
        }));
        DB._set(DB.KEYS.EXPENSE, mapped);
      }

      // 11. Employees
      const { data: cloudEmployees, error: empErr } = await window.supabaseClient.from('employees').select('*');
      if (!empErr && cloudEmployees) {
        const mapped = cloudEmployees.map(emp => ({
          id: emp.id, name: emp.name, designation: emp.designation, salary: Number(emp.salary) || 0,
          joiningDate: emp.joining_date, status: emp.status || 'Active',
          aadhaarFront: emp.aadhaar_front || '',
          aadhaarBack: emp.aadhaar_back || '',
          panCard: emp.pan_card || '',
          createdAt: emp.created_at
        }));
        DB._set(DB.KEYS.EMPLOYEES, mapped);
      }

      // 12. Attendance
      const { data: cloudAttendance, error: attErr } = await window.supabaseClient.from('attendance').select('*');
      if (!attErr && cloudAttendance) {
        const mapped = cloudAttendance.map(log => ({
          id: log.id, employeeId: log.employee_id, date: log.date, status: log.status, createdAt: log.created_at
        }));
        DB._set(DB.KEYS.ATTENDANCE, mapped);
      }

      // 13. Salary Advances
      const { data: cloudAdvances, error: advErr } = await window.supabaseClient.from('salary_advances').select('*');
      if (!advErr && cloudAdvances) {
        const mapped = cloudAdvances.map(adv => ({
          id: adv.id, employeeId: adv.employee_id, date: adv.date, amount: Number(adv.amount) || 0,
          paymentMode: adv.payment_mode, status: adv.status || 'Paid', notes: adv.notes, createdAt: adv.created_at
        }));
        DB._set(DB.KEYS.SALARY_ADVANCES, mapped);
      }

      // 14. Salary Payments
      const { data: cloudSalPayments, error: salPayErr } = await window.supabaseClient.from('salary_payments').select('*');
      if (!salPayErr && cloudSalPayments) {
        const mapped = cloudSalPayments.map(pay => ({
          id: pay.id, employeeId: pay.employee_id, month: pay.month, baseSalary: Number(pay.base_salary) || 0,
          daysPresent: Number(pay.days_present) || 0, grossSalary: Number(pay.gross_salary) || 0,
          advancesDeducted: Number(pay.advances_deducted) || 0, netPaid: Number(pay.net_paid) || 0,
          paymentMode: pay.payment_mode, paymentDate: pay.payment_date, createdAt: pay.created_at
        }));
        DB._set(DB.KEYS.SALARY_PAYMENTS, mapped);
      }

      // 15. Quotations
      const { data: cloudQuotes, error: qErr } = await window.supabaseClient.from('quotations').select('*');
      if (!qErr && cloudQuotes) {
        const mapped = cloudQuotes.map(q => ({
          id: q.id,
          quotationNo: q.quotation_no,
          date: q.date,
          validUntil: q.valid_until,
          taxType: q.tax_type,
          supplyType: q.supply_type,
          customer: q.customer,
          items: q.items,
          subtotal: Number(q.subtotal) || 0,
          totalTaxable: Number(q.total_taxable) || 0,
          totalGST: Number(q.total_gst) || 0,
          cgst: Number(q.cgst) || 0,
          sgst: Number(q.sgst) || 0,
          igst: Number(q.igst) || 0,
          freight: Number(q.freight) || 0,
          discount: Number(q.discount) || 0,
          roundOff: Number(q.round_off) || 0,
          grandTotal: Number(q.grand_total) || 0,
          notes: q.notes,
          status: q.status,
          createdAt: q.created_at,
          updatedAt: q.updated_at
        }));
        DB._set(DB.KEYS.QUOTATIONS, mapped);
      }
    }
  },

  // ============================================================
  // SEED DEFAULT DATA
  // ============================================================
  seedIfEmpty() {
    // Auto-fill company settings if GSTIN is missing
    let existing = this._get(this.KEYS.SETTINGS);
    let updated = false;

    if (!existing || !existing.gstin) {
      existing = { ...this._defaultSettings(), ...(existing || {}) };
      existing.gstin = existing.gstin || '08FBZPS8721P1Z6';
      existing.companyName = existing.companyName || 'Sharma Industries';
      existing.address = existing.address || '00, Main road, Hospital ke Samne';
      existing.city = existing.city || 'Barodiya';
      existing.state = existing.state || 'Rajasthan';
      existing.stateCode = existing.stateCode || '08';
      existing.pincode = existing.pincode || '323001';
      existing.district = existing.district || 'Bundi';
      updated = true;
    }

    // Auto-migrate active settings cache to connect your real Supabase project
    if (existing && !existing.supabaseUrl) {
      existing.supabaseUrl = 'https://ooyoyxjxavusiuabomzv.supabase.co';
      existing.supabaseKey = 'sb_publishable_FKX4AcZQFApmUY622XTUpA_Rnt13mC4';
      updated = true;
    }

    if (updated && existing) {
      this._set(this.KEYS.SETTINGS, existing);
    }

    // Try connecting to Supabase immediately upon load
    this.initCloud();

    // Automatically pull updates from Cloud Database if connected on load
    if (this.Cloud.isConnected()) {
      console.log('%c Auto-Sync: Connecting to Supabase and checking for updates... ', 'background:#3b82f6;color:white;');
      this.Cloud.pullAllCloudToLocal()
        .then(() => {
          console.log('%c Auto-Sync Complete: Local cache successfully updated from Supabase. ', 'background:#10b981;color:white;');
          // Silent refresh of active view state so user sees updates immediately
          if (typeof App !== 'undefined' && App.navigate) {
            const hash = window.location.hash.slice(1) || 'dashboard';
            const [page, param] = hash.split('/');
            App.navigate(page, param || null);
          }
        })
        .catch(err => {
          console.error('Auto-Sync on startup encountered error:', err);
        });
    }
    
    if (this.getProducts().length === 0) {
      const sampleProducts = [
        {
          name: 'Interior Emulsion Paint',
          category: 'Finished Paints',
          description: 'Premium water-based interior emulsion paint. Smooth finish, washable, low VOC. Suitable for interior walls and ceilings.',
          sku: 'INT-EMU-20L',
          hsnCode: '3209',
          unit: 'Ltr',
          purchasePrice: 85,
          sellingPrice: 130,
          gstRate: 18,
          stock: 500,
          minStock: 50,
          image: '',
        },
        {
          name: 'Exterior Emulsion Paint',
          category: 'Finished Paints',
          description: 'Weather-resistant exterior emulsion paint. UV stable, anti-fungal, crack-resistant. Ideal for exterior walls.',
          sku: 'EXT-EMU-20L',
          hsnCode: '3210',
          unit: 'Ltr',
          purchasePrice: 100,
          sellingPrice: 155,
          gstRate: 18,
          stock: 350,
          minStock: 50,
          image: '',
        }
      ];
      sampleProducts.forEach(p => this.addProduct(p));
    }

    if (this.getMaterials().length === 0) {
      const sampleMaterials = [
        {
          name: 'Titanium Dioxide (TiO₂)',
          category: 'Raw Materials - Pigments',
          description: 'High-opacity white pigment (Rutile grade). Used as primary white pigment in paints and coatings.',
          sku: 'TIO2-RUT',
          hsnCode: '2823',
          unit: 'Kg',
          purchasePrice: 180,
          gstRate: 18,
          stock: 1000,
          minStock: 100,
          location: 'Bin A-1',
          image: '',
        },
        {
          name: 'Alkyd Resin (Short Oil)',
          category: 'Raw Materials - Binders',
          description: 'Short-oil alkyd resin for fast-drying enamel paints. Provides excellent gloss and hardness.',
          sku: 'ALK-SO-50',
          hsnCode: '3907',
          unit: 'Kg',
          purchasePrice: 95,
          gstRate: 18,
          stock: 800,
          minStock: 80,
          location: 'Bin B-3',
          image: '',
        },
        {
          name: 'Linseed Oil (Raw)',
          category: 'Raw Materials - Binders',
          description: 'Cold-pressed raw linseed oil used as binder in oil-based paints and putties.',
          sku: 'LINS-OIL-RAW',
          hsnCode: '1515',
          unit: 'Ltr',
          purchasePrice: 75,
          gstRate: 5,
          stock: 600,
          minStock: 60,
          location: 'Cold Room C',
          image: '',
        },
        {
          name: 'Calcium Carbonate (Coated)',
          category: 'Raw Materials - Fillers',
          description: 'Coated calcium carbonate extender pigment. Improves opacity, reduces cost, used in all paint types.',
          sku: 'CACO3-CTD',
          hsnCode: '2836',
          unit: 'Kg',
          purchasePrice: 8,
          gstRate: 5,
          stock: 5000,
          minStock: 500,
          location: 'Shed 2',
          image: '',
        },
        {
          name: 'Paint Thinner (Mineral Spirits)',
          category: 'Solvents',
          description: 'Petroleum-based mineral spirits / white spirit used as solvent and thinner for oil-based paints.',
          sku: 'THNR-MIN',
          hsnCode: '2710',
          unit: 'Ltr',
          purchasePrice: 45,
          gstRate: 18,
          stock: 1200,
          minStock: 100,
          location: 'Flammable Storage D',
          image: '',
        },
        {
          name: 'Carbon Black Pigment',
          category: 'Raw Materials - Pigments',
          description: 'Fine carbon black for tinting and black paints. High tinting strength, jet black shade.',
          sku: 'CBLK-FIN',
          hsnCode: '2803',
          unit: 'Kg',
          purchasePrice: 55,
          gstRate: 18,
          stock: 400,
          minStock: 40,
          location: 'Bin A-2',
          image: '',
        },
        {
          name: 'Packaging Tin Can (5 Ltr)',
          category: 'Packaging',
          description: 'Lacquered tin container 5-litre capacity for paint packaging. Leak-proof with clip-on lid.',
          sku: 'PKG-TIN-5L',
          hsnCode: '7310',
          unit: 'Pcs',
          purchasePrice: 38,
          gstRate: 18,
          stock: 2000,
          minStock: 200,
          location: 'Packaging Room E',
          image: '',
        },
        {
          name: 'Zinc Oxide',
          category: 'Raw Materials - Pigments',
          description: 'Technical grade zinc oxide used as anti-fungal agent and pigment in paints and primers.',
          sku: 'ZNOX-TECH',
          hsnCode: '2817',
          unit: 'Kg',
          purchasePrice: 120,
          gstRate: 18,
          stock: 300,
          minStock: 30,
          location: 'Bin A-3',
          image: '',
        },
      ];
      sampleMaterials.forEach(m => this.addMaterial(m));
    }

    if (this.getExpenses().length === 0) {
      const sampleExpenses = [
        {
          date: new Date().toISOString().split('T')[0],
          category: 'Salaries',
          description: 'Monthly payroll for production operators',
          amount: 25000,
          type: 'Debit',
          paymentMode: 'Bank'
        },
        {
          date: new Date().toISOString().split('T')[0],
          category: 'Rent',
          description: 'Factory shed monthly lease',
          amount: 15000,
          type: 'Debit',
          paymentMode: 'Bank'
        },
        {
          date: new Date().toISOString().split('T')[0],
          category: 'Utilities',
          description: 'High-voltage electric power bill',
          amount: 8500,
          type: 'Debit',
          paymentMode: 'UPI'
        }
      ];
      sampleExpenses.forEach(e => this.addExpense(e));
    }

    if (this.getMaterialBills().length === 0) {
      const sampleBills = [
        {
          billNo: 'PUR-2026-001',
          date: new Date().toISOString().split('T')[0],
          supplierName: 'Gujarat Pigments Ltd.',
          items: [
            {
              materialId: 'MAT_seed1',
              name: 'Titanium Dioxide (TiO₂)',
              qty: 100,
              purchasePrice: 180,
              total: 18000
            }
          ],
          subtotal: 18000,
          taxRate: 18,
          taxAmount: 3240,
          grandTotal: 21240,
          paymentStatus: 'Paid',
          notes: 'Standard batch purchase'
        }
      ];
      const materials = this.getMaterials();
      if (materials.length > 0) {
        sampleBills[0].items[0].materialId = materials[0].id;
        sampleBills[0].items[0].name = materials[0].name;
        this.addMaterialBill(sampleBills[0]);
      }
    }

    if (this.getEmployees().length === 0) {
      const sampleStaff = [
        {
          name: 'Rajesh Kumar',
          designation: 'Production Chemist',
          salary: 28000,
          joiningDate: '2025-01-15',
          status: 'Active'
        },
        {
          name: 'Sunil Sharma',
          designation: 'Machine Operator',
          salary: 18000,
          joiningDate: '2025-03-10',
          status: 'Active'
        },
        {
          name: 'Amit Verma',
          designation: 'Helper / Packer',
          salary: 12000,
          joiningDate: '2025-05-01',
          status: 'Active'
        }
      ];
      sampleStaff.forEach(s => this.addEmployee(s));
    }

    if (this.getQuotations().length === 0) {
      const products = this.getProducts();
      const sampleItems = [];
      if (products.length > 0) {
        sampleItems.push({
          productId: products[0].id,
          name: products[0].name,
          qty: 10,
          price: Number(products[0].sellingPrice) || 250,
          gstRate: Number(products[0].gstRate) || 18,
          taxable: 2500,
          gstAmount: 450,
          total: 2950
        });
      } else {
        sampleItems.push({
          productId: 'PROD_sample',
          name: 'Premium Emulsion White',
          qty: 10,
          price: 250,
          gstRate: 18,
          taxable: 2500,
          gstAmount: 450,
          total: 2950
        });
      }
      
      const sampleQuote = {
        quotationNo: 'QT-2026-001',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxType: 'exclusive',
        supplyType: 'intra',
        customer: {
          name: 'Sharma Builders',
          gstin: '08AAAAA0000A1Z0',
          address: '45, Industrial Area',
          city: 'Kota',
          state: 'Rajasthan',
          pincode: '324001',
          phone: '9876543210',
          email: 'sharmabuilders@gmail.com'
        },
        items: sampleItems,
        subtotal: 2500,
        totalTaxable: 2500,
        totalGST: 450,
        cgst: 225,
        sgst: 225,
        igst: 0,
        freight: 100,
        discount: 50,
        roundOff: 0,
        grandTotal: 3000,
        notes: 'Special discount applied. Estimate valid for 30 days.',
        status: 'Draft'
      };
      
      this.addQuotation(sampleQuote);
    }
  },
};

```

## File: `.\js\employees.js`
```javascript
// ============================================================
// employees.js — Employees Directory, Attendance Register & Payroll
// ============================================================

const EmployeesPage = (() => {
  let currentTab = 'directory'; // 'directory', 'attendance', 'payroll'
  let searchStaffQuery = '';
  let designationFilter = '';
  let attendanceDate = new Date().toISOString().split('T')[0];
  let payrollMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const DESIGNATIONS = [
    'Production Manager',
    'Chemical Analyst',
    'Paint Tinting Operator',
    'Logistics Supervisor',
    'Maintenance Technician',
    'Factory Helper',
    'Office Accountant',
    'Security Officer'
  ];

  function render() {
    const employees = DB.getEmployees();
    const attendance = DB.getAttendance();
    const advances = DB.getSalaryAdvances();
    const payments = DB.getSalaryPayments();

    // Calculations
    const activeStaff = employees.filter(e => e.status === 'Active').length;
    
    // Total gross payments this month
    const currentMonthPayments = payments
      .filter(p => p.month === payrollMonth)
      .reduce((sum, p) => sum + Number(p.netPaid || 0), 0);

    // Total outstanding unpaid advances
    const activeAdvancesVal = advances
      .filter(a => a.status === 'Paid')
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);

    // Today's attendance ratio
    const todayLogs = attendance.filter(a => a.date === attendanceDate);
    const presentCount = todayLogs.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
    const ratioText = activeStaff > 0 ? `${presentCount}/${activeStaff}` : '0/0';

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let mainContentHtml = '';

    if (currentTab === 'directory') {
      mainContentHtml = `
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="staff-search" placeholder="Search employee name..." value="${searchStaffQuery}" oninput="EmployeesPage.applyFilters()">
          </div>
          <select class="filter-select" id="staff-filter-designation" onchange="EmployeesPage.applyFilters()">
            <option value="">All Designations</option>
            ${DESIGNATIONS.map(d => `<option value="${d}" ${designationFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="EmployeesPage.openAddEmployeeModal()" style="margin-left:auto;">
            ➕ Add Employee
          </button>
        </div>

        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;">
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Designation</th>
                  <th>Core Monthly Salary</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th style="width:120px;text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody id="staff-tbody">
                ${renderStaffRows(employees)}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (currentTab === 'attendance') {
      mainContentHtml = `
        <div class="filter-bar" style="align-items: center; justify-content: space-between;">
          <div class="form-group" style="margin:0; display:flex; align-items:center; gap:10px;">
            <label class="form-label" style="margin:0; font-weight:700;">📅 Attendance Date:</label>
            <input class="form-control" type="date" id="attendance-date-select" value="${attendanceDate}" onchange="EmployeesPage.changeAttendanceDate(this.value)" style="width:160px; padding:6px 10px;">
          </div>
          <span style="font-size:12px; color:var(--text-secondary);">Click status buttons below to log attendance instantly</span>
        </div>

        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;">
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Designation</th>
                  <th>Logged Status</th>
                  <th style="text-align:right; width:340px;">Mark Daily Attendance</th>
                </tr>
              </thead>
              <tbody>
                ${renderAttendanceRows(employees, todayLogs)}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (currentTab === 'payroll') {
      mainContentHtml = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; align-items:start;">
          <!-- Left: Advances Ledger -->
          <div class="card" style="padding:0; overflow:hidden;">
            <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
              <h3 class="card-title">💸 Mid-Month Salary Advances</h3>
              <button class="btn btn-secondary btn-sm" onclick="EmployeesPage.openRecordAdvanceModal()">➕ Pay Advance</button>
            </div>
            <div class="table-wrapper" style="border:none; max-height:450px; overflow-y:auto;">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th class="text-right">Advance Amount</th>
                    <th>Status</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${renderAdvancesRows(advances, employees)}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right: Payroll Payments Ledger -->
          <div class="card" style="padding:0; overflow:hidden;">
            <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
              <h3 class="card-title">🧾 Monthly Payroll Slips (${payrollMonth})</h3>
              <div style="display:flex; gap:10px; align-items:center;">
                <input type="month" class="form-control" value="${payrollMonth}" onchange="EmployeesPage.changePayrollMonth(this.value)" style="padding:4px 8px; width:130px; font-size:12px;">
                <button class="btn btn-primary btn-sm" onclick="EmployeesPage.openProcessPayrollModal()">⚙️ Process Payroll</button>
              </div>
            </div>
            <div class="table-wrapper" style="border:none; max-height:450px; overflow-y:auto;">
              <table>
                <thead>
                  <tr>
                    <th>Slip Period</th>
                    <th>Employee</th>
                    <th class="text-right">Net Payout</th>
                    <th style="width:100px; text-align:right;">Slip Operations</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderPaymentsRows(payments, employees)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>👤 Staff Directory & Payroll</h1>
          <p>Register employees, manage daily attendance logs, payout advances, and process monthly salaries</p>
        </div>
        <div class="topbar-actions">
          ${currentTab === 'directory' ? `
            <button class="btn btn-primary" onclick="EmployeesPage.openAddEmployeeModal()">
              ➕ Add New Employee
            </button>
          ` : ''}
          ${currentTab === 'payroll' ? `
            <button class="btn btn-secondary" onclick="EmployeesPage.openRecordAdvanceModal()" style="margin-right:8px;">
              💸 Disburse Salary Advance
            </button>
            <button class="btn btn-primary" onclick="EmployeesPage.openProcessPayrollModal()">
              ⚙️ Calculate Monthly Payroll
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Summary Row -->
      <div class="stat-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-icon purple">👤</div>
          <div class="stat-info">
            <div class="stat-value">${activeStaff}</div>
            <div class="stat-label">Active Employees</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">📅</div>
          <div class="stat-info">
            <div class="stat-value">${ratioText}</div>
            <div class="stat-label">Today's Present Attendance</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">💸</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;color:#f59e0b;">₹${fmt(activeAdvancesVal)}</div>
            <div class="stat-label">Outstanding Staff Advances</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan">📊</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;">₹${fmt(currentMonthPayments)}</div>
            <div class="stat-label">Net Payroll Paid (${payrollMonth})</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn ${currentTab === 'directory' ? 'active' : ''}" id="staff-tab-btn-directory" onclick="EmployeesPage.switchTab('directory')">📋 Staff Directory</button>
        <button class="tab-btn ${currentTab === 'attendance' ? 'active' : ''}" id="staff-tab-btn-attendance" onclick="EmployeesPage.switchTab('attendance')">📜 Attendance Register</button>
        <button class="tab-btn ${currentTab === 'payroll' ? 'active' : ''}" id="staff-tab-btn-payroll" onclick="EmployeesPage.switchTab('payroll')">💳 Salary Slips & Advances</button>
      </div>

      <!-- Tab Content Area -->
      ${mainContentHtml}
    `;
  }

  function renderStaffRows(employees) {
    let list = [...employees];
    if (searchStaffQuery) {
      const q = searchStaffQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    if (designationFilter) {
      list = list.filter(e => e.designation === designationFilter);
    }

    if (!list.length) {
      return `<tr><td colspan="6"><div class="empty-state">
        <div class="empty-icon">👤</div>
        <h3>No employees matching filters</h3>
        <p>Add new staff members or clear search criteria</p>
      </div></td></tr>`;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return list.map(emp => {
      const statusBadge = emp.status === 'Active' ? 'success' : 'muted';
      const actionText = emp.status === 'Active' ? 'Inactivate' : 'Activate';
      const dateStr = new Date(emp.joiningDate + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

      const hasAadhaarF = !!emp.aadhaarFront;
      const hasAadhaarB = !!emp.aadhaarBack;
      const hasPan = !!emp.panCard;
      const docsIndicator = `
        <div style="display:flex; gap:6px; margin-top:4px; font-size:11px; align-items:center;">
          <span style="color:${hasAadhaarF && hasAadhaarB ? 'var(--success)' : 'var(--text-muted)'}; cursor:pointer; font-weight:500;" onclick="EmployeesPage.openDocsModal('${emp.id}')" title="Aadhaar Front/Back Status">
            🪪 Aadhaar: ${hasAadhaarF ? '●' : '○'}${hasAadhaarB ? '●' : '○'}
          </span>
          <span style="color:var(--text-muted); font-size:9px;">|</span>
          <span style="color:${hasPan ? 'var(--success)' : 'var(--text-muted)'}; cursor:pointer; font-weight:500;" onclick="EmployeesPage.openDocsModal('${emp.id}')" title="PAN Status">
            💳 PAN: ${hasPan ? '●' : '○'}
          </span>
        </div>
      `;

      return `
        <tr>
          <td>
            <strong style="color:var(--text-primary); font-size:14px;">${emp.name}</strong>
            ${docsIndicator}
          </td>
          <td><span class="badge badge-info" style="padding:2px 6px;">💼 ${emp.designation}</span></td>
          <td class="td-mono font-bold text-accent">₹${fmt(emp.salary)}</td>
          <td class="td-mono">${dateStr}</td>
          <td><span class="badge badge-${statusBadge}">${emp.status || 'Active'}</span></td>
          <td style="text-align:right;">
            <div class="flex gap-2" style="justify-content:flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="EmployeesPage.openDocsModal('${emp.id}')" style="padding:4px 8px;font-size:11px;">
                📁 Docs
              </button>
              <button class="btn btn-secondary btn-sm" onclick="EmployeesPage.toggleEmployeeStatus('${emp.id}')" style="padding:4px 8px;font-size:11px;">
                ${actionText}
              </button>
              <button class="btn btn-danger btn-sm" onclick="EmployeesPage.deleteEmployee('${emp.id}')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.2);" title="Delete Employee">
                🗑️
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }



  function renderAttendanceRows(employees, logs) {
    const activeList = employees.filter(e => e.status === 'Active');
    if (!activeList.length) {
      return `<tr><td colspan="4"><div class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>No active employees found</h3>
        <p>Register active employees in the directory first to log attendance</p>
      </div></td></tr>`;
    }

    return activeList.map(emp => {
      const log = logs.find(l => l.employeeId === emp.id);
      const currentStatus = log ? log.status : 'Not Logged';
      
      const badgeMap = {
        'Present': 'success',
        'Absent': 'danger',
        'Half-Day': 'warning',
        'Leave': 'info',
        'Not Logged': 'muted'
      };

      return `
        <tr>
          <td><strong style="color:var(--text-primary); font-size:14px;">${emp.name}</strong></td>
          <td><span class="badge badge-muted" style="padding:2px 6px;">💼 ${emp.designation}</span></td>
          <td><span class="badge badge-${badgeMap[currentStatus]}" style="padding:4px 10px; font-weight:700;">${currentStatus}</span></td>
          <td>
            <div class="flex gap-2" style="justify-content:flex-end;">
              <button class="btn btn-sm btn-success" onclick="EmployeesPage.logAttendance('${emp.id}', 'Present')" style="padding:4px 8px; font-size:11px; ${currentStatus === 'Present' ? 'outline:2px solid var(--success);' : ''}">P</button>
              <button class="btn btn-sm btn-warning" onclick="EmployeesPage.logAttendance('${emp.id}', 'Half-Day')" style="padding:4px 8px; font-size:11px; ${currentStatus === 'Half-Day' ? 'outline:2px solid var(--warning);' : ''}">HD</button>
              <button class="btn btn-sm btn-info" onclick="EmployeesPage.logAttendance('${emp.id}', 'Leave')" style="padding:4px 8px; font-size:11px; ${currentStatus === 'Leave' ? 'outline:2px solid var(--info);' : ''}">L</button>
              <button class="btn btn-sm btn-danger" onclick="EmployeesPage.logAttendance('${emp.id}', 'Absent')" style="padding:4px 8px; font-size:11px; background:rgba(239,68,68,0.25); ${currentStatus === 'Absent' ? 'outline:2px solid var(--danger);' : ''}">A</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function renderAdvancesRows(advances, employees) {
    if (!advances.length) {
      return `<tr><td colspan="5"><div class="empty-state">
        <div class="empty-icon">💸</div>
        <h3>No advance payments recorded</h3>
      </div></td></tr>`;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return advances.map(adv => {
      const emp = employees.find(e => e.id === adv.employeeId);
      const name = emp ? emp.name : 'Unknown';
      const statusBadge = adv.status === 'Paid' ? 'warning' : 'success';
      const dateStr = new Date(adv.date + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

      return `
        <tr>
          <td class="td-mono">${dateStr}</td>
          <td><strong>${name}</strong></td>
          <td class="td-mono text-right font-bold" style="color:var(--danger);">₹${fmt(adv.amount)}</td>
          <td><span class="badge badge-${statusBadge}">${adv.status || 'Paid'}</span></td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="EmployeesPage.deleteSalaryAdvance('${adv.id}')" style="padding:2px 6px; font-size:11px; background:rgba(239,68,68,0.2);" title="Delete Advance">✕</button>
          </td>
        </tr>`;
    }).join('');
  }

  function renderPaymentsRows(payments, employees) {
    // filter payments of the active month
    const filtered = payments.filter(p => p.month === payrollMonth);

    if (!filtered.length) {
      return `<tr><td colspan="4"><div class="empty-state">
        <div class="empty-icon">🧾</div>
        <h3>No salary slips for ${payrollMonth}</h3>
      </div></td></tr>`;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return filtered.map(pay => {
      const emp = employees.find(e => e.id === pay.employeeId);
      const name = emp ? emp.name : 'Unknown';
      
      return `
        <tr>
          <td class="td-mono">${pay.month}</td>
          <td><strong>${name}</strong></td>
          <td class="td-mono text-right font-bold text-accent">₹${fmt(pay.netPaid)}</td>
          <td style="text-align:right;">
            <div class="flex gap-2" style="justify-content:flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="EmployeesPage.printSalarySlip('${pay.id}')" style="padding:4px 8px; font-size:11px;">🖨️ View Slip</button>
              <button class="btn btn-danger btn-sm" onclick="EmployeesPage.deleteSalaryPayment('${pay.id}')" style="padding:4px 8px; font-size:11px; background:rgba(239,68,68,0.25);">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function switchTab(tab) {
    currentTab = tab;
    render();
  }

  function applyFilters() {
    if (currentTab === 'directory') {
      searchStaffQuery = document.getElementById('staff-search')?.value || '';
      designationFilter = document.getElementById('staff-filter-designation')?.value || '';
      const tbody = document.getElementById('staff-tbody');
      if (tbody) {
        tbody.innerHTML = renderStaffRows(DB.getEmployees());
      }
    }
  }

  function changeAttendanceDate(d) {
    attendanceDate = d;
    render();
  }

  function changePayrollMonth(m) {
    payrollMonth = m;
    render();
  }

  function logAttendance(employeeId, status) {
    DB.logAttendance(employeeId, attendanceDate, status);
    const empName = DB.getEmployees().find(e => e.id === employeeId)?.name || 'Employee';
    App.showToast(`Attendance marked ${status} for ${empName}!`, 'success');
    render();
  }

  function toggleEmployeeStatus(id) {
    const emp = DB.getEmployees().find(e => e.id === id);
    if (!emp) return;
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    DB.updateEmployee(id, { status: nextStatus });
    App.showToast(`${emp.name} is now marked ${nextStatus}.`, 'info');
    render();
  }

  function deleteEmployee(id) {
    const emp = DB.getEmployees().find(e => e.id === id);
    if (!emp) return;
    if (!confirm(`Delete employee "${emp.name}" and all historical attendance/salary logs?`)) return;
    DB.deleteEmployee(id);
    App.showToast('Employee registry deleted successfully.', 'warning');
    render();
  }

  function deleteSalaryAdvance(id) {
    if (!confirm('Are you sure you want to delete this advance transaction? This rolls back Salaries expenses.')) return;
    DB.deleteSalaryAdvance(id);
    App.showToast('Advance payment rolled back.', 'warning');
    render();
  }

  function deleteSalaryPayment(id) {
    if (!confirm('Delete this salary payment? This will roll back deductions and related Salaries expenses.')) return;
    DB.deleteSalaryPayment(id);
    App.showToast('Salary payout slip deleted.', 'warning');
    render();
  }

  // --- Modals ---
  function openAddEmployeeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'add-employee-modal';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">👤 Add Staff Member</h2>
          <button class="modal-close" onclick="EmployeesPage.closeModal('add-employee-modal')">✕</button>
        </div>
        <form onsubmit="EmployeesPage.saveNewEmployee(event)">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">Employee Name <span class="required">*</span></label>
              <input class="form-control" name="name" placeholder="e.g. Rajesh Kumar" required>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Designation <span class="required">*</span></label>
                <select class="form-control" name="designation" required>
                  ${DESIGNATIONS.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Joining Date <span class="required">*</span></label>
                <input class="form-control" name="joiningDate" type="date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Core Monthly Salary (₹) <span class="required">*</span></label>
              <input class="form-control" name="salary" type="number" step="0.01" min="0" placeholder="0.00" required>
            </div>

            <div class="divider"></div>
            <div class="flex gap-3" style="justify-content:flex-end;">
              <button type="button" class="btn btn-secondary" onclick="EmployeesPage.closeModal('add-employee-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">💾 Save Employee</button>
            </div>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('add-employee-modal'); });
  }

  function openRecordAdvanceModal() {
    const activeStaffList = DB.getEmployees().filter(e => e.status === 'Active');
    if (!activeStaffList.length) {
      alert('Please register an active employee first.');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'record-advance-modal';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">💸 Disburse Salary Advance</h2>
          <button class="modal-close" onclick="EmployeesPage.closeModal('record-advance-modal')">✕</button>
        </div>
        <form onsubmit="EmployeesPage.saveSalaryAdvance(event)">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">Choose Employee <span class="required">*</span></label>
              <select class="form-control" name="employeeId" required>
                ${activeStaffList.map(emp => `<option value="${emp.id}">${emp.name} (${emp.designation})</option>`).join('')}
              </select>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Advance Amount (₹) <span class="required">*</span></label>
                <input class="form-control" name="amount" type="number" step="0.01" min="1" placeholder="0.00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Payout Date <span class="required">*</span></label>
                <input class="form-control" name="date" type="date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Payment Mode <span class="required">*</span></label>
              <select class="form-control" name="paymentMode" required>
                <option value="UPI" selected>UPI Payout</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Internal notes</label>
              <input class="form-control" name="notes" placeholder="e.g. Requested for home repairs emergency">
            </div>

            <div class="divider"></div>
            <div class="flex gap-3" style="justify-content:flex-end;">
              <button type="button" class="btn btn-secondary" onclick="EmployeesPage.closeModal('record-advance-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">💾 Payout Advance</button>
            </div>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('record-advance-modal'); });
  }

  function openProcessPayrollModal() {
    const activeStaffList = DB.getEmployees().filter(e => e.status === 'Active');
    if (!activeStaffList.length) {
      alert('Please register an active employee first.');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'process-payroll-modal';

    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">⚙️ Calculate & Disburse Monthly Payroll</h2>
          <button class="modal-close" onclick="EmployeesPage.closeModal('process-payroll-modal')">✕</button>
        </div>
        <form onsubmit="EmployeesPage.saveSalarySlip(event)">
          <div class="form-grid-3" style="margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Select Employee <span class="required">*</span></label>
              <select class="form-control" name="employeeId" id="p-emp-select" onchange="EmployeesPage.recalculatePayrollSlip()" required>
                ${activeStaffList.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Salary Month <span class="required">*</span></label>
              <input type="month" class="form-control" name="month" id="p-month-input" value="${payrollMonth}" onchange="EmployeesPage.recalculatePayrollSlip()" required>
            </div>
            <div class="form-group">
              <label class="form-label">Payout Date <span class="required">*</span></label>
              <input type="date" class="form-control" name="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; margin-bottom:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div>
              <h3 style="font-size:13px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:12px;">📊 Attendance & Earnings</h3>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:13px;">
                <div style="display:flex; justify-content:space-between;"><span>Designation:</span><strong id="p-designation-label">—</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Core Base Salary:</span><strong id="p-core-salary-label">₹0.00</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Present Days in Month:</span><strong id="p-attendance-days-label" class="text-success">0 Days</strong></div>
                <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border); padding-top:8px; font-weight:700; font-size:14px;">
                  <span>Gross Pro-Rata Earnings:</span><span id="p-gross-earning-label" class="text-accent">₹0.00</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style="font-size:13px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:12px;">💸 Deductions & Net Take-home</h3>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:13px;">
                <div style="display:flex; justify-content:space-between;"><span>Mid-month Advance Taken:</span><strong id="p-advance-deduct-label" class="text-danger">₹0.00</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Payment Outflow Mode:</span>
                  <select name="paymentMode" style="padding:2px 6px; font-size:11px; background:#1b1d24; border:1px solid var(--border); border-radius:3px; color:inherit;">
                    <option value="Bank" selected>Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border); padding-top:8px; font-weight:900; font-size:16px; color:var(--success);">
                  <span>Net Paid Amount:</span><span id="p-net-paid-label">₹0.00</span>
                </div>
              </div>
            </div>
          </div>

          <div class="divider"></div>
          <div class="flex gap-3" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" onclick="EmployeesPage.closeModal('process-payroll-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">💼 Approve & Disburse Payout</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('process-payroll-modal'); });
    recalculatePayrollSlip();
  }

  function closeModal(id) {
    document.getElementById(id)?.remove();
  }

  function recalculatePayrollSlip() {
    const employeeId = document.getElementById('p-emp-select')?.value;
    const month = document.getElementById('p-month-input')?.value;
    if (!employeeId || !month) return;

    const emp = DB.getEmployees().find(e => e.id === employeeId);
    if (!emp) return;

    // Scan attendance for the selected employee in the selected month
    const logs = DB.getAttendance().filter(a => a.employeeId === employeeId && a.date.startsWith(month));
    
    // Count days present (1 for Present, 0.5 for Half-Day)
    let daysPresent = 0;
    logs.forEach(log => {
      if (log.status === 'Present') daysPresent += 1.0;
      else if (log.status === 'Half-Day') daysPresent += 0.5;
      else if (log.status === 'Leave') daysPresent += 1.0; // leave approved counts as salary day
    });

    // Default to full month if no logs are present, to avoid empty salary
    if (logs.length === 0) daysPresent = 30.0;

    const baseSalary = Number(emp.salary || 0);
    // Gross is pro-rated by present days out of a standard 30 day month
    const grossSalary = Math.round((baseSalary * daysPresent) / 30);

    // Scan paid advances for this employee
    const advances = DB.getSalaryAdvances().filter(a => a.employeeId === employeeId && a.status === 'Paid');
    const advancesDeducted = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

    const netPaid = Math.max(0, grossSalary - advancesDeducted);

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Update UI elements
    const dLabel = document.getElementById('p-designation-label');
    if (dLabel) dLabel.textContent = emp.designation;

    const sLabel = document.getElementById('p-core-salary-label');
    if (sLabel) sLabel.textContent = '₹' + fmt(baseSalary);

    const aLabel = document.getElementById('p-attendance-days-label');
    if (aLabel) aLabel.textContent = `${daysPresent} Days Present / Logged`;

    const gLabel = document.getElementById('p-gross-earning-label');
    if (gLabel) gLabel.textContent = '₹' + fmt(grossSalary);

    const adLabel = document.getElementById('p-advance-deduct-label');
    if (adLabel) adLabel.textContent = '-₹' + fmt(advancesDeducted);

    const nLabel = document.getElementById('p-net-paid-label');
    if (nLabel) nLabel.textContent = '₹' + fmt(netPaid);
  }

  // --- Save Operations ---
  function saveNewEmployee(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const emp = {
      name: fd.get('name'),
      designation: fd.get('designation'),
      salary: Number(fd.get('salary')) || 0,
      joiningDate: fd.get('joiningDate'),
      status: 'Active'
    };

    DB.addEmployee(emp);
    App.showToast('Employee successfully registered!', 'success');
    closeModal('add-employee-modal');
    render();
  }

  function saveSalaryAdvance(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const adv = {
      employeeId: fd.get('employeeId'),
      amount: Number(fd.get('amount')) || 0,
      date: fd.get('date'),
      paymentMode: fd.get('paymentMode'),
      notes: fd.get('notes') || '',
      status: 'Paid'
    };

    DB.addSalaryAdvance(adv);
    App.showToast('Mid-month advance disbursed and cash log registered!', 'success');
    closeModal('record-advance-modal');
    render();
  }

  function saveSalarySlip(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const employeeId = fd.get('employeeId');
    const month = fd.get('month');

    // Double check if already paid for this month
    const existing = DB.getSalaryPayments().find(p => p.employeeId === employeeId && p.month === month);
    if (existing) {
      alert(`Payroll has already been processed for this employee for ${month}!`);
      return;
    }

    const emp = DB.getEmployees().find(e => e.id === employeeId);
    if (!emp) return;

    // Redo pro-rata calculations safely
    const logs = DB.getAttendance().filter(a => a.employeeId === employeeId && a.date.startsWith(month));
    let daysPresent = 0;
    logs.forEach(log => {
      if (log.status === 'Present') daysPresent += 1.0;
      else if (log.status === 'Half-Day') daysPresent += 0.5;
      else if (log.status === 'Leave') daysPresent += 1.0;
    });
    if (logs.length === 0) daysPresent = 30.0;

    const baseSalary = Number(emp.salary || 0);
    const grossSalary = Math.round((baseSalary * daysPresent) / 30);

    const advances = DB.getSalaryAdvances().filter(a => a.employeeId === employeeId && a.status === 'Paid');
    const advancesDeducted = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

    const netPaid = Math.max(0, grossSalary - advancesDeducted);

    const pay = {
      employeeId,
      month,
      baseSalary,
      daysPresent,
      grossSalary,
      advancesDeducted,
      netPaid,
      paymentMode: fd.get('paymentMode'),
      paymentDate: fd.get('paymentDate')
    };

    DB.addSalaryPayment(pay);
    App.showToast('Monthly salary slip approved and net cash paid!', 'success');
    closeModal('process-payroll-modal');
    render();
  }

  function printSalarySlip(paymentId) {
    const pay = DB.getSalaryPayments().find(p => p.id === paymentId);
    if (!pay) return;

    const emp = DB.getEmployees().find(e => e.id === pay.employeeId);
    if (!emp) return;

    const settings = DB.getSettings();
    const dateStr = new Date(pay.paymentDate + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Salary Slip - ${emp.name} (${pay.month})</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
          .container { border: 2px solid #333; padding: 30px; border-radius: 8px; max-width: 650px; margin: auto; }
          .header { border-bottom: 2px solid #333; padding-bottom: 14px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center; }
          .company-name { font-size: 22px; font-weight: bold; text-transform: uppercase; }
          .company-info { font-size: 11px; color: #666; margin-top: 4px; }
          .slip-title { font-size: 16px; font-weight: 800; text-transform: uppercase; text-align: center; margin-bottom: 20px; text-decoration: underline; }
          
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; font-size: 13px; }
          .meta-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding-bottom: 4px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th { background: #f0f0f0; font-weight: 700; border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 8px 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          tr.total td { font-weight: bold; border-top: 2px solid #333; border-bottom: 2px double #333; background: #fafafa; font-size: 14px; }
          td.right { text-align: right; font-family: monospace; }
          
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; }
          .sig-box { width: 200px; text-align: center; border-top: 1px solid #333; padding-top: 8px; }
          
          @media print {
            body { margin: 20px; }
            .print-btn-container { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container" style="display:flex;justify-content:flex-end;margin-bottom:20px;max-width:650px;margin:auto;">
          <button onclick="window.print()" style="padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:inherit;">🖨️ Print Salary Slip</button>
        </div>
        <div class="container">
          <div class="header">
            <div>
              <div class="company-name">${settings.companyName}</div>
              <div class="company-info">GSTIN: ${settings.gstin || '—'} · Address: ${settings.address || '—'}, ${settings.city || ''}</div>
            </div>
            <div style="text-align:right; font-size:12px;">
              <strong>Slip Date:</strong> ${dateStr}
            </div>
          </div>
          
          <div class="slip-title">Salary Pay Slip (${pay.month})</div>

          <div class="meta-grid">
            <div class="meta-item"><span>Employee Name:</span><strong>${emp.name}</strong></div>
            <div class="meta-item"><span>Designation:</span><strong>${emp.designation}</strong></div>
            <div class="meta-item"><span>Joining Date:</span><strong>${emp.joiningDate}</strong></div>
            <div class="meta-item"><span>Slip Period:</span><strong>${pay.month}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings Details</th>
                <th style="text-align:right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Core Base Monthly Salary</td>
                <td class="right">₹${fmt(pay.baseSalary)}</td>
              </tr>
              <tr>
                <td>Logged Attendance Days (Present)</td>
                <td class="right">${pay.daysPresent} Days</td>
              </tr>
              <tr>
                <td><strong>Gross Pro-Rata Earnings</strong></td>
                <td class="right" style="font-weight:700;">₹${fmt(pay.grossSalary)}</td>
              </tr>
              <thead>
                <tr>
                  <th>Deductions / Advances</th>
                  <th style="text-align:right;">Amount (₹)</th>
                </tr>
              </thead>
              <tr>
                <td>Mid-month Salary Advance Deductions</td>
                <td class="right" style="color:red;">-₹${fmt(pay.advancesDeducted)}</td>
              </tr>
              <tr class="total">
                <td>NET TAKE-HOME PAYOUT (${pay.paymentMode})</td>
                <td class="right" style="color:#10b981;">₹${fmt(pay.netPaid)}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">Employee Signature</div>
            <div class="sig-box">Authorized Seal & Signature</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function openDocsModal(employeeId) {
    const emp = DB.getEmployees().find(e => e.id === employeeId);
    if (!emp) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'manage-docs-modal';

    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">📁 Manage Documents — ${emp.name}</h2>
          <button class="modal-close" onclick="EmployeesPage.closeModal('manage-docs-modal')">✕</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:20px;">
          <p style="color:var(--text-secondary); margin-bottom:8px;">Upload and store official identity cards and tax registration copies (PNG or JPG under 1MB as Base64 strings).</p>
          
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px;">
            
            <!-- Aadhaar Front -->
            <div class="card" style="padding:14px; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
              <div style="font-weight:700; font-size:13px; color:var(--text-primary); text-transform:uppercase;">🪪 Aadhaar Front</div>
              <div class="image-upload-area" id="aadhaar-front-upload-area" style="height:120px; font-size:12px; padding:10px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; border:2px dashed var(--border); border-radius:var(--radius-md);">
                <input type="file" id="aadhaar-front-file" accept="image/*" onchange="EmployeesPage.onDocChange(event, '${emp.id}', 'aadhaarFront')" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index:2;">
                <div id="aadhaar-front-preview" style="text-align:center; z-index:1;">
                  ${emp.aadhaarFront
                    ? `<img src="${emp.aadhaarFront}" style="max-width:100%; max-height:80px; object-fit:contain; border-radius:4px;"><div style="font-size:9px; color:var(--success); margin-top:4px; font-weight:700;">✓ Uploaded</div>`
                    : `<div style="font-size:24px;">🪪</div><div class="upload-text" style="font-size:11px; margin-top:4px;">Upload Front</div>`
                  }
                </div>
              </div>
              ${emp.aadhaarFront
                ? `<div style="display:flex; gap:6px; margin-top:4px;">
                    <button class="btn btn-secondary btn-sm flex-1" style="font-size:11px; padding:4px;" onclick="EmployeesPage.viewDoc('${emp.id}', 'aadhaarFront')">👁️ View</button>
                    <button class="btn btn-danger btn-sm" style="font-size:11px; padding:4px 8px; background:rgba(239,68,68,0.15);" onclick="EmployeesPage.clearDoc('${emp.id}', 'aadhaarFront')">🗑️</button>
                   </div>`
                : ''
              }
            </div>

            <!-- Aadhaar Back -->
            <div class="card" style="padding:14px; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
              <div style="font-weight:700; font-size:13px; color:var(--text-primary); text-transform:uppercase;">🪪 Aadhaar Back</div>
              <div class="image-upload-area" id="aadhaar-back-upload-area" style="height:120px; font-size:12px; padding:10px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; border:2px dashed var(--border); border-radius:var(--radius-md);">
                <input type="file" id="aadhaar-back-file" accept="image/*" onchange="EmployeesPage.onDocChange(event, '${emp.id}', 'aadhaarBack')" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index:2;">
                <div id="aadhaar-back-preview" style="text-align:center; z-index:1;">
                  ${emp.aadhaarBack
                    ? `<img src="${emp.aadhaarBack}" style="max-width:100%; max-height:80px; object-fit:contain; border-radius:4px;"><div style="font-size:9px; color:var(--success); margin-top:4px; font-weight:700;">✓ Uploaded</div>`
                    : `<div style="font-size:24px;">🪪</div><div class="upload-text" style="font-size:11px; margin-top:4px;">Upload Back</div>`
                  }
                </div>
              </div>
              ${emp.aadhaarBack
                ? `<div style="display:flex; gap:6px; margin-top:4px;">
                    <button class="btn btn-secondary btn-sm flex-1" style="font-size:11px; padding:4px;" onclick="EmployeesPage.viewDoc('${emp.id}', 'aadhaarBack')">👁️ View</button>
                    <button class="btn btn-danger btn-sm" style="font-size:11px; padding:4px 8px; background:rgba(239,68,68,0.15);" onclick="EmployeesPage.clearDoc('${emp.id}', 'aadhaarBack')">🗑️</button>
                   </div>`
                : ''
              }
            </div>

            <!-- PAN Card -->
            <div class="card" style="padding:14px; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
              <div style="font-weight:700; font-size:13px; color:var(--text-primary); text-transform:uppercase;">💳 PAN Card</div>
              <div class="image-upload-area" id="pan-card-upload-area" style="height:120px; font-size:12px; padding:10px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; border:2px dashed var(--border); border-radius:var(--radius-md);">
                <input type="file" id="pan-card-file" accept="image/*" onchange="EmployeesPage.onDocChange(event, '${emp.id}', 'panCard')" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index:2;">
                <div id="pan-card-preview" style="text-align:center; z-index:1;">
                  ${emp.panCard
                    ? `<img src="${emp.panCard}" style="max-width:100%; max-height:80px; object-fit:contain; border-radius:4px;"><div style="font-size:9px; color:var(--success); margin-top:4px; font-weight:700;">✓ Uploaded</div>`
                    : `<div style="font-size:24px;">💳</div><div class="upload-text" style="font-size:11px; margin-top:4px;">Upload PAN</div>`
                  }
                </div>
              </div>
              ${emp.panCard
                ? `<div style="display:flex; gap:6px; margin-top:4px;">
                    <button class="btn btn-secondary btn-sm flex-1" style="font-size:11px; padding:4px;" onclick="EmployeesPage.viewDoc('${emp.id}', 'panCard')">👁️ View</button>
                    <button class="btn btn-danger btn-sm" style="font-size:11px; padding:4px 8px; background:rgba(239,68,68,0.15);" onclick="EmployeesPage.clearDoc('${emp.id}', 'panCard')">🗑️</button>
                   </div>`
                : ''
              }
            </div>

          </div>
          
          <div class="divider"></div>
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="EmployeesPage.closeModal('manage-docs-modal')">Done</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('manage-docs-modal'); });
  }

  function onDocChange(e, employeeId, docType) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      App.showToast('File size must be under 1MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result;
      // Update employee record
      const updates = {};
      updates[docType] = base64;
      DB.updateEmployee(employeeId, updates);
      
      App.showToast('Document uploaded successfully!', 'success');
      
      // Re-render the modal to show preview
      closeModal('manage-docs-modal');
      openDocsModal(employeeId);
      render(); // Update registry as well
    };
    reader.readAsDataURL(file);
  }

  function clearDoc(employeeId, docType) {
    if (!confirm('Remove this document?')) return;
    const updates = {};
    updates[docType] = '';
    DB.updateEmployee(employeeId, updates);
    
    App.showToast('Document removed.', 'warning');
    
    // Re-render the modal to show empty area
    closeModal('manage-docs-modal');
    openDocsModal(employeeId);
    render();
  }

  function viewDoc(employeeId, docType) {
    const emp = DB.getEmployees().find(e => e.id === employeeId);
    if (!emp || !emp[docType]) return;
    
    // Open base64 file in a new tab safely
    const win = window.open();
    if (!win) {
      App.showToast('Popup blocked! Please allow popups to view files.', 'error');
      return;
    }
    
    // Build a clean, styled HTML preview page in the new tab
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${emp.name} — Document View</title>
        <style>
          body { margin: 0; background: #0b0c10; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; color: #fff; }
          .wrap { text-align: center; max-width: 90%; }
          img { max-width: 100%; max-height: 80vh; border-radius: 8px; border: 1px solid #333; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
          iframe { width: 80vw; height: 80vh; border: none; border-radius: 8px; background: white; }
          h3 { margin-bottom: 20px; font-weight: 400; color: #6366f1; letter-spacing: 0.5px; }
          .btn { padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 4px; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h3>Employee Document: ${docType === 'panCard' ? 'PAN Card' : docType === 'aadhaarFront' ? 'Aadhaar Card (Front)' : 'Aadhaar Card (Back)'} — ${emp.name}</h3>
          ${emp[docType].startsWith('data:application/pdf')
            ? `<iframe src="${emp[docType]}"></iframe>`
            : `<img src="${emp[docType]}" alt="Document preview">`
          }
          <div>
            <a class="btn" href="${emp[docType]}" download="${emp.name.replace(/\s+/g, '_')}_${docType}">💾 Download Document</a>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  }

  return {
    render,
    switchTab,
    applyFilters,
    changeAttendanceDate,
    changePayrollMonth,
    logAttendance,
    toggleEmployeeStatus,
    deleteEmployee,
    deleteSalaryAdvance,
    deleteSalaryPayment,
    openAddEmployeeModal,
    openRecordAdvanceModal,
    openProcessPayrollModal,
    closeModal,
    recalculatePayrollSlip,
    saveNewEmployee,
    saveSalaryAdvance,
    saveSalarySlip,
    printSalarySlip,
    openDocsModal,
    onDocChange,
    clearDoc,
    viewDoc
  };
})();

```

## File: `.\js\financials.js`
```javascript
// ============================================================
// financials.js — Corporate Financial Reporting & Balance Sheet Module
// ============================================================

const Financials = (() => {
  let currentTab = 'pl'; // 'pl', 'bs', 'expenses'
  let expenseSearchQuery = '';
  let expenseCategoryFilter = '';

  function render() {
    const invoices = DB.getInvoices();
    const products = DB.getProducts(); // finished goods only
    const materials = DB.getMaterials(); // raw materials only
    const materialLogs = DB.getMaterialLogs();
    const stockLogs = DB.getStockLogs(); // finished goods stock logs
    const bills = DB.getMaterialBills();
    const expenses = DB.getExpenses();

    // 1. Profit & Loss Calculations
    const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal || 0) - Number(inv.balanceDue || 0)), 0);
    const totalReceivables = invoices.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);

    // Material Purchases Costs (Grand totals of all material bills)
    const totalMaterialPurchased = bills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

    // Spillage / Damage Write-offs
    let spillageLoss = 0;
    materialLogs.forEach(log => {
      if (log.type === 'DAMAGE') {
        const mat = DB.getMaterial(log.materialId);
        if (mat) {
          spillageLoss += Math.abs(Number(log.qty || 0)) * (Number(mat.purchasePrice) || 0);
        }
      }
    });
    stockLogs.forEach(log => {
      if (log.type === 'DAMAGE') {
        const prod = DB.getProduct(log.productId);
        if (prod) {
          spillageLoss += Math.abs(Number(log.qty || 0)) * (Number(prod.purchasePrice) || 0);
        }
      }
    });

    // General Business Expenses
    const totalGeneralExpenses = expenses.reduce((sum, e) => {
      const amt = Number(e.amount || 0);
      if (e.type === 'Debit') return sum + amt;
      if (e.type === 'Credit') return sum - amt;
      return sum;
    }, 0);

    // Net Operating Profit
    const netProfit = totalSales - totalMaterialPurchased - totalGeneralExpenses - spillageLoss;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // 2. Balance Sheet Calculations
    // Cash Flow formula: Collections - Paid Material Bills - Paid Expenses
    const paidMaterialBills = bills.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const liquidCash = totalCollected - paidMaterialBills - totalGeneralExpenses;

    const receivables = totalReceivables;
    const finishedStockValue = products.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.purchasePrice || 0)), 0);
    const rawMaterialStockValue = materials.reduce((sum, m) => sum + (Number(m.stock || 0) * Number(m.purchasePrice || 0)), 0);

    const totalAssets = liquidCash + receivables + finishedStockValue + rawMaterialStockValue;

    // Equities & Liabilities
    const retainedEarnings = netProfit;
    const accountsPayable = bills.filter(b => b.paymentStatus === 'Unpaid').reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const investedCapital = totalAssets - retainedEarnings - accountsPayable; // Double-entry balance equation
    const totalEquities = retainedEarnings + accountsPayable + investedCapital;

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // UI Rendering
    let mainContentHtml = '';

    if (currentTab === 'pl') {
      mainContentHtml = `
        <div class="card" style="padding:0; overflow:hidden;">
          <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">📖 Operating Income Statement (Profit & Loss)</h3>
            <span class="badge ${netProfit >= 0 ? 'badge-success' : 'badge-danger'}">${netProfit >= 0 ? 'PROFITABLE' : 'NET LOSS'}</span>
          </div>
          <div class="table-wrapper" style="border:none;">
            <table class="invoice-items-table">
              <tbody>
                <tr style="background: rgba(255,255,255,0.01);">
                  <td><strong>1. Revenue from Operations (Sales)</strong></td>
                  <td class="td-mono text-right font-bold" style="color: var(--success); font-size:15px;">₹${fmt(totalSales)}</td>
                </tr>
                <tr>
                  <td style="padding-left:32px; color:var(--text-secondary); font-size:13px;">Gross Invoiced Value (Tax Inclusive)</td>
                  <td class="td-mono text-right" style="color:var(--text-secondary);">₹${fmt(totalSales)}</td>
                </tr>
                
                <tr style="background: rgba(255,255,255,0.01);">
                  <td><strong>2. Raw Materials Cost (Direct Purchases)</strong></td>
                  <td class="td-mono text-right font-bold" style="color: var(--danger); font-size:15px;">-₹${fmt(totalMaterialPurchased)}</td>
                </tr>
                <tr>
                  <td style="padding-left:32px; color:var(--text-secondary); font-size:13px;">Supplier Bills (GST Inclusive)</td>
                  <td class="td-mono text-right" style="color:var(--text-secondary);">-₹${fmt(totalMaterialPurchased)}</td>
                </tr>

                <tr style="background: rgba(255,255,255,0.01);">
                  <td><strong>3. General Operating & Cash Expenses</strong></td>
                  <td class="td-mono text-right font-bold" style="color: var(--danger); font-size:15px;">-₹${fmt(totalGeneralExpenses)}</td>
                </tr>
                <tr>
                  <td style="padding-left:32px; color:var(--text-secondary); font-size:13px;">Salaries, Utilities, Rent, Logistics, etc.</td>
                  <td class="td-mono text-right" style="color:var(--text-secondary);">-₹${fmt(totalGeneralExpenses)}</td>
                </tr>

                <tr style="background: rgba(255,255,255,0.01);">
                  <td><strong>4. Inventory Waste & Defect Write-offs</strong></td>
                  <td class="td-mono text-right font-bold" style="color: var(--danger); font-size:15px;">-₹${fmt(spillageLoss)}</td>
                </tr>
                <tr>
                  <td style="padding-left:32px; color:var(--text-secondary); font-size:13px;">Damage, Spillage & Expired Materials</td>
                  <td class="td-mono text-right" style="color:var(--text-secondary);">-₹${fmt(spillageLoss)}</td>
                </tr>

                <tr style="background: rgba(99,102,241,0.1); font-weight:700;">
                  <td style="font-size: 15px; padding-top:16px; padding-bottom:16px;"><strong>Net Operating Profit / Loss</strong></td>
                  <td class="td-mono text-right" style="font-size: 17px; color: ${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}; padding-top:16px; padding-bottom:16px;">₹${fmt(netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (currentTab === 'bs') {
      mainContentHtml = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
          <!-- Left Column: Assets -->
          <div class="card" style="padding:0; overflow:hidden;">
            <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
              <h3 class="card-title">📦 Assets (What Sharma Industries Owns)</h3>
            </div>
            <div class="table-wrapper" style="border:none;">
              <table class="invoice-items-table">
                <thead>
                  <tr style="background:rgba(255,255,255,0.01);">
                    <th style="padding:8px 16px;">Asset Classification</th>
                    <th style="padding:8px 16px;" class="text-right">Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>💼 Cash & Bank Balance (Liquid)</td>
                    <td class="td-mono text-right font-bold text-accent">₹${fmt(liquidCash)}</td>
                  </tr>
                  <tr>
                    <td>🧾 Trade Receivables (Outstanding customer balances)</td>
                    <td class="td-mono text-right font-bold">₹${fmt(receivables)}</td>
                  </tr>
                  <tr>
                    <td>📦 Finished Products Stock Value</td>
                    <td class="td-mono text-right font-bold">₹${fmt(finishedStockValue)}</td>
                  </tr>
                  <tr>
                    <td>🧪 Raw Materials & Chemicals Stock Value</td>
                    <td class="td-mono text-right font-bold">₹${fmt(rawMaterialStockValue)}</td>
                  </tr>
                  <tr style="background: rgba(99,102,241,0.08); font-weight:700; border-top:1px solid var(--border);">
                    <td style="font-size: 14px; padding-top:14px; padding-bottom:14px;"><strong>TOTAL ASSETS VALUATION</strong></td>
                    <td class="td-mono text-right text-accent" style="font-size: 15px; padding-top:14px; padding-bottom:14px;"><strong>₹${fmt(totalAssets)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column: Equities & Liabilities -->
          <div class="card" style="padding:0; overflow:hidden;">
            <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
              <h3 class="card-title">⚖️ Capital, Equity & Liabilities</h3>
              <span class="badge badge-success">⚖️ Reconciled</span>
            </div>
            <div class="table-wrapper" style="border:none;">
              <table class="invoice-items-table">
                <thead>
                  <tr style="background:rgba(255,255,255,0.01);">
                    <th style="padding:8px 16px;">Source of Funds</th>
                    <th style="padding:8px 16px;" class="text-right">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🏢 Invested Capital & Reserves</td>
                    <td class="td-mono text-right font-bold">₹${fmt(investedCapital)}</td>
                  </tr>
                  <tr>
                    <td>📈 Retained Earnings (Current Year P&L)</td>
                    <td class="td-mono text-right font-bold" style="color: ${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">₹${fmt(retainedEarnings)}</td>
                  </tr>
                  <tr>
                    <td>🧾 Accounts Payable (Supplier Debt)</td>
                    <td class="td-mono text-right font-bold">₹${fmt(accountsPayable)}</td>
                  </tr>
                  <tr style="background: rgba(6,182,212,0.08); font-weight:700; border-top:1px solid var(--border);">
                    <td style="font-size: 14px; padding-top:14px; padding-bottom:14px;"><strong>TOTAL CAPITAL & LIABILITIES</strong></td>
                    <td class="td-mono text-right" style="font-size: 15px; color: var(--accent-light); padding-top:14px; padding-bottom:14px;"><strong>₹${fmt(totalEquities)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (currentTab === 'expenses') {
      mainContentHtml = `
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="expense-search" placeholder="Search expense description..." value="${expenseSearchQuery}" oninput="Financials.applyFilters()">
          </div>
          <select class="filter-select" id="expense-filter-category" onchange="Financials.applyFilters()">
            <option value="">All Categories</option>
            <option value="Rent" ${expenseCategoryFilter === 'Rent' ? 'selected' : ''}>Rent</option>
            <option value="Salaries" ${expenseCategoryFilter === 'Salaries' ? 'selected' : ''}>Salaries</option>
            <option value="Utilities" ${expenseCategoryFilter === 'Utilities' ? 'selected' : ''}>Utilities</option>
            <option value="Logistics" ${expenseCategoryFilter === 'Logistics' ? 'selected' : ''}>Logistics & Freight</option>
            <option value="Marketing" ${expenseCategoryFilter === 'Marketing' ? 'selected' : ''}>Marketing</option>
            <option value="Repairs" ${expenseCategoryFilter === 'Repairs' ? 'selected' : ''}>Repairs & Maintenance</option>
            <option value="Others" ${expenseCategoryFilter === 'Others' ? 'selected' : ''}>Others</option>
          </select>
        </div>

        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payment Mode</th>
                  <th>Type</th>
                  <th class="text-right">Amount</th>
                  <th style="width:60px;"></th>
                </tr>
              </thead>
              <tbody id="expense-tbody">
                ${renderExpenseRows(expenses)}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>📈 Corporate Financial Statements</h1>
          <p>Real-time Income Statement (P&L), balanced Balance Sheet, and business expenses journal</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" onclick="Financials.printReport()">
            🖨️ Print Financial Statement
          </button>
          ${currentTab === 'expenses' ? `
            <button class="btn btn-primary" onclick="Financials.openRecordExpenseModal()">
              ➕ Record Business Expense
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Summary Row -->
      <div class="stat-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-icon purple">📊</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;">₹${fmt(totalSales)}</div>
            <div class="stat-label">Gross Revenue (Sales)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">💸</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;color:var(--danger);">₹${fmt(totalGeneralExpenses)}</div>
            <div class="stat-label">Operating Expenses</div>
          </div>
        </div>
        <div class="stat-card ${netProfit >= 0 ? 'success' : 'danger'}" style="border-left: 4px solid ${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">
          <div class="stat-icon">${netProfit >= 0 ? '📈' : '📉'}</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;color:${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:bold;">₹${fmt(netProfit)}</div>
            <div class="stat-label">Net Operating ${netProfit >= 0 ? 'Profit' : 'Loss'}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan">💼</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;color:${liquidCash >= 0 ? 'var(--accent-light)' : 'var(--danger)'};">₹${fmt(liquidCash)}</div>
            <div class="stat-label">Cash & Bank Balance</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn ${currentTab === 'pl' ? 'active' : ''}" id="fin-tab-btn-pl" onclick="Financials.switchTab('pl')">📖 Operating Profit & Loss</button>
        <button class="tab-btn ${currentTab === 'bs' ? 'active' : ''}" id="fin-tab-btn-bs" onclick="Financials.switchTab('bs')">⚖️ Balanced Balance Sheet</button>
        <button class="tab-btn ${currentTab === 'expenses' ? 'active' : ''}" id="fin-tab-btn-expenses" onclick="Financials.switchTab('expenses')">💸 Business Expenses Journal</button>
      </div>

      <!-- Tab Content Area -->
      ${mainContentHtml}
    `;
  }

  function renderExpenseRows(expenses) {
    let list = [...expenses];
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (expenseSearchQuery) {
      const q = expenseSearchQuery.toLowerCase();
      list = list.filter(e => 
        (e.description || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      );
    }

    if (expenseCategoryFilter) {
      list = list.filter(e => e.category === expenseCategoryFilter);
    }

    if (!list.length) {
      return `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-icon">💸</div>
        <h3>No expenses recorded</h3>
        <p>Record a new cash/bank expense to log operational costs</p>
      </div></td></tr>`;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return list.map(e => {
      const typeBadge = e.type === 'Debit' ? 'danger' : 'success';
      const typeLabel = e.type === 'Debit' ? 'DEBIT' : 'CREDIT';
      const dateStr = new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
      
      return `
        <tr>
          <td class="td-mono">${dateStr}</td>
          <td><span class="badge badge-muted" style="padding:2px 6px;">${e.category}</span></td>
          <td><strong style="color:var(--text-primary); font-size: 13px;">${e.description || '—'}</strong></td>
          <td><span style="font-size:12px; color:var(--text-secondary);">💳 ${e.paymentMode || 'Bank'}</span></td>
          <td><span class="badge badge-${typeBadge}" style="padding: 2px 6px; font-weight: 700; font-size:10px;">${typeLabel}</span></td>
          <td class="td-mono text-right font-bold" style="color: ${e.type === 'Debit' ? 'var(--danger)' : 'var(--success)'}; font-size:14px;">
            ${e.type === 'Debit' ? '-' : '+'}₹${fmt(e.amount)}
          </td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="Financials.deleteExpense('${e.id}')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.15);" title="Delete Expense">🗑️</button>
          </td>
        </tr>`;
    }).join('');
  }

  function switchTab(tab) {
    currentTab = tab;
    render();
  }

  function applyFilters() {
    if (currentTab === 'expenses') {
      expenseSearchQuery = document.getElementById('expense-search')?.value || '';
      expenseCategoryFilter = document.getElementById('expense-filter-category')?.value || '';
      const tbody = document.getElementById('expense-tbody');
      if (tbody) {
        tbody.innerHTML = renderExpenseRows(DB.getExpenses());
      }
    }
  }

  function openRecordExpenseModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'record-expense-modal';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">💸 Record Business Expense</h2>
          <button class="modal-close" onclick="Financials.closeRecordExpenseModal()">✕</button>
        </div>
        <form onsubmit="Financials.saveNewExpense(event)">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Expense Category <span class="required">*</span></label>
                <select class="form-control" name="category" required>
                  <option value="Rent">Rent</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Utilities">Utilities (Electricity, Power)</option>
                  <option value="Logistics">Logistics & Freight</option>
                  <option value="Marketing">Marketing & Advertising</option>
                  <option value="Repairs">Repairs & Maintenance</option>
                  <option value="Others" selected>Others</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date <span class="required">*</span></label>
                <input class="form-control" name="date" type="date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">Amount (₹) <span class="required">*</span></label>
                <input class="form-control" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Type <span class="required">*</span></label>
                <select class="form-control" name="type" required>
                  <option value="Debit" selected>Debit (Expense)</option>
                  <option value="Credit">Credit (Refund / Reversal)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Payment Mode <span class="required">*</span></label>
                <select class="form-control" name="paymentMode" required>
                  <option value="Bank" selected>Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Description / Particulars <span class="required">*</span></label>
              <input class="form-control" name="description" placeholder="e.g. Electricity bill for production machinery" required>
            </div>

            <div class="divider"></div>
            <div class="flex gap-3" style="justify-content:flex-end;">
              <button type="button" class="btn btn-secondary" onclick="Financials.closeRecordExpenseModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">💾 Save Expense</button>
            </div>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Financials.closeRecordExpenseModal(); });
  }

  function closeRecordExpenseModal() {
    document.getElementById('record-expense-modal')?.remove();
  }

  function saveNewExpense(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const expense = {
      category: fd.get('category'),
      date: fd.get('date'),
      amount: Number(fd.get('amount')) || 0,
      type: fd.get('type'),
      paymentMode: fd.get('paymentMode'),
      description: fd.get('description'),
    };

    DB.addExpense(expense);
    App.showToast('Business expense recorded successfully!', 'success');
    closeRecordExpenseModal();
    render();
  }

  function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense record? This will alter corporate financial books.')) return;
    DB.deleteExpense(id);
    App.showToast('Expense record deleted.', 'warning');
    render();
  }

  function printReport() {
    const invoices = DB.getInvoices();
    const products = DB.getProducts();
    const materials = DB.getMaterials();
    const materialLogs = DB.getMaterialLogs();
    const stockLogs = DB.getStockLogs();
    const bills = DB.getMaterialBills();
    const expenses = DB.getExpenses();
    const settings = DB.getSettings();

    const dateStr = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

    // Calculations
    const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal || 0) - Number(inv.balanceDue || 0)), 0);
    const totalReceivables = invoices.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);

    const totalMaterialPurchased = bills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

    let spillageLoss = 0;
    materialLogs.forEach(log => {
      if (log.type === 'DAMAGE') {
        const mat = DB.getMaterial(log.materialId);
        if (mat) spillageLoss += Math.abs(Number(log.qty || 0)) * (Number(mat.purchasePrice) || 0);
      }
    });
    stockLogs.forEach(log => {
      if (log.type === 'DAMAGE') {
        const prod = DB.getProduct(log.productId);
        if (prod) spillageLoss += Math.abs(Number(log.qty || 0)) * (Number(prod.purchasePrice) || 0);
      }
    });

    const totalGeneralExpenses = expenses.reduce((sum, e) => {
      const amt = Number(e.amount || 0);
      if (e.type === 'Debit') return sum + amt;
      if (e.type === 'Credit') return sum - amt;
      return sum;
    }, 0);

    const netProfit = totalSales - totalMaterialPurchased - totalGeneralExpenses - spillageLoss;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    const paidMaterialBills = bills.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const liquidCash = totalCollected - paidMaterialBills - totalGeneralExpenses;

    const receivables = totalReceivables;
    const finishedStockValue = products.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.purchasePrice || 0)), 0);
    const rawMaterialStockValue = materials.reduce((sum, m) => sum + (Number(m.stock || 0) * Number(m.purchasePrice || 0)), 0);

    const totalAssets = liquidCash + receivables + finishedStockValue + rawMaterialStockValue;
    const retainedEarnings = netProfit;
    const accountsPayable = bills.filter(b => b.paymentStatus === 'Unpaid').reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const investedCapital = totalAssets - retainedEarnings - accountsPayable;
    const totalEquities = retainedEarnings + accountsPayable + investedCapital;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Financial Statements Report - Sharma Industries</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #666; margin-top: 5px; }
          .report-meta { text-align: right; font-size: 13px; color: #666; }
          
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .section-title { font-size: 15px; font-weight: bold; border-bottom: 2px solid #666; padding-bottom: 6px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          tr.total td { font-weight: bold; border-top: 2px solid #666; border-bottom: 2px double #666; background: #fafafa; }
          td.right { text-align: right; font-family: monospace; }
          
          .footer { text-align: center; border-top: 1px solid #ddd; padding-top: 20px; font-size: 11px; color: #888; margin-top: 60px; }
          
          @media print {
            body { margin: 20px; }
            .print-btn-container { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container" style="display:flex;justify-content:flex-end;margin-bottom:20px;">
          <button onclick="window.print()" style="padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:inherit;">🖨️ Print Financial Statement</button>
        </div>
        <div class="header">
          <div>
            <div class="company-name">${settings.companyName}</div>
            <div class="report-title">Financial Statements Report (P&L and Balance Sheet)</div>
            <div style="font-size:12px;color:#666;margin-top:5px;">GSTIN: ${settings.gstin || '—'} · Address: ${settings.address || '—'}, ${settings.city || ''}</div>
          </div>
          <div class="report-meta">
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Audit Period:</strong> FY 2026-2027</div>
          </div>
        </div>
        
        <div class="grid">
          <!-- Income Statement -->
          <div>
            <div class="section-title">Operating Income Statement (P&L)</div>
            <table>
              <tbody>
                <tr>
                  <td><strong>Operating Revenue (Sales)</strong></td>
                  <td class="right" style="color: #10b981; font-weight: bold;">₹${totalSales.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding-left:20px; color:#666;">Raw Materials Purchased</td>
                  <td class="right" style="color:#ef4444;">-₹${totalMaterialPurchased.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding-left:20px; color:#666;">General Business Expenses</td>
                  <td class="right" style="color:#ef4444;">-₹${totalGeneralExpenses.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding-left:20px; color:#666;">Inventory Waste / Defect Write-offs</td>
                  <td class="right" style="color:#ef4444;">-₹${spillageLoss.toFixed(2)}</td>
                </tr>
                <tr class="total">
                  <td>NET OPERATING PROFIT / LOSS</td>
                  <td class="right" style="color: ${netProfit >= 0 ? '#10b981' : '#ef4444'}">₹${netProfit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size: 11px; color:#666;">* Net Operating Profit Margin: <strong>${profitMargin.toFixed(2)}%</strong></div>
          </div>

          <!-- Balance Sheet -->
          <div>
            <div class="section-title">Physical Assets & Capital (Balance Sheet)</div>
            <table>
              <thead>
                <tr style="background:#f4f4f5; font-weight:bold;">
                  <td style="padding:6px 10px;">Assets (What We Own)</td>
                  <td style="padding:6px 10px; text-align:right;">Valuation</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cash & Bank Balance (Liquid)</td>
                  <td class="right">₹${liquidCash.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Accounts Receivable (Outstanding)</td>
                  <td class="right">₹${receivables.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Finished Goods Stock Assets</td>
                  <td class="right">₹${finishedStockValue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Raw Chemicals & Materials Stock</td>
                  <td class="right">₹${rawMaterialStockValue.toFixed(2)}</td>
                </tr>
                <tr class="total">
                  <td>TOTAL PHYSICAL ASSETS</td>
                  <td class="right">₹${totalAssets.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <table>
              <thead>
                <tr style="background:#f4f4f5; font-weight:bold;">
                  <td style="padding:6px 10px;">Equities & Liabilities (What We Owe)</td>
                  <td style="padding:6px 10px; text-align:right;">Allocation</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Invested Capital & Reserves</td>
                  <td class="right">₹${investedCapital.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Retained Earnings (Accumulated Profits)</td>
                  <td class="right">₹${retainedEarnings.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Accounts Payable (Supplier Debt)</td>
                  <td class="right">₹${accountsPayable.toFixed(2)}</td>
                </tr>
                <tr class="total">
                  <td>TOTAL LIABILITIES & EQUITY</td>
                  <td class="right">₹${totalEquities.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <strong>Sharma Industries Financial Reports Group</strong><br>
          This is an official physical audit balance sheet assessment. Prepared to conform with local accounting standards and balanced using double-entry methodology.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return { 
    render, 
    switchTab, 
    applyFilters, 
    openRecordExpenseModal, 
    closeRecordExpenseModal, 
    saveNewExpense, 
    deleteExpense, 
    printReport 
  };
})();

```

## File: `.\js\inventory.js`
```javascript
// ============================================================
// inventory.js — Dedicated Inventory Management for Chemicals & Raw Materials
// ============================================================

const Inventory = (() => {
  let currentTab = 'inventory'; // 'inventory', 'journal', or 'bills'
  let searchQuery = '';
  let categoryFilter = '';
  let statusFilter = '';
  
  let journalSearchQuery = '';
  let journalTypeFilter = '';
  
  let billItems = []; // holds temporary rows in supplier bill modal

  const RAW_MATERIAL_CATEGORIES = [
    'Raw Materials - Pigments',
    'Raw Materials - Binders',
    'Raw Materials - Fillers',
    'Solvents',
    'Chemicals',
    'Packaging',
    'Other Raw Materials'
  ];

  function render() {
    const products = DB.getMaterials();
    const logs = DB.getMaterialLogs();
    const bills = DB.getMaterialBills();
    
    // Calculations
    const totalItems = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalAssetVal = products.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.purchasePrice) || 0)), 0);
    const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= (Number(p.minStock) || 10)).length;
    const outOfStock = products.filter(p => Number(p.stock) === 0).length;
    
    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>🧪 Raw Materials & Chemicals Inventory</h1>
          <p>Real-time valuation, alerts, and transaction journals for manufacturing inputs</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" onclick="Inventory.printReport()">
            🖨️ Inventory Report
          </button>
          <button class="btn btn-primary" onclick="Inventory.openAddInventoryModal()">
            ➕ Add Raw Material / Chemical
          </button>
        </div>
      </div>
      
      <!-- Stats Row -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon green">💰</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;">₹${fmt(totalAssetVal)}</div>
            <div class="stat-label">Total Material Asset Value</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan">📦</div>
          <div class="stat-info">
            <div class="stat-value">${totalItems.toLocaleString('en-IN')}</div>
            <div class="stat-label">Total Volume in Stock</div>
          </div>
        </div>
        <div class="stat-card" style="${lowStock > 0 ? 'border-color:rgba(245,158,11,0.2);' : ''}">
          <div class="stat-icon orange">⚠️</div>
          <div class="stat-info">
            <div class="stat-value ${lowStock > 0 ? 'text-warning' : ''}">${lowStock}</div>
            <div class="stat-label">Low Stock Materials</div>
          </div>
        </div>
        <div class="stat-card" style="${outOfStock > 0 ? 'border-color:rgba(239,68,68,0.2);' : ''}">
          <div class="stat-icon red">❌</div>
          <div class="stat-info">
            <div class="stat-value ${outOfStock > 0 ? 'text-danger' : ''}">${outOfStock}</div>
            <div class="stat-label">Out of Stock</div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn ${currentTab === 'inventory' ? 'active' : ''}" id="inv-tab-btn-inventory" onclick="Inventory.switchTab('inventory')">📋 Stock Valuation & Control</button>
        <button class="tab-btn ${currentTab === 'journal' ? 'active' : ''}" id="inv-tab-btn-journal" onclick="Inventory.switchTab('journal')">📜 Materials Ledger Journal</button>
        <button class="tab-btn ${currentTab === 'bills' ? 'active' : ''}" id="inv-tab-btn-bills" onclick="Inventory.switchTab('bills')">🧾 Supplier Bills (Purchases)</button>
      </div>
      
      <!-- Tab Content: Inventory status -->
      <div id="inv-tab-inventory" class="tab-content ${currentTab === 'inventory' ? 'active' : ''}">
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="inv-search" placeholder="Search chemical, SKU, HSN..." value="${searchQuery}" oninput="Inventory.applyFilters()">
          </div>
          <select class="filter-select" id="inv-filter-category" onchange="Inventory.applyFilters()">
            <option value="">All Categories</option>
            ${RAW_MATERIAL_CATEGORIES.map(c => `<option value="${c}" ${categoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <select class="filter-select" id="inv-filter-status" onchange="Inventory.applyFilters()">
            <option value="">All Stock Status</option>
            <option value="ok" ${statusFilter === 'ok' ? 'selected' : ''}>In Stock</option>
            <option value="low" ${statusFilter === 'low' ? 'selected' : ''}>Low Stock</option>
            <option value="out" ${statusFilter === 'out' ? 'selected' : ''}>Out of Stock</option>
          </select>
        </div>
        
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;">
            <table>
              <thead>
                <tr>
                  <th>Material / Chemical</th>
                  <th>Category</th>
                  <th>HSN</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Current Stock</th>
                  <th>Status</th>
                  <th class="text-right">Valuation (Asset)</th>
                  <th>Quick Adjustment</th>
                </tr>
              </thead>
              <tbody id="inv-inventory-tbody">
                ${renderInventoryRows(products)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Tab Content: Global Journal -->
      <div id="inv-tab-journal" class="tab-content ${currentTab === 'journal' ? 'active' : ''}">
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="inv-journal-search" placeholder="Search material name, reference, SKU..." value="${journalSearchQuery}" oninput="Inventory.applyFilters()">
          </div>
          <select class="filter-select" id="inv-journal-filter-type" onchange="Inventory.applyFilters()">
            <option value="">All Transaction Types</option>
            <option value="INITIAL" ${journalTypeFilter === 'INITIAL' ? 'selected' : ''}>INITIAL ENTRY</option>
            <option value="RESTOCK" ${journalTypeFilter === 'RESTOCK' ? 'selected' : ''}>RESTOCK / PURCHASES</option>
            <option value="DAMAGE" ${journalTypeFilter === 'DAMAGE' ? 'selected' : ''}>DAMAGE / SPILLAGE</option>
            <option value="AUDIT" ${journalTypeFilter === 'AUDIT' ? 'selected' : ''}>AUDIT ADJUSTMENTS</option>
          </select>
        </div>
        
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;max-height:600px;overflow-y:auto;">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Chemical Name</th>
                  <th>Operation</th>
                  <th>Ref # / PO No.</th>
                  <th class="text-right">Qty Adjusted</th>
                  <th class="text-right">Resulting Stock</th>
                  <th>Reason & Notes</th>
                </tr>
              </thead>
              <tbody id="inv-journal-tbody">
                ${renderJournalRows(logs)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab Content: Supplier Bills (Purchases) -->
      <div id="inv-tab-bills" class="tab-content ${currentTab === 'bills' ? 'active' : ''}">
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="bill-search" placeholder="Search supplier name, bill number..." oninput="Inventory.applyFilters()">
          </div>
          <button class="btn btn-primary" onclick="Inventory.openCreateBillModal()" style="margin-left:auto;">
            ➕ Create Supplier Bill
          </button>
        </div>
        
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Supplier Name</th>
                  <th>Items Purchased</th>
                  <th class="text-right">Taxable Subtotal</th>
                  <th class="text-right">Grand Total (GST Inc)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="inv-bills-tbody">
                ${renderBillsRows(bills)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `inv-tab-btn-${tab}`);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `inv-tab-${tab}`);
    });
    applyFilters();
  }

  function renderInventoryRows(products) {
    let list = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.hsnCode || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter);
    }
    if (statusFilter) {
      if (statusFilter === 'ok') list = list.filter(p => Number(p.stock) > (Number(p.minStock) || 10));
      else if (statusFilter === 'low') list = list.filter(p => Number(p.stock) > 0 && Number(p.stock) <= (Number(p.minStock) || 10));
      else if (statusFilter === 'out') list = list.filter(p => Number(p.stock) === 0);
    }

    if (!list.length) {
      return `<tr><td colspan="8"><div class="empty-state">
        <div class="empty-icon">🧪</div>
        <h3>No materials match filters</h3>
        <p>Try resetting search parameters or category filter</p>
      </div></td></tr>`;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return list.map(p => {
      const stock = Number(p.stock) || 0;
      const minStock = Number(p.minStock) || 10;
      const purchasePrice = Number(p.purchasePrice) || 0;
      const assetValue = stock * purchasePrice;
      
      const stockStatus = stock === 0 ? 'critical' : (stock <= minStock ? 'low' : 'ok');
      const stockLabel = stock === 0 ? '❌ Out' : (stockStatus === 'low' ? `⚠️ Low` : `✅ Good`);
      const badgeMap = { critical: 'danger', low: 'warning', ok: 'success' };
      
      return `
        <tr>
          <td>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${p.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">SKU: ${p.sku || '—'} · Loc: ${p.location || 'Default Store'}</div>
          </td>
          <td><span class="badge badge-muted" style="padding:2px 6px;">${p.category || 'General'}</span></td>
          <td class="td-mono">${p.hsnCode || '—'}</td>
          <td class="td-mono text-right">₹${fmt(purchasePrice)}</td>
          <td class="td-mono text-right font-bold" style="font-size:15px;color:${stockStatus==='critical'?'var(--danger)':(stockStatus==='low'?'#f59e0b':'var(--success)')}">${stock} ${p.unit || ''}</td>
          <td><span class="badge badge-${badgeMap[stockStatus]}">${stockLabel}</span></td>
          <td class="td-mono text-right font-bold text-accent">₹${fmt(assetValue)}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-success btn-sm" onclick="Inventory.openAdjustModal('${p.id}', 'add')" style="padding:4px 8px;font-size:11px;">➕ Receive</button>
              <button class="btn btn-danger btn-sm" onclick="Inventory.openAdjustModal('${p.id}', 'sub')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.15);">➖ Reduce</button>
              <button class="btn btn-danger btn-sm" onclick="Inventory.deleteProduct('${p.id}')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.25);" title="Delete Material">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function renderJournalRows(logs) {
    let list = [...logs];
    list.sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00:00')) - new Date(a.date + ' ' + (a.time || '00:00:00')) || b.id.localeCompare(a.id));
    
    if (journalSearchQuery) {
      const q = journalSearchQuery.toLowerCase();
      list = list.filter(log => {
        const mat = DB.getMaterial(log.materialId);
        return (mat && mat.name.toLowerCase().includes(q)) || 
               (mat && mat.sku && mat.sku.toLowerCase().includes(q)) ||
               (log.reference || '').toLowerCase().includes(q) ||
               (log.reason || '').toLowerCase().includes(q);
      });
    }
    
    if (journalTypeFilter) {
      list = list.filter(log => log.type === journalTypeFilter);
    }
    
    if (!list.length) {
      return `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>No chemical ledger logs registered</h3>
        <p>Seed materials or perform quick adjustments to see ledger events</p>
      </div></td></tr>`;
    }

    return list.map(log => {
      const p = DB.getMaterial(log.materialId);
      if (!p) return '';
      
      const badgeMap = { INITIAL: 'purple', RESTOCK: 'success', DAMAGE: 'danger', AUDIT: 'warning' };
      const qtyFmt = log.qty > 0 ? `+${log.qty}` : `${log.qty}`;
      const qtyColor = log.qty > 0 ? 'text-success' : 'text-danger';
      const dateStr = new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
      
      return `
        <tr>
          <td class="td-mono">${dateStr}</td>
          <td>
            <div style="font-weight:700;">${p.name}</div>
            <div style="font-size:11px;color:var(--text-muted);">SKU: ${p.sku || '—'}</div>
          </td>
          <td><span class="badge badge-${badgeMap[log.type] || 'muted'}">${log.type}</span></td>
          <td><strong>${log.reference || '—'}</strong></td>
          <td class="td-mono font-bold ${qtyColor} text-right">${qtyFmt} ${p.unit||''}</td>
          <td class="td-mono font-bold text-accent text-right">${log.resultingStock} ${p.unit||''}</td>
          <td>
            <div style="font-weight:600;font-size:12px;">${log.reason || ''}</div>
            ${log.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">"${log.notes}"</div>` : ''}
          </td>
        </tr>`;
    }).join('');
  }

  function renderBillsRows(bills) {
    let list = [...bills];
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const searchVal = document.getElementById('bill-search')?.value.toLowerCase() || '';
    if (searchVal) {
      list = list.filter(b => 
        b.supplierName.toLowerCase().includes(searchVal) ||
        b.billNo.toLowerCase().includes(searchVal)
      );
    }
    
    if (!list.length) {
      return `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-icon">🧾</div>
        <h3>No supplier bills recorded</h3>
        <p>Record a new purchase invoice / bill to seed stocks</p>
      </div></td></tr>`;
    }
    
    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return list.map(b => {
      const itemSummary = b.items.map(item => `${item.name} (${item.qty} ${DB.getMaterial(item.materialId)?.unit || ''})`).join(', ');
      const statusBadge = b.paymentStatus === 'Paid' ? 'success' : 'warning';
      
      return `
        <tr>
          <td class="td-mono font-bold text-accent">${b.billNo}</td>
          <td class="td-mono">${new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
          <td><strong>${b.supplierName}</strong></td>
          <td style="font-size:12px; color:var(--text-secondary); max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemSummary}">${itemSummary}</td>
          <td class="td-mono text-right">₹${fmt(b.subtotal)}</td>
          <td class="td-mono text-right font-bold text-accent">₹${fmt(b.grandTotal)}</td>
          <td><span class="badge badge-${statusBadge}">${b.paymentStatus}</span></td>
        </tr>`;
    }).join('');
  }

  function applyFilters() {
    if (currentTab === 'inventory') {
      searchQuery = document.getElementById('inv-search')?.value || '';
      categoryFilter = document.getElementById('inv-filter-category')?.value || '';
      statusFilter = document.getElementById('inv-filter-status')?.value || '';
      
      const tbody = document.getElementById('inv-inventory-tbody');
      if (tbody) tbody.innerHTML = renderInventoryRows(DB.getMaterials());
    } else if (currentTab === 'journal') {
      journalSearchQuery = document.getElementById('inv-journal-search')?.value || '';
      journalTypeFilter = document.getElementById('inv-journal-filter-type')?.value || '';
      
      const tbody = document.getElementById('inv-journal-tbody');
      if (tbody) tbody.innerHTML = renderJournalRows(DB.getMaterialLogs());
    } else {
      const tbody = document.getElementById('inv-bills-tbody');
      if (tbody) tbody.innerHTML = renderBillsRows(DB.getMaterialBills());
    }
  }

  function openAdjustModal(materialId, action) {
    const p = DB.getMaterial(materialId);
    if (!p) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'inv-adjust-modal';
    
    const title = action === 'add' ? '➕ Receive Stock / Add Material' : '➖ Reduce Stock / Deduct Spillage';
    const label = action === 'add' ? 'Quantity to Add / Restock' : 'Quantity to Reduce / Deduct';
    const btnText = action === 'add' ? '➕ Add Stock' : '➖ Reduce Stock';
    const btnClass = action === 'add' ? 'btn-success' : 'btn-danger';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" onclick="Inventory.closeAdjustModal()">✕</button>
        </div>
        <form onsubmit="Inventory.saveStockAdjustment(event, '${p.id}', '${action}')">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="font-size:14px;background:rgba(255,255,255,0.02);padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);">
              <strong>Material Name:</strong> ${p.name}<br>
              <strong>Current Physical Stock:</strong> <span class="font-mono text-accent" style="font-weight:700;">${p.stock} ${p.unit||''}</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">${label} <span class="required">*</span></label>
              <input class="form-control" name="qty" type="number" step="0.01" min="0.01" placeholder="0.00" required id="inv-adjust-qty-input">
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Reference / PO No.</label>
                <input class="form-control" name="reference" placeholder="e.g. PO-9801, Batch-9B">
              </div>
              <div class="form-group">
                <label class="form-label">Reason Code <span class="required">*</span></label>
                <select class="form-control" name="reason" required>
                  ${action === 'add'
                    ? `<option value="Purchase Restock">Purchase Restock</option>
                       <option value="Restored from Waste">Restored from Waste</option>
                       <option value="Physical Inventory Audit">Physical Inventory Audit</option>
                       <option value="Other Addition">Other Addition</option>`
                    : `<option value="Damage / Spillage">Damage / Chemical Spillage</option>
                       <option value="Physical Inventory Shrinkage">Physical Inventory Shrinkage</option>
                       <option value="Internal Factory Usage">Internal Factory Usage</option>
                       <option value="Expired / Defective">Expired / Defective Reagent</option>
                       <option value="Other Deduction">Other Deduction</option>`
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes / Remarks</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Provide extra detail about this adjustment..."></textarea>
            </div>
            <div class="divider mt-2"></div>
            <div class="flex gap-3" style="justify-content:flex-end;">
              <button type="button" class="btn btn-secondary" onclick="Inventory.closeAdjustModal()">Cancel</button>
              <button type="submit" class="btn ${btnClass}">💾 ${btnText}</button>
            </div>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Inventory.closeAdjustModal(); });
    document.getElementById('inv-adjust-qty-input')?.focus();
  }

  function closeAdjustModal() {
    document.getElementById('inv-adjust-modal')?.remove();
  }

  function saveStockAdjustment(e, materialId, action) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const qty = Number(fd.get('qty'));
    const finalQty = action === 'add' ? qty : -qty;

    const reference = fd.get('reference') || '';
    const reason = fd.get('reason') || '';
    const notes = fd.get('notes') || '';
    
    const type = action === 'add' ? 'RESTOCK' : (reason === 'Damage / Spillage' ? 'DAMAGE' : 'AUDIT');

    DB.addMaterialAdjustment(materialId, type, finalQty, reference, reason, notes);
    App.showToast('Inventory level adjusted successfully!', 'success');
    closeAdjustModal();
    render();
  }

  function openAddInventoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'add-inventory-modal';
    
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">➕ Add Raw Material / Chemical</h2>
          <button class="modal-close" onclick="Inventory.closeAddInventoryModal()">✕</button>
        </div>
        <form onsubmit="Inventory.saveNewInventoryItem(event)">
          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Chemical / Material Name <span class="required">*</span></label>
              <input class="form-control" name="name" placeholder="e.g. Titanium Dioxide (TiO₂)" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category <span class="required">*</span></label>
              <select class="form-control" name="category" required>
                <option value="Raw Materials - Pigments">Raw Materials - Pigments</option>
                <option value="Raw Materials - Binders">Raw Materials - Binders</option>
                <option value="Raw Materials - Fillers">Raw Materials - Fillers</option>
                <option value="Solvents">Solvents</option>
                <option value="Chemicals" selected>Chemicals & Reagents</option>
                <option value="Packaging">Packaging Materials</option>
                <option value="Other Raw Materials">Other Raw Materials</option>
              </select>
            </div>
          </div>

          <div class="form-grid-3" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">SKU / Catalog No.</label>
              <input class="form-control" name="sku" placeholder="e.g. TIO2-RUT">
            </div>
            <div class="form-group">
              <label class="form-label">HSN Code <span class="required">*</span></label>
              <input class="form-control" name="hsnCode" placeholder="e.g. 2823" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit of Measure <span class="required">*</span></label>
              <select class="form-control" name="unit" required>
                <option value="Kg" selected>Kg (Kilogram)</option>
                <option value="Ltr">Ltr (Litre)</option>
                <option value="Nos">Nos (Numbers)</option>
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Ton">Ton (Tonne)</option>
                <option value="Quintal">Quintal</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
            </div>
          </div>

          <div class="form-grid-3" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">GST Rate (%) <span class="required">*</span></label>
              <select class="form-control" name="gstRate" required>
                <option value="18" selected>18% (Standard)</option>
                <option value="12">12%</option>
                <option value="5">5%</option>
                <option value="28">28%</option>
                <option value="0">0% (Exempt)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Purchase Price (₹) <span class="required">*</span></label>
              <input class="form-control" name="purchasePrice" type="number" step="0.01" min="0" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">Initial Stock Qty <span class="required">*</span></label>
              <input class="form-control" name="stock" type="number" step="0.01" min="0" placeholder="0.00" required>
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Min Stock Alert Level</label>
              <input class="form-control" name="minStock" type="number" step="0.01" min="0" placeholder="10.00" value="10">
            </div>
            <div class="form-group">
              <label class="form-label">Storage Location / Bin</label>
              <input class="form-control" name="location" placeholder="e.g. Shelf A-3, Cold Room">
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Description / Grade Specs</label>
            <textarea class="form-control" name="description" placeholder="Specify grade, concentration, purity or specific usage instructions..." rows="3"></textarea>
          </div>

          <div class="divider"></div>
          <div class="flex gap-3" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" onclick="Inventory.closeAddInventoryModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">💾 Save Material</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Inventory.closeAddInventoryModal(); });
  }

  function closeAddInventoryModal() {
    document.getElementById('add-inventory-modal')?.remove();
  }

  function saveNewInventoryItem(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    
    const purchasePrice = Number(fd.get('purchasePrice')) || 0;
    
    const newProduct = {
      name: fd.get('name'),
      category: fd.get('category'),
      sku: fd.get('sku') || '',
      hsnCode: fd.get('hsnCode'),
      description: fd.get('description') || '',
      unit: fd.get('unit'),
      gstRate: Number(fd.get('gstRate')),
      purchasePrice: purchasePrice,
      sellingPrice: purchasePrice, // default sellingPrice to purchasePrice since it's a raw chemical/material
      stock: Number(fd.get('stock')) || 0,
      minStock: Number(fd.get('minStock')) || 10,
      location: fd.get('location') || '',
      image: '',
    };

    DB.addMaterial(newProduct);
    App.showToast('Inventory item added and synced successfully!', 'success');
    closeAddInventoryModal();
    render();
  }

  function openCreateBillModal() {
    billItems = [{ materialId: '', qty: 1, purchasePrice: 0 }];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'create-bill-modal';
    
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">➕ Create Supplier Purchase Bill</h2>
          <button class="modal-close" onclick="Inventory.closeCreateBillModal()">✕</button>
        </div>
        <form onsubmit="Inventory.saveSupplierBill(event)">
          <div class="form-grid-3" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Supplier Name <span class="required">*</span></label>
              <input class="form-control" name="supplierName" placeholder="e.g. Gujarat Pigments Ltd." required>
            </div>
            <div class="form-group">
              <label class="form-label">Bill Number <span class="required">*</span></label>
              <input class="form-control" name="billNo" placeholder="e.g. BILL-9021" required>
            </div>
            <div class="form-group">
              <label class="form-label">Bill Date <span class="required">*</span></label>
              <input class="form-control" name="date" type="date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>

          <div style="margin-top:20px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:14px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">Purchase Items List</strong>
            <button type="button" class="btn btn-secondary btn-sm" onclick="Inventory.addBillItemRow()">➕ Add Material Row</button>
          </div>

          <div class="table-wrapper" style="margin-bottom:16px;max-height:260px;overflow-y:auto;">
            <table>
              <thead>
                <tr>
                  <th style="width:40%;">Material / Chemical</th>
                  <th style="width:20%;text-align:right;">Quantity</th>
                  <th style="width:20%;text-align:right;">Purchase Price (₹)</th>
                  <th style="width:15%;text-align:right;">Total (₹)</th>
                  <th style="width:5%;"></th>
                </tr>
              </thead>
              <tbody id="bill-items-tbody">
                <!-- Dynamically populated rows -->
              </tbody>
            </table>
          </div>

          <div class="form-grid-3" style="margin-bottom:16px;align-items:end;">
            <div class="form-group">
              <label class="form-label">GST Rate (%) <span class="required">*</span></label>
              <select class="form-control" id="bill-tax-rate" onchange="Inventory.recalculateBillTotals()">
                <option value="18" selected>18% (Standard)</option>
                <option value="12">12%</option>
                <option value="5">5%</option>
                <option value="28">28%</option>
                <option value="0">0%</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Payment Status <span class="required">*</span></label>
              <select class="form-control" name="paymentStatus">
                <option value="Paid" selected>Paid (Cash Outflow)</option>
                <option value="Unpaid">Unpaid (Supplier Accounts Payable)</option>
              </select>
            </div>
            <div class="tax-summary" style="padding:10px 14px;border-radius:var(--radius-sm);">
              <div style="font-size:12px;color:var(--text-secondary);">Taxable Subtotal: <strong id="bill-subtotal-val">₹0.00</strong></div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">GST Tax Amount: <strong id="bill-tax-val">₹0.00</strong></div>
              <div style="font-size:13px;color:var(--accent-light);font-weight:700;margin-top:4px;">Grand Total: <strong id="bill-total-val">₹0.00</strong></div>
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Purchase Notes</label>
            <textarea class="form-control" name="notes" placeholder="Specify batch numbers, certificate of analysis (COA) numbers, or terms..." rows="2"></textarea>
          </div>

          <div class="divider"></div>
          <div class="flex gap-3" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" onclick="Inventory.closeCreateBillModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">💾 Save Purchase Bill</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Inventory.closeCreateBillModal(); });
    renderBillRowsUI();
  }

  function closeCreateBillModal() {
    document.getElementById('create-bill-modal')?.remove();
  }

  function renderBillRowsUI() {
    const materials = DB.getMaterials();
    const tbody = document.getElementById('bill-items-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = billItems.map((item, idx) => {
      return `
        <tr>
          <td>
            <select class="form-control" style="padding:6px 10px;" onchange="Inventory.updateBillItem(${idx}, 'materialId', this.value)" required>
              <option value="">Select Material...</option>
              ${materials.map(m => `<option value="${m.id}" ${item.materialId === m.id ? 'selected' : ''}>${m.name} (${m.unit})</option>`).join('')}
            </select>
          </td>
          <td>
            <input class="form-control text-right" style="padding:6px 10px;" type="number" step="0.01" min="0.01" value="${item.qty}" oninput="Inventory.updateBillItem(${idx}, 'qty', this.value)" required>
          </td>
          <td>
            <input class="form-control text-right" style="padding:6px 10px;" type="number" step="0.01" min="0" value="${item.purchasePrice}" oninput="Inventory.updateBillItem(${idx}, 'purchasePrice', this.value)" required>
          </td>
          <td class="td-mono text-right font-bold" style="padding-top:14px;">
            ₹${((item.qty || 0) * (item.purchasePrice || 0)).toFixed(2)}
          </td>
          <td>
            <button type="button" class="item-remove-btn" onclick="Inventory.removeBillItemRow(${idx})">✕</button>
          </td>
        </tr>`;
    }).join('');
    
    recalculateBillTotals();
  }

  function addBillItemRow() {
    billItems.push({ materialId: '', qty: 1, purchasePrice: 0 });
    renderBillRowsUI();
  }

  function removeBillItemRow(idx) {
    if (billItems.length === 1) return;
    billItems.splice(idx, 1);
    renderBillRowsUI();
  }

  function updateBillItem(idx, field, val) {
    billItems[idx][field] = field === 'materialId' ? val : Number(val);
    
    if (field === 'materialId' && val) {
      const mat = DB.getMaterial(val);
      if (mat) {
        billItems[idx].purchasePrice = Number(mat.purchasePrice) || 0;
      }
    }
    
    renderBillRowsUI();
  }

  function recalculateBillTotals() {
    let subtotal = 0;
    billItems.forEach(item => {
      subtotal += (item.qty || 0) * (item.purchasePrice || 0);
    });
    
    const taxRate = Number(document.getElementById('bill-tax-rate')?.value || 18);
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    
    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    document.getElementById('bill-subtotal-val').textContent = '₹' + fmt(subtotal);
    document.getElementById('bill-tax-val').textContent = '₹' + fmt(taxAmount);
    document.getElementById('bill-total-val').textContent = '₹' + fmt(grandTotal);
  }

  function saveSupplierBill(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    
    const taxRate = Number(document.getElementById('bill-tax-rate')?.value || 18);
    
    let subtotal = 0;
    const validatedItems = [];
    
    for (let i = 0; i < billItems.length; i++) {
      const item = billItems[i];
      if (!item.materialId) {
        alert('Please select a material for all rows.');
        return;
      }
      const mat = DB.getMaterial(item.materialId);
      const total = (item.qty || 0) * (item.purchasePrice || 0);
      subtotal += total;
      
      validatedItems.push({
        materialId: item.materialId,
        name: mat?.name || 'Chemical',
        qty: item.qty,
        purchasePrice: item.purchasePrice,
        total: total
      });
    }
    
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    
    const bill = {
      billNo: fd.get('billNo'),
      date: fd.get('date'),
      supplierName: fd.get('supplierName'),
      items: validatedItems,
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      paymentStatus: fd.get('paymentStatus'),
      notes: fd.get('notes') || ''
    };
    
    DB.addMaterialBill(bill);
    App.showToast('Supplier purchase bill recorded successfully!', 'success');
    closeCreateBillModal();
    render();
  }

  function printReport() {
    const products = DB.getMaterials();
    const settings = DB.getSettings();
    const dateStr = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    
    let totalItems = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outStockCount = 0;
    
    const rows = products.map((p, idx) => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.purchasePrice) || 0;
      const value = stock * price;
      totalItems += stock;
      totalValuation += value;
      
      const isLow = stock > 0 && stock <= (Number(p.minStock) || 10);
      const isOut = stock === 0;
      if (isLow) lowStockCount++;
      if (isOut) outStockCount++;
      
      const statusText = isOut ? 'Out of Stock' : (isLow ? 'Low Stock' : 'Good');
      const statusColor = isOut ? '#ef4444' : (isLow ? '#f59e0b' : '#10b981');
      
      return `
        <tr>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;">${idx + 1}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;">
            <strong>${p.name}</strong><br>
            <span style="font-size:10px;color:#666;">SKU: ${p.sku || '—'} | HSN: ${p.hsnCode || '—'}</span>
          </td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;">${p.category || 'Uncategorized'}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;text-align:right;font-family:monospace;">${stock} ${p.unit || 'Pcs'}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;text-align:right;font-family:monospace;">₹${price.toFixed(2)}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;text-align:right;font-family:monospace;font-weight:bold;">₹${value.toFixed(2)}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;color:${statusColor};font-weight:bold;font-size:11px;">${statusText}</td>
        </tr>
      `;
    }).join('');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Raw Materials & Chemicals Valuation Report - Sharma Industries</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #333; margin: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #666; margin-top: 5px; }
          .report-meta { text-align: right; font-size: 13px; color: #666; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 6px; background: #fafafa; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
          .stat-value { font-size: 18px; font-weight: bold; font-family: monospace; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) td { background-color: #fafafa; }
          .footer { text-align: center; border-top: 1px solid #ddd; padding-top: 20px; font-size: 11px; color: #888; margin-top: 50px; }
          
          @media print {
            body { margin: 20px; }
            .print-btn-container { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container" style="display:flex;justify-content:flex-end;margin-bottom:20px;">
          <button onclick="window.print()" style="padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:inherit;">🖨️ Print Inventory Sheet</button>
        </div>
        <div class="header">
          <div>
            <div class="company-name">${settings.companyName}</div>
            <div class="report-title">Raw Materials & Chemicals Valuation Report</div>
            <div style="font-size:12px;color:#666;margin-top:5px;">GSTIN: ${settings.gstin || '—'} · Address: ${settings.address || '—'}, ${settings.city || ''}</div>
          </div>
          <div class="report-meta">
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Total Materials Count:</strong> ${products.length}</div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Material Assets Valuation</div>
            <div class="stat-value">₹${totalValuation.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Materials Volume</div>
            <div class="stat-value">${totalItems.toLocaleString('en-IN')} Units</div>
          </div>
          <div class="stat-card" style="border-left: 4px solid #f59e0b;">
            <div class="stat-label">Low Stock Materials</div>
            <div class="stat-value" style="color:#b45309;">${lowStockCount}</div>
          </div>
          <div class="stat-card" style="border-left: 4px solid #ef4444;">
            <div class="stat-label">Out of Stock Materials</div>
            <div class="stat-value" style="color:#b91c1c;">${outStockCount}</div>
          </div>
        </div>
        
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">S.No</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">Material Details</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">Category</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:right;">Current Stock</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:right;">Unit Price</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:right;">Asset Value</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          <strong>Sharma Industries Inventory Report</strong><br>
          This is a system-generated physical inventory assessment report for raw materials. Confirms to local valuation rules.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function deleteProduct(id) {
    const prod = DB.getMaterial(id);
    if (!prod) return;
    if (!confirm(`Delete raw material "${prod.name}" and all its inventory logs? This cannot be undone.`)) return;
    DB.deleteMaterial(id);
    App.showToast('Raw material deleted.', 'warning');
    render();
  }

  return { 
    render, 
    switchTab, 
    applyFilters, 
    openAdjustModal, 
    closeAdjustModal, 
    saveStockAdjustment, 
    openAddInventoryModal, 
    closeAddInventoryModal, 
    saveNewInventoryItem, 
    openCreateBillModal,
    closeCreateBillModal,
    addBillItemRow,
    removeBillItemRow,
    updateBillItem,
    recalculateBillTotals,
    saveSupplierBill,
    printReport, 
    deleteProduct 
  };
})();

```

## File: `.\js\invoice.js`
```javascript
// ============================================================
// invoice.js — Create / Edit Invoice  (simplified tax toggle + template picker)
// ============================================================

const InvoiceCreator = (() => {
  let items = [];
  let editingId = null;
  let currentTemplate = 'classic';

  const fmt = n => Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});

  // ---- Per-item calc (inclusive / exclusive) ----
  function calcItem(item, taxType) {
    const raw = item.qty * item.rate * (1 - (item.discount||0)/100);
    let taxable, gstAmt;
    if (taxType === 'inclusive') {
      taxable = raw / (1 + item.gstRate/100);
      gstAmt  = raw - taxable;
    } else {
      taxable = raw;
      gstAmt  = taxable * item.gstRate/100;
    }
    return { raw, taxable, gstAmt, total: taxable + gstAmt };
  }

  function getTaxType() {
    return document.getElementById('tt-incl')?.checked ? 'inclusive' : 'exclusive';
  }

  // ----------------------------------------------------------------
  function render(invoiceId = null) {
    editingId = invoiceId;
    const existing = invoiceId ? DB.getInvoice(invoiceId) : null;
    items = existing ? JSON.parse(JSON.stringify(existing.items||[])) : [];
    currentTemplate = existing?.template || 'classic';

    const settings  = DB.getSettings();
    const today     = new Date().toISOString().split('T')[0];
    const dueDate   = new Date(Date.now()+30*86400000).toISOString().split('T')[0];
    const invoiceNo = existing?.invoiceNo || `${settings.invoicePrefix}-${new Date().getFullYear()}-${String(DB.getNextInvoiceNumber()).padStart(4,'0')}`;
    const e = existing || {};
    const savedTaxType = e.taxType || 'exclusive';

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>${invoiceId ? '✏️ Edit Invoice' : '🧾 New Invoice'}</h1>
          <p>GST-compliant tax invoice · ${settings.companyName}</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" onclick="App.navigate('invoices')">← Back</button>
          <button class="btn btn-primary" onclick="InvoiceCreator.saveInvoice()">💾 Save Invoice</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 340px;gap:22px;align-items:start;">
        <!-- ===== LEFT COLUMN ===== -->
        <div style="display:flex;flex-direction:column;gap:18px;">

          <!-- Invoice Details -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">📋 Invoice Details</h3></div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Invoice Number</label>
                <input class="form-control font-mono" id="inv-number" value="${invoiceNo}">
              </div>
              <div class="form-group">
                <label class="form-label">Invoice Date <span class="required">*</span></label>
                <input class="form-control" id="inv-date" type="date" value="${e.date||today}">
              </div>
              <div class="form-group">
                <label class="form-label">Due Date</label>
                <input class="form-control" id="inv-due-date" type="date" value="${e.dueDate||dueDate}">
              </div>
              <div class="form-group">
                <label class="form-label">Supply Type</label>
                <select class="form-control" id="inv-supply-type" onchange="InvoiceCreator.recalc()">
                  <option value="intra" ${(e.supplyType||'intra')==='intra'?'selected':''}>Intra-State (CGST+SGST)</option>
                  <option value="inter" ${e.supplyType==='inter'?'selected':''}>Inter-State (IGST)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tax in Prices</label>
                <div style="display:flex;gap:8px;align-items:center;">
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:7px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);font-size:13px;transition:all 0.15s;" id="tt-excl-lbl">
                    <input type="radio" name="inv-taxtype" id="tt-excl" ${savedTaxType!=='inclusive'?'checked':''} onchange="InvoiceCreator.recalc()">
                    📤 Excl. GST
                  </label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:7px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);font-size:13px;transition:all 0.15s;" id="tt-incl-lbl">
                    <input type="radio" name="inv-taxtype" id="tt-incl" ${savedTaxType==='inclusive'?'checked':''} onchange="InvoiceCreator.recalc()">
                    📥 Incl. GST
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Payment Mode</label>
                <select class="form-control" id="inv-payment-mode">
                  ${['Cash','Bank Transfer','UPI','Cheque','Credit'].map(m=>`<option value="${m}" ${(e.paymentMode||'Cash')===m?'selected':''}>${m}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Payment Status</label>
                <select class="form-control" id="inv-payment-status">
                  ${['Unpaid','Paid','Partial','Cancelled'].map(s=>`<option value="${s}" ${(e.paymentStatus||'Unpaid')===s?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">👤 Customer / Buyer Details</h3></div>
            <div class="form-grid">
              <div class="form-group">
                <input class="form-control" id="cust-name" list="customer-autocomplete-list" placeholder="Full name or company" value="${e.customer?.name||''}" oninput="InvoiceCreator.onCustomerNameInput(this.value)">
                <datalist id="customer-autocomplete-list">
                  ${DB.getCustomers().map(c => `<option value="${c.name}">`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">GSTIN</label>
                <input class="form-control font-mono" id="cust-gstin" placeholder="27AAAAA0000A1Z5" maxlength="15" value="${e.customer?.gstin||''}" oninput="this.value=this.value.toUpperCase()">
              </div>
              <div class="form-group full">
                <label class="form-label">Address</label>
                <input class="form-control" id="cust-address" placeholder="Street address" value="${e.customer?.address||''}">
              </div>
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="form-control" id="cust-city" placeholder="City" value="${e.customer?.city||''}">
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input class="form-control" id="cust-state" list="state-list" placeholder="State" value="${e.customer?.state||''}">
                <datalist id="state-list">${STATES.map(s=>`<option value="${s}">`).join('')}</datalist>
              </div>
              <div class="form-group">
                <label class="form-label">PIN Code</label>
                <input class="form-control" id="cust-pin" placeholder="000000" maxlength="6" value="${e.customer?.pincode||''}">
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input class="form-control" id="cust-phone" placeholder="+91 9876543210" value="${e.customer?.phone||''}">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-control" id="cust-email" placeholder="email@example.com" value="${e.customer?.email||''}">
              </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🎨 Line Items</h3>
              <button class="btn btn-primary btn-sm" onclick="InvoiceCreator.openProductPicker()">➕ Add Product</button>
            </div>
            <div id="line-items-wrap">${renderLineItems(savedTaxType)}</div>
            <div id="subtotal-strip-wrap">${renderSubtotalStrip(savedTaxType)}</div>
            <div class="divider"></div>
            <!-- Charges row -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Freight (₹)</label>
                <input class="form-control" id="inv-freight" type="number" step="0.01" min="0" placeholder="0.00" value="${e.freight||''}" oninput="InvoiceCreator.recalc()">
              </div>
              <div class="form-group">
                <label class="form-label">Discount (₹)</label>
                <input class="form-control" id="inv-discount" type="number" step="0.01" min="0" placeholder="0.00" value="${e.discount||''}" oninput="InvoiceCreator.recalc()">
              </div>
              <div class="form-group">
                <label class="form-label">Advance Paid (₹)</label>
                <input class="form-control" id="inv-advance" type="number" step="0.01" min="0" placeholder="0.00" value="${e.advance||''}" oninput="InvoiceCreator.recalc()" style="border-color:rgba(16,185,129,0.4);">
              </div>
              <div class="form-group">
                <label class="form-label">Round Off (₹)</label>
                <input class="form-control" id="inv-roundoff" type="number" step="0.01" placeholder="0.00" value="${e.roundOff||''}" oninput="InvoiceCreator.recalc()">
              </div>
            </div>
            <div class="form-group mt-4">
              <label class="form-label">Notes / Terms</label>
              <textarea class="form-control" id="inv-notes" rows="3" placeholder="Payment terms, delivery notes...">${e.notes||DB.getSettings().defaultTerms||''}</textarea>
            </div>
          </div>
        </div>

        <!-- ===== RIGHT COLUMN ===== -->
        <div style="position:sticky;top:80px;display:flex;flex-direction:column;gap:14px;">

          <!-- Summary -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">🧮 Summary</h3></div>
            <div id="tax-summary-wrap">${renderTaxSummary(savedTaxType)}</div>
          </div>

          <!-- Template Picker -->
          <div class="card" style="padding:16px;">
            <div style="font-size:12px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">🎨 Invoice Template</div>
            <div id="template-picker-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
              ${(typeof PRINT_TEMPLATES!=='undefined'?PRINT_TEMPLATES:[]).map(t=>renderTemplateSwatch(t,currentTemplate)).join('')}
            </div>
            <div id="tpl-name" style="text-align:center;font-size:11px;color:var(--accent-light);margin-top:8px;font-weight:600;min-height:14px;">
              ${(typeof PRINT_TEMPLATES!=='undefined'?PRINT_TEMPLATES:[]).find(t=>t.id===currentTemplate)?.name||'Classic Indigo'}
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-full" onclick="InvoiceCreator.saveInvoice()">💾 Save Invoice</button>
          <button class="btn btn-secondary btn-lg w-full" onclick="InvoiceCreator.previewInvoice()">👁️ Preview & Print</button>
        </div>
      </div>

      <!-- Product Picker Modal -->
      <div id="picker-modal" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">🎨 Select Product</h2>
            <button class="modal-close" onclick="InvoiceCreator.closeProductPicker()">✕</button>
          </div>
          <div class="search-bar mb-4">
            <span class="search-icon">🔍</span>
            <input type="text" id="picker-search" placeholder="Search products, HSN, category..." oninput="InvoiceCreator.filterPicker()">
          </div>
          <div id="picker-list" class="product-picker-dropdown" style="position:static;max-height:420px;border-radius:var(--radius-md);">
            ${renderPickerList(DB.getProducts())}
          </div>
        </div>
      </div>
    `;
    setTimeout(()=>recalc(),0);
  }

  // ---- Template swatch HTML ----
  function renderTemplateSwatch(t, selected) {
    return `<div class="tpl-swatch${selected===t.id?' active':''}" title="${t.name}" onclick="InvoiceCreator.setTemplate('${t.id}')">
      <div style="height:20px;border-radius:3px 3px 0 0;background:${t.color};"></div>
      <div class="tpl-swatch-name">${t.shortName}</div>
    </div>`;
  }

  function setTemplate(id) {
    currentTemplate = id;
    const grid = document.getElementById('template-picker-grid');
    if (grid && typeof PRINT_TEMPLATES !== 'undefined') {
      grid.innerHTML = PRINT_TEMPLATES.map(t=>renderTemplateSwatch(t,id)).join('');
      const nameEl = document.getElementById('tpl-name');
      if (nameEl) nameEl.textContent = PRINT_TEMPLATES.find(t=>t.id===id)?.name||'';
    }
  }

  // ---- Subtotal strip below items table ----
  function renderSubtotalStrip(taxType) {
    if (!items.length) return '';
    let raw=0, taxable=0, gst=0;
    items.forEach(item => { const c=calcItem(item,taxType); raw+=item.qty*item.rate; taxable+=c.taxable; gst+=c.gstAmt; });
    const isIncl = taxType==='inclusive';
    return `<div style="display:flex;align-items:center;justify-content:flex-end;gap:20px;padding:10px 14px;background:rgba(99,102,241,0.05);border-radius:var(--radius-sm);border:1px solid rgba(99,102,241,0.12);margin-top:8px;flex-wrap:wrap;">
      ${isIncl
        ? `<div style="text-align:right;"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Total (Incl. GST)</div><div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;">₹${fmt(raw)}</div></div>
           <div style="text-align:right;"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Taxable Value</div><div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;">₹${fmt(taxable)}</div></div>`
        : `<div style="text-align:right;"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Subtotal</div><div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;">₹${fmt(raw)}</div></div>`}
      <div style="text-align:right;padding-left:14px;border-left:1px solid var(--border);">
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">GST ${isIncl?'Extracted':'Added'}</div>
        <div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--accent-light);">₹${fmt(gst)}</div>
      </div>
      <div style="text-align:right;padding-left:14px;border-left:1px solid var(--border);">
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Items Total</div>
        <div style="font-size:19px;font-weight:800;font-family:'JetBrains Mono',monospace;">₹${fmt(taxable+gst)}</div>
      </div>
    </div>`;
  }

  // ---- Line items table ----
  function renderLineItems(taxType) {
    if (!items.length) return `<div class="empty-state" style="padding:28px;"><div class="empty-icon">🎨</div><p>No items yet. Click "Add Product" to start.</p></div>`;
    const isIncl = taxType==='inclusive';
    return `<div class="table-wrapper" style="border:none;">
      <table class="invoice-items-table">
        <thead><tr>
          <th>#</th><th>Product</th><th>HSN</th><th>Qty</th>
          <th>Rate ₹ <span style="font-size:9px;opacity:0.7;">(${isIncl?'Incl.GST':'Excl.GST'})</span></th>
          <th>Disc%</th><th>GST%</th><th>Total ₹</th><th></th>
        </tr></thead>
        <tbody>
          ${items.map((item,i)=>{
            const c=calcItem(item,taxType);
            return `<tr>
              <td class="text-muted">${i+1}</td>
              <td><div style="font-weight:600;">${item.name}</div><div style="font-size:10px;color:var(--text-muted);">${item.unit||'Pcs'}</div></td>
              <td class="td-mono">${item.hsnCode||'—'}</td>
              <td><input type="number" class="form-control" style="width:68px;padding:5px 7px;" min="0.01" step="0.01" value="${item.qty}" onchange="InvoiceCreator.updateItem(${i},'qty',this.value)"></td>
              <td><input type="number" class="form-control" style="width:88px;padding:5px 7px;" min="0" step="0.01" value="${item.rate}" onchange="InvoiceCreator.updateItem(${i},'rate',this.value)"></td>
              <td><input type="number" class="form-control" style="width:56px;padding:5px 7px;" min="0" max="100" step="0.5" value="${item.discount||0}" onchange="InvoiceCreator.updateItem(${i},'discount',this.value)"></td>
              <td><span class="badge badge-purple">${item.gstRate}%</span></td>
              <td class="td-mono font-bold">₹${fmt(c.total)}</td>
              <td><button class="item-remove-btn" onclick="InvoiceCreator.removeItem(${i})">✕</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  // ---- Right panel summary (no GST rate table) ----
  function renderTaxSummary(taxType) {
    const supplyType = document.getElementById('inv-supply-type')?.value||'intra';
    const freight    = Number(document.getElementById('inv-freight')?.value)||0;
    const discount   = Number(document.getElementById('inv-discount')?.value)||0;
    const roundOff   = Number(document.getElementById('inv-roundoff')?.value)||0;
    const advance    = Number(document.getElementById('inv-advance')?.value)||0;

    let rawTotal=0, totalTaxable=0, totalGST=0;
    items.forEach(item => { const c=calcItem(item,taxType); rawTotal+=item.qty*item.rate; totalTaxable+=c.taxable; totalGST+=c.gstAmt; });

    const grandTotal = totalTaxable + totalGST + freight - discount + roundOff;
    const balanceDue = Math.max(0, grandTotal - advance);

    return `
      <div class="tax-summary">
        <div class="tax-row"><span class="tax-label">Subtotal</span><span class="tax-value">₹${fmt(rawTotal)}</span></div>
        ${discount>0?`<div class="tax-row"><span class="tax-label">Discount</span><span class="tax-value text-danger">- ₹${fmt(discount)}</span></div>`:''}
        <div class="tax-row"><span class="tax-label">Taxable Amount</span><span class="tax-value">₹${fmt(totalTaxable)}</span></div>
        ${supplyType==='inter'
          ?`<div class="tax-row"><span class="tax-label">IGST</span><span class="tax-value">₹${fmt(totalGST)}</span></div>`
          :`<div class="tax-row"><span class="tax-label">CGST</span><span class="tax-value">₹${fmt(totalGST/2)}</span></div>
            <div class="tax-row"><span class="tax-label">SGST</span><span class="tax-value">₹${fmt(totalGST/2)}</span></div>`}
        ${freight>0?`<div class="tax-row"><span class="tax-label">Freight</span><span class="tax-value">₹${fmt(freight)}</span></div>`:''}
        ${roundOff!==0?`<div class="tax-row"><span class="tax-label">Round Off</span><span class="tax-value">₹${fmt(roundOff)}</span></div>`:''}
        <div class="tax-row total"><span class="tax-label">Grand Total</span><span class="tax-value">₹${fmt(grandTotal)}</span></div>
        ${advance>0?`
        <div class="tax-row" style="background:rgba(16,185,129,0.06);border-top:1px dashed rgba(16,185,129,0.3);">
          <span class="tax-label text-success">Advance Paid</span>
          <span class="tax-value text-success">- ₹${fmt(advance)}</span>
        </div>
        <div class="tax-row" style="background:rgba(16,185,129,0.1);padding:13px 16px;">
          <span style="font-size:15px;font-weight:800;">Balance Due</span>
          <span style="font-size:17px;font-weight:800;color:${balanceDue===0?'var(--success)':'#f59e0b'};font-family:'JetBrains Mono',monospace;">₹${fmt(balanceDue)}</span>
        </div>`:''
        }
      </div>
      <div class="mt-3 card-sm" style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);">
        <div style="font-size:11px;color:var(--text-secondary);">Amount in words:</div>
        <div style="font-size:11px;font-weight:600;margin-top:3px;line-height:1.5;">${numToWords(grandTotal)} Only</div>
      </div>
      ${advance>0?`
      <div class="mt-2 card-sm" style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);">
        <div style="font-size:11px;color:var(--text-secondary);">Balance in words:</div>
        <div style="font-size:11px;font-weight:600;margin-top:3px;color:var(--success);line-height:1.5;">${numToWords(balanceDue)} Only</div>
      </div>`:''}`;
  }

  // ---- Recalc all live panels ----
  function recalc() {
    const taxType = getTaxType();

    // Style active/inactive tax type radio pills
    const exclLbl = document.getElementById('tt-excl-lbl');
    const inclLbl = document.getElementById('tt-incl-lbl');
    if (exclLbl && inclLbl) {
      if (taxType === 'inclusive') {
        inclLbl.style.borderColor = 'var(--accent)';
        inclLbl.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))';
        inclLbl.style.color = 'var(--accent-light)';
        inclLbl.style.boxShadow = '0 0 0 2px var(--accent-glow)';
        
        exclLbl.style.borderColor = 'var(--border)';
        exclLbl.style.background = 'none';
        exclLbl.style.color = 'var(--text-secondary)';
        exclLbl.style.boxShadow = 'none';
      } else {
        exclLbl.style.borderColor = 'var(--accent)';
        exclLbl.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))';
        exclLbl.style.color = 'var(--accent-light)';
        exclLbl.style.boxShadow = '0 0 0 2px var(--accent-glow)';
        
        inclLbl.style.borderColor = 'var(--border)';
        inclLbl.style.background = 'none';
        inclLbl.style.color = 'var(--text-secondary)';
        inclLbl.style.boxShadow = 'none';
      }
    }

    const li = document.getElementById('line-items-wrap');
    if (li) li.innerHTML = renderLineItems(taxType);
    const st = document.getElementById('subtotal-strip-wrap');
    if (st) st.innerHTML = renderSubtotalStrip(taxType);
    const tx = document.getElementById('tax-summary-wrap');
    if (tx) tx.innerHTML = renderTaxSummary(taxType);
  }

  function updateItem(idx, field, val) {
    if (!items[idx]) return;
    items[idx][field] = ['qty','rate','discount'].includes(field) ? Number(val) : val;
    recalc();
  }
  function removeItem(idx) { items.splice(idx,1); recalc(); }

  // ---- Product Picker ----
  function renderPickerList(products) {
    if (!products.length) return `<div class="empty-state" style="padding:28px;"><div class="empty-icon">🎨</div><p>No products found</p></div>`;
    return products.map(p => {
      const img = p.image
        ? `<img src="${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:7px;">`
        : `<div style="width:40px;height:40px;background:rgba(255,255,255,0.05);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:18px;">🎨</div>`;
      return `<div class="picker-item" onclick="InvoiceCreator.addItem('${p.id}')">
        ${img}
        <div class="picker-info">
          <strong>${p.name}</strong>
          <span>HSN: ${p.hsnCode||'—'} · ${p.gstRate}% GST · ₹${Number(p.sellingPrice).toLocaleString('en-IN')}/${p.unit||'Pcs'} · Stock: ${p.stock} ${p.unit||''}</span>
        </div>
      </div>`;
    }).join('');
  }

  function openProductPicker() {
    document.getElementById('picker-modal')?.classList.remove('hidden');
    document.getElementById('picker-search')?.focus();
  }
  function closeProductPicker() {
    document.getElementById('picker-modal')?.classList.add('hidden');
    const s = document.getElementById('picker-search');
    if (s) s.value = '';
  }
  function filterPicker() {
    const q = (document.getElementById('picker-search')?.value||'').toLowerCase();
    const list = document.getElementById('picker-list');
    if (list) list.innerHTML = renderPickerList(
      DB.getProducts().filter(p =>
        (p.name||'').toLowerCase().includes(q) ||
        (p.hsnCode||'').toLowerCase().includes(q) ||
        (p.sku||'').toLowerCase().includes(q) ||
        (p.category||'').toLowerCase().includes(q)
      )
    );
  }
  function addItem(productId) {
    const p = DB.getProduct(productId);
    if (!p) return;
    const ex = items.find(i=>i.productId===productId);
    if (ex) { ex.qty+=1; } else {
      items.push({ productId:p.id, name:p.name, hsnCode:p.hsnCode, unit:p.unit, qty:1, rate:p.sellingPrice, gstRate:p.gstRate, discount:0 });
    }
    closeProductPicker();
    recalc();
  }

  // ---- Collect all data for save/preview ----
  function collectInvoiceData() {
    const settings  = DB.getSettings();
    const taxType   = getTaxType();
    const supplyType = document.getElementById('inv-supply-type')?.value||'intra';
    const freight   = Number(document.getElementById('inv-freight')?.value)||0;
    const discount  = Number(document.getElementById('inv-discount')?.value)||0;
    const roundOff  = Number(document.getElementById('inv-roundoff')?.value)||0;
    const advance   = Number(document.getElementById('inv-advance')?.value)||0;

    let rawTotal=0, totalTaxable=0, totalGST=0;
    items.forEach(item => { const c=calcItem(item,taxType); rawTotal+=item.qty*item.rate; totalTaxable+=c.taxable; totalGST+=c.gstAmt; });
    const grandTotal = totalTaxable + totalGST + freight - discount + roundOff;
    const balanceDue = Math.max(0, grandTotal - advance);

    const enrichedItems = items.map(item => {
      const c = calcItem(item, taxType);
      return { ...item, _taxable:c.taxable, _gstAmt:c.gstAmt, _total:c.total };
    });

    return {
      invoiceNo: document.getElementById('inv-number')?.value,
      date: document.getElementById('inv-date')?.value,
      dueDate: document.getElementById('inv-due-date')?.value,
      taxType, supplyType, template: currentTemplate,
      paymentMode: document.getElementById('inv-payment-mode')?.value,
      paymentStatus: document.getElementById('inv-payment-status')?.value,
      customer: {
        name:    document.getElementById('cust-name')?.value,
        gstin:   document.getElementById('cust-gstin')?.value,
        address: document.getElementById('cust-address')?.value,
        city:    document.getElementById('cust-city')?.value,
        state:   document.getElementById('cust-state')?.value,
        pincode: document.getElementById('cust-pin')?.value,
        phone:   document.getElementById('cust-phone')?.value,
        email:   document.getElementById('cust-email')?.value,
      },
      items: enrichedItems,
      subtotal: rawTotal, totalTaxable, totalGST,
      cgst: supplyType==='intra' ? totalGST/2 : 0,
      sgst: supplyType==='intra' ? totalGST/2 : 0,
      igst: supplyType==='inter' ? totalGST : 0,
      freight, discount, roundOff, advance, grandTotal, balanceDue,
      notes: document.getElementById('inv-notes')?.value,
      seller: {
        companyName:settings.companyName, gstin:settings.gstin, address:settings.address,
        city:settings.city, district:settings.district, state:settings.state, stateCode:settings.stateCode,
        pincode:settings.pincode, phone:settings.phone, email:settings.email,
        logo:settings.logo, signature:settings.signature, bankName:settings.bankName,
        accountNo:settings.accountNo, ifscCode:settings.ifscCode, accountHolder:settings.accountHolder, upiId:settings.upiId,
      },
      customerId: (editingId ? DB.getInvoice(editingId)?.customerId : null) || null,
    };
  }

  function onCustomerNameInput(val) {
    const c = DB.getCustomerByName(val);
    if (c) {
      const gstin = document.getElementById('cust-gstin');
      const address = document.getElementById('cust-address');
      const city = document.getElementById('cust-city');
      const state = document.getElementById('cust-state');
      const pin = document.getElementById('cust-pin');
      const phone = document.getElementById('cust-phone');
      const email = document.getElementById('cust-email');

      if (gstin) gstin.value = c.gstin || '';
      if (address) address.value = c.address || '';
      if (city) city.value = c.city || '';
      if (state) state.value = c.state || '';
      if (pin) pin.value = c.pincode || '';
      if (phone) phone.value = c.phone || '';
      if (email) email.value = c.email || '';
      App.showToast(`Auto-filled details for ${c.name}`, 'info');
    }
  }

  function saveInvoice() {
    if (!document.getElementById('cust-name')?.value) { App.showToast('Please enter customer name!','error'); return; }
    if (!items.length) { App.showToast('Please add at least one product!','error'); return; }
    
    const data = collectInvoiceData();
    
    // Sync customer and get customerId
    const customerId = DB.syncCustomerFromInvoice(data);
    data.customerId = customerId;
    
    if (editingId) { 
      DB.updateInvoice(editingId,data); 
      App.showToast('Invoice updated!','success'); 
    }
    else { 
      DB.addInvoice(data); 
      App.showToast('Invoice saved!','success'); 
    }
    App.navigate('invoices');
  }

  function previewInvoice() {
    if (!items.length) { App.showToast('Please add at least one product!','error'); return; }
    PrintInvoice.open(collectInvoiceData());
  }

  return { render, recalc, setTemplate, updateItem, removeItem, openProductPicker, closeProductPicker, filterPicker, addItem, saveInvoice, previewInvoice, onCustomerNameInput };
})();

// ---- Indian States ----
const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry'
];

// ---- Number to Words ----
function numToWords(amount) {
  const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function w(n){if(n<20)return a[n];if(n<100)return b[~~(n/10)]+(n%10?' '+a[n%10]:'');if(n<1000)return a[~~(n/100)]+' Hundred'+(n%100?' '+w(n%100):'');if(n<1e5)return w(~~(n/1e3))+' Thousand'+(n%1e3?' '+w(n%1e3):'');if(n<1e7)return w(~~(n/1e5))+' Lakh'+(n%1e5?' '+w(n%1e5):'');return w(~~(n/1e7))+' Crore'+(n%1e7?' '+w(n%1e7):'');}
  const ip=Math.floor(Math.abs(amount)),dp=Math.round((Math.abs(amount)-ip)*100);
  return 'Rupees '+(w(ip)||'Zero')+(dp>0?' and '+w(dp)+' Paise':'');
}

```

## File: `.\js\invoiceList.js`
```javascript
// ============================================================
// invoiceList.js — Invoice List & Management Page
// ============================================================

const InvoiceList = (() => {
  const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function render() {
    const invoices = DB.getInvoices();
    const totalRevenue = invoices.filter(i => i.paymentStatus === 'Paid').reduce((s, i) => s + (i.grandTotal || 0), 0);
    const pending = invoices.filter(i => i.paymentStatus === 'Unpaid').reduce((s, i) => s + (i.grandTotal || 0), 0);

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>🧾 Invoices</h1>
          <p>${invoices.length} total · ₹${fmt(totalRevenue)} received · ₹${fmt(pending)} pending</p>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('invoice-new')">➕ New Invoice</button>
      </div>

      <div class="filter-bar">
        <div class="search-bar" style="flex:1;min-width:200px;">
          <span class="search-icon">🔍</span>
          <input type="text" id="inv-search" placeholder="Search by customer, invoice no..." oninput="InvoiceList.applyFilters()">
        </div>
        <input type="date" class="filter-select" id="filter-date-from" onchange="InvoiceList.applyFilters()" title="From date">
        <input type="date" class="filter-select" id="filter-date-to" onchange="InvoiceList.applyFilters()" title="To date">
        <select class="filter-select" id="filter-status" onchange="InvoiceList.applyFilters()">
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="card" style="padding:0;">
        <div class="table-wrapper" style="border:none;">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Tax Type</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="invoice-tbody">
              ${renderRows(invoices)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function statusBadge(status) {
    const map = { Paid: 'success', Unpaid: 'warning', Partial: 'info', Cancelled: 'danger' };
    return `<span class="badge badge-${map[status] || 'muted'}">${status || 'Unpaid'}</span>`;
  }

  function renderRows(invoices) {
    if (!invoices.length) {
      return `<tr><td colspan="10"><div class="empty-state">
        <div class="empty-icon">🧾</div>
        <h3>No invoices yet</h3>
        <p>Create your first invoice to get started</p>
        <button class="btn btn-primary" onclick="App.navigate('invoice-new')">➕ New Invoice</button>
      </div></td></tr>`;
    }
    return invoices.map(inv => `
      <tr>
        <td class="td-mono font-bold">${inv.invoiceNo || inv.id?.slice(-6)}</td>
        <td>${inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : '—'}</td>
        <td>
          <div style="font-weight:600;">${inv.customer?.name || '—'}</div>
          <div style="font-size:11px;color:var(--text-muted);">${inv.customer?.gstin || ''}</div>
        </td>
        <td><span class="badge badge-purple">${inv.items?.length || 0} items</span></td>
        <td>${inv.taxType === 'inclusive'
          ? `<span class="badge badge-info">📥 Incl. GST</span>`
          : `<span class="badge badge-purple">📤 Excl. GST</span>`}</td>
        <td class="td-mono font-bold">₹${fmt(inv.grandTotal)}</td>
        <td><span style="font-size:13px;">${inv.paymentMode || '—'}</span></td>
        <td>
          <select class="filter-select" style="padding:4px 8px;font-size:12px;"
            onchange="InvoiceList.updateStatus('${inv.id}', this.value)">
            ${['Unpaid','Paid','Partial','Cancelled'].map(s =>
              `<option value="${s}" ${inv.paymentStatus === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" title="Preview" onclick="InvoiceList.previewInvoice('${inv.id}')">👁️</button>
            <button class="btn btn-secondary btn-sm" title="Print" onclick="InvoiceList.printInvoice('${inv.id}')">🖨️</button>
            <button class="btn btn-secondary btn-sm" title="Edit" onclick="App.navigate('invoice-edit','${inv.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" title="Delete" onclick="InvoiceList.deleteInvoice('${inv.id}')">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function applyFilters() {
    const q = (document.getElementById('inv-search')?.value || '').toLowerCase();
    const from = document.getElementById('filter-date-from')?.value;
    const to = document.getElementById('filter-date-to')?.value;
    const status = document.getElementById('filter-status')?.value;

    let invoices = DB.getInvoices();
    if (q) invoices = invoices.filter(inv =>
      (inv.invoiceNo || '').toLowerCase().includes(q) ||
      (inv.customer?.name || '').toLowerCase().includes(q) ||
      (inv.customer?.gstin || '').toLowerCase().includes(q)
    );
    if (from) invoices = invoices.filter(inv => inv.date >= from);
    if (to) invoices = invoices.filter(inv => inv.date <= to);
    if (status) invoices = invoices.filter(inv => inv.paymentStatus === status);

    const tbody = document.getElementById('invoice-tbody');
    if (tbody) tbody.innerHTML = renderRows(invoices);
  }

  function updateStatus(id, status) {
    DB.updateInvoice(id, { paymentStatus: status });
    App.showToast(`Invoice marked as ${status}`, 'success');
  }

  function previewInvoice(id) {
    const inv = DB.getInvoice(id);
    if (!inv) return;
    PrintInvoice.open(inv);
  }

  function printInvoice(id) {
    const inv = DB.getInvoice(id);
    if (!inv) return;
    PrintInvoice.open(inv, true);
  }

  function deleteInvoice(id) {
    const inv = DB.getInvoice(id);
    if (!confirm(`Delete invoice ${inv?.invoiceNo || id}? This cannot be undone.`)) return;
    DB.deleteInvoice(id);
    App.showToast('Invoice deleted.', 'warning');
    render();
  }

  return { render, applyFilters, updateStatus, previewInvoice, printInvoice, deleteInvoice };
})();

```

## File: `.\js\ledger.js`
```javascript
// ============================================================
// ledger.js — Customer Ledger & Payment Follow-up Controller
// ============================================================

const Ledger = (() => {
  const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---- Main Ledger Directory ----
  function render() {
    const customers = DB.getCustomers();
    const invoices = DB.getInvoices();
    const payments = DB.getPayments();

    // Compute metrics
    let totalReceivables = 0;
    let debtorCount = 0;
    let settledCount = 0;

    const enrichedCustomers = customers.map(cust => {
      const ledger = DB.getCustomerLedger(cust.id);
      const balance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
      
      const totalInvoiced = ledger.reduce((sum, r) => sum + r.debit, 0);
      const totalPaid = ledger.reduce((sum, r) => sum + r.credit, 0);

      if (balance > 0) {
        totalReceivables += balance;
        debtorCount++;
      } else {
        settledCount++;
      }

      return { ...cust, totalInvoiced, totalPaid, balance };
    });

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>📊 Customer Ledger Accounts</h1>
          <p>Manage customer directories, track outstanding credits, and accept payments</p>
        </div>
      </div>

      <!-- Financial Metrics -->
      <div class="stat-grid">
        <div class="stat-card" style="border-color: rgba(245,158,11,0.2);">
          <div class="stat-icon orange">⏳</div>
          <div class="stat-info">
            <div class="stat-value text-warning">₹${fmt(totalReceivables)}</div>
            <div class="stat-label">Outstanding Receivables</div>
          </div>
        </div>
        <div class="stat-card" style="border-color: rgba(16,185,129,0.2);">
          <div class="stat-icon green">✅</div>
          <div class="stat-info">
            <div class="stat-value text-success">${settledCount}</div>
            <div class="stat-label">Settled Accounts</div>
          </div>
        </div>
        <div class="stat-card" style="border-color: rgba(99,102,241,0.2);">
          <div class="stat-icon purple">👥</div>
          <div class="stat-info">
            <div class="stat-value text-accent">${debtorCount}</div>
            <div class="stat-label">Active Debtors</div>
          </div>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="filter-bar">
        <div class="search-bar" style="flex:1;min-width:260px;">
          <span class="search-icon">🔍</span>
          <input type="text" id="ledger-search" placeholder="Search customers by name, phone, GSTIN..." oninput="Ledger.applyFilters()">
        </div>
        <select class="filter-select" id="filter-ledger-status" onchange="Ledger.applyFilters()">
          <option value="">All Accounts</option>
          <option value="debtor">Outstanding Debtors</option>
          <option value="settled">Settled Accounts</option>
        </select>
      </div>

      <!-- Customers Directory List -->
      <div class="card" style="padding:0;">
        <div class="table-wrapper" style="border:none;">
          <table>
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th>Contact Details</th>
                <th>GSTIN</th>
                <th>Total Billed</th>
                <th>Total Settled</th>
                <th>Outstanding Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="ledger-tbody">
              ${renderCustomerRows(enrichedCustomers)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCustomerRows(custs) {
    if (!custs.length) {
      return `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No customer accounts found</h3>
        <p>Customers are automatically saved here when you create their first invoice.</p>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('invoice-new')">➕ Create First Invoice</button>
      </div></td></tr>`;
    }

    return custs.map(c => {
      const balClass = c.balance > 0 ? 'text-warning font-bold' : 'text-success';
      const balBadge = c.balance > 0 ? `₹${fmt(c.balance)}` : '✅ Settled';
      return `
        <tr>
          <td>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${c.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Added ${new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
          </td>
          <td>
            <div>${c.phone ? '📞 ' + c.phone : '—'}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${c.email || ''}</div>
          </td>
          <td class="td-mono">${c.gstin || '<span class="text-muted">GUEST</span>'}</td>
          <td class="td-mono">₹${fmt(c.totalInvoiced)}</td>
          <td class="td-mono">₹${fmt(c.totalPaid)}</td>
          <td class="td-mono ${balClass}" style="font-size:14px;">${balBadge}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" onclick="App.navigate('ledger-detail','${c.id}')">👁️ View Statement</button>
              ${c.balance > 0 
                ? `<button class="btn btn-success btn-sm" onclick="Ledger.shareWhatsApp('${c.id}')" title="Send WhatsApp follow-up">📱 Remind</button>`
                : ''
              }
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function applyFilters() {
    const q = (document.getElementById('ledger-search')?.value || '').toLowerCase();
    const status = document.getElementById('filter-ledger-status')?.value || '';

    let custs = DB.getCustomers();
    const enriched = custs.map(cust => {
      const ledger = DB.getCustomerLedger(cust.id);
      const balance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
      const totalInvoiced = ledger.reduce((sum, r) => sum + r.debit, 0);
      const totalPaid = ledger.reduce((sum, r) => sum + r.credit, 0);
      return { ...cust, totalInvoiced, totalPaid, balance };
    });

    let filtered = enriched;
    if (q) {
      filtered = filtered.filter(c => 
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.gstin || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    }

    if (status === 'debtor') {
      filtered = filtered.filter(c => c.balance > 0);
    } else if (status === 'settled') {
      filtered = filtered.filter(c => c.balance <= 0);
    }

    const tbody = document.getElementById('ledger-tbody');
    if (tbody) tbody.innerHTML = renderCustomerRows(filtered);
  }

  // ---- Detailed Customer Statement View ----
  function renderDetail(customerId) {
    const c = DB.getCustomer(customerId);
    if (!c) {
      App.showToast('Customer not found!', 'error');
      App.navigate('ledger');
      return;
    }

    const ledger = DB.getCustomerLedger(customerId);
    const totalInvoiced = ledger.reduce((sum, r) => sum + r.debit, 0);
    const totalPaid = ledger.reduce((sum, r) => sum + r.credit, 0);
    const balance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div style="display:flex;align-items:center;gap:12px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('ledger')" style="padding:6px 10px;">← Back</button>
            <h1 style="margin:0;">📊 Ledger Statement: ${c.name}</h1>
          </div>
          <p style="margin-top:6px;padding-left:42px;">GSTIN: ${c.gstin || 'Guest/Unregistered'} · ${c.phone ? 'Phone: ' + c.phone : 'No Phone'}</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-primary" onclick="Ledger.openPaymentModal('${c.id}')">➕ Record Payment</button>
          <button class="btn btn-secondary" onclick="Ledger.printStatement('${c.id}')">🖨️ Print Statement</button>
          ${balance > 0 
            ? `<button class="btn btn-success" onclick="Ledger.shareWhatsApp('${c.id}')">📱 WhatsApp Follow-up</button>`
            : ''
          }
        </div>
      </div>

      <div style="display:grid;grid-template-columns:300px 1fr;gap:22px;align-items:start;">
        <!-- Left: Customer Profile Summary Card -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">👤 Customer Profile</h3>
              <button class="btn btn-secondary btn-sm" onclick="Ledger.openEditCustomerModal('${c.id}')" style="padding:4px 8px;font-size:11px;">✏️ Edit</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
              <div>
                <span class="text-muted" style="font-size:10px;text-transform:uppercase;font-weight:700;">Address</span>
                <div style="font-weight:600;margin-top:2px;line-height:1.4;">${[c.address, c.city, c.state, c.pincode].filter(Boolean).join(', ') || 'No address configured'}</div>
              </div>
              ${c.phone ? `<div>
                <span class="text-muted" style="font-size:10px;text-transform:uppercase;font-weight:700;">Contact Phone</span>
                <div style="font-weight:600;margin-top:2px;">${c.phone}</div>
              </div>` : ''}
              ${c.email ? `<div>
                <span class="text-muted" style="font-size:10px;text-transform:uppercase;font-weight:700;">Email Address</span>
                <div style="font-weight:600;margin-top:2px;">${c.email}</div>
              </div>` : ''}
              <div>
                <span class="text-muted" style="font-size:10px;text-transform:uppercase;font-weight:700;">Registration Date</span>
                <div style="font-weight:600;margin-top:2px;">${new Date(c.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}</div>
              </div>
            </div>
          </div>

          <!-- Totals Cards -->
          <div class="card card-sm" style="background:rgba(255,255,255,0.02);">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Total Billed</div>
            <div class="font-mono font-bold text-accent" style="font-size:20px;margin-top:4px;">₹${fmt(totalInvoiced)}</div>
          </div>

          <div class="card card-sm" style="background:rgba(255,255,255,0.02);">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Total Settled</div>
            <div class="font-mono font-bold text-success" style="font-size:20px;margin-top:4px;">₹${fmt(totalPaid)}</div>
          </div>

          <div class="card card-sm" style="background:${balance > 0 ? 'rgba(245,158,11,0.05)' : 'rgba(16,185,129,0.05)'};border-color:${balance > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'};">
            <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Outstanding Dues</div>
            <div class="font-mono font-bold ${balance > 0 ? 'text-warning' : 'text-success'}" style="font-size:24px;margin-top:4px;">
              ${balance > 0 ? `₹${fmt(balance)}` : '✅ Fully Settled'}
            </div>
          </div>
        </div>

        <!-- Right: Ledger Statement Sheet -->
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="card-header" style="padding:20px 24px;"><h3 class="card-title">📖 Financial Ledger Account Log</h3></div>
          <div class="table-wrapper" style="border:none;border-top:1px solid var(--border);">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Type</th>
                  <th>Reference #</th>
                  <th class="text-right">Debit (+)</th>
                  <th class="text-right">Credit (-)</th>
                  <th class="text-right">Running Balance</th>
                  <th class="text-center" style="width:50px;"></th>
                </tr>
              </thead>
              <tbody>
                ${ledger.length === 0
                  ? `<tr><td colspan="7"><div class="empty-state" style="padding:40px;">
                      <div class="empty-icon">📖</div>
                      <p>No transactions posted on this customer's account yet.</p>
                    </div></td></tr>`
                  : ledger.map(r => {
                      const dateFormatted = new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
                      const typeBadgeColor = r.isInvoice ? 'purple' : (r.isAdvance ? 'info' : 'success');
                      
                      let actionHtml = '';
                      if (r.isReceipt) {
                        actionHtml = `<button class="item-remove-btn" title="Delete payment receipt" onclick="Ledger.deleteReceipt('${r.id}','${c.id}')" style="width:24px;height:24px;font-size:11px;margin:0 auto;">✕</button>`;
                      } else if (r.isInvoice) {
                        actionHtml = `<button class="btn btn-secondary btn-sm" title="Edit invoice" onclick="App.navigate('invoice-edit','${r.id}')" style="padding:4px 8px;font-size:11px;min-width:auto;">✏️</button>`;
                      }

                      return `<tr>
                        <td class="td-mono">${dateFormatted}</td>
                        <td><span class="badge badge-${typeBadgeColor}">${r.type}</span></td>
                        <td>
                          <div style="font-weight:600;">${r.reference}</div>
                          ${r.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">"${r.notes}"</div>` : ''}
                        </td>
                        <td class="td-mono text-right font-bold text-danger">${r.debit > 0 ? '₹' + fmt(r.debit) : '—'}</td>
                        <td class="td-mono text-right font-bold text-success">${r.credit > 0 ? '₹' + fmt(r.credit) : '—'}</td>
                        <td class="td-mono text-right font-bold" style="font-size:14px;color:${r.balance > 0 ? '#f59e0b' : 'var(--success)'}">₹${fmt(Math.abs(r.balance))} ${r.balance > 0 ? 'Dr' : 'Cr'}</td>
                        <td><div class="flex items-center justify-center">${actionHtml}</div></td>
                      </tr>`;
                    }).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Edit Customer Modal -->
      <div id="edit-customer-modal" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">✏️ Edit Customer Profile</h2>
            <button class="modal-close" onclick="Ledger.closeEditCustomerModal()">✕</button>
          </div>
          <form onsubmit="Ledger.saveCustomerProfile(event, '${c.id}')">
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">Customer Name <span class="required">*</span></label>
                <input class="form-control" name="name" value="${c.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">GSTIN</label>
                <input class="form-control font-mono" name="gstin" placeholder="27AAAAA0000A1Z5" maxlength="15" value="${c.gstin || ''}" oninput="this.value=this.value.toUpperCase()">
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input class="form-control" name="address" value="${c.address || ''}">
              </div>
              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label">City</label>
                  <input class="form-control" name="city" value="${c.city || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">State</label>
                  <input class="form-control" name="state" list="state-list-ledger" value="${c.state || ''}">
                  <datalist id="state-list-ledger">
                    ${(typeof STATES !== 'undefined' ? STATES : []).map(s => `<option value="${s}">`).join('')}
                  </datalist>
                </div>
                <div class="form-group">
                  <label class="form-label">PIN Code</label>
                  <input class="form-control" name="pincode" maxlength="6" value="${c.pincode || ''}">
                </div>
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input class="form-control" name="phone" value="${c.phone || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input class="form-control" name="email" value="${c.email || ''}">
                </div>
              </div>
              <div class="divider mt-2"></div>
              <div class="flex gap-3" style="justify-content:flex-end;">
                <button type="button" class="btn btn-secondary" onclick="Ledger.closeEditCustomerModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">💾 Save Profile</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Payment Receipt Modal -->
      <div id="payment-modal" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">💵 Record Customer Payment</h2>
            <button class="modal-close" onclick="Ledger.closePaymentModal()">✕</button>
          </div>
          <form onsubmit="Ledger.savePayment(event, '${c.id}')">
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">Payment Date <span class="required">*</span></label>
                <input class="form-control" name="date" type="date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Amount Received (₹) <span class="required">*</span></label>
                <input class="form-control" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" style="border-color:rgba(16,185,129,0.4);" required id="receipt-amount">
                <span class="form-hint" style="color:var(--success);" id="outstanding-helper">Customer outstanding balance: ₹${fmt(balance)}</span>
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Payment Mode <span class="required">*</span></label>
                  <select class="form-control" name="paymentMode" required>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cash">Cash Payment</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Other">Other Mode</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Reference ID / No.</label>
                  <input class="form-control" name="reference" placeholder="e.g. Transaction ID, Cheque #">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Notes / Remarks</label>
                <textarea class="form-control" name="notes" rows="2" placeholder="e.g. Payment for Invoice #0012, monthly dues clearance"></textarea>
              </div>
              <div class="divider mt-2"></div>
              <div class="flex gap-3" style="justify-content:flex-end;">
                <button type="button" class="btn btn-secondary" onclick="Ledger.closePaymentModal()">Cancel</button>
                <button type="submit" class="btn btn-success">💾 Save Receipt</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ---- Record Payment Receipts Modals ----
  function openPaymentModal(id) {
    document.getElementById('payment-modal')?.classList.remove('hidden');
    document.getElementById('receipt-amount')?.focus();
  }
  function closePaymentModal() {
    document.getElementById('payment-modal')?.classList.add('hidden');
  }

  // ---- Edit Customer Profile Modals ----
  function openEditCustomerModal(id) {
    document.getElementById('edit-customer-modal')?.classList.remove('hidden');
  }
  function closeEditCustomerModal() {
    document.getElementById('edit-customer-modal')?.classList.add('hidden');
  }
  function saveCustomerProfile(e, id) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const updates = {
      name: fd.get('name'),
      gstin: fd.get('gstin') || '',
      address: fd.get('address') || '',
      city: fd.get('city') || '',
      state: fd.get('state') || '',
      pincode: fd.get('pincode') || '',
      phone: fd.get('phone') || '',
      email: fd.get('email') || '',
    };
    DB.updateCustomer(id, updates);
    App.showToast('Customer profile updated successfully!', 'success');
    closeEditCustomerModal();
    renderDetail(id);
  }

  function savePayment(e, customerId) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const payment = {
      customerId,
      date: fd.get('date'),
      amount: Number(fd.get('amount')),
      paymentMode: fd.get('paymentMode'),
      reference: fd.get('reference') || '',
      notes: fd.get('notes') || '',
    };

    DB.addPayment(payment);
    App.showToast('Payment recorded successfully!', 'success');
    closePaymentModal();
    renderDetail(customerId);
  }

  function deleteReceipt(paymentId, customerId) {
    if (!confirm('Are you sure you want to delete this payment receipt? This will recalculate the ledger outstanding balance.')) return;
    DB.deletePayment(paymentId);
    App.showToast('Payment receipt deleted.', 'warning');
    renderDetail(customerId);
  }

  // ---- WhatsApp Credit Follow-up Text Generator ----
  function shareWhatsApp(customerId) {
    const c = DB.getCustomer(customerId);
    const s = DB.getSettings();
    if (!c) return;

    const ledger = DB.getCustomerLedger(customerId);
    const balance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const totalInvoiced = ledger.reduce((sum, r) => sum + r.debit, 0);
    const totalPaid = ledger.reduce((sum, r) => sum + r.credit, 0);

    if (balance <= 0) {
      App.showToast('This customer has no outstanding dues!', 'info');
      return;
    }

    const text = `*Sharma Industries — Payment Reminder*
    
Dear *${c.name}*,

This is a friendly reminder that there is an outstanding balance of *₹${fmt(balance)}* on your ledger account with *Sharma Industries*.

*ACCOUNT STATEMENT SUMMARY*
- Total Billed: ₹${fmt(totalInvoiced)}
- Total Paid: ₹${fmt(totalPaid)}
- *Outstanding Balance: ₹${fmt(balance)}*

Please clear your dues at your earliest convenience. You can make the payment to our Bank Account:

*BANK DETAILS:*
🏦 Bank: ${s.bankName || '—'}
👤 A/C Name: ${s.accountHolder || '—'}
🔢 Account No: ${s.accountNo || '—'}
🔑 IFSC Code: ${s.ifscCode || '—'}
📱 UPI ID: ${s.upiId || '—'}

Thank you for your business!
*Sharma Industries*`;

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      App.showToast('Polite ledger reminder copied to clipboard!', 'success');
      
      // Clean phone number
      const phoneDigits = (c.phone || '').replace(/[^0-9]/g, '');
      const waPhone = phoneDigits.length === 10 ? '91' + phoneDigits : phoneDigits;
      
      const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(text)}`;
      const win = window.open(waUrl, '_blank');
      if (win) win.focus();
    }).catch(err => {
      alert('Unable to copy statement: ' + err);
    });
  }

  // ---- Printable Ledger Statement Window ----
  function printStatement(customerId) {
    const c = DB.getCustomer(customerId);
    const s = DB.getSettings();
    if (!c) return;

    const ledger = DB.getCustomerLedger(customerId);
    const totalInvoiced = ledger.reduce((sum, r) => sum + r.debit, 0);
    const totalPaid = ledger.reduce((sum, r) => sum + r.credit, 0);
    const balance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const upiId = s.upiId;

    // QR Code URL based on outstanding balance
    let qrUrl = null;
    if (upiId && balance > 0) {
      const upiStr = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(s.companyName)}&am=${balance.toFixed(2)}&cu=INR&tn=Statement%20Clearance`;
      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiStr)}&margin=6&bgcolor=ffffff`;
    }

    const t = PRINT_TEMPLATES?.find(tt => tt.id === 'classic') || { color: '#3730a3', accent: '#6366f1', bg: '#eef2ff' };

    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!win) { alert('Popup blocked! Please allow popups for this site.'); return; }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Statement of Account — ${c.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 28px; }
          .no-print { display: flex; gap: 10px; margin-bottom: 18px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; }
          .no-print button { padding: 8px 20px; background: #3730a3; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; }
          .no-print button.close { background: white; color: #333; border: 1px solid #ddd; }
          
          .header { background: ${t.color}; color: white; padding: 20px 24px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .header-left h2 { font-size: 20px; font-weight: 900; letter-spacing: 1px; }
          .header-left p { font-size: 10px; opacity: 0.85; margin-top: 3px; }
          .header-right { text-align: right; }
          .header-right h1 { font-size: 22px; text-transform: uppercase; font-weight: 900; letter-spacing: 1.5px; opacity: 0.95; }
          .header-right p { font-size: 11px; opacity: 0.8; margin-top: 2px; }

          .party-section { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
          .pbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
          .pbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent}; margin-bottom: 6px; letter-spacing: 0.8px; }
          .pbox .nm { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
          .pbox .addr { font-size: 10px; color: #555; line-height: 1.5; }
          
          .summary-strip { display: flex; justify-content: space-between; background: ${t.bg}; border: 1px solid ${t.color}33; border-radius: 6px; padding: 12px 18px; margin-bottom: 20px; }
          .s-item { text-align: center; }
          .s-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #666; }
          .s-value { font-size: 16px; font-weight: 800; margin-top: 4px; font-family: monospace; }

          .ledger-tbl { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .ledger-tbl th { background: #f3f4f6; color: #333; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; text-align: left; border-bottom: 2px solid ${t.color}; }
          .ledger-tbl td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          .ledger-tbl tr:nth-child(even) td { background: #fafafa; }
          .tr { text-align: right; }
          
          .footer-grid { display: grid; grid-template-columns: 1fr 150px 180px; gap: 14px; margin-top: 20px; }
          .bank-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
          .bank-box h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent}; margin-bottom: 6px; }
          .bank-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; }
          .bank-label { color: #888; }
          .bank-val { font-weight: 600; }
          
          .qr-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; }
          .qr-box img { width: 90px; height: 90px; margin-bottom: 4px; border-radius: 4px; }
          .qr-box div { font-size: 9px; font-weight: 700; color: ${t.color}; }

          .sign-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
          .sign-box h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent}; text-align: left; }
          .sign-wrap { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 40px; }
          .sign-wrap img { max-height: 40px; }
          .sign-line { border-top: 1px solid #ccc; padding-top: 4px; font-size: 10px; font-weight: 700; }

          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button onclick="window.print()">🖨️ Print / Save PDF</button>
          <button class="close" onclick="window.close()">✕ Close</button>
        </div>

        <div class="header">
          <div class="header-left">
            <h2>${s.companyName || 'Sharma Industries'}</h2>
            <p>${[s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ')}</p>
            ${s.gstin ? `<p style="font-weight:700;margin-top:2px;">GSTIN: ${s.gstin}</p>` : ''}
          </div>
          <div class="header-right">
            <h1>Statement of Account</h1>
            <p>Period: As of ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div class="party-section">
          <div class="pbox">
            <h4>From Company</h4>
            <div class="nm">${s.companyName || 'Sharma Industries'}</div>
            <div class="addr">${[s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ')}</div>
            ${s.phone ? `<div class="addr">📞 ${s.phone}</div>` : ''}
          </div>
          <div class="pbox">
            <h4>Statement for</h4>
            <div class="nm">${c.name}</div>
            ${c.gstin ? `<div style="font-family:monospace;font-size:10px;font-weight:700;margin-bottom:4px;color:${t.color};">GSTIN: ${c.gstin}</div>` : ''}
            <div class="addr">${[c.address, c.city, c.state, c.pincode].filter(Boolean).join(', ') || 'No address configured'}</div>
            ${c.phone ? `<div class="addr">📞 ${c.phone}</div>` : ''}
          </div>
        </div>

        <div class="summary-strip">
          <div class="s-item">
            <div class="s-label">Total Purchased</div>
            <div class="s-value" style="color:${t.color};">₹${fmt(totalInvoiced)}</div>
          </div>
          <div class="s-item">
            <div class="s-label">Total Paid</div>
            <div class="s-value" style="color:#059669;">₹${fmt(totalPaid)}</div>
          </div>
          <div class="s-item">
            <div class="s-label">Balance Due</div>
            <div class="s-value" style="color:${balance > 0 ? '#d97706' : '#059669'}">
              ₹${fmt(Math.abs(balance))} ${balance > 0 ? 'Dr (Due)' : 'Cr (Advance)'}
            </div>
          </div>
        </div>

        <table class="ledger-tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction Type</th>
              <th>Reference Details</th>
              <th class="tr">Debit (+)</th>
              <th class="tr">Credit (-)</th>
              <th class="tr">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${ledger.map(r => {
              const dateFormatted = new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
              return `<tr>
                <td style="font-family:monospace;">${dateFormatted}</td>
                <td><strong>${r.type}</strong></td>
                <td>${r.reference}</td>
                <td class="tr" style="font-family:monospace;color:#ef4444;">${r.debit > 0 ? '₹' + fmt(r.debit) : '—'}</td>
                <td class="tr" style="font-family:monospace;color:#10b981;">${r.credit > 0 ? '₹' + fmt(r.credit) : '—'}</td>
                <td class="tr" style="font-family:monospace;font-weight:700;color:${r.balance > 0 ? '#b45309' : '#059669'}">
                  ₹${fmt(Math.abs(r.balance))} ${r.balance > 0 ? 'Dr' : 'Cr'}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>

        <div class="footer-grid">
          <div class="bank-box">
            <h4>Settlement Bank Account</h4>
            ${s.bankName ? `<div class="bank-row"><span class="bank-label">Bank</span><span class="bank-val">${s.bankName}</span></div>` : ''}
            ${s.accountHolder ? `<div class="bank-row"><span class="bank-label">Name</span><span class="bank-val">${s.accountHolder}</span></div>` : ''}
            ${s.accountNo ? `<div class="bank-row"><span class="bank-label">A/C No</span><span class="bank-val" style="font-family:monospace;">${s.accountNo}</span></div>` : ''}
            ${s.ifscCode ? `<div class="bank-row"><span class="bank-label">IFSC</span><span class="bank-val" style="font-family:monospace;">${s.ifscCode}</span></div>` : ''}
            ${s.upiId ? `<div class="bank-row"><span class="bank-label">UPI ID</span><span class="bank-val">${s.upiId}</span></div>` : ''}
            ${!(s.bankName || s.accountNo || s.upiId) ? '<p style="font-size:11px;color:#aaa;">Bank details not configured</p>' : ''}
          </div>
          
          ${qrUrl 
            ? `<div class="qr-box">
                <img src="${qrUrl}">
                <div>Scan to Pay Due</div>
              </div>`
            : '<div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;text-align:center;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:11px;">No QR generated</div>'
          }

          <div class="sign-box">
            <h4>For ${s.companyName || 'Sharma Industries'}</h4>
            <div class="sign-wrap">${s.signature ? `<img src="${s.signature}">` : ''}</div>
            <div class="sign-line">Authorized Signatory</div>
          </div>
        </div>

        <div style="text-align:center;margin-top:30px;font-size:10px;color:#aaa;border-top:1px solid #e5e7eb;padding-top:10px;">
          This is a computer generated Statement of Account and requires no physical signature.
        </div>
      </body>
      </html>
    `;

    win.document.write(printHtml);
    win.document.close();
  }

  return { render, applyFilters, renderDetail, openPaymentModal, closePaymentModal, savePayment, deleteReceipt, shareWhatsApp, printStatement, openEditCustomerModal, closeEditCustomerModal, saveCustomerProfile };
})();

```

## File: `.\js\print.js`
```javascript
// ============================================================
// print.js — 12 Invoice Templates + Print  (no tax-rate table)
// ============================================================

// ---- Template definitions (global so invoice.js can access) ----
const PRINT_TEMPLATES = [
  { id:'classic',  name:'Classic Indigo',      shortName:'Indigo',  color:'#3730a3', accent:'#6366f1', bg:'#eef2ff', layout:'standard' },
  { id:'navy',     name:'Bold Navy & Gold',     shortName:'Navy',    color:'#1e3a5f', accent:'#f59e0b', bg:'#fffbeb', layout:'standard' },
  { id:'teal',     name:'Modern Teal',          shortName:'Teal',    color:'#0d9488', accent:'#14b8a6', bg:'#f0fdfa', layout:'standard' },
  { id:'green',    name:'Forest Green',         shortName:'Green',   color:'#14532d', accent:'#16a34a', bg:'#f0fdf4', layout:'standard' },
  { id:'black',    name:'Executive Black',      shortName:'Black',   color:'#1c1917', accent:'#78716c', bg:'#fafaf9', layout:'standard' },
  { id:'slate',    name:'Slate Professional',   shortName:'Slate',   color:'#334155', accent:'#64748b', bg:'#f8fafc', layout:'standard' },
  { id:'minimal',  name:'Minimal Clean',        shortName:'Minimal', color:'#6366f1', accent:'#818cf8', bg:'#f5f3ff', layout:'minimal'  },
  { id:'warmmin',  name:'Warm Minimal',         shortName:'Warm',    color:'#b45309', accent:'#d97706', bg:'#fffbeb', layout:'minimal'  },
  { id:'sunset',   name:'Sunset Orange',        shortName:'Sunset',  color:'#c2410c', accent:'#f97316', bg:'#fff7ed', layout:'centered' },
  { id:'purple',   name:'Royal Purple',         shortName:'Purple',  color:'#6d28d9', accent:'#8b5cf6', bg:'#f5f3ff', layout:'centered' },
  { id:'blue',     name:'Corporate Blue',       shortName:'Blue',    color:'#1d4ed8', accent:'#3b82f6', bg:'#eff6ff', layout:'split'    },
  { id:'coral',    name:'Coral & Rose',         shortName:'Coral',   color:'#9f1239', accent:'#e11d48', bg:'#fff1f2', layout:'split'    },
];

const PrintInvoice = (() => {
  const fmt = (n, d=2) => Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});

  // UPI QR code URL
  function upiQrUrl(upiId, name, amount) {
    if (!upiId) return null;
    const str = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name||'Sharma Industries')}&am=${Number(amount||0).toFixed(2)}&cu=INR&tn=Invoice%20Payment`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(str)}&margin=8&bgcolor=ffffff`;
  }

  // Number → Indian words
  function numToWords(amount) {
    const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function w(n){if(n<20)return a[n];if(n<100)return b[~~(n/10)]+(n%10?' '+a[n%10]:'');if(n<1000)return a[~~(n/100)]+' Hundred'+(n%100?' '+w(n%100):'');if(n<1e5)return w(~~(n/1e3))+' Thousand'+(n%1e3?' '+w(n%1e3):'');if(n<1e7)return w(~~(n/1e5))+' Lakh'+(n%1e5?' '+w(n%1e5):'');return w(~~(n/1e7))+' Crore'+(n%1e7?' '+w(n%1e7):'');}
    const ip=Math.floor(Math.abs(amount)),dp=Math.round((Math.abs(amount)-ip)*100);
    return 'Rupees '+(w(ip)||'Zero')+(dp>0?' and '+w(dp)+' Paise':'');
  }

  // =============================================================
  // SHARED PARTIALS
  // =============================================================
  function sharedCSS(t) {
    return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${t.font||'Arial, sans-serif'}; font-size: 12px; color: #111; background: white; }
    .page { max-width: 820px; margin: 0 auto; padding: 28px; }
    /* ---- Party boxes ---- */
    .party-section { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .pbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; }
    .pbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${t.accent||t.color}; margin-bottom: 5px; }
    .pbox .nm { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
    .pbox .gst { font-family: monospace; font-size: 10px; font-weight: 600; color: ${t.color}; background: ${t.bg||'#f3f4f6'}; padding: 2px 5px; border-radius: 3px; display: inline-block; margin-bottom: 3px; }
    .pbox .addr { font-size: 10px; color: #666; line-height: 1.6; }
    /* ---- Items table ---- */
    .items-tbl { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    .items-tbl th { background: ${t.color}; color: ${t.headerText||'white'}; padding: 7px 8px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    .items-tbl td { padding: 7px 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px; vertical-align: middle; }
    .items-tbl tr:nth-child(even) td { background: ${t.rowAlt||'#fafafa'}; }
    .tr { text-align: right; } .tc { text-align: center; }
    /* ---- Totals ---- */
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 12px; }
    .totals-box { min-width: 240px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
    .trow { display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    .trow:last-child { border-bottom: none; }
    .trow .tl { color: #666; } .trow .tv { font-weight: 700; font-family: monospace; }
    .trow.grand { background: ${t.color}; color: white; font-size: 14px; font-weight: 800; padding: 10px 12px; }
    .trow.grand .tl { color: rgba(255,255,255,0.85); } .trow.grand .tv { color: white; }
    .trow.adv { background: #f0fdf4; } .trow.adv .tl { color: #059669; } .trow.adv .tv { color: #059669; }
    .trow.bal { background: #fefce8; border-top: 2px dashed #f59e0b; }
    .trow.bal .tl { font-weight: 800; } .trow.bal .tv { color: #d97706; font-size: 14px; font-weight: 900; }
    /* ---- Amount words ---- */
    .amt-words { background: ${t.bg||'#eff6ff'}; border: 1px solid ${t.color}33; border-radius: 5px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; }
    .amt-words span { font-weight: 700; }
    /* ---- Footer ---- */
    .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .bbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; }
    .bbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${t.accent||t.color}; margin-bottom: 6px; }
    .brow { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; }
    .brow .bl { color: #888; } .brow .bv { font-weight: 600; }
    .qrbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; text-align: center; }
    .qrbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent||t.color}; margin-bottom: 6px; }
    .qrbox img { width: 100px; height: 100px; display: block; margin: 0 auto 5px; border-radius: 5px; }
    .qrbox .qu { font-size: 10px; color: #555; } .qrbox .qa { font-size: 12px; font-weight: 800; color: ${t.color}; }
    .sbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; display: flex; flex-direction: column; }
    .sbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent||t.color}; margin-bottom: 6px; }
    .sbox .swrap { flex:1; display:flex; align-items:center; justify-content:center; min-height:50px; }
    .sbox img { max-height: 50px; max-width: 130px; }
    .sline { border-top: 1px solid #ccc; padding-top: 5px; font-size: 11px; font-weight: 700; text-align: center; margin-top: 8px; }
    .nbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 12px; }
    .nbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent||t.color}; margin-bottom: 5px; }
    .nbox p { font-size: 11px; color: #555; line-height: 1.7; white-space: pre-line; }
    .inv-footer-line { text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #e5e7eb; padding-top: 8px; }
    @media print { body{print-color-adjust:exact;-webkit-print-color-adjust:exact;} .no-print{display:none!important;} .page{padding:12px;} }
    `;
  }

  function printControls() {
    return `<div class="no-print" style="display:flex;gap:10px;margin-bottom:18px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb;">
      <button onclick="window.print()" style="padding:8px 20px;background:#3730a3;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ Print / Save PDF</button>
      <button onclick="window.close()" style="padding:8px 14px;background:white;color:#333;border:1px solid #ddd;border-radius:6px;font-size:13px;cursor:pointer;">✕ Close</button>
      <span style="font-size:11px;color:#888;align-self:center;">Tip: Print dialog → "Save as PDF"</span>
    </div>`;
  }

  function partySection(inv) {
    const s = inv.seller||{}, c = inv.customer||{};
    return `<div class="party-section">
      <div class="pbox">
        <h4>Bill From</h4>
        <div class="nm">${s.companyName||'Sharma Industries'}</div>
        ${s.gstin?`<div class="gst">GSTIN: ${s.gstin}</div>`:''}
        <div class="addr">${[s.address,s.city,s.district?`Dist. ${s.district}`:'',s.state+(s.stateCode?` (${s.stateCode})`:''),s.pincode].filter(Boolean).join(', ')}</div>
        ${s.phone?`<div class="addr">📞 ${s.phone}</div>`:''}
      </div>
      <div class="pbox">
        <h4>Bill To</h4>
        <div class="nm">${c.name||'—'}</div>
        ${c.gstin?`<div class="gst">GSTIN: ${c.gstin}</div>`:''}
        <div class="addr">${[c.address,c.city,c.state,c.pincode].filter(Boolean).join(', ')}</div>
        ${c.phone?`<div class="addr">📞 ${c.phone}</div>`:''}
      </div>
    </div>`;
  }

  function itemsTable(inv, t) {
    const isIncl = inv.taxType === 'inclusive';
    const rows = (inv.items||[]).map((item,i) => {
      const taxable = item._taxable ?? (item.qty * item.rate * (1-(item.discount||0)/100));
      const gstAmt  = item._gstAmt  ?? (taxable * item.gstRate / 100);
      const total   = item._total   ?? (taxable + gstAmt);
      return `<tr>
        <td>${i+1}</td>
        <td><strong>${item.name}</strong></td>
        <td style="font-family:monospace;font-size:10px;">${item.hsnCode||'—'}</td>
        <td class="tc">${fmt(item.qty,2)} ${item.unit||''}</td>
        <td class="tr">${fmt(item.rate)}</td>
        <td class="tc">${item.discount||0}%</td>
        <td class="tc">${item.gstRate}%</td>
        <td class="tr"><strong>${fmt(total)}</strong></td>
      </tr>`;
    }).join('');
    return `<table class="items-tbl">
      <thead><tr>
        <th>#</th><th>Description of Goods</th><th>HSN</th><th class="tc">Qty & Unit</th>
        <th class="tr">Rate ₹<br><span style="font-size:8px;font-weight:400;">(${isIncl?'Incl.':'Excl.'} GST)</span></th>
        <th class="tc">Disc%</th><th class="tc">GST%</th><th class="tr">Total ₹</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function totalsSection(inv) {
    const isInter = inv.supplyType === 'inter';
    const advance = Number(inv.advance||0);
    const bal = Number(inv.balanceDue ?? Math.max(0,(inv.grandTotal||0)-advance));
    return `
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="trow"><span class="tl">Subtotal</span><span class="tv">₹${fmt(inv.subtotal)}</span></div>
        ${inv.discount?`<div class="trow"><span class="tl">Discount</span><span class="tv" style="color:#ef4444;">- ₹${fmt(inv.discount)}</span></div>`:''}
        ${isInter
          ?`<div class="trow"><span class="tl">IGST</span><span class="tv">₹${fmt(inv.igst)}</span></div>`
          :`<div class="trow"><span class="tl">CGST</span><span class="tv">₹${fmt(inv.cgst)}</span></div>
            <div class="trow"><span class="tl">SGST</span><span class="tv">₹${fmt(inv.sgst)}</span></div>`}
        ${inv.freight?`<div class="trow"><span class="tl">Freight</span><span class="tv">₹${fmt(inv.freight)}</span></div>`:''}
        ${inv.roundOff?`<div class="trow"><span class="tl">Round Off</span><span class="tv">₹${fmt(inv.roundOff)}</span></div>`:''}
        <div class="trow grand"><span class="tl">Grand Total</span><span class="tv">₹${fmt(inv.grandTotal)}</span></div>
        ${advance>0?`
        <div class="trow adv"><span class="tl">Advance Paid</span><span class="tv">- ₹${fmt(advance)}</span></div>
        <div class="trow bal"><span class="tl">Balance Due</span><span class="tv">₹${fmt(bal)}</span></div>`:''}
      </div>
    </div>
    <div class="amt-words">
      ${advance>0
        ?`Grand Total: <span>${numToWords(inv.grandTotal)} Only</span> &nbsp;|&nbsp; Balance Due: <span style="color:#d97706;">${numToWords(bal)} Only</span>`
        :`Amount in words: <span>${numToWords(inv.grandTotal)} Only</span>`}
    </div>`;
  }

  function footerSection(inv, t) {
    const s = inv.seller||{};
    const advance = Number(inv.advance||0);
    const bal = Number(inv.balanceDue ?? Math.max(0,(inv.grandTotal||0)-advance));
    const qrUrl = upiQrUrl(s.upiId, s.companyName, bal>0?bal:inv.grandTotal);
    const rightSide = qrUrl
      ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="qrbox"><h4>Pay via UPI</h4>
            <img src="${qrUrl}" onerror="this.style.display='none'">
            <div class="qu">${s.upiId}</div>
            <div class="qa">₹${fmt(bal>0?bal:inv.grandTotal)}</div>
            <div style="font-size:9px;color:#aaa;margin-top:2px;">Scan to pay${advance>0?' (Balance)':''}</div>
          </div>
          <div class="sbox"><h4>For ${s.companyName||'Sharma Industries'}</h4>
            <div class="swrap">${s.signature?`<img src="${s.signature}" alt="Sign">`:''}</div>
            <div class="sline">Authorized Signatory</div>
          </div>
        </div>`
      : `<div class="sbox"><h4>For ${s.companyName||'Sharma Industries'}</h4>
          <div class="swrap">${s.signature?`<img src="${s.signature}" alt="Sign">`:''}</div>
          <div class="sline">Authorized Signatory</div>
        </div>`;
    const bankHtml = (s.bankName||s.accountNo||s.ifscCode||s.upiId)
      ? `${s.bankName?`<div class="brow"><span class="bl">Bank</span><span class="bv">${s.bankName}</span></div>`:''}
         ${s.accountHolder?`<div class="brow"><span class="bl">Name</span><span class="bv">${s.accountHolder}</span></div>`:''}
         ${s.accountNo?`<div class="brow"><span class="bl">A/C No</span><span class="bv" style="font-family:monospace;">${s.accountNo}</span></div>`:''}
         ${s.ifscCode?`<div class="brow"><span class="bl">IFSC</span><span class="bv" style="font-family:monospace;">${s.ifscCode}</span></div>`:''}
         ${s.upiId?`<div class="brow"><span class="bl">UPI</span><span class="bv">${s.upiId}</span></div>`:''}`
      : `<p style="font-size:11px;color:#aaa;">Bank details not configured</p>`;
    return `
    <div class="footer-grid">
      <div class="bbox"><h4>Bank Details</h4>${bankHtml}</div>
      ${rightSide}
    </div>
    ${inv.notes?`<div class="nbox"><h4>Terms & Conditions</h4><p>${inv.notes}</p></div>`:''}
    <div class="inv-footer-line">${s.companyName||'Sharma Industries'}${s.gstin?' · GSTIN: '+s.gstin:''} · Computer Generated Invoice</div>`;
  }

  // =============================================================
  // LAYOUT 1: STANDARD (Logo left, TAX INVOICE right, full header)
  // =============================================================
  function buildStandard(inv, t) {
    const s = inv.seller||{};
    const dateStr = inv.date ? new Date(inv.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    const dueStr  = inv.dueDate ? new Date(inv.dueDate+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Invoice ${inv.invoiceNo||''} · ${s.companyName||''}</title>
<style>${sharedCSS(t)}
.header { background: ${t.color}; color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.logo-circle { width: 52px; height: 52px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; flex-shrink: 0; }
.co-name { font-size: 19px; font-weight: 900; }
.co-addr { font-size: 10px; opacity: 0.8; margin-top: 2px; line-height: 1.5; }
.co-gstin { font-family: monospace; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 2px 7px; border-radius: 4px; margin-top: 4px; display: inline-block; }
.inv-title { text-align: right; }
.inv-title h2 { font-size: 22px; font-weight: 900; letter-spacing: 2px; opacity: 0.9; text-transform: uppercase; }
.inv-title .ino { font-size: 13px; font-weight: 700; font-family: monospace; margin-top: 3px; }
.inv-title .idate { font-size: 11px; opacity: 0.8; margin-top: 2px; }
.meta-bar { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 14px; background: ${t.bg||'#f8fafc'}; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
.meta-item label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; display: block; }
.meta-item span { font-size: 12px; font-weight: 700; color: #111; }
</style></head><body><div class="page">
${printControls()}
<div class="header">
  <div class="header-left">
    ${s.logo?`<img src="${s.logo}" style="width:52px;height:52px;object-fit:contain;border-radius:8px;">`
      :`<div class="logo-circle">SI</div>`}
    <div>
      <div class="co-name">${s.companyName||'Sharma Industries'}</div>
      <div class="co-addr">${[s.address,s.city,s.state,s.pincode].filter(Boolean).join(', ')}</div>
      ${s.gstin?`<div class="co-gstin">GSTIN: ${s.gstin}</div>`:''}
    </div>
  </div>
  <div class="inv-title">
    <h2>Tax Invoice</h2>
    <div class="ino"># ${inv.invoiceNo||''}</div>
    <div class="idate">Date: ${dateStr}</div>
    ${dueStr?`<div class="idate">Due: ${dueStr}</div>`:''}
  </div>
</div>
<div class="meta-bar">
  <div class="meta-item"><label>Supply Type</label><span>${inv.supplyType==='inter'?'Inter-State':'Intra-State'}</span></div>
  <div class="meta-item"><label>Tax in Prices</label><span>${inv.taxType==='inclusive'?'GST Inclusive':'GST Exclusive'}</span></div>
  <div class="meta-item"><label>Payment Mode</label><span>${inv.paymentMode||'—'}</span></div>
</div>
${partySection(inv)}
${itemsTable(inv,t)}
${totalsSection(inv)}
${footerSection(inv,t)}
</div></body></html>`;
  }

  // =============================================================
  // LAYOUT 2: MINIMAL (No colored header — top accent border only)
  // =============================================================
  function buildMinimal(inv, t) {
    const s = inv.seller||{};
    const dateStr = inv.date ? new Date(inv.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    const dueStr  = inv.dueDate ? new Date(inv.dueDate+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Invoice ${inv.invoiceNo||''} · ${s.companyName||''}</title>
<style>${sharedCSS(t)}
body { border-top: 5px solid ${t.color}; }
.header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.logo-sq { width: 48px; height: 48px; background: ${t.color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: white; flex-shrink: 0; }
.co-name { font-size: 17px; font-weight: 900; color: #111; }
.co-meta { font-size: 10px; color: #666; margin-top: 2px; line-height: 1.5; }
.co-gstin { font-family: monospace; font-size: 10px; font-weight: 700; color: ${t.color}; background: ${t.bg||'#f5f3ff'}; padding: 2px 5px; border-radius: 3px; display: inline-block; margin-top: 3px; }
.inv-title { text-align: right; }
.inv-title h2 { font-size: 20px; font-weight: 900; color: ${t.color}; text-transform: uppercase; letter-spacing: 1px; }
.inv-title .ino { font-size: 12px; font-weight: 700; color: #333; font-family: monospace; margin-top: 3px; }
.inv-title .idate { font-size: 11px; color: #666; margin-top: 2px; }
.tax-badge { display: inline-block; background: ${t.bg||'#f5f3ff'}; color: ${t.color}; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid ${t.color}33; margin-top: 3px; }
.items-tbl th { background: ${t.bg||'#f5f3ff'}; color: #333; border-bottom: 2px solid ${t.color}; }
.trow.grand { background: ${t.color}; }
</style></head><body><div class="page">
${printControls()}
<div class="header">
  <div class="header-left">
    ${s.logo?`<img src="${s.logo}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;">`
      :`<div class="logo-sq">SI</div>`}
    <div>
      <div class="co-name">${s.companyName||'Sharma Industries'}</div>
      <div class="co-meta">${[s.address,s.city,s.state,s.pincode].filter(Boolean).join(', ')}</div>
      ${s.phone?`<div class="co-meta">📞 ${s.phone}${s.email?' · '+s.email:''}</div>`:''}
      ${s.gstin?`<div class="co-gstin">GSTIN: ${s.gstin}</div>`:''}
    </div>
  </div>
  <div class="inv-title">
    <h2>Tax Invoice</h2>
    <div class="ino"># ${inv.invoiceNo||''}</div>
    <div class="idate">Date: ${dateStr}${dueStr?' · Due: '+dueStr:''}</div>
    <div><span class="tax-badge">${inv.taxType==='inclusive'?'GST Inclusive':'GST Exclusive'}</span></div>
    <div style="font-size:11px;color:#666;margin-top:3px;">${inv.supplyType==='inter'?'Inter-State (IGST)':'Intra-State (CGST+SGST)'}</div>
  </div>
</div>
${partySection(inv)}
${itemsTable(inv,t)}
${totalsSection(inv)}
${footerSection(inv,t)}
</div></body></html>`;
  }

  // =============================================================
  // LAYOUT 3: CENTERED (Company name + logo centered in header)
  // =============================================================
  function buildCentered(inv, t) {
    const s = inv.seller||{};
    const dateStr = inv.date ? new Date(inv.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    const dueStr  = inv.dueDate ? new Date(inv.dueDate+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Invoice ${inv.invoiceNo||''} · ${s.companyName||''}</title>
<style>${sharedCSS(t)}
.header { background: linear-gradient(135deg, ${t.color}, ${t.accent}); color: white; padding: 22px 24px; text-align: center; margin-bottom: 0; }
.header img { width: 56px; height: 56px; object-fit: contain; border-radius: 10px; margin-bottom: 8px; }
.logo-cir { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; margin-bottom: 8px; }
.co-name { font-size: 20px; font-weight: 900; letter-spacing: 1px; }
.co-addr { font-size: 10px; opacity: 0.85; margin-top: 3px; }
.co-gstin { font-family: monospace; font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 2px 7px; border-radius: 4px; margin-top: 4px; display: inline-block; }
.inv-bar { background: #1f2937; color: white; display: flex; align-items: center; justify-content: space-between; padding: 10px 24px; margin-bottom: 14px; font-size: 12px; }
.inv-bar .title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: ${t.accent}; }
.inv-bar .meta { text-align: right; line-height: 1.6; }
.inv-bar .meta strong { font-family: monospace; }
.tax-pill { background: ${t.bg||'#fff7ed'}; color: ${t.color}; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-top: 3px; }
</style></head><body><div class="page">
${printControls()}
<div class="header">
  ${s.logo?`<img src="${s.logo}" alt="Logo">`:`<div class="logo-cir">SI</div>`}
  <div class="co-name">${s.companyName||'Sharma Industries'}</div>
  <div class="co-addr">${[s.address,s.city,s.district?`Dist. ${s.district}`:'',s.state,s.pincode].filter(Boolean).join(' · ')}</div>
  ${s.phone?`<div class="co-addr">📞 ${s.phone}${s.email?' · ✉ '+s.email:''}</div>`:''}
  ${s.gstin?`<div class="co-gstin">GSTIN: ${s.gstin}</div>`:''}
</div>
<div class="inv-bar">
  <span class="title">Tax Invoice</span>
  <div class="meta">
    <div># <strong>${inv.invoiceNo||''}</strong></div>
    <div>Date: ${dateStr}${dueStr?'  · Due: '+dueStr:''}</div>
    <div><span class="tax-pill">${inv.taxType==='inclusive'?'GST Inclusive':'GST Exclusive'}</span></div>
  </div>
</div>
${partySection(inv)}
${itemsTable(inv,t)}
${totalsSection(inv)}
${footerSection(inv,t)}
</div></body></html>`;
  }

  // =============================================================
  // LAYOUT 4: SPLIT (Two-column header boxes)
  // =============================================================
  function buildSplit(inv, t) {
    const s = inv.seller||{};
    const dateStr = inv.date ? new Date(inv.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    const dueStr  = inv.dueDate ? new Date(inv.dueDate+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Invoice ${inv.invoiceNo||''} · ${s.companyName||''}</title>
<style>${sharedCSS(t)}
.header { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 14px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.header-company { background: ${t.color}; color: white; padding: 18px; display: flex; align-items: flex-start; gap: 12px; }
.logo-sq { width: 46px; height: 46px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; flex-shrink: 0; }
.co-name { font-size: 16px; font-weight: 900; margin-bottom: 3px; }
.co-addr { font-size: 10px; opacity: 0.85; line-height: 1.5; }
.co-gstin { font-family: monospace; font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 2px 5px; border-radius: 3px; display: inline-block; margin-top: 4px; }
.header-inv { background: ${t.bg||'#f8fafc'}; padding: 18px; }
.header-inv h2 { font-size: 18px; font-weight: 900; color: ${t.color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.irow { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
.irow .il { color: #888; } .irow .iv { font-weight: 700; font-family: monospace; }
.tax-pill { background: ${t.color}; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; display: inline-block; }
</style></head><body><div class="page">
${printControls()}
<div class="header">
  <div class="header-company">
    ${s.logo?`<img src="${s.logo}" style="width:46px;height:46px;object-fit:contain;border-radius:7px;">`
      :`<div class="logo-sq">SI</div>`}
    <div>
      <div class="co-name">${s.companyName||'Sharma Industries'}</div>
      <div class="co-addr">${[s.address,s.city,s.district?`Dist. ${s.district}`:'',s.state,s.pincode].filter(Boolean).join(', ')}</div>
      ${s.phone?`<div class="co-addr">📞 ${s.phone}</div>`:''}
      ${s.gstin?`<div class="co-gstin">GSTIN: ${s.gstin}</div>`:''}
    </div>
  </div>
  <div class="header-inv">
    <h2>Tax Invoice</h2>
    <div class="irow"><span class="il">Invoice #</span><span class="iv">${inv.invoiceNo||'—'}</span></div>
    <div class="irow"><span class="il">Date</span><span class="iv">${dateStr}</span></div>
    ${dueStr?`<div class="irow"><span class="il">Due Date</span><span class="iv">${dueStr}</span></div>`:''}
    <div class="irow"><span class="il">Supply</span><span class="iv">${inv.supplyType==='inter'?'Inter-State':'Intra-State'}</span></div>
    <div class="irow"><span class="il">Payment</span><span class="iv">${inv.paymentMode||'—'}</span></div>
    <div class="irow"><span class="il">Tax Type</span><span><span class="tax-pill">${inv.taxType==='inclusive'?'Incl. GST':'Excl. GST'}</span></span></div>
  </div>
</div>
${partySection(inv)}
${itemsTable(inv,t)}
${totalsSection(inv)}
${footerSection(inv,t)}
</div></body></html>`;
  }

  // =============================================================
  // DISPATCHER
  // =============================================================
  function buildHTML(inv) {
    const tmpl = PRINT_TEMPLATES.find(tt => tt.id === (inv.template||'classic')) || PRINT_TEMPLATES[0];
    switch(tmpl.layout) {
      case 'minimal':  return buildMinimal(inv, tmpl);
      case 'centered': return buildCentered(inv, tmpl);
      case 'split':    return buildSplit(inv, tmpl);
      default:         return buildStandard(inv, tmpl);
    }
  }

  function open(inv, autoPrint = false) {
    const win = window.open('', '_blank', 'width=940,height=760,scrollbars=yes');
    if (!win) { alert('Popup blocked! Please allow popups for this site.'); return; }
    win.document.write(buildHTML(inv));
    win.document.close();
    if (autoPrint) win.onload = () => { win.focus(); win.print(); };
  }

  return { open, buildHTML, TEMPLATES: PRINT_TEMPLATES };
})();

```

## File: `.\js\products.js`
```javascript
// ============================================================
// products.js — Product Catalog Page
// ============================================================

const Products = (() => {
  let editingId = null;

  const RAW_MATERIAL_CATEGORIES = [
    'Raw Materials - Pigments',
    'Raw Materials - Binders',
    'Raw Materials - Fillers',
    'Solvents',
    'Chemicals',
    'Packaging',
    'Other Raw Materials'
  ];

  function render(param = null) {
    const allProducts = DB.getProducts();
    const products = allProducts.filter(p => !RAW_MATERIAL_CATEGORIES.includes(p.category));
    const lowStock = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>📦 Product Catalog & Inventory</h1>
          <p>${products.length} products · ${lowStock > 0 ? `<span class="text-warning">${lowStock} low stock</span>` : ''} ${outOfStock > 0 ? `· <span class="text-danger">${outOfStock} out of stock</span>` : ''}</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-primary" onclick="Products.openModal()">
            ➕ Add Product
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn active" id="tab-btn-cards" onclick="Products.switchTab('cards')">📦 Product Cards</button>
        <button class="tab-btn" id="tab-btn-inventory" onclick="Products.switchTab('inventory')">📊 Inventory Control</button>
      </div>

      <!-- Tab Content: Product Cards Grid -->
      <div id="tab-cards" class="tab-content active">
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="product-search" placeholder="Search products, HSN, SKU..." oninput="Products.applyFilters()">
          </div>
          <select class="filter-select" id="filter-category" onchange="Products.applyFilters()">
            <option value="">All Categories</option>
            ${[...new Set(products.map(p => p.category).filter(Boolean))].map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <select class="filter-select" id="filter-gst" onchange="Products.applyFilters()">
            <option value="">All GST Rates</option>
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
          <select class="filter-select" id="filter-stock" onchange="Products.applyFilters()">
            <option value="">All Stock</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div id="product-grid" class="product-grid">
          ${renderProductCards(products)}
        </div>
      </div>

      <!-- Tab Content: Inventory Table -->
      <div id="tab-inventory" class="tab-content">
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="card-header" style="padding:20px 24px;"><h3 class="card-title">📊 Stock Adjustment & Ledger Log</h3></div>
          <div class="table-wrapper" style="border:none;border-top:1px solid var(--border);">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>HSN</th>
                  <th class="text-right">Min Stock</th>
                  <th class="text-right">Current Stock</th>
                  <th>Status</th>
                  <th>Quick Adjustment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="inventory-tbody">
                ${renderInventoryRows(products)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (param === 'new') {
      setTimeout(() => openModal(), 50);
    } else if (param && param.startsWith('PROD_')) {
      setTimeout(() => openModal(param), 50);
    }
  }

  function renderProductCards(products) {
    if (!products.length) {
      return `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📦</div>
        <h3>No products found</h3>
        <p>Add your first product to get started</p>
        <button class="btn btn-primary" onclick="Products.openModal()">➕ Add Product</button>
      </div>`;
    }
    return products.map(p => {
      const stockStatus = p.stock === 0 ? 'critical' : (p.stock <= (p.minStock || 10) ? 'low' : 'ok');
      const stockLabel = p.stock === 0 ? '❌ Out of Stock' : (stockStatus === 'low' ? `⚠️ Low: ${p.stock} ${p.unit || ''}` : `✅ ${p.stock} ${p.unit || ''}`);
      const imgHtml = p.image
        ? `<img src="${p.image}" alt="${p.name}" class="product-img">`
        : `<div class="product-img-placeholder">📦</div>`;
      return `
        <div class="product-card" onclick="Products.openModal('${p.id}')">
          <div class="product-img-wrap">${imgHtml}</div>
          <div class="product-body">
            <div class="product-category">${p.category || 'Uncategorized'}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-desc">${p.description || 'No description'}</div>
            <div class="product-meta">
              <span class="product-meta-item">HSN: ${p.hsnCode || '—'}</span>
              <span class="product-meta-item">GST: ${p.gstRate || 0}%</span>
              <span class="product-meta-item">SKU: ${p.sku || '—'}</span>
              <span class="product-meta-item">Unit: ${p.unit || 'Pcs'}</span>
            </div>
            <div class="product-footer">
              <div class="product-price">₹${Number(p.sellingPrice || 0).toLocaleString('en-IN')} <span>/ ${p.unit || 'Pcs'}</span></div>
              <div class="product-stock ${stockStatus}">${stockLabel}</div>
            </div>
            <div class="product-actions" onclick="event.stopPropagation()">
              <button class="btn btn-secondary btn-sm flex-1" onclick="Products.openModal('${p.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="Products.deleteProduct('${p.id}')">🗑️</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function applyFilters() {
    const q = document.getElementById('product-search')?.value.toLowerCase() || '';
    const cat = document.getElementById('filter-category')?.value || '';
    const gst = document.getElementById('filter-gst')?.value || '';
    const stock = document.getElementById('filter-stock')?.value || '';

    let products = DB.getProducts().filter(p => !RAW_MATERIAL_CATEGORIES.includes(p.category));
    if (q) products = products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.hsnCode || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    if (cat) products = products.filter(p => p.category === cat);
    if (gst) products = products.filter(p => String(p.gstRate) === gst);
    if (stock === 'ok') products = products.filter(p => p.stock > (p.minStock || 10));
    else if (stock === 'low') products = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10));
    else if (stock === 'out') products = products.filter(p => p.stock === 0);

    const grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = renderProductCards(products);
  }

  function openModal(id = null) {
    editingId = id;
    const prod = id ? DB.getProduct(id) : null;
    const v = prod || {};

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'product-modal';
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">${id ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
          <button class="modal-close" onclick="Products.closeModal()">✕</button>
        </div>
        <form id="product-form" onsubmit="Products.saveProduct(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">
            <!-- Left: Image -->
            <div>
              <div class="form-label">Product Image</div>
              <div class="image-upload-area" id="upload-area" ondragover="Products.onDragOver(event)" ondrop="Products.onDrop(event)">
                <input type="file" id="product-image-file" accept="image/*" onchange="Products.onImageChange(event)">
                <div id="upload-preview-wrap">
                  ${v.image
                    ? `<img src="${v.image}" class="upload-preview" id="upload-img-preview"><div class="upload-text">Click or drag to change</div>`
                    : `<div class="upload-icon">🖼️</div><div class="upload-text">Click or drag image here</div><div class="upload-hint">PNG, JPG, WEBP up to 5MB</div>`
                  }
                </div>
              </div>
            </div>
            <!-- Right: Basic Info -->
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">Product Name <span class="required">*</span></label>
                <input class="form-control" name="name" placeholder="e.g. Steel Rod 10mm" value="${v.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <input class="form-control" name="category" list="category-list" placeholder="e.g. Steel Products" value="${v.category || ''}">
                <datalist id="category-list">
                  ${[...new Set(DB.getProducts().filter(p => !RAW_MATERIAL_CATEGORIES.includes(p.category)).map(p => p.category).filter(Boolean))].map(c => `<option value="${c}">`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">SKU / Barcode</label>
                <input class="form-control" name="sku" placeholder="e.g. SR-10MM" value="${v.sku || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">HSN Code <span class="required">*</span></label>
                <input class="form-control" name="hsnCode" placeholder="e.g. 7214" value="${v.hsnCode || ''}" required>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-group mb-4">
            <label class="form-label">Description</label>
            <textarea class="form-control" name="description" placeholder="Product description, specifications, usage..." rows="3">${v.description || ''}</textarea>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Unit of Measure</label>
              <select class="form-control" name="unit">
                ${['Pcs','Kg','Nos','Mtr','Ltr','Box','Set','Pair','Roll','Sheet','Ton','Quintal'].map(u =>
                  `<option value="${u}" ${v.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">GST Rate <span class="required">*</span></label>
              <select class="form-control" name="gstRate" required>
                ${[0,5,12,18,28].map(r =>
                  `<option value="${r}" ${String(v.gstRate) === String(r) ? 'selected' : ''}>${r}%</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Manufacturing Cost (₹)</label>
              <input class="form-control" name="purchasePrice" type="number" step="0.01" min="0" placeholder="0.00" value="${v.purchasePrice || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Selling Price (₹) <span class="required">*</span></label>
              <input class="form-control" name="sellingPrice" type="number" step="0.01" min="0" placeholder="0.00" value="${v.sellingPrice || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Current Stock</label>
              <input class="form-control" name="stock" type="number" min="0" placeholder="0" value="${v.stock ?? ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Min Stock Alert</label>
              <input class="form-control" name="minStock" type="number" min="0" placeholder="10" value="${v.minStock ?? ''}">
            </div>
          </div>

          <div class="divider"></div>
          <div class="flex gap-3" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" onclick="Products.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">💾 ${id ? 'Update' : 'Save'} Product</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Products.closeModal(); });

    // Store base64 image
    modal._imageData = v.image || '';
  }

  function closeModal() {
    document.getElementById('product-modal')?.remove();
    editingId = null;
  }

  function onImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const modal = document.getElementById('product-modal');
      if (modal) modal._imageData = ev.target.result;
      document.getElementById('upload-preview-wrap').innerHTML =
        `<img src="${ev.target.result}" class="upload-preview" id="upload-img-preview"><div class="upload-text">Click or drag to change</div>`;
    };
    reader.readAsDataURL(file);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
  function onDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const modal = document.getElementById('product-modal');
        if (modal) modal._imageData = ev.target.result;
        document.getElementById('upload-preview-wrap').innerHTML =
          `<img src="${ev.target.result}" class="upload-preview" id="upload-img-preview"><div class="upload-text">Click or drag to change</div>`;
      };
      reader.readAsDataURL(file);
    }
  }

  function saveProduct(e) {
    e.preventDefault();
    const form = e.target;
    const modal = document.getElementById('product-modal');
    const fd = new FormData(form);
    const data = {
      name: fd.get('name'),
      category: fd.get('category'),
      sku: fd.get('sku'),
      hsnCode: fd.get('hsnCode'),
      description: fd.get('description'),
      unit: fd.get('unit'),
      gstRate: Number(fd.get('gstRate')),
      purchasePrice: Number(fd.get('purchasePrice')) || 0,
      sellingPrice: Number(fd.get('sellingPrice')),
      stock: Number(fd.get('stock')) || 0,
      minStock: Number(fd.get('minStock')) || 10,
      image: modal?._imageData || '',
    };

    if (editingId) {
      DB.updateProduct(editingId, data);
      App.showToast('Product updated successfully!', 'success');
    } else {
      DB.addProduct(data);
      App.showToast('Product added successfully!', 'success');
    }
    closeModal();
    render();
  }

  function deleteProduct(id) {
    const prod = DB.getProduct(id);
    if (!confirm(`Delete "${prod?.name}"? This cannot be undone.`)) return;
    DB.deleteProduct(id);
    App.showToast('Product deleted.', 'warning');
    render();
  }

  // ============================================================
  // STOCK MANAGEMENT CONTROLS & LEDGER
  // ============================================================
  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `tab-btn-${tab}`);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tab}`);
    });
  }

  function renderInventoryRows(products) {
    if (!products.length) {
      return `<tr><td colspan="8"><div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No products found</h3>
        <p>Create a product to view stock settings</p>
      </div></td></tr>`;
    }

    return products.map(p => {
      const stockStatus = p.stock === 0 ? 'critical' : (p.stock <= (p.minStock || 10) ? 'low' : 'ok');
      const stockLabel = p.stock === 0 ? '❌ Out' : (stockStatus === 'low' ? `⚠️ Low` : `✅ Good`);
      const badgeMap = { critical: 'danger', low: 'warning', ok: 'success' };
      
      return `
        <tr>
          <td>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${p.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">SKU: ${p.sku || '—'}</div>
          </td>
          <td><span class="badge badge-muted" style="padding:2px 6px;">${p.category || 'General'}</span></td>
          <td class="td-mono">${p.hsnCode || '—'}</td>
          <td class="td-mono text-right" style="font-size:13px;">${p.minStock || 10} ${p.unit || ''}</td>
          <td class="td-mono text-right font-bold" style="font-size:15px;color:${stockStatus==='critical'?'var(--danger)':(stockStatus==='low'?'#f59e0b':'var(--success)')}">${p.stock} ${p.unit || ''}</td>
          <td><span class="badge badge-${badgeMap[stockStatus]}">${stockLabel}</span></td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-success btn-sm" onclick="Products.openAdjustModal('${p.id}', 'add')" style="padding:4px 8px;font-size:11px;">➕ Receive</button>
              <button class="btn btn-danger btn-sm" onclick="Products.openAdjustModal('${p.id}', 'sub')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.15);">➖ Reduce</button>
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" onclick="Products.openLedgerModal('${p.id}')">👁️ Logs</button>
              <button class="btn btn-danger btn-sm" onclick="Products.deleteProduct('${p.id}')" style="padding:5px 8px;background:rgba(239,68,68,0.15);" title="Delete Product">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function openAdjustModal(productId, action) {
    const p = DB.getProduct(productId);
    if (!p) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'adjust-modal';
    
    const title = action === 'add' ? '➕ Receive Paint / Raw Materials' : '➖ Reduce Paint / Raw Materials';
    const label = action === 'add' ? 'Quantity to Add / Restock' : 'Quantity to Reduce / Deduct';
    const btnText = action === 'add' ? '➕ Add Stock' : '➖ Reduce Stock';
    const btnClass = action === 'add' ? 'btn-success' : 'btn-danger';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" onclick="Products.closeAdjustModal()">✕</button>
        </div>
        <form onsubmit="Products.saveStockAdjustment(event, '${p.id}', '${action}')">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="font-size:14px;background:rgba(255,255,255,0.02);padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);">
              <strong>Product:</strong> ${p.name}<br>
              <strong>Current Stock Level:</strong> <span class="font-mono text-accent" style="font-weight:700;">${p.stock} ${p.unit||''}</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">${label} <span class="required">*</span></label>
              <input class="form-control" name="qty" type="number" step="0.01" min="0.01" placeholder="0.00" required id="adjust-qty-input">
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Reference ID / No.</label>
                <input class="form-control" name="reference" placeholder="e.g. PO-1002, physically counted">
              </div>
              <div class="form-group">
                <label class="form-label">Adjustment Reason <span class="required">*</span></label>
                <select class="form-control" name="reason" required>
                  ${action === 'add'
                    ? `<option value="Purchase Restock">Purchase Restock</option>
                       <option value="Restored from Waste">Restored from Waste</option>
                       <option value="Physical Inventory Audit">Physical Inventory Audit</option>
                       <option value="Other Addition">Other Addition</option>`
                    : `<option value="Damage / Spillage">Damage / Paint Spillage</option>
                       <option value="Physical Inventory Shrinkage">Physical Inventory Shrinkage</option>
                       <option value="Internal Factory Usage">Internal Factory Usage</option>
                       <option value="Expired / Defective">Expired / Defective Paint</option>
                       <option value="Other Deduction">Other Deduction</option>`
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes / Remarks</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Provide extra detail about this batch..."></textarea>
            </div>
            <div class="divider mt-2"></div>
            <div class="flex gap-3" style="justify-content:flex-end;">
              <button type="button" class="btn btn-secondary" onclick="Products.closeAdjustModal()">Cancel</button>
              <button type="submit" class="btn ${btnClass}">💾 ${btnText}</button>
            </div>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Products.closeAdjustModal(); });
    document.getElementById('adjust-qty-input')?.focus();
  }

  function closeAdjustModal() {
    document.getElementById('adjust-modal')?.remove();
  }

  function saveStockAdjustment(e, productId, action) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const qty = Number(fd.get('qty'));
    const finalQty = action === 'add' ? qty : -qty;

    const reference = fd.get('reference') || '';
    const reason = fd.get('reason') || '';
    const notes = fd.get('notes') || '';
    
    const type = action === 'add' ? 'RESTOCK' : (reason === 'Damage / Spillage' ? 'DAMAGE' : 'AUDIT');

    DB.addStockAdjustment(productId, type, finalQty, reference, reason, notes);
    App.showToast('Inventory level adjusted successfully!', 'success');
    closeAdjustModal();
    render();
    switchTab('inventory');
  }

  function openLedgerModal(productId) {
    const p = DB.getProduct(productId);
    if (!p) return;

    const logs = DB.getProductStockLogs(productId);
    logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // descending date

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'ledger-modal';

    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">📖 Stock Log Ledger: ${p.name}</h2>
          <button class="modal-close" onclick="Products.closeLedgerModal()">✕</button>
        </div>
        <div style="font-size:14px;background:rgba(255,255,255,0.02);padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;">
          <div><strong>HSN Code:</strong> ${p.hsnCode || '—'} · <strong>SKU:</strong> ${p.sku || '—'}</div>
          <div><strong>Current Stock:</strong> <span class="font-mono text-accent" style="font-weight:800;font-size:16px;">${p.stock} ${p.unit||''}</span></div>
        </div>
        <div class="table-wrapper" style="max-height:400px;overflow-y:auto;">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Operation</th>
                <th>Reference #</th>
                <th>Quantity Adjusted</th>
                <th>Resulting Stock</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0
                ? `<tr><td colspan="6"><div class="empty-state" style="padding:32px;"><p>No stock logs registered for this product yet.</p></div></td></tr>`
                : logs.map(log => {
                    const badgeMap = { INITIAL: 'purple', RESTOCK: 'success', SALE: 'info', SALE_CANCELLED: 'info', DAMAGE: 'danger', AUDIT: 'warning' };
                    const qtyFmt = log.qty > 0 ? `+${log.qty}` : `${log.qty}`;
                    const qtyColor = log.qty > 0 ? 'text-success' : 'text-danger';
                    
                    return `
                      <tr>
                        <td class="td-mono">${new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
                        <td><span class="badge badge-${badgeMap[log.type] || 'muted'}">${log.type}</span></td>
                        <td><strong>${log.reference || '—'}</strong></td>
                        <td class="td-mono font-bold ${qtyColor}">${qtyFmt} ${p.unit||''}</td>
                        <td class="td-mono font-bold text-accent">${log.resultingStock} ${p.unit||''}</td>
                        <td>
                          <div style="font-weight:600;font-size:12px;">${log.reason || ''}</div>
                          ${log.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">"${log.notes}"</div>` : ''}
                        </td>
                      </tr>`;
                  }).join('')
              }
            </tbody>
          </table>
        </div>
        <div class="divider mt-4"></div>
        <div class="flex" style="justify-content:flex-end;">
          <button class="btn btn-secondary" onclick="Products.closeLedgerModal()">✕ Close Log</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Products.closeLedgerModal(); });
  }

  function closeLedgerModal() {
    document.getElementById('ledger-modal')?.remove();
  }

  return { render, applyFilters, openModal, closeModal, saveProduct, onImageChange, onDragOver, onDrop, deleteProduct, switchTab, renderInventoryRows, openAdjustModal, closeAdjustModal, saveStockAdjustment, openLedgerModal, closeLedgerModal };
})();

```

## File: `.\js\quotations.js`
```javascript
// ============================================================
// quotations.js — Quotations & Estimates SPA Module
// ============================================================

const QuotationsPage = (() => {
  let items = [];
  let editingId = null;
  let currentTemplate = 'classic';

  const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---- Per-item calculation (inclusive / exclusive) ----
  function calcItem(item, taxType) {
    const raw = item.qty * item.rate * (1 - (item.discount || 0) / 100);
    let taxable, gstAmt;
    if (taxType === 'inclusive') {
      taxable = raw / (1 + item.gstRate / 100);
      gstAmt  = raw - taxable;
    } else {
      taxable = raw;
      gstAmt  = taxable * item.gstRate / 100;
    }
    return { raw, taxable, gstAmt, total: taxable + gstAmt };
  }

  function getTaxType() {
    return document.getElementById('tt-incl')?.checked ? 'inclusive' : 'exclusive';
  }

  // ============================================================
  // LIST VIEW RENDERING
  // ============================================================
  function render() {
    const quotes = DB.getQuotations();
    const totalEst = quotes.reduce((s, q) => s + (q.grandTotal || 0), 0);
    const pendingQuotes = quotes.filter(q => q.status === 'Draft' || q.status === 'Sent');
    const totalPendingVal = pendingQuotes.reduce((s, q) => s + (q.grandTotal || 0), 0);

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>📝 Quotations & Estimates</h1>
          <p>${quotes.length} total · ₹${fmt(totalEst)} estimated · ₹${fmt(totalPendingVal)} pending decision</p>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('quotation-new')">➕ New Quotation</button>
      </div>

      <div class="filter-bar">
        <div class="search-bar" style="flex:1;min-width:200px;">
          <span class="search-icon">🔍</span>
          <input type="text" id="quote-search" placeholder="Search by customer, quote no..." oninput="QuotationsPage.applyFilters()">
        </div>
        <input type="date" class="filter-select" id="filter-date-from" onchange="QuotationsPage.applyFilters()" title="From date">
        <input type="date" class="filter-select" id="filter-date-to" onchange="QuotationsPage.applyFilters()" title="To date">
        <select class="filter-select" id="filter-status" onchange="QuotationsPage.applyFilters()">
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Invoiced">Invoiced</option>
        </select>
      </div>

      <div class="card" style="padding:0;">
        <div class="table-wrapper" style="border:none;">
          <table>
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Date</th>
                <th>Valid Until</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Tax Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="quote-tbody">
              ${renderRows(quotes)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderRows(quotes) {
    if (!quotes.length) {
      return `<tr><td colspan="9"><div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No quotations yet</h3>
        <p>Create your first quotation or estimate to get started</p>
        <button class="btn btn-primary" onclick="App.navigate('quotation-new')">➕ New Quotation</button>
      </div></td></tr>`;
    }
    
    return quotes.map(q => {
      const isConverted = q.status === 'Invoiced';
      return `
      <tr>
        <td class="td-mono font-bold">${q.quotationNo || q.id?.slice(-6)}</td>
        <td>${q.date ? new Date(q.date).toLocaleDateString('en-IN') : '—'}</td>
        <td>${q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : '—'}</td>
        <td>
          <div style="font-weight:600;">${q.customer?.name || '—'}</div>
          <div style="font-size:11px;color:var(--text-muted);">${q.customer?.gstin || ''}</div>
        </td>
        <td><span class="badge badge-purple">${q.items?.length || 0} items</span></td>
        <td>${q.taxType === 'inclusive'
          ? `<span class="badge badge-info">📥 Incl. GST</span>`
          : `<span class="badge badge-purple">📤 Excl. GST</span>`}</td>
        <td class="td-mono font-bold">₹${fmt(q.grandTotal)}</td>
        <td>
          <select class="filter-select" style="padding:4px 8px;font-size:12px;"
            onchange="QuotationsPage.updateStatus('${q.id}', this.value)" ${isConverted ? 'disabled' : ''}>
            ${['Draft','Sent','Accepted','Rejected','Invoiced'].map(s =>
              `<option value="${s}" ${q.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" title="Preview / Print" onclick="QuotationsPage.printQuotation('${q.id}')">👁️</button>
            <button class="btn btn-secondary btn-sm" title="Edit" onclick="App.navigate('quotation-edit','${q.id}')" ${isConverted ? 'disabled' : ''}>✏️</button>
            ${!isConverted
              ? `<button class="btn btn-success btn-sm" style="background:#10b981;border-color:#10b981;" title="Convert to Invoice" onclick="QuotationsPage.convertToInvoice('${q.id}')">🔄 Invoice</button>`
              : `<span class="badge badge-success">✓ Invoiced</span>`
            }
            <button class="btn btn-danger btn-sm" title="Delete" onclick="QuotationsPage.deleteQuotation('${q.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function applyFilters() {
    const q = (document.getElementById('quote-search')?.value || '').toLowerCase();
    const from = document.getElementById('filter-date-from')?.value;
    const to = document.getElementById('filter-date-to')?.value;
    const status = document.getElementById('filter-status')?.value;

    let quotes = DB.getQuotations();
    if (q) quotes = quotes.filter(quote =>
      (quote.quotationNo || '').toLowerCase().includes(q) ||
      (quote.customer?.name || '').toLowerCase().includes(q) ||
      (quote.customer?.gstin || '').toLowerCase().includes(q)
    );
    if (from) quotes = quotes.filter(quote => quote.date >= from);
    if (to) quotes = quotes.filter(quote => quote.date <= to);
    if (status) quotes = quotes.filter(quote => quote.status === status);

    const tbody = document.getElementById('quote-tbody');
    if (tbody) tbody.innerHTML = renderRows(quotes);
  }

  function updateStatus(id, status) {
    DB.updateQuotation(id, { status });
    App.showToast(`Quotation marked as ${status}`, 'success');
    render();
  }

  function deleteQuotation(id) {
    const q = DB.getQuotation(id);
    if (!confirm(`Delete quotation ${q?.quotationNo || id}? This cannot be undone.`)) return;
    DB.deleteQuotation(id);
    App.showToast('Quotation deleted.', 'warning');
    render();
  }

  // ============================================================
  // FORM / CREATOR VIEW RENDERING
  // ============================================================
  function renderForm(quotationId = null) {
    editingId = quotationId;
    const existing = quotationId ? DB.getQuotation(quotationId) : null;
    items = existing ? JSON.parse(JSON.stringify(existing.items || [])) : [];
    currentTemplate = existing?.template || 'classic';

    const settings = DB.getSettings();
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; // 30 days default
    
    // Auto-generate next quotation number
    const quoteNo = existing?.quotationNo || `QT-${new Date().getFullYear()}-${String(DB.getNextQuotationNumber()).padStart(4, '0')}`;
    const e = existing || {};
    const savedTaxType = e.taxType || 'exclusive';

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>${quotationId ? '✏️ Edit Quotation' : '📝 New Quotation'}</h1>
          <p>Proforma Invoice / Commercial Estimate · ${settings.companyName}</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" onclick="App.navigate('quotations')">← Back</button>
          <button class="btn btn-primary" onclick="QuotationsPage.saveQuotation()">💾 Save Quotation</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 340px;gap:22px;align-items:start;">
        <!-- ===== LEFT COLUMN ===== -->
        <div style="display:flex;flex-direction:column;gap:18px;">

          <!-- Quotation Details -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">📋 Quotation Details</h3></div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Quotation Number</label>
                <input class="form-control font-mono" id="quote-number" value="${quoteNo}">
              </div>
              <div class="form-group">
                <label class="form-label">Quotation Date <span class="required">*</span></label>
                <input class="form-control" id="quote-date" type="date" value="${e.date || today}">
              </div>
              <div class="form-group">
                <label class="form-label">Valid Until</label>
                <input class="form-control" id="quote-valid-until" type="date" value="${e.validUntil || validUntil}">
              </div>
              <div class="form-group">
                <label class="form-label">Supply Type</label>
                <select class="form-control" id="quote-supply-type" onchange="QuotationsPage.recalc()">
                  <option value="intra" ${(e.supplyType || 'intra') === 'intra' ? 'selected' : ''}>Intra-State (CGST+SGST)</option>
                  <option value="inter" ${e.supplyType === 'inter' ? 'selected' : ''}>Inter-State (IGST)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tax in Prices</label>
                <div style="display:flex;gap:8px;align-items:center;">
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:7px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);font-size:13px;transition:all 0.15s;" id="tt-excl-lbl">
                    <input type="radio" name="quote-taxtype" id="tt-excl" ${savedTaxType !== 'inclusive' ? 'checked' : ''} onchange="QuotationsPage.recalc()">
                    📤 Excl. GST
                  </label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:7px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);font-size:13px;transition:all 0.15s;" id="tt-incl-lbl">
                    <input type="radio" name="quote-taxtype" id="tt-incl" ${savedTaxType === 'inclusive' ? 'checked' : ''} onchange="QuotationsPage.recalc()">
                    📥 Incl. GST
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Initial Status</label>
                <select class="form-control" id="quote-status">
                  ${['Draft','Sent','Accepted','Rejected'].map(s => `<option value="${s}" ${(e.status || 'Draft') === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">👤 Customer / Buyer Details</h3></div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Customer Name <span class="required">*</span></label>
                <input class="form-control" id="cust-name" list="customer-autocomplete-list" placeholder="Full name or company" value="${e.customer?.name || ''}" oninput="QuotationsPage.onCustomerNameInput(this.value)">
                <datalist id="customer-autocomplete-list">
                  ${DB.getCustomers().map(c => `<option value="${c.name}">`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">GSTIN</label>
                <input class="form-control font-mono" id="cust-gstin" placeholder="27AAAAA0000A1Z5" maxlength="15" value="${e.customer?.gstin || ''}" oninput="this.value=this.value.toUpperCase()">
              </div>
              <div class="form-group full">
                <label class="form-label">Address</label>
                <input class="form-control" id="cust-address" placeholder="Street address" value="${e.customer?.address || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="form-control" id="cust-city" placeholder="City" value="${e.customer?.city || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input class="form-control" id="cust-state" list="state-list" placeholder="State" value="${e.customer?.state || ''}">
                <datalist id="state-list">${STATES.map(s => `<option value="${s}">`).join('')}</datalist>
              </div>
              <div class="form-group">
                <label class="form-label">PIN Code</label>
                <input class="form-control" id="cust-pin" placeholder="000000" maxlength="6" value="${e.customer?.pincode || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input class="form-control" id="cust-phone" placeholder="+91 9876543210" value="${e.customer?.phone || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-control" id="cust-email" placeholder="email@example.com" value="${e.customer?.email || ''}">
              </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🎨 Line Items</h3>
              <button class="btn btn-primary btn-sm" onclick="QuotationsPage.openProductPicker()">➕ Add Product</button>
            </div>
            <div id="line-items-wrap">${renderLineItems(savedTaxType)}</div>
            <div id="subtotal-strip-wrap">${renderSubtotalStrip(savedTaxType)}</div>
            <div class="divider"></div>
            <!-- Charges row -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Freight (₹)</label>
                <input class="form-control" id="quote-freight" type="number" step="0.01" min="0" placeholder="0.00" value="${e.freight || ''}" oninput="QuotationsPage.recalc()">
              </div>
              <div class="form-group">
                <label class="form-label">Discount (₹)</label>
                <input class="form-control" id="quote-discount" type="number" step="0.01" min="0" placeholder="0.00" value="${e.discount || ''}" oninput="QuotationsPage.recalc()">
              </div>
              <div class="form-group">
                <label class="form-label">Round Off (₹)</label>
                <input class="form-control" id="quote-roundoff" type="number" step="0.01" placeholder="0.00" value="${e.roundOff || ''}" oninput="QuotationsPage.recalc()">
              </div>
            </div>
            <div class="form-group mt-4">
              <label class="form-label">Internal / Public Notes</label>
              <textarea class="form-control" id="quote-notes" rows="3" placeholder="Notes, terms, quotation validity...">${e.notes || DB.getSettings().defaultTerms || ''}</textarea>
            </div>
          </div>
        </div>

        <!-- ===== RIGHT COLUMN ===== -->
        <div style="position:sticky;top:80px;display:flex;flex-direction:column;gap:14px;">

          <!-- Summary -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">🧮 Summary</h3></div>
            <div id="tax-summary-wrap">${renderTaxSummary(savedTaxType)}</div>
          </div>

          <!-- Template Picker -->
          <div class="card" style="padding:16px;">
            <div style="font-size:12px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">🎨 Print Template</div>
            <div id="template-picker-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
              ${(typeof PRINT_TEMPLATES !== 'undefined' ? PRINT_TEMPLATES : []).map(t => renderTemplateSwatch(t, currentTemplate)).join('')}
            </div>
            <div id="tpl-name" style="text-align:center;font-size:11px;color:var(--accent-light);margin-top:8px;font-weight:600;min-height:14px;">
              ${(typeof PRINT_TEMPLATES !== 'undefined' ? PRINT_TEMPLATES : []).find(t => t.id === currentTemplate)?.name || 'Classic Indigo'}
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-full" onclick="QuotationsPage.saveQuotation()">💾 Save Quotation</button>
          <button class="btn btn-secondary btn-lg w-full" onclick="QuotationsPage.previewQuotation()">👁️ Preview & Print</button>
        </div>
      </div>

      <!-- Product Picker Modal -->
      <div id="picker-modal" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">🎨 Select Product</h2>
            <button class="modal-close" onclick="QuotationsPage.closeProductPicker()">✕</button>
          </div>
          <div class="search-bar mb-4">
            <span class="search-icon">🔍</span>
            <input type="text" id="picker-search" placeholder="Search products, HSN, category..." oninput="QuotationsPage.filterPicker()">
          </div>
          <div id="picker-list" class="product-picker-dropdown" style="position:static;max-height:420px;border-radius:var(--radius-md);">
            ${renderPickerList(DB.getProducts())}
          </div>
        </div>
      </div>
    `;
    setTimeout(() => recalc(), 0);
  }

  function renderTemplateSwatch(t, selected) {
    return `<div class="tpl-swatch${selected === t.id ? ' active' : ''}" title="${t.name}" onclick="QuotationsPage.setTemplate('${t.id}')">
      <div style="height:20px;border-radius:3px 3px 0 0;background:${t.color};"></div>
      <div class="tpl-swatch-name">${t.shortName}</div>
    </div>`;
  }

  function setTemplate(id) {
    currentTemplate = id;
    const grid = document.getElementById('template-picker-grid');
    if (grid && typeof PRINT_TEMPLATES !== 'undefined') {
      grid.innerHTML = PRINT_TEMPLATES.map(t => renderTemplateSwatch(t, id)).join('');
      const nameEl = document.getElementById('tpl-name');
      if (nameEl) nameEl.textContent = PRINT_TEMPLATES.find(t => t.id === id)?.name || '';
    }
  }

  function renderSubtotalStrip(taxType) {
    if (!items.length) return '';
    let raw = 0, taxable = 0, gst = 0;
    items.forEach(item => { const c = calcItem(item, taxType); raw += item.qty * item.rate; taxable += c.taxable; gst += c.gstAmt; });
    const isIncl = taxType === 'inclusive';
    return `<div style="display:flex;align-items:center;justify-content:flex-end;gap:20px;padding:10px 14px;background:rgba(99,102,241,0.05);border-radius:var(--radius-sm);border:1px solid rgba(99,102,241,0.12);margin-top:8px;flex-wrap:wrap;">
      ${isIncl
        ? `<div style="text-align:right;"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Total (Incl. GST)</div><div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;">₹${fmt(raw)}</div></div>
           <div style="text-align:right;"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Taxable Value</div><div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;">₹${fmt(taxable)}</div></div>`
        : `<div style="text-align:right;"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Subtotal</div><div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;">₹${fmt(raw)}</div></div>`}
      <div style="text-align:right;padding-left:14px;border-left:1px solid var(--border);">
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">GST ${isIncl ? 'Extracted' : 'Added'}</div>
        <div style="font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--accent-light);">₹${fmt(gst)}</div>
      </div>
      <div style="text-align:right;padding-left:14px;border-left:1px solid var(--border);">
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">Quotation Total</div>
        <div style="font-size:19px;font-weight:800;font-family:'JetBrains Mono',monospace;">₹${fmt(taxable + gst)}</div>
      </div>
    </div>`;
  }

  function renderLineItems(taxType) {
    if (!items.length) return `<div class="empty-state" style="padding:28px;"><div class="empty-icon">🎨</div><p>No items yet. Click "Add Product" to start.</p></div>`;
    const isIncl = taxType === 'inclusive';
    return `<div class="table-wrapper" style="border:none;">
      <table class="invoice-items-table">
        <thead><tr>
          <th>#</th><th>Product</th><th>HSN</th><th>Qty</th>
          <th>Rate ₹ <span style="font-size:9px;opacity:0.7;">(${isIncl ? 'Incl.GST' : 'Excl.GST'})</span></th>
          <th>Disc%</th><th>GST%</th><th>Total ₹</th><th></th>
        </tr></thead>
        <tbody>
          ${items.map((item, i) => {
            const c = calcItem(item, taxType);
            return `<tr>
              <td class="text-muted">${i + 1}</td>
              <td><div style="font-weight:600;">${item.name}</div><div style="font-size:10px;color:var(--text-muted);">${item.unit || 'Pcs'}</div></td>
              <td class="td-mono">${item.hsnCode || '—'}</td>
              <td><input type="number" class="form-control" style="width:68px;padding:5px 7px;" min="0.01" step="0.01" value="${item.qty}" onchange="QuotationsPage.updateItem(${i},'qty',this.value)"></td>
              <td><input type="number" class="form-control" style="width:88px;padding:5px 7px;" min="0" step="0.01" value="${item.rate}" onchange="QuotationsPage.updateItem(${i},'rate',this.value)"></td>
              <td><input type="number" class="form-control" style="width:56px;padding:5px 7px;" min="0" max="100" step="0.5" value="${item.discount || 0}" onchange="QuotationsPage.updateItem(${i},'discount',this.value)"></td>
              <td><span class="badge badge-purple">${item.gstRate}%</span></td>
              <td class="td-mono font-bold">₹${fmt(c.total)}</td>
              <td><button class="item-remove-btn" onclick="QuotationsPage.removeItem(${i})">✕</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  function renderTaxSummary(taxType) {
    const supplyType = document.getElementById('quote-supply-type')?.value || 'intra';
    const freight    = Number(document.getElementById('quote-freight')?.value) || 0;
    const discount   = Number(document.getElementById('quote-discount')?.value) || 0;
    const roundOff   = Number(document.getElementById('quote-roundoff')?.value) || 0;

    let rawTotal = 0, totalTaxable = 0, totalGST = 0;
    items.forEach(item => { const c = calcItem(item, taxType); rawTotal += item.qty * item.rate; totalTaxable += c.taxable; totalGST += c.gstAmt; });

    const grandTotal = totalTaxable + totalGST + freight - discount + roundOff;

    return `
      <div class="tax-summary">
        <div class="tax-row"><span class="tax-label">Subtotal</span><span class="tax-value">₹${fmt(rawTotal)}</span></div>
        ${discount > 0 ? `<div class="tax-row"><span class="tax-label">Discount</span><span class="tax-value text-danger">- ₹${fmt(discount)}</span></div>` : ''}
        <div class="tax-row"><span class="tax-label">Taxable Amount</span><span class="tax-value">₹${fmt(totalTaxable)}</span></div>
        ${supplyType === 'inter'
          ? `<div class="tax-row"><span class="tax-label">IGST</span><span class="tax-value">₹${fmt(totalGST)}</span></div>`
          : `<div class="tax-row"><span class="tax-label">CGST</span><span class="tax-value">₹${fmt(totalGST / 2)}</span></div>
             <div class="tax-row"><span class="tax-label">SGST</span><span class="tax-value">₹${fmt(totalGST / 2)}</span></div>`}
        ${freight > 0 ? `<div class="tax-row"><span class="tax-label">Freight</span><span class="tax-value">₹${fmt(freight)}</span></div>` : ''}
        ${roundOff !== 0 ? `<div class="tax-row"><span class="tax-label">Round Off</span><span class="tax-value">₹${fmt(roundOff)}</span></div>` : ''}
        <div class="tax-row total"><span class="tax-label">Grand Total</span><span class="tax-value">₹${fmt(grandTotal)}</span></div>
      </div>
      <div class="mt-3 card-sm" style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);">
        <div style="font-size:11px;color:var(--text-secondary);">Amount in words:</div>
        <div style="font-size:11px;font-weight:600;margin-top:3px;line-height:1.5;">${numToWords(grandTotal)} Only</div>
      </div>`;
  }

  function recalc() {
    const taxType = getTaxType();

    // Style active/inactive tax type radio pills
    const exclLbl = document.getElementById('tt-excl-lbl');
    const inclLbl = document.getElementById('tt-incl-lbl');
    if (exclLbl && inclLbl) {
      if (taxType === 'inclusive') {
        inclLbl.style.borderColor = 'var(--accent)';
        inclLbl.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))';
        inclLbl.style.color = 'var(--accent-light)';
        inclLbl.style.boxShadow = '0 0 0 2px var(--accent-glow)';
        
        exclLbl.style.borderColor = 'var(--border)';
        exclLbl.style.background = 'none';
        exclLbl.style.color = 'var(--text-secondary)';
        exclLbl.style.boxShadow = 'none';
      } else {
        exclLbl.style.borderColor = 'var(--accent)';
        exclLbl.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))';
        exclLbl.style.color = 'var(--accent-light)';
        exclLbl.style.boxShadow = '0 0 0 2px var(--accent-glow)';
        
        inclLbl.style.borderColor = 'var(--border)';
        inclLbl.style.background = 'none';
        inclLbl.style.color = 'var(--text-secondary)';
        inclLbl.style.boxShadow = 'none';
      }
    }

    const li = document.getElementById('line-items-wrap');
    if (li) li.innerHTML = renderLineItems(taxType);
    const st = document.getElementById('subtotal-strip-wrap');
    if (st) st.innerHTML = renderSubtotalStrip(taxType);
    const tx = document.getElementById('tax-summary-wrap');
    if (tx) tx.innerHTML = renderTaxSummary(taxType);
  }

  function updateItem(idx, field, val) {
    if (!items[idx]) return;
    items[idx][field] = ['qty', 'rate', 'discount'].includes(field) ? Number(val) : val;
    recalc();
  }

  function removeItem(idx) { items.splice(idx, 1); recalc(); }

  // ---- Product Picker ----
  function renderPickerList(products) {
    if (!products.length) return `<div class="empty-state" style="padding:28px;"><div class="empty-icon">🎨</div><p>No products found</p></div>`;
    return products.map(p => {
      const img = p.image
        ? `<img src="${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:7px;">`
        : `<div style="width:40px;height:40px;background:rgba(255,255,255,0.05);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:18px;">🎨</div>`;
      return `<div class="picker-item" onclick="QuotationsPage.addItem('${p.id}')">
        ${img}
        <div class="picker-info">
          <strong>${p.name}</strong>
          <span>HSN: ${p.hsnCode || '—'} · ${p.gstRate}% GST · ₹${Number(p.sellingPrice).toLocaleString('en-IN')}/${p.unit || 'Pcs'} · Stock: ${p.stock} ${p.unit || ''}</span>
        </div>
      </div>`;
    }).join('');
  }

  function openProductPicker() {
    document.getElementById('picker-modal')?.classList.remove('hidden');
    document.getElementById('picker-search')?.focus();
  }

  function closeProductPicker() {
    document.getElementById('picker-modal')?.classList.add('hidden');
    const s = document.getElementById('picker-search');
    if (s) s.value = '';
  }

  function filterPicker() {
    const q = (document.getElementById('picker-search')?.value || '').toLowerCase();
    const list = document.getElementById('picker-list');
    if (list) list.innerHTML = renderPickerList(
      DB.getProducts().filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.hsnCode || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    );
  }

  function addItem(productId) {
    const p = DB.getProduct(productId);
    if (!p) return;
    const ex = items.find(i => i.productId === productId);
    if (ex) { ex.qty += 1; } else {
      items.push({ productId: p.id, name: p.name, hsnCode: p.hsnCode, unit: p.unit, qty: 1, rate: p.sellingPrice, gstRate: p.gstRate, discount: 0 });
    }
    closeProductPicker();
    recalc();
  }

  // ---- Collect all data for save/preview ----
  function collectQuotationData() {
    const settings = DB.getSettings();
    const taxType = getTaxType();
    const supplyType = document.getElementById('quote-supply-type')?.value || 'intra';
    const freight    = Number(document.getElementById('quote-freight')?.value) || 0;
    const discount   = Number(document.getElementById('quote-discount')?.value) || 0;
    const roundOff   = Number(document.getElementById('quote-roundoff')?.value) || 0;

    let rawTotal = 0, totalTaxable = 0, totalGST = 0;
    items.forEach(item => { const c = calcItem(item, taxType); rawTotal += item.qty * item.rate; totalTaxable += c.taxable; totalGST += c.gstAmt; });
    const grandTotal = totalTaxable + totalGST + freight - discount + roundOff;

    const enrichedItems = items.map(item => {
      const c = calcItem(item, taxType);
      return { ...item, _taxable: c.taxable, _gstAmt: c.gstAmt, _total: c.total };
    });

    return {
      quotationNo: document.getElementById('quote-number')?.value,
      date: document.getElementById('quote-date')?.value,
      validUntil: document.getElementById('quote-valid-until')?.value,
      taxType, supplyType, template: currentTemplate,
      status: document.getElementById('quote-status')?.value || 'Draft',
      customer: {
        name:    document.getElementById('cust-name')?.value,
        gstin:   document.getElementById('cust-gstin')?.value,
        address: document.getElementById('cust-address')?.value,
        city:    document.getElementById('cust-city')?.value,
        state:   document.getElementById('cust-state')?.value,
        pincode: document.getElementById('cust-pin')?.value,
        phone:   document.getElementById('cust-phone')?.value,
        email:   document.getElementById('cust-email')?.value,
      },
      items: enrichedItems,
      subtotal: rawTotal, totalTaxable, totalGST,
      cgst: supplyType === 'intra' ? totalGST / 2 : 0,
      sgst: supplyType === 'intra' ? totalGST / 2 : 0,
      igst: supplyType === 'inter' ? totalGST : 0,
      freight, discount, roundOff, grandTotal,
      notes: document.getElementById('quote-notes')?.value,
      seller: {
        companyName: settings.companyName, gstin: settings.gstin, address: settings.address,
        city: settings.city, district: settings.district, state: settings.state, stateCode: settings.stateCode,
        pincode: settings.pincode, phone: settings.phone, email: settings.email,
        logo: settings.logo, signature: settings.signature, bankName: settings.bankName,
        accountNo: settings.accountNo, ifscCode: settings.ifscCode, accountHolder: settings.accountHolder, upiId: settings.upiId,
      },
      customerId: (editingId ? DB.getQuotation(editingId)?.customerId : null) || null,
    };
  }

  function onCustomerNameInput(val) {
    const c = DB.getCustomerByName(val);
    if (c) {
      const gstin = document.getElementById('cust-gstin');
      const address = document.getElementById('cust-address');
      const city = document.getElementById('cust-city');
      const state = document.getElementById('cust-state');
      const pin = document.getElementById('cust-pin');
      const phone = document.getElementById('cust-phone');
      const email = document.getElementById('cust-email');

      if (gstin) gstin.value = c.gstin || '';
      if (address) address.value = c.address || '';
      if (city) city.value = c.city || '';
      if (state) state.value = c.state || '';
      if (pin) pin.value = c.pincode || '';
      if (phone) phone.value = c.phone || '';
      if (email) email.value = c.email || '';
      App.showToast(`Auto-filled details for ${c.name}`, 'info');
    }
  }

  function saveQuotation() {
    if (!document.getElementById('cust-name')?.value) { App.showToast('Please enter customer name!', 'error'); return; }
    if (!items.length) { App.showToast('Please add at least one product!', 'error'); return; }
    
    const data = collectQuotationData();
    
    // Sync customer and get customerId
    // Standardize using same DB method
    const customerId = DB.syncCustomerFromInvoice(data);
    data.customerId = customerId;
    
    if (editingId) { 
      DB.updateQuotation(editingId, data); 
      App.showToast('Quotation updated!', 'success'); 
    }
    else { 
      DB.addQuotation(data); 
      App.showToast('Quotation saved!', 'success'); 
    }
    App.navigate('quotations');
  }

  // ============================================================
  // CONVERT TO INVOICE HOOK
  // ============================================================
  function convertToInvoice(id) {
    const quote = DB.getQuotation(id);
    if (!quote) return;

    if (quote.status === 'Invoiced') {
      App.showToast('This quotation is already converted to an invoice!', 'warning');
      return;
    }

    if (!confirm(`Convert quotation ${quote.quotationNo || id} to a Tax Invoice? This will automatically lock the quotation and deduct physical product stocks.`)) return;

    const settings = DB.getSettings();
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const invoiceNo = `${settings.invoicePrefix}-${new Date().getFullYear()}-${String(DB.getNextInvoiceNumber()).padStart(4, '0')}`;

    // Create Invoice Data matching the schema
    const invoiceData = {
      invoiceNo,
      date: today,
      dueDate,
      taxType: quote.taxType || 'exclusive',
      supplyType: quote.supplyType || 'intra',
      template: quote.template || 'classic',
      paymentMode: 'Cash',
      paymentStatus: 'Unpaid',
      customer: quote.customer,
      items: quote.items.map(item => ({
        productId: item.productId,
        name: item.name,
        hsnCode: item.hsnCode,
        unit: item.unit,
        qty: Number(item.qty),
        rate: Number(item.rate),
        gstRate: Number(item.gstRate),
        discount: Number(item.discount || 0),
        _taxable: Number(item._taxable),
        _gstAmt: Number(item._gstAmt),
        _total: Number(item._total)
      })),
      subtotal: Number(quote.subtotal),
      totalTaxable: Number(quote.totalTaxable),
      totalGST: Number(quote.totalGST),
      cgst: Number(quote.cgst),
      sgst: Number(quote.sgst),
      igst: Number(quote.igst),
      freight: Number(quote.freight || 0),
      discount: Number(quote.discount || 0),
      roundOff: Number(quote.roundOff || 0),
      advance: 0,
      grandTotal: Number(quote.grandTotal),
      balanceDue: Number(quote.grandTotal),
      notes: quote.notes || '',
      seller: quote.seller,
      customerId: quote.customerId
    };

    // 1. Add invoice (triggers stock deduction automatically in local DB + cloud push)
    DB.addInvoice(invoiceData);

    // 2. Mark quote as Invoiced and save
    DB.updateQuotation(id, { status: 'Invoiced' });

    App.showToast(`Successfully converted to Tax Invoice ${invoiceNo}!`, 'success');

    // 3. Redirect to invoices view
    App.navigate('invoices');
  }

  // ============================================================
  // PRINT/PDF EXPORT LAYOUT COMPILER
  // ============================================================
  function printQuotation(id) {
    const quote = DB.getQuotation(id);
    if (!quote) return;
    openPrintWindow(quote);
  }

  function previewQuotation() {
    if (!items.length) { App.showToast('Please add at least one product!', 'error'); return; }
    openPrintWindow(collectQuotationData());
  }

  function openPrintWindow(quote) {
    const win = window.open('', '_blank', 'width=940,height=760,scrollbars=yes');
    if (!win) { alert('Popup blocked! Please allow popups for this site.'); return; }
    
    const tmpl = (typeof PRINT_TEMPLATES !== 'undefined' ? PRINT_TEMPLATES : []).find(tt => tt.id === (quote.template || 'classic')) || { id:'classic', name:'Classic Indigo', color:'#3730a3', accent:'#6366f1', bg:'#eef2ff', layout:'standard' };
    
    win.document.write(buildPrintHTML(quote, tmpl));
    win.document.close();
  }

  function buildPrintHTML(quote, t) {
    const s = quote.seller || {};
    const dateStr = quote.date ? new Date(quote.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const validStr = quote.validUntil ? new Date(quote.validUntil + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const isIncl = quote.taxType === 'inclusive';
    const isInter = quote.supplyType === 'inter';

    // Compiling stylesheet
    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: sans-serif; font-size: 12px; color: #111; background: white; border-top: 5px solid ${t.color}; }
      .page { max-width: 820px; margin: 0 auto; padding: 28px; }
      .no-print { display: flex; gap: 10px; margin-bottom: 18px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; }
      .no-print button { padding: 8px 20px; background: ${t.color}; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; }
      .no-print .sec-btn { padding: 8px 14px; background: white; color: #333; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; cursor: pointer; }
      
      .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; }
      .header-left { display: flex; align-items: center; gap: 12px; }
      .logo-sq { width: 48px; height: 48px; background: ${t.color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: white; flex-shrink: 0; }
      .co-name { font-size: 17px; font-weight: 900; color: #111; }
      .co-meta { font-size: 10px; color: #666; margin-top: 2px; line-height: 1.5; }
      .co-gstin { font-family: monospace; font-size: 10px; font-weight: 700; color: ${t.color}; background: ${t.bg}; padding: 2px 5px; border-radius: 3px; display: inline-block; margin-top: 3px; }
      
      .inv-title { text-align: right; }
      .inv-title h2 { font-size: 16px; font-weight: 900; color: ${t.color}; text-transform: uppercase; letter-spacing: 1px; }
      .inv-title .ino { font-size: 12px; font-weight: 700; color: #333; font-family: monospace; margin-top: 3px; }
      .inv-title .idate { font-size: 11px; color: #666; margin-top: 2px; }
      .tax-pill { display: inline-block; background: ${t.bg}; color: ${t.color}; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid ${t.color}33; margin-top: 3px; }
      
      .party-section { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
      .pbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; }
      .pbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${t.accent}; margin-bottom: 5px; }
      .pbox .nm { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
      .pbox .gst { font-family: monospace; font-size: 10px; font-weight: 600; color: ${t.color}; background: ${t.bg}; padding: 2px 5px; border-radius: 3px; display: inline-block; margin-bottom: 3px; }
      .pbox .addr { font-size: 10px; color: #666; line-height: 1.6; }
      
      .items-tbl { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
      .items-tbl th { background: ${t.bg}; color: #333; border-bottom: 2px solid ${t.color}; padding: 7px 8px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; }
      .items-tbl td { padding: 7px 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px; vertical-align: middle; }
      .items-tbl tr:nth-child(even) td { background: #fafafa; }
      .tr { text-align: right; } .tc { text-align: center; }
      
      .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 12px; }
      .totals-box { min-width: 240px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
      .trow { display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
      .trow:last-child { border-bottom: none; }
      .trow .tl { color: #666; } .trow .tv { font-weight: 700; font-family: monospace; }
      .trow.grand { background: ${t.color}; color: white; font-size: 14px; font-weight: 800; padding: 10px 12px; }
      .trow.grand .tl { color: rgba(255,255,255,0.85); } .trow.grand .tv { color: white; }
      
      .amt-words { background: ${t.bg}; border: 1px solid ${t.color}33; border-radius: 5px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; }
      .amt-words span { font-weight: 700; }
      
      .footer-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 14px; }
      @media(min-width: 480px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
      .bbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; }
      .bbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent}; margin-bottom: 6px; }
      .sbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 11px; display: flex; flex-direction: column; }
      .sbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent}; margin-bottom: 6px; }
      .sbox .swrap { flex:1; display:flex; align-items:center; justify-content:center; min-height:50px; }
      .sbox img { max-height: 50px; max-width: 130px; }
      .sline { border-top: 1px solid #ccc; padding-top: 5px; font-size: 11px; font-weight: 700; text-align: center; margin-top: 8px; }
      
      .nbox { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 12px; }
      .nbox h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${t.accent}; margin-bottom: 5px; }
      .nbox p { font-size: 11px; color: #555; line-height: 1.7; white-space: pre-line; }
      .inv-footer-line { text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #e5e7eb; padding-top: 8px; }
      
      @media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } .no-print { display:none!important; } .page { padding:12px; } }
    `;

    // Customer details
    const c = quote.customer || {};

    const rows = (quote.items || []).map((item, i) => {
      const taxable = item._taxable ?? (item.qty * item.rate * (1 - (item.discount || 0) / 100));
      const gstAmt  = item._gstAmt  ?? (taxable * item.gstRate / 100);
      const total   = item._total   ?? (taxable + gstAmt);
      return `<tr>
        <td>${i + 1}</td>
        <td><strong>${item.name}</strong></td>
        <td style="font-family:monospace;font-size:10px;">${item.hsnCode || '—'}</td>
        <td class="tc">${fmt(item.qty, 2)} ${item.unit || ''}</td>
        <td class="tr">${fmt(item.rate)}</td>
        <td class="tc">${item.discount || 0}%</td>
        <td class="tc">${item.gstRate}%</td>
        <td class="tr"><strong>${fmt(total)}</strong></td>
      </tr>`;
    }).join('');

    const rightSide = `
      <div class="sbox">
        <h4>For ${s.companyName || 'Sharma Industries'}</h4>
        <div class="swrap">${s.signature ? `<img src="${s.signature}" alt="Sign">` : ''}</div>
        <div class="sline">Authorized Representative</div>
      </div>
    `;

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Quotation ${quote.quotationNo || ''} · ${s.companyName || ''}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="page">
          <div class="no-print">
            <button onclick="window.print()">🖨️ Print / Save PDF</button>
            <button class="sec-btn" onclick="window.close()">✕ Close</button>
            <span style="font-size:11px;color:#888;align-self:center;">Tip: In print dialog, select "Save as PDF" to download.</span>
          </div>

          <div class="header">
            <div class="header-left">
              ${s.logo ? `<img src="${s.logo}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;">` : `<div class="logo-sq">SI</div>`}
              <div>
                <div class="co-name">${s.companyName || 'Sharma Industries'}</div>
                <div class="co-meta">${[s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ')}</div>
                ${s.phone ? `<div class="co-meta">📞 ${s.phone}${s.email ? ' · ' + s.email : ''}</div>` : ''}
                ${s.gstin ? `<div class="co-gstin">GSTIN: ${s.gstin}</div>` : ''}
              </div>
            </div>
            <div class="inv-title">
              <h2>PROFORMA INVOICE / ESTIMATE</h2>
              <div class="ino"># ${quote.quotationNo || ''}</div>
              <div class="idate">Date: ${dateStr}</div>
              ${validStr ? `<div class="idate" style="color:var(--text-danger);font-weight:600;">Valid Until: ${validStr}</div>` : ''}
              <div><span class="tax-pill">${quote.taxType === 'inclusive' ? 'GST Inclusive' : 'GST Exclusive'}</span></div>
              <div style="font-size:11px;color:#666;margin-top:3px;">${quote.supplyType === 'inter' ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}</div>
            </div>
          </div>

          <div class="party-section">
            <div class="pbox">
              <h4>Quoted By</h4>
              <div class="nm">${s.companyName || 'Sharma Industries'}</div>
              ${s.gstin ? `<div class="gst">GSTIN: ${s.gstin}</div>` : ''}
              <div class="addr">${[s.address, s.city, s.district ? `Dist. ${s.district}` : '', s.state + (s.stateCode ? ` (${s.stateCode})` : ''), s.pincode].filter(Boolean).join(', ')}</div>
              ${s.phone ? `<div class="addr">📞 ${s.phone}</div>` : ''}
            </div>
            <div class="pbox">
              <h4>Quoted To</h4>
              <div class="nm">${c.name || '—'}</div>
              ${c.gstin ? `<div class="gst">GSTIN: ${c.gstin}</div>` : ''}
              <div class="addr">${[c.address, c.city, c.state, c.pincode].filter(Boolean).join(', ')}</div>
              ${c.phone ? `<div class="addr">📞 ${c.phone}</div>` : ''}
            </div>
          </div>

          <table class="items-tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Description of Goods</th>
                <th>HSN</th>
                <th class="tc">Qty & Unit</th>
                <th class="tr">Rate ₹<br><span style="font-size:8px;font-weight:400;">(${isIncl ? 'Incl.' : 'Excl.'} GST)</span></th>
                <th class="tc">Disc%</th>
                <th class="tc">GST%</th>
                <th class="tr">Total ₹</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="totals-wrap">
            <div class="totals-box">
              <div class="trow"><span class="tl">Subtotal</span><span class="tv">₹${fmt(quote.subtotal)}</span></div>
              ${quote.discount ? `<div class="trow"><span class="tl">Discount</span><span class="tv" style="color:#ef4444;">- ₹${fmt(quote.discount)}</span></div>` : ''}
              <div class="trow"><span class="tl">Taxable Amount</span><span class="tv">₹${fmt(quote.totalTaxable)}</span></div>
              ${isInter
                ? `<div class="trow"><span class="tl">IGST</span><span class="tv">₹${fmt(quote.igst)}</span></div>`
                : `<div class="trow"><span class="tl">CGST</span><span class="tv">₹${fmt(quote.cgst)}</span></div>
                   <div class="trow"><span class="tl">SGST</span><span class="tv">₹${fmt(quote.sgst)}</span></div>`}
              ${quote.freight ? `<div class="trow"><span class="tl">Freight</span><span class="tv">₹${fmt(quote.freight)}</span></div>` : ''}
              ${quote.roundOff ? `<div class="trow"><span class="tl">Round Off</span><span class="tv">₹${fmt(quote.roundOff)}</span></div>` : ''}
              <div class="trow grand"><span class="tl">Estimate Grand Total</span><span class="tv">₹${fmt(quote.grandTotal)}</span></div>
            </div>
          </div>

          <div class="amt-words">
            Amount in words: <span>${numToWords(quote.grandTotal)} Only</span>
          </div>

          <div class="footer-grid">
            <div class="bbox">
              <h4>Quotation Terms</h4>
              <div style="font-size:11px;color:#555;line-height:1.6;">
                1. Prices quoted are valid until the specified date.<br>
                2. Goods once invoiced will be subject to company terms & conditions.<br>
                3. This is a commercial estimate and does not represent a tax debit note.
              </div>
            </div>
            ${rightSide}
          </div>

          ${quote.notes ? `<div class="nbox"><h4>Internal & Supply Notes</h4><p>${quote.notes}</p></div>` : ''}
          <div class="inv-footer-line">${s.companyName || 'Sharma Industries'} · Estimates & Proforma Invoices Manager</div>
        </div>
      </body>
      </html>
    `;
  }

  return { 
    render, 
    renderForm, 
    recalc, 
    setTemplate, 
    updateItem, 
    removeItem, 
    openProductPicker, 
    closeProductPicker, 
    filterPicker, 
    addItem, 
    saveQuotation, 
    previewQuotation, 
    onCustomerNameInput,
    updateStatus,
    deleteQuotation,
    convertToInvoice,
    printQuotation
  };
})();

```

## File: `.\js\settings.js`
```javascript
// ============================================================
// settings.js — Company Settings Page with Supabase Cloud Sync
// ============================================================

const Settings = (() => {
  function render() {
    const s = DB.getSettings();

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>⚙️ Company Settings</h1>
          <p>Configure your business details, GST info, and cloud synchronization</p>
        </div>
        <button class="btn btn-primary" onclick="Settings.save()">💾 Save Settings</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

        <!-- Company Info -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">🏢 Company Information</h3></div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">Company Name <span class="required">*</span></label>
              <input class="form-control" id="s-name" placeholder="Sharma Industries" value="${s.companyName || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">GSTIN</label>
              <input class="form-control font-mono" id="s-gstin" placeholder="09AAAAA0000A1Z5" maxlength="15" value="${s.gstin || ''}" oninput="this.value=this.value.toUpperCase()">
            </div>
            <div class="form-group">
              <label class="form-label">Address</label>
              <input class="form-control" id="s-address" placeholder="Plot No, Street, Area" value="${s.address || ''}">
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="form-control" id="s-city" placeholder="City" value="${s.city || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">District</label>
                <input class="form-control" id="s-district" placeholder="District" value="${s.district || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">PIN Code</label>
                <input class="form-control" id="s-pin" placeholder="000000" maxlength="6" value="${s.pincode || ''}">
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">State</label>
                <input class="form-control" id="s-state" list="state-list2" placeholder="Uttar Pradesh" value="${s.state || ''}">
                <datalist id="state-list2">${(typeof STATES !== 'undefined' ? STATES : []).map(st=>`<option value="${st}">`).join('')}</datalist>
              </div>
              <div class="form-group">
                <label class="form-label">State Code</label>
                <input class="form-control" id="s-state-code" placeholder="09" maxlength="2" value="${s.stateCode || ''}">
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input class="form-control" id="s-phone" placeholder="+91 9876543210" value="${s.phone || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-control" id="s-email" placeholder="info@company.com" value="${s.email || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Website</label>
              <input class="form-control" id="s-website" placeholder="www.sharmaindustries.com" value="${s.website || ''}">
            </div>
          </div>
        </div>

        <!-- Logo & Signature -->
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">🖼️ Company Logo</h3></div>
            <div class="image-upload-area" id="logo-upload-area" ondragover="Settings.onDragOver(event,'logo')" ondrop="Settings.onDrop(event,'logo')">
              <input type="file" id="logo-file" accept="image/*" onchange="Settings.onImageChange(event,'logo')">
              <div id="logo-preview-wrap">
                ${s.logo
                  ? `<img src="${s.logo}" class="upload-preview" id="logo-img"><div class="upload-text">Click to change logo</div>`
                  : `<div class="upload-icon">🏢</div><div class="upload-text">Upload Company Logo</div><div class="upload-hint">PNG, JPG, SVG recommended</div>`}
              </div>
            </div>
            ${s.logo ? `<button class="btn btn-danger btn-sm mt-4" onclick="Settings.clearImage('logo')">🗑️ Remove Logo</button>` : ''}
          </div>

          <div class="card">
            <div class="card-header"><h3 class="card-title">✍️ Authorized Signature</h3></div>
            <div class="image-upload-area" id="sign-upload-area" ondragover="Settings.onDragOver(event,'sign')" ondrop="Settings.onDrop(event,'sign')">
              <input type="file" id="sign-file" accept="image/*" onchange="Settings.onImageChange(event,'sign')">
              <div id="sign-preview-wrap">
                ${s.signature
                  ? `<img src="${s.signature}" class="upload-preview" id="sign-img"><div class="upload-text">Click to change signature</div>`
                  : `<div class="upload-icon">✍️</div><div class="upload-text">Upload Signature Image</div><div class="upload-hint">Use transparent background PNG</div>`}
              </div>
            </div>
            ${s.signature ? `<button class="btn btn-danger btn-sm mt-4" onclick="Settings.clearImage('sign')">🗑️ Remove Signature</button>` : ''}
          </div>
        </div>

        <!-- Bank Details -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">🏦 Bank Details</h3></div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">Bank Name</label>
              <input class="form-control" id="s-bank-name" placeholder="State Bank of India" value="${s.bankName || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Account Holder Name</label>
              <input class="form-control" id="s-acc-holder" placeholder="Sharma Industries" value="${s.accountHolder || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Account Number</label>
              <input class="form-control font-mono" id="s-acc-no" placeholder="1234567890" value="${s.accountNo || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">IFSC Code</label>
              <input class="form-control font-mono" id="s-ifsc" placeholder="SBIN0001234" maxlength="11" value="${s.ifscCode || ''}" oninput="this.value=this.value.toUpperCase()">
            </div>
            <div class="form-group">
              <label class="form-label">UPI ID</label>
              <input class="form-control" id="s-upi" placeholder="sharma@upi" value="${s.upiId || ''}" oninput="Settings.updateQrPreview()">
            </div>
            <!-- UPI QR Preview -->
            <div id="upi-qr-preview-wrap" style="${s.upiId ? '' : 'display:none;'}">
              <div class="form-label mb-2">📱 UPI QR Preview</div>
              <div style="display:flex;align-items:center;gap:16px;padding:14px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);border-radius:var(--radius-md);">
                <img id="upi-qr-img" src="${s.upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('upi://pay?pa=' + s.upiId + '&pn=' + encodeURIComponent(s.companyName || 'Sharma Industries') + '&cu=INR')}&margin=6` : ''}" style="width:100px;height:100px;border-radius:8px;border:1px solid var(--border);" alt="QR">
                <div>
                  <div style="font-weight:700;font-size:14px;">Scan to Pay</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;" id="upi-qr-id-display">${s.upiId || ''}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">This QR will appear on all invoices. The amount shown on the QR will automatically be the Balance Due for each invoice.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Preferences -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">🧾 Invoice Preferences</h3></div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Invoice Prefix</label>
                <input class="form-control" id="s-inv-prefix" placeholder="SI" value="${s.invoicePrefix || 'SI'}">
                <span class="form-hint">e.g. SI → SI-2024-0001</span>
              </div>
              <div class="form-group">
                <label class="form-label">Starting Invoice Number</label>
                <input class="form-control" id="s-inv-start" type="number" min="1" placeholder="1" value="${s.invoiceStartNo || 1}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Default Terms & Conditions</label>
              <textarea class="form-control" id="s-terms" rows="6" placeholder="Enter your default terms and conditions...">${s.defaultTerms || ''}</textarea>
            </div>

            <!-- Preview invoice number -->
            <div class="card-sm" style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.2);">
              <div class="form-label">Invoice Number Preview</div>
              <div class="font-mono" style="font-size:18px;font-weight:700;color:var(--accent-light);margin-top:6px;" id="inv-no-preview">
                ${s.invoicePrefix || 'SI'}-${new Date().getFullYear()}-${String(s.invoiceStartNo || 1).padStart(4,'0')}
              </div>
            </div>
          </div>
        </div>

        <!-- Supabase Cloud Sync -->
        <div class="card" style="grid-column: 1 / -1; margin-top: 10px;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">☁️ Cloud Database Sync (Supabase)</h3>
            <span id="supabase-status-badge" class="badge badge-muted">Checking...</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
            <!-- Left: Config inputs -->
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div class="form-group">
                <label class="form-label">Supabase URL</label>
                <input class="form-control" id="s-sb-url" placeholder="https://your-project.supabase.co" value="${s.supabaseUrl || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Supabase Anon Key</label>
                <input class="form-control font-mono" id="s-sb-key" type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${s.supabaseKey || ''}">
              </div>
              <div class="flex gap-2" style="margin-top:8px;">
                <button class="btn btn-primary" onclick="Settings.connectCloud()">🔌 Save & Connect</button>
                <button class="btn btn-danger btn-sm" onclick="Settings.disconnectCloud()" style="background:rgba(239,68,68,0.12); padding:8px 12px;">Disconnect Cloud</button>
              </div>
            </div>

            <!-- Right: Sync utilities -->
            <div style="display:flex; flex-direction:column; gap:12px; background:rgba(255,255,255,0.02); padding:16px; border:1px solid var(--border); border-radius:var(--radius-md);">
              <h4 style="font-size:12px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Data Replication Tools</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">Push local files to initialize empty database, or pull cloud tables to restore data on a fresh device.</p>
              
              <div class="flex gap-3" style="margin-top:6px;">
                <button class="btn btn-secondary btn-sm flex-1" id="btn-cloud-push" onclick="Settings.pushCloudData()">📤 Push Local to Cloud</button>
                <button class="btn btn-secondary btn-sm flex-1" id="btn-cloud-pull" onclick="Settings.pullCloudData()">📥 Pull Cloud to Local</button>
              </div>

              <!-- Collapsible DDL Schema script -->
              <details style="margin-top:8px; border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden;">
                <summary style="font-size:11px; font-weight:700; color:var(--accent-light); cursor:pointer; padding:8px 12px; background:rgba(255,255,255,0.03); outline:none; user-select:none;">📋 Supabase SQL Setup Script</summary>
                <div style="padding:12px; background:#0e0f13; border-top:1px solid var(--border);">
                  <div style="font-size:10px; color:var(--text-secondary); margin-bottom:8px; line-height:1.4;">Copy and paste this script in your Supabase SQL Editor to create the correct tables instantly:</div>
                  <textarea class="form-control font-mono" readonly style="width:100%; height:150px; font-size:10px; background:#08090b; border:1px solid var(--border); padding:8px; border-radius:4px; resize:vertical;" onclick="this.select()">-- Supabase Database Schema Script for Sharma Industries

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

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_single_row CHECK (id = 1)
);</textarea>
                </div>
              </details>
            </div>
          </div>
        </div>

      </div>

      <div class="flex gap-3 mt-6" style="justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="Settings.resetDefaults()">↩️ Reset Defaults</button>
        <button class="btn btn-primary btn-lg" onclick="Settings.save()">💾 Save All Settings</button>
      </div>
    `;

    // Live preview of invoice number
    ['s-inv-prefix', 's-inv-start'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        const prefix = document.getElementById('s-inv-prefix')?.value || 'SI';
        const start = document.getElementById('s-inv-start')?.value || '1';
        const preview = document.getElementById('inv-no-preview');
        if (preview) preview.textContent = `${prefix}-${new Date().getFullYear()}-${String(start).padStart(4,'0')}`;
      });
    });

    // Update the cloud connection status badge
    setTimeout(updateCloudBadge, 50);
  }

  // Store image data temporarily
  const _imgs = { logo: null, sign: null };

  function onImageChange(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      _imgs[type] = ev.target.result;
      if (type === 'logo') {
        document.getElementById('logo-preview-wrap').innerHTML =
          `<img src="${ev.target.result}" class="upload-preview" id="logo-img"><div class="upload-text">Click to change logo</div>`;
      } else {
        document.getElementById('sign-preview-wrap').innerHTML =
          `<img src="${ev.target.result}" class="upload-preview" id="sign-img"><div class="upload-text">Click to change signature</div>`;
      }
    };
    reader.readAsDataURL(file);
  }

  function onDragOver(e, type) {
    e.preventDefault();
    document.getElementById(`${type === 'logo' ? 'logo' : 'sign'}-upload-area`)?.classList.add('drag-over');
  }

  function onDrop(e, type) {
    e.preventDefault();
    const area = document.getElementById(`${type === 'logo' ? 'logo' : 'sign'}-upload-area`);
    area?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        _imgs[type] = ev.target.result;
        const wrapId = type === 'logo' ? 'logo-preview-wrap' : 'sign-preview-wrap';
        document.getElementById(wrapId).innerHTML =
          `<img src="${ev.target.result}" class="upload-preview"><div class="upload-text">Click to change</div>`;
      };
      reader.readAsDataURL(file);
    }
  }

  function clearImage(type) {
    _imgs[type] = '';
    if (type === 'logo') {
      document.getElementById('logo-preview-wrap').innerHTML =
        `<div class="upload-icon">🏢</div><div class="upload-text">Upload Company Logo</div><div class="upload-hint">PNG, JPG, SVG recommended</div>`;
    } else {
      document.getElementById('sign-preview-wrap').innerHTML =
        `<div class="upload-icon">✍️</div><div class="upload-text">Upload Signature Image</div><div class="upload-hint">Use transparent background PNG</div>`;
    }
  }

  function updateQrPreview() {
    const upiId = document.getElementById('s-upi')?.value || '';
    const name  = document.getElementById('s-name')?.value || 'Sharma Industries';
    const wrap  = document.getElementById('upi-qr-preview-wrap');
    const img   = document.getElementById('upi-qr-img');
    const label = document.getElementById('upi-qr-id-display');
    if (!wrap) return;
    if (!upiId) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    const upiStr = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&cu=INR`;
    if (img) img.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiStr)}&margin=6`;
    if (label) label.textContent = upiId;
  }

  function updateCloudBadge() {
    const badge = document.getElementById('supabase-status-badge');
    if (!badge) return;
    
    if (DB.Cloud.isConnected()) {
      badge.textContent = '🔌 Cloud Connected';
      badge.className = 'badge badge-success';
    } else {
      const s = DB.getSettings();
      if (s.supabaseUrl && s.supabaseKey) {
        badge.textContent = '⚠️ Config Error';
        badge.className = 'badge badge-danger';
      } else {
        badge.textContent = '❌ Cloud Disconnected';
        badge.className = 'badge badge-muted';
      }
    }
  }

  async function connectCloud() {
    const url = document.getElementById('s-sb-url')?.value.trim() || '';
    const key = document.getElementById('s-sb-key')?.value.trim() || '';
    
    if (!url || !key) {
      App.showToast('Please enter both Supabase URL and Anon Key!', 'error');
      return;
    }
    
    const settings = DB.getSettings();
    settings.supabaseUrl = url;
    settings.supabaseKey = key;
    
    // Save to settings
    DB._set(DB.KEYS.SETTINGS, settings);
    
    // Test Connection
    App.showToast('Testing cloud connection...', 'info');
    const success = DB.initCloud();
    
    if (success) {
      try {
        // Try simple settings upsert to check if database permissions and schema are correct
        await DB.Cloud.pushSettings(settings);
        App.showToast('Supabase Connected & Settings Synced!', 'success');
      } catch (err) {
        console.error(err);
        App.showToast('Connected to Supabase, but settings sync failed. Ensure tables are created!', 'warning');
      }
    } else {
      App.showToast('Connection failed! Check credentials.', 'error');
    }
    
    render();
  }

  function disconnectCloud() {
    if (!confirm('Disconnect from Supabase? Data on this machine will not be deleted, but cloud sync will stop.')) return;
    
    const settings = DB.getSettings();
    settings.supabaseUrl = '';
    settings.supabaseKey = '';
    DB._set(DB.KEYS.SETTINGS, settings);
    
    DB.initCloud(); // sets window.supabaseClient to null
    App.showToast('Cloud sync disconnected.', 'warning');
    render();
  }

  async function pushCloudData() {
    if (!DB.Cloud.isConnected()) {
      App.showToast('Please connect to Supabase first!', 'error');
      return;
    }
    if (!confirm('Push all local products, invoices, ledgers, and logs to the cloud? This will overwrite/merge records in Supabase.')) return;
    
    const btn = document.getElementById('btn-cloud-push');
    if (btn) { btn.disabled = true; btn.textContent = 'Pushing...'; }
    
    App.showToast('Uploading local database to Supabase...', 'info');
    try {
      await DB.Cloud.pushAllLocalToCloud();
      App.showToast('Cloud database seeded successfully!', 'success');
    } catch (err) {
      console.error(err);
      App.showToast('Bulk upload failed: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '📤 Push Local Data to Cloud'; }
      render();
    }
  }

  async function pullCloudData() {
    if (!DB.Cloud.isConnected()) {
      App.showToast('Please connect to Supabase first!', 'error');
      return;
    }
    if (!confirm('Pull all cloud data and OVERWRITE your current local storage cache? Warning: This will replace all current data on this machine!')) return;
    
    const btn = document.getElementById('btn-cloud-pull');
    if (btn) { btn.disabled = true; btn.textContent = 'Pulling...'; }
    
    App.showToast('Downloading database from Supabase...', 'info');
    try {
      await DB.Cloud.pullAllCloudToLocal();
      App.showToast('Cloud database synchronized to local storage!', 'success');
    } catch (err) {
      console.error(err);
      App.showToast('Sync download failed: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '📥 Pull Cloud Data to Local'; }
      render();
    }
  }

  function save() {
    const current = DB.getSettings();
    const data = {
      companyName: document.getElementById('s-name')?.value || 'Sharma Industries',
      gstin: document.getElementById('s-gstin')?.value || '',
      address: document.getElementById('s-address')?.value || '',
      city: document.getElementById('s-city')?.value || '',
      district: document.getElementById('s-district')?.value || '',
      state: document.getElementById('s-state')?.value || '',
      stateCode: document.getElementById('s-state-code')?.value || '',
      pincode: document.getElementById('s-pin')?.value || '',
      phone: document.getElementById('s-phone')?.value || '',
      email: document.getElementById('s-email')?.value || '',
      website: document.getElementById('s-website')?.value || '',
      logo: _imgs.logo !== null ? _imgs.logo : (current.logo || ''),
      signature: _imgs.sign !== null ? _imgs.sign : (current.signature || ''),
      bankName: document.getElementById('s-bank-name')?.value || '',
      accountHolder: document.getElementById('s-acc-holder')?.value || '',
      accountNo: document.getElementById('s-acc-no')?.value || '',
      ifscCode: document.getElementById('s-ifsc')?.value || '',
      upiId: document.getElementById('s-upi')?.value || '',
      invoicePrefix: document.getElementById('s-inv-prefix')?.value || 'SI',
      invoiceStartNo: Number(document.getElementById('s-inv-start')?.value) || 1,
      defaultTerms: document.getElementById('s-terms')?.value || '',
      supabaseUrl: document.getElementById('s-sb-url')?.value.trim() || '',
      supabaseKey: document.getElementById('s-sb-key')?.value.trim() || '',
    };
    DB.saveSettings(data);
    _imgs.logo = null;
    _imgs.sign = null;
    App.showToast('Settings saved successfully!', 'success');
    App.updateSidebarCompanyName(data.companyName);
  }

  function resetDefaults() {
    if (!confirm('Reset all settings to default? This cannot be undone.')) return;
    DB.saveSettings({});
    _imgs.logo = null;
    _imgs.sign = null;
    render();
    App.showToast('Settings reset to defaults.', 'warning');
  }

  return { render, onImageChange, onDragOver, onDrop, clearImage, save, resetDefaults, updateQrPreview, connectCloud, disconnectCloud, pushCloudData, pullCloudData };
})();

```

## File: `.\js\stock.js`
```javascript
// ============================================================
// stock.js — Stock Management Module for Sharma Industries
// ============================================================

const Stock = (() => {
  let currentTab = 'inventory'; // 'inventory' or 'journal'
  let searchQuery = '';
  let categoryFilter = '';
  let statusFilter = '';
  
  let journalSearchQuery = '';
  let journalTypeFilter = '';

  const RAW_MATERIAL_CATEGORIES = [
    'Raw Materials - Pigments',
    'Raw Materials - Binders',
    'Raw Materials - Fillers',
    'Solvents',
    'Chemicals',
    'Packaging',
    'Other Raw Materials'
  ];

  function render() {
    const allProducts = DB.getProducts();
    const products = allProducts.filter(p => !RAW_MATERIAL_CATEGORIES.includes(p.category));
    
    const allLogs = DB.getStockLogs();
    const logs = allLogs.filter(log => {
      const p = DB.getProduct(log.productId);
      return p && !RAW_MATERIAL_CATEGORIES.includes(p.category);
    });
    
    // Calculations
    const totalItems = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalAssetVal = products.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.purchasePrice) || 0)), 0);
    const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= (Number(p.minStock) || 10)).length;
    const outOfStock = products.filter(p => Number(p.stock) === 0).length;
    
    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>📊 Product Stock Management</h1>
          <p>Real-time valuation, alerts, and transaction journals for Sharma Industries finished products</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" onclick="Stock.printReport()">
            🖨️ Stock Report
          </button>
          <button class="btn btn-primary" onclick="App.navigate('products', 'new')">
            ➕ Add Finished Product
          </button>
        </div>
      </div>
      
      <!-- Stats Row -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon green">💰</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size:18px;">₹${fmt(totalAssetVal)}</div>
            <div class="stat-label">Total Asset Value</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan">📦</div>
          <div class="stat-info">
            <div class="stat-value">${totalItems.toLocaleString('en-IN')}</div>
            <div class="stat-label">Total Items in Stock</div>
          </div>
        </div>
        <div class="stat-card" style="${lowStock > 0 ? 'border-color:rgba(245,158,11,0.2);' : ''}">
          <div class="stat-icon orange">⚠️</div>
          <div class="stat-info">
            <div class="stat-value ${lowStock > 0 ? 'text-warning' : ''}">${lowStock}</div>
            <div class="stat-label">Low Stock Products</div>
          </div>
        </div>
        <div class="stat-card" style="${outOfStock > 0 ? 'border-color:rgba(239,68,68,0.2);' : ''}">
          <div class="stat-icon red">❌</div>
          <div class="stat-info">
            <div class="stat-value ${outOfStock > 0 ? 'text-danger' : ''}">${outOfStock}</div>
            <div class="stat-label">Out of Stock</div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn ${currentTab === 'inventory' ? 'active' : ''}" id="stock-tab-btn-inventory" onclick="Stock.switchTab('inventory')">📋 Stock Valuation & Control</button>
        <button class="tab-btn ${currentTab === 'journal' ? 'active' : ''}" id="stock-tab-btn-journal" onclick="Stock.switchTab('journal')">📜 Global Stock Ledger Journal</button>
      </div>
      
      <!-- Tab Content: Inventory status -->
      <div id="stock-tab-inventory" class="tab-content ${currentTab === 'inventory' ? 'active' : ''}">
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="stock-search" placeholder="Search product name, SKU, HSN..." value="${searchQuery}" oninput="Stock.applyFilters()">
          </div>
          <select class="filter-select" id="stock-filter-category" onchange="Stock.applyFilters()">
            <option value="">All Categories</option>
            ${[...new Set(products.map(p => p.category).filter(Boolean))].map(c => `<option value="${c}" ${categoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <select class="filter-select" id="stock-filter-status" onchange="Stock.applyFilters()">
            <option value="">All Stock Status</option>
            <option value="ok" ${statusFilter === 'ok' ? 'selected' : ''}>In Stock</option>
            <option value="low" ${statusFilter === 'low' ? 'selected' : ''}>Low Stock</option>
            <option value="out" ${statusFilter === 'out' ? 'selected' : ''}>Out of Stock</option>
          </select>
        </div>
        
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>HSN</th>
                  <th class="text-right">Purchase Cost</th>
                  <th class="text-right">Current Stock</th>
                  <th>Status</th>
                  <th class="text-right">Valuation (Asset)</th>
                  <th>Quick Adjustment</th>
                </tr>
              </thead>
              <tbody id="stock-inventory-tbody">
                ${renderInventoryRows(products)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Tab Content: Global Journal -->
      <div id="stock-tab-journal" class="tab-content ${currentTab === 'journal' ? 'active' : ''}">
        <div class="filter-bar">
          <div class="search-bar" style="flex:1;min-width:200px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="journal-search" placeholder="Search product name, reference, SKU..." value="${journalSearchQuery}" oninput="Stock.applyFilters()">
          </div>
          <select class="filter-select" id="journal-filter-type" onchange="Stock.applyFilters()">
            <option value="">All Transaction Types</option>
            <option value="INITIAL" ${journalTypeFilter === 'INITIAL' ? 'selected' : ''}>INITIAL ENTRY</option>
            <option value="RESTOCK" ${journalTypeFilter === 'RESTOCK' ? 'selected' : ''}>RESTOCK / PURCHASES</option>
            <option value="SALE" ${journalTypeFilter === 'SALE' ? 'selected' : ''}>SALES DEDUCTIONS</option>
            <option value="SALE_CANCELLED" ${journalTypeFilter === 'SALE_CANCELLED' ? 'selected' : ''}>SALES CANCELLED</option>
            <option value="DAMAGE" ${journalTypeFilter === 'DAMAGE' ? 'selected' : ''}>DAMAGE / SPILLAGE</option>
            <option value="AUDIT" ${journalTypeFilter === 'AUDIT' ? 'selected' : ''}>AUDIT ADJUSTMENTS</option>
          </select>
        </div>
        
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="table-wrapper" style="border:none;max-height:600px;overflow-y:auto;">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product Name</th>
                  <th>Operation</th>
                  <th>Ref # / Invoice</th>
                  <th class="text-right">Qty Adjusted</th>
                  <th class="text-right">Resulting Stock</th>
                  <th>Reason & Notes</th>
                </tr>
              </thead>
              <tbody id="stock-journal-tbody">
                ${renderJournalRows(logs)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `stock-tab-btn-${tab}`);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `stock-tab-${tab}`);
    });
    applyFilters();
  }

  function renderInventoryRows(products) {
    // apply filtering
    let list = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.hsnCode || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter);
    }
    if (statusFilter) {
      if (statusFilter === 'ok') list = list.filter(p => Number(p.stock) > (Number(p.minStock) || 10));
      else if (statusFilter === 'low') list = list.filter(p => Number(p.stock) > 0 && Number(p.stock) <= (Number(p.minStock) || 10));
      else if (statusFilter === 'out') list = list.filter(p => Number(p.stock) === 0);
    }

    if (!list.length) {
      return `<tr><td colspan="8"><div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No products match filters</h3>
        <p>Try resetting search or category parameters</p>
      </div></td></tr>`;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return list.map(p => {
      const stock = Number(p.stock) || 0;
      const minStock = Number(p.minStock) || 10;
      const purchasePrice = Number(p.purchasePrice) || 0;
      const assetValue = stock * purchasePrice;
      
      const stockStatus = stock === 0 ? 'critical' : (stock <= minStock ? 'low' : 'ok');
      const stockLabel = stock === 0 ? '❌ Out' : (stockStatus === 'low' ? `⚠️ Low` : `✅ Good`);
      const badgeMap = { critical: 'danger', low: 'warning', ok: 'success' };
      
      return `
        <tr>
          <td>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${p.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">SKU: ${p.sku || '—'}</div>
          </td>
          <td><span class="badge badge-muted" style="padding:2px 6px;">${p.category || 'General'}</span></td>
          <td class="td-mono">${p.hsnCode || '—'}</td>
          <td class="td-mono text-right">₹${fmt(purchasePrice)}</td>
          <td class="td-mono text-right font-bold" style="font-size:15px;color:${stockStatus==='critical'?'var(--danger)':(stockStatus==='low'?'#f59e0b':'var(--success)')}">${stock} ${p.unit || ''}</td>
          <td><span class="badge badge-${badgeMap[stockStatus]}">${stockLabel}</span></td>
          <td class="td-mono text-right font-bold text-accent">₹${fmt(assetValue)}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-success btn-sm" onclick="Stock.openAdjustModal('${p.id}', 'add')" style="padding:4px 8px;font-size:11px;">➕ Receive</button>
              <button class="btn btn-danger btn-sm" onclick="Stock.openAdjustModal('${p.id}', 'sub')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.15);">➖ Reduce</button>
              <button class="btn btn-danger btn-sm" onclick="Stock.deleteProduct('${p.id}')" style="padding:4px 8px;font-size:11px;background:rgba(239,68,68,0.25);" title="Delete Product">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function renderJournalRows(logs) {
    let list = [...logs];
    list.sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00:00')) - new Date(a.date + ' ' + (a.time || '00:00:00')) || b.id.localeCompare(a.id));
    
    if (journalSearchQuery) {
      const q = journalSearchQuery.toLowerCase();
      list = list.filter(log => {
        const prod = DB.getProduct(log.productId);
        return (prod && prod.name.toLowerCase().includes(q)) || 
               (prod && prod.sku && prod.sku.toLowerCase().includes(q)) ||
               (log.reference || '').toLowerCase().includes(q) ||
               (log.reason || '').toLowerCase().includes(q);
      });
    }
    
    if (journalTypeFilter) {
      list = list.filter(log => log.type === journalTypeFilter);
    }
    
    if (!list.length) {
      return `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>No transactions found</h3>
        <p>Perform a stock adjust or create an invoice to populate stock logs</p>
      </div></td></tr>`;
    }

    return list.map(log => {
      const p = DB.getProduct(log.productId);
      if (!p) return '';
      
      const badgeMap = { INITIAL: 'purple', RESTOCK: 'success', SALE: 'info', SALE_CANCELLED: 'info', DAMAGE: 'danger', AUDIT: 'warning' };
      const qtyFmt = log.qty > 0 ? `+${log.qty}` : `${log.qty}`;
      const qtyColor = log.qty > 0 ? 'text-success' : 'text-danger';
      
      // format date
      const dateStr = new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
      
      return `
        <tr>
          <td class="td-mono">${dateStr}</td>
          <td>
            <div style="font-weight:700;">${p.name}</div>
            <div style="font-size:11px;color:var(--text-muted);">SKU: ${p.sku || '—'}</div>
          </td>
          <td><span class="badge badge-${badgeMap[log.type] || 'muted'}">${log.type}</span></td>
          <td><strong>${log.reference || '—'}</strong></td>
          <td class="td-mono font-bold ${qtyColor} text-right">${qtyFmt} ${p.unit||''}</td>
          <td class="td-mono font-bold text-accent text-right">${log.resultingStock} ${p.unit||''}</td>
          <td>
            <div style="font-weight:600;font-size:12px;">${log.reason || ''}</div>
            ${log.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">"${log.notes}"</div>` : ''}
          </td>
        </tr>`;
    }).join('');
  }

  function applyFilters() {
    if (currentTab === 'inventory') {
      searchQuery = document.getElementById('stock-search')?.value || '';
      categoryFilter = document.getElementById('stock-filter-category')?.value || '';
      statusFilter = document.getElementById('stock-filter-status')?.value || '';
      
      const tbody = document.getElementById('stock-inventory-tbody');
      if (tbody) tbody.innerHTML = renderInventoryRows(DB.getProducts().filter(p => !RAW_MATERIAL_CATEGORIES.includes(p.category)));
    } else {
      journalSearchQuery = document.getElementById('journal-search')?.value || '';
      journalTypeFilter = document.getElementById('journal-filter-type')?.value || '';
      
      const tbody = document.getElementById('stock-journal-tbody');
      if (tbody) {
        const allLogs = DB.getStockLogs();
        const logs = allLogs.filter(log => {
          const p = DB.getProduct(log.productId);
          return p && !RAW_MATERIAL_CATEGORIES.includes(p.category);
        });
        tbody.innerHTML = renderJournalRows(logs);
      }
    }
  }

  function openAdjustModal(productId, action) {
    const p = DB.getProduct(productId);
    if (!p) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'stock-adjust-modal';
    
    const title = action === 'add' ? '➕ Receive Stock / Add Material' : '➖ Reduce Stock / Deduct Spillage';
    const label = action === 'add' ? 'Quantity to Add / Restock' : 'Quantity to Reduce / Deduct';
    const btnText = action === 'add' ? '➕ Add Stock' : '➖ Reduce Stock';
    const btnClass = action === 'add' ? 'btn-success' : 'btn-danger';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" onclick="Stock.closeAdjustModal()">✕</button>
        </div>
        <form onsubmit="Stock.saveStockAdjustment(event, '${p.id}', '${action}')">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="font-size:14px;background:rgba(255,255,255,0.02);padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);">
              <strong>Product Name:</strong> ${p.name}<br>
              <strong>Current Physical Stock:</strong> <span class="font-mono text-accent" style="font-weight:700;">${p.stock} ${p.unit||''}</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">${label} <span class="required">*</span></label>
              <input class="form-control" name="qty" type="number" step="0.01" min="0.01" placeholder="0.00" required id="stock-adjust-qty-input">
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Reference ID / No.</label>
                <input class="form-control" name="reference" placeholder="e.g. PO-1002, physically counted">
              </div>
              <div class="form-group">
                <label class="form-label">Reason Code <span class="required">*</span></label>
                <select class="form-control" name="reason" required>
                  ${action === 'add'
                    ? `<option value="Purchase Restock">Purchase Restock</option>
                       <option value="Restored from Waste">Restored from Waste</option>
                       <option value="Physical Inventory Audit">Physical Inventory Audit</option>
                       <option value="Other Addition">Other Addition</option>`
                    : `<option value="Damage / Spillage">Damage / Paint Spillage</option>
                       <option value="Physical Inventory Shrinkage">Physical Inventory Shrinkage</option>
                       <option value="Internal Factory Usage">Internal Factory Usage</option>
                       <option value="Expired / Defective">Expired / Defective Paint</option>
                       <option value="Other Deduction">Other Deduction</option>`
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes / Remarks</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Provide extra detail about this adjustment..."></textarea>
            </div>
            <div class="divider mt-2"></div>
            <div class="flex gap-3" style="justify-content:flex-end;">
              <button type="button" class="btn btn-secondary" onclick="Stock.closeAdjustModal()">Cancel</button>
              <button type="submit" class="btn ${btnClass}">💾 ${btnText}</button>
            </div>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Stock.closeAdjustModal(); });
    document.getElementById('stock-adjust-qty-input')?.focus();
  }

  function closeAdjustModal() {
    document.getElementById('stock-adjust-modal')?.remove();
  }

  function saveStockAdjustment(e, productId, action) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const qty = Number(fd.get('qty'));
    const finalQty = action === 'add' ? qty : -qty;

    const reference = fd.get('reference') || '';
    const reason = fd.get('reason') || '';
    const notes = fd.get('notes') || '';
    
    const type = action === 'add' ? 'RESTOCK' : (reason === 'Damage / Spillage' ? 'DAMAGE' : 'AUDIT');

    DB.addStockAdjustment(productId, type, finalQty, reference, reason, notes);
    App.showToast('Inventory level adjusted successfully!', 'success');
    closeAdjustModal();
    render();
  }

  function deleteProduct(id) {
    const prod = DB.getProduct(id);
    if (!prod) return;
    if (!confirm(`Delete "${prod.name}" and all its inventory logs? This cannot be undone.`)) return;
    DB.deleteProduct(id);
    App.showToast('Product deleted.', 'warning');
    render();
  }

  function printReport() {
    const products = DB.getProducts();
    const settings = DB.getSettings();
    const dateStr = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    
    let totalItems = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outStockCount = 0;
    
    const rows = products.map((p, idx) => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.purchasePrice) || 0;
      const value = stock * price;
      totalItems += stock;
      totalValuation += value;
      
      const isLow = stock > 0 && stock <= (Number(p.minStock) || 10);
      const isOut = stock === 0;
      if (isLow) lowStockCount++;
      if (isOut) outStockCount++;
      
      const statusText = isOut ? 'Out of Stock' : (isLow ? 'Low Stock' : 'Good');
      const statusColor = isOut ? '#ef4444' : (isLow ? '#f59e0b' : '#10b981');
      
      return `
        <tr>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;">${idx + 1}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;">
            <strong>${p.name}</strong><br>
            <span style="font-size:10px;color:#666;">SKU: ${p.sku || '—'} | HSN: ${p.hsnCode || '—'}</span>
          </td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;">${p.category || 'Uncategorized'}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;text-align:right;font-family:monospace;">${stock} ${p.unit || 'Pcs'}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;text-align:right;font-family:monospace;">₹${price.toFixed(2)}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;text-align:right;font-family:monospace;font-weight:bold;">₹${value.toFixed(2)}</td>
          <td style="border-bottom:1px solid #ddd;padding:8px 10px;color:${statusColor};font-weight:bold;font-size:11px;">${statusText}</td>
        </tr>
      `;
    }).join('');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Inventory Valuation Report - Sharma Industries</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #333; margin: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #666; margin-top: 5px; }
          .report-meta { text-align: right; font-size: 13px; color: #666; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 6px; background: #fafafa; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
          .stat-value { font-size: 18px; font-weight: bold; font-family: monospace; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) td { background-color: #fafafa; }
          .footer { text-align: center; border-top: 1px solid #ddd; padding-top: 20px; font-size: 11px; color: #888; margin-top: 50px; }
          
          @media print {
            body { margin: 20px; }
            .print-btn-container { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container" style="display:flex;justify-content:flex-end;margin-bottom:20px;">
          <button onclick="window.print()" style="padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:inherit;">🖨️ Print Stock Sheet</button>
        </div>
        <div class="header">
          <div>
            <div class="company-name">${settings.companyName}</div>
            <div class="report-title">Inventory Valuation & Stock Report</div>
            <div style="font-size:12px;color:#666;margin-top:5px;">GSTIN: ${settings.gstin || '—'} · Address: ${settings.address || '—'}, ${settings.city || ''}</div>
          </div>
          <div class="report-meta">
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Total SKU Count:</strong> ${products.length}</div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Valuation (Asset)</div>
            <div class="stat-value">₹${totalValuation.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Stock Quantity</div>
            <div class="stat-value">${totalItems.toLocaleString('en-IN')} Items</div>
          </div>
          <div class="stat-card" style="border-left: 4px solid #f59e0b;">
            <div class="stat-label">Low Stock Products</div>
            <div class="stat-value" style="color:#b45309;">${lowStockCount}</div>
          </div>
          <div class="stat-card" style="border-left: 4px solid #ef4444;">
            <div class="stat-label">Out of Stock Products</div>
            <div class="stat-value" style="color:#b91c1c;">${outStockCount}</div>
          </div>
        </div>
        
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">S.No</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">Product Details</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">Category</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:right;">Current Stock</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:right;">Purchase Rate</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:right;">Asset Value</th>
              <th style="border-bottom:2px solid #ddd;padding:10px;text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          <strong>Sharma Industries Inventory Report</strong><br>
          This is a system-generated physical inventory assessment report. Confirms to local valuation rules.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function openAddInventoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'add-inventory-modal';
    
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">➕ Add Raw Material / Chemical</h2>
          <button class="modal-close" onclick="Stock.closeAddInventoryModal()">✕</button>
        </div>
        <form onsubmit="Stock.saveNewInventoryItem(event)">
          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Chemical / Material Name <span class="required">*</span></label>
              <input class="form-control" name="name" placeholder="e.g. Titanium Dioxide (TiO₂)" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category <span class="required">*</span></label>
              <select class="form-control" name="category" required>
                <option value="Raw Materials - Pigments">Raw Materials - Pigments</option>
                <option value="Raw Materials - Binders">Raw Materials - Binders</option>
                <option value="Raw Materials - Fillers">Raw Materials - Fillers</option>
                <option value="Solvents">Solvents</option>
                <option value="Chemicals" selected>Chemicals & Reagents</option>
                <option value="Packaging">Packaging Materials</option>
                <option value="Other">Other Inventory</option>
              </select>
            </div>
          </div>

          <div class="form-grid-3" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">SKU / Catalog No.</label>
              <input class="form-control" name="sku" placeholder="e.g. TIO2-RUT">
            </div>
            <div class="form-group">
              <label class="form-label">HSN Code <span class="required">*</span></label>
              <input class="form-control" name="hsnCode" placeholder="e.g. 2823" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit of Measure <span class="required">*</span></label>
              <select class="form-control" name="unit" required>
                <option value="Kg" selected>Kg (Kilogram)</option>
                <option value="Ltr">Ltr (Litre)</option>
                <option value="Nos">Nos (Numbers)</option>
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Ton">Ton (Tonne)</option>
                <option value="Quintal">Quintal</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
            </div>
          </div>

          <div class="form-grid-3" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">GST Rate (%) <span class="required">*</span></label>
              <select class="form-control" name="gstRate" required>
                <option value="18" selected>18% (Standard)</option>
                <option value="12">12%</option>
                <option value="5">5%</option>
                <option value="28">28%</option>
                <option value="0">0% (Exempt)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Purchase Price (₹) <span class="required">*</span></label>
              <input class="form-control" name="purchasePrice" type="number" step="0.01" min="0" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">Initial Stock Qty <span class="required">*</span></label>
              <input class="form-control" name="stock" type="number" step="0.01" min="0" placeholder="0.00" required>
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Min Stock Alert Level</label>
              <input class="form-control" name="minStock" type="number" step="0.01" min="0" placeholder="10.00" value="10">
            </div>
            <div class="form-group">
              <label class="form-label">Storage Location / Bin</label>
              <input class="form-control" name="location" placeholder="e.g. Shelf A-3, Cold Room">
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Description / Grade Specs</label>
            <textarea class="form-control" name="description" placeholder="Specify grade, concentration, purity or specific usage instructions..." rows="3"></textarea>
          </div>

          <div class="divider"></div>
          <div class="flex gap-3" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" onclick="Stock.closeAddInventoryModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">💾 Save Material</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) Stock.closeAddInventoryModal(); });
  }

  function closeAddInventoryModal() {
    document.getElementById('add-inventory-modal')?.remove();
  }

  function saveNewInventoryItem(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    
    const purchasePrice = Number(fd.get('purchasePrice')) || 0;
    
    const newProduct = {
      name: fd.get('name'),
      category: fd.get('category'),
      sku: fd.get('sku') || '',
      hsnCode: fd.get('hsnCode'),
      description: fd.get('description') || '',
      unit: fd.get('unit'),
      gstRate: Number(fd.get('gstRate')),
      purchasePrice: purchasePrice,
      sellingPrice: purchasePrice, // default sellingPrice to purchasePrice since it's a raw chemical/material
      stock: Number(fd.get('stock')) || 0,
      minStock: Number(fd.get('minStock')) || 10,
      location: fd.get('location') || '',
      image: '',
    };

    DB.addProduct(newProduct);
    App.showToast('Inventory item added and synced successfully!', 'success');
    closeAddInventoryModal();
    render();
  }

  return { render, switchTab, applyFilters, openAdjustModal, closeAdjustModal, saveStockAdjustment, printReport, deleteProduct, openAddInventoryModal, closeAddInventoryModal, saveNewInventoryItem };
})();

```

## File: `.\node-portable\node-v20.11.0-win-x64\CHANGELOG.md`
```md
# Node.js Changelog

Select a Node.js version below to view the changelog history:

* [Node.js 20](doc/changelogs/CHANGELOG_V20.md) **Long Term Support**
* [Node.js 19](doc/changelogs/CHANGELOG_V19.md) End-of-Life
* [Node.js 18](doc/changelogs/CHANGELOG_V18.md) Long Term Support
* [Node.js 17](doc/changelogs/CHANGELOG_V17.md) End-of-Life
* [Node.js 16](doc/changelogs/CHANGELOG_V16.md) End-of-Life
* [Node.js 15](doc/changelogs/CHANGELOG_V15.md) End-of-Life
* [Node.js 14](doc/changelogs/CHANGELOG_V14.md) End-of-Life
* [Node.js 13](doc/changelogs/CHANGELOG_V13.md) End-of-Life
* [Node.js 12](doc/changelogs/CHANGELOG_V12.md) End-of-Life
* [Node.js 11](doc/changelogs/CHANGELOG_V11.md) End-of-Life
* [Node.js 10](doc/changelogs/CHANGELOG_V10.md) End-of-Life
* [Node.js 9](doc/changelogs/CHANGELOG_V9.md) End-of-Life
* [Node.js 8](doc/changelogs/CHANGELOG_V8.md) End-of-Life
* [Node.js 7](doc/changelogs/CHANGELOG_V7.md) End-of-Life
* [Node.js 6](doc/changelogs/CHANGELOG_V6.md) End-of-Life
* [Node.js 5](doc/changelogs/CHANGELOG_V5.md) End-of-Life
* [Node.js 4](doc/changelogs/CHANGELOG_V4.md) End-of-Life
* [io.js](doc/changelogs/CHANGELOG_IOJS.md) End-of-Life
* [Node.js 0.12](doc/changelogs/CHANGELOG_V012.md) End-of-Life
* [Node.js 0.10](doc/changelogs/CHANGELOG_V010.md) End-of-Life
* [Archive](doc/changelogs/CHANGELOG_ARCHIVE.md)

Please use the following table to find the changelog for a specific Node.js
release.

<table>
<tr>
  <th title="LTS Until 2026-04"><a href="doc/changelogs/CHANGELOG_V20.md">20</a> (LTS)</th>
  <th title="LTS Until 2025-04"><a href="doc/changelogs/CHANGELOG_V18.md">18</a> (LTS)</th>
  <th title="LTS Until 2023-09"><a href="doc/changelogs/CHANGELOG_V16.md">16</a> (LTS)</th>
</tr>
<tr>
  <td valign="top">
<b><a href="doc/changelogs/CHANGELOG_V20.md#20.11.0">20.11.0</a></b><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.10.0">20.10.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.9.0">20.9.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.8.1">20.8.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.8.0">20.8.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.7.0">20.7.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.6.1">20.6.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.6.0">20.6.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.5.1">20.5.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.5.0">20.5.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.4.0">20.4.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.3.1">20.3.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.3.0">20.3.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.2.0">20.2.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.1.0">20.1.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V20.md#20.0.0">20.0.0</a><br/>
  </td>
  <td valign="top">
<b><a href="doc/changelogs/CHANGELOG_V18.md#18.15.0">18.15.0</a></b><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.14.2">18.14.2</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.14.1">18.14.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.14.0">18.14.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.13.0">18.13.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.12.1">18.12.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.12.0">18.12.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.11.0">18.11.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.10.0">18.10.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.9.1">18.9.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.9.0">18.9.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.8.0">18.8.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.7.0">18.7.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.6.0">18.6.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.5.0">18.5.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.4.0">18.4.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.3.0">18.3.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.2.0">18.2.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.1.0">18.1.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V18.md#18.0.0">18.0.0</a><br/>
  </td>
  <td valign="top">
<b><a href="doc/changelogs/CHANGELOG_V16.md#16.20.0">16.20.0</a></b><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.19.1">16.19.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.19.0">16.19.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.18.1">16.18.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.18.0">16.18.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.17.1">16.17.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.17.0">16.17.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.16.0">16.16.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.15.1">16.15.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.15.0">16.15.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.14.2">16.14.2</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.14.1">16.14.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.14.0">16.14.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.13.2">16.13.2</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.13.1">16.13.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.13.0">16.13.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.12.0">16.12.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.11.1">16.11.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.11.0">16.11.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.10.0">16.10.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.9.1">16.9.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.9.0">16.9.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.8.0">16.8.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.7.0">16.7.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.6.2">16.6.2</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.6.1">16.6.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.6.0">16.6.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.5.0">16.5.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.4.2">16.4.2</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.4.1">16.4.1</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.4.0">16.4.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.3.0">16.3.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.2.0">16.2.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.1.0">16.1.0</a><br/>
<a href="doc/changelogs/CHANGELOG_V16.md#16.0.0">16.0.0</a><br/>
    </td>
</tr>
</table>

## Notes

* The [Node.js Long Term Support plan](https://github.com/nodejs/Release) covers
  LTS releases.
* Release versions in **bold** text are the most recent supported releases.

***

***

## 2016-05-06, Version 0.12.14 (Maintenance), @rvagg

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.14">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.14</a>.

## 2016-05-06, Version 0.10.45 (Maintenance), @rvagg

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.45">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.45</a>.

## 2016-05-05, Version 6.1.0 (Current), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V6.md#6.1.0">Moved to doc/changelogs/CHANGELOG\_V6.md#6.1.0</a>.

## 2016-05-05, Version 5.11.1 (Stable), @evanlucas

<a href="doc/changelogs/CHANGELOG_V5.md#5.11.1">Moved to doc/changelogs/CHANGELOG\_V5.md#5.11.1</a>.

## 2016-05-05, Version 4.4.4 'Argon' (LTS), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.4.4">Moved to doc/changelogs/CHANGELOG\_V4.md#4.4.4</a>.

## 2016-04-26, Version 6.0.0 (Current), @jasnell

<a href="doc/changelogs/CHANGELOG_V6.md#6.0.0">Moved to doc/changelogs/CHANGELOG\_V6.md#6.0.0</a>.

## 2016-04-20, Version 5.11.0 (Stable), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V5.md#5.11.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.11.0</a>.

## 2016-04-05, Version 5.10.1 (Stable), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V5.md#5.10.1">Moved to doc/changelogs/CHANGELOG\_V5.md#5.10.1</a>.

## 2016-03-31, Version 0.10.44 (Maintenance), @rvagg

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.44">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.44</a>.

## 2016-03-31, Version 5.10.0 (Stable), @evanlucas

<a href="doc/changelogs/CHANGELOG_V5.md#5.10.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.10.0</a>.

## 2016-03-31, Version 4.4.2 'Argon' (LTS), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.4.2">Moved to doc/changelogs/CHANGELOG\_V4.md#4.4.2</a>.

## 2016-03-31, Version 0.12.13 (LTS), @rvagg

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.13">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.13</a>.

## 2016-03-23, Version 5.9.1 (Stable), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V5.md#5.9.1">Moved to doc/changelogs/CHANGELOG\_V5.md#5.9.1</a>.

## 2016-03-22, Version 4.4.1 'Argon' (LTS), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.4.1">Moved to doc/changelogs/CHANGELOG\_V4.md#4.4.1</a>.

## 2016-03-16, Version 5.9.0 (Stable), @evanlucas

<a href="doc/changelogs/CHANGELOG_V5.md#5.9.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.9.0</a>.

## 2016-03-08, Version 5.8.0 (Stable), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V5.md#5.8.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.8.0</a>.

## 2016-03-08, Version 4.4.0 'Argon' (LTS), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.4.0">Moved to doc/changelogs/CHANGELOG\_V4.md#4.4.0</a>.

## 2016-03-08, Version 0.12.12 (LTS), @rvagg

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.12">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.12</a>.

## 2016-03-03, Version 0.12.11 (LTS), @rvagg

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.11">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.11</a>.

## 2016-03-02, Version 5.7.1 (Stable), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V5.md#5.7.1">Moved to doc/changelogs/CHANGELOG\_V5.md#5.7.1</a>.

## 2016-03-02, Version 4.3.2 'Argon' (LTS), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.3.2">Moved to doc/changelogs/CHANGELOG\_V4.md#4.3.2</a>.

## 2016-02-23, Version 5.7.0 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V5.md#5.7.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.7.0</a>.

## 2016-02-16, Version 4.3.1 'Argon' (LTS), @thealphanerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.3.1">Moved to doc/changelogs/CHANGELOG\_V4.md#4.3.1</a>.

## 2016-02-09, Version 5.6.0 (Stable), @jasnell

<a href="doc/changelogs/CHANGELOG_V5.md#5.6.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.6.0</a>.

## 2016-02-09, Version 4.3.0 'Argon' (LTS), @jasnell

<a href="doc/changelogs/CHANGELOG_V4.md#4.3.0">Moved to doc/changelogs/CHANGELOG\_V4.md#4.3.0</a>.

## 2016-02-09, Version 0.12.10 (LTS), @jasnell

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.10">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.10</a>.

## 2016-02-09, Version 0.10.42 (Maintenance), @jasnell

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.42">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.42</a>.

## 2016-01-21, Version 4.2.6 'Argon' (LTS), @TheAlphaNerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.6">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.6</a>.

## 2016-01-20, Version 5.5.0 (Stable), @evanlucas

<a href="doc/changelogs/CHANGELOG_V5.md#5.5.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.5.0</a>.

## 2016-01-20, Version 4.2.5 'Argon' (LTS), @TheAlphaNerd

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.5">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.5</a>.

## 2016-01-12, Version 5.4.1 (Stable), @TheAlphaNerd

<a href="doc/changelogs/CHANGELOG_V5.md#5.4.1">Moved to doc/changelogs/CHANGELOG\_V5.md#5.4.1</a>.

## 2016-01-06, Version 5.4.0 (Stable), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V5.md#5.4.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.4.0</a>.

## 2015-12-23, Version 4.2.4 'Argon' (LTS), @jasnell

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.4">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.4</a>.

## 2015-12-16, Version 5.3.0 (Stable), @cjihrig

<a href="doc/changelogs/CHANGELOG_V5.md#5.3.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.3.0</a>.

## 2015-12-09, Version 5.2.0 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V5.md#5.2.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.2.0</a>.

## 2015-12-04, Version 5.1.1 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V5.md#5.1.1">Moved to doc/changelogs/CHANGELOG\_V5.md#5.1.1</a>.

## 2015-12-04, Version 4.2.3 'Argon' (LTS), @rvagg

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.3">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.3</a>.

## 2015-12-04, Version 0.12.9 (LTS), @rvagg

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.9">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.9</a>.

## 2015-12-04, Version 0.10.41 (Maintenance), @rvagg

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.41">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.41</a>.

## 2015.11.25, Version 0.12.8 (LTS), @rvagg

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.8">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.8</a>.

## 2015-11-17, Version 5.1.0 (Stable), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V5.md#5.1.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.1.0</a>.

## 2015-11-03, Version 4.2.2 'Argon' (LTS), @jasnell

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.2">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.2</a>.

## 2015-10-29, Version 5.0.0 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V5.md#5.0.0">Moved to doc/changelogs/CHANGELOG\_V5.md#5.0.0</a>.

## 2015-10-13, Version 4.2.1 'Argon' (LTS), @jasnell

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.1">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.1</a>.

## 2015-10-07, Version 4.2.0 'Argon' (LTS), @jasnell

<a href="doc/changelogs/CHANGELOG_V4.md#4.2.0">Moved to doc/changelogs/CHANGELOG\_V4.md#4.2.0</a>.

## 2015-10-05, Version 4.1.2 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V4.md#4.1.2">Moved to doc/changelogs/CHANGELOG\_V4.md#4.1.2</a>.

## 2015-09-22, Version 4.1.1 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V4.md#4.1.1">Moved to doc/changelogs/CHANGELOG\_V4.md#4.1.1</a>.

## 2015-09-17, Version 4.1.0 (Stable), @Fishrock123

<a href="doc/changelogs/CHANGELOG_V4.md#4.1.0">Moved to doc/changelogs/CHANGELOG\_V4.md#4.1.0</a>.

## 2015-09-15, io.js Version 3.3.1 @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#3.3.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#3.3.1</a>.

## 2015-09-08, Version 4.0.0 (Stable), @rvagg

<a href="doc/changelogs/CHANGELOG_V4.md#4.0.0">Moved to doc/changelogs/CHANGELOG\_V6.md#6.0.0</a>.

## 2015-09-02, Version 3.3.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#3.3.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#3.3.0</a>.

## 2015-08-25, Version 3.2.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#3.2.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#3.2.0</a>.

## 2015-08-18, Version 3.1.0, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#3.1.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#3.1.0</a>.

## 2015-08-04, Version 3.0.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#3.0.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#3.0.0</a>.

## 2015-07-28, Version 2.5.0, @cjihrig

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.5.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.5.0</a>.

## 2015-07-17, Version 2.4.0, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.4.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.4.0</a>.

## 2015-07-09, Version 2.3.4, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.3.4">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.3.4</a>.

## 2015-07-09, Version 1.8.4, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.8.4">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.8.4</a>.

## 2015-07-09, Version 0.12.7 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.7">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.7</a>.

## 2015-07-04, Version 2.3.3, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.3.3">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.3.3</a>.

## 2015-07-04, Version 1.8.3, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.8.3">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.8.3</a>.

## 2015-07-03, Version 0.12.6 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.6">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.6</a>.

## 2015-07-01, Version 2.3.2, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.3.2">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.3.2</a>.

## 2015-06-23, Version 2.3.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.3.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.3.1</a>.

## 2015-06-22, Version 0.12.5 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.5">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.5</a>.

## 2015-06-18, Version 0.10.39 (Maintenance)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.39">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.39</a>.

## 2015-06-13, Version 2.3.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.3.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.3.0</a>.

## 2015-06-01, Version 2.2.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.2.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.2.1</a>.

## 2015-05-31, Version 2.2.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.2.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.2.0</a>.

## 2015-05-24, Version 2.1.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.1.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.1.0</a>.

## 2015-05-22, Version 0.12.4 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.4">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.4</a>.

## 2015-05-17, Version 1.8.2, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.8.2">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.8.2</a>.

## 2015-05-15, Version 2.0.2, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.0.2">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.0.2</a>.

## 2015-05-13, Version 0.12.3 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.3">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.3</a>.

## 2015-05-07, Version 2.0.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.0.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.0.1</a>.

## 2015-05-04, Version 2.0.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#2.0.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#2.0.0</a>.

## 2015-04-20, Version 1.8.1, @chrisdickinson

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.8.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.8.1</a>.

## 2015-04-14, Version 1.7.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.7.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.7.1</a>.

## 2015-04-14, Version 1.7.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.7.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.7.0</a>.

## 2015-04-06, Version 1.6.4, @Fishrock123

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.6.4">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.6.4</a>.

## 2015-03-31, Version 1.6.3, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.6.3">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.6.3</a>.

## 2015-03-31, Version 0.12.2 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.2">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.2</a>.

## 2015-03-23, Version 1.6.2, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.6.2">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.6.2</a>.

## 2015-03-23, Version 0.12.1 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.1">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.1</a>.

## 2015-03-23, Version 0.10.38 (Maintenance)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.38">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.38</a>.

## 2015-03-20, Version 1.6.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.6.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.6.1</a>.

## 2015-03-19, Version 1.6.0, @chrisdickinson

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.6.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.6.0</a>.

## 2015-03-11, Version 0.10.37 (Maintenance)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.37">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.37</a>.

## 2015-03-09, Version 1.5.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.5.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.5.1</a>.

## 2015-03-06, Version 1.5.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.5.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.5.0</a>.

## 2015-03-02, Version 1.4.3, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.4.3">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.4.3</a>.

## 2015-02-28, Version 1.4.2, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.4.2">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.4.2</a>.

## 2015-02-26, Version 1.4.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.4.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.4.1</a>.

## 2015-02-20, Version 1.3.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.3.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.3.0</a>.

## 2015-02-10, Version 1.2.0, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.2.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.2.0</a>.

## 2015-02-06, Version 0.12.0 (Stable)

<a href="doc/changelogs/CHANGELOG_V012.md#0.12.0">Moved to doc/changelogs/CHANGELOG\_V012.md#0.12.0</a>.

## 2015-02-03, Version 1.1.0, @chrisdickinson

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.1.0">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.1.0</a>.

## 2015-01-26, Version 0.10.36 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.36">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.36</a>.

## 2015-01-24, Version 1.0.4, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.0.4">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.0.4</a>.

## 2015-01-20, Version 1.0.3, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.0.3">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.0.3</a>.

## 2015-01-16, Version 1.0.2, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.0.2">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.0.2</a>.

## 2015-01-14, Version 1.0.1, @rvagg

<a href="doc/changelogs/CHANGELOG_IOJS.md#1.0.1">Moved to doc/changelogs/CHANGELOG\_IOJS.md#1.0.1</a>.

## 2014.09.24, Version 0.11.14 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.14">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.14</a>.

## 2014.05.01, Version 0.11.13 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.13">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.13</a>.

## 2014.03.11, Version 0.11.12 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.12</a>.

## 2014.01.29, Version 0.11.11 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.11</a>.

## 2013.12.31, Version 0.11.10 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.10</a>.

## 2013.11.20, Version 0.11.9 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.9</a>.

## 2013.10.30, Version 0.11.8 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.8</a>.

## 2013.08.21, Version 0.11.7 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.7</a>.

## 2013.08.21, Version 0.11.6 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.6</a>.

## 2013.08.06, Version 0.11.5 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.5</a>.

## 2013.07.12, Version 0.11.4 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.4</a>.

## 2013.06.26, Version 0.11.3 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.3</a>.

## 2013.05.13, Version 0.11.2 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.2</a>.

## 2013.04.19, Version 0.11.1 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.1</a>.

## 2013.03.28, Version 0.11.0 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.11.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.11.0</a>.

## 2014.12.22, Version 0.10.35 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.35">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.35</a>.

## 2014.12.17, Version 0.10.34 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.34">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.34</a>.

## 2014.10.20, Version 0.10.33 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.33">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.33</a>.

## 2014.09.16, Version 0.10.32 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.32">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.32</a>.

## 2014.08.19, Version 0.10.31 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.31">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.31</a>.

## 2014.07.31, Version 0.10.30 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.30">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.30</a>.

## 2014.06.05, Version 0.10.29 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.29">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.29</a>.

## 2014.05.01, Version 0.10.28 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.28">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.28</a>.

## 2014.05.01, Version 0.10.27 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.27">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.27</a>.

## 2014.02.18, Version 0.10.26 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.26">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.26</a>.

## 2014.01.23, Version 0.10.25 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.25">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.25</a>.

## 2013.12.18, Version 0.10.24 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.24">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.24</a>.

## 2013.12.12, Version 0.10.23 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.23">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.23</a>.

## 2013.11.12, Version 0.10.22 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.22">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.22</a>.

## 2013.10.18, Version 0.10.21 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.21">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.21</a>.

## 2013.09.30, Version 0.10.20 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.20">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.20</a>.

## 2013.09.24, Version 0.10.19 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.19">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.19</a>.

## 2013.09.04, Version 0.10.18 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.18">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.18</a>.

## 2013.08.21, Version 0.10.17 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.17">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.17</a>.

## 2013.08.16, Version 0.10.16 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.16">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.16</a>.

## 2013.07.25, Version 0.10.15 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.15">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.15</a>.

## 2013.07.25, Version 0.10.14 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.14">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.14</a>.

## 2013.07.09, Version 0.10.13 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.13">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.13</a>.

## 2013.06.18, Version 0.10.12 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.12">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.12</a>.

## 2013.06.13, Version 0.10.11 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.11">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.11</a>.

## 2013.06.04, Version 0.10.10 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.10">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.10</a>.

## 2013.05.30, Version 0.10.9 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.9">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.9</a>.

## 2013.05.24, Version 0.10.8 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.8">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.8</a>.

## 2013.05.17, Version 0.10.7 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.7">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.7</a>.

## 2013.05.14, Version 0.10.6 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.6">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.6</a>.

## 2013.04.23, Version 0.10.5 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.5">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.5</a>.

## 2013.04.11, Version 0.10.4 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.4">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.4</a>.

## 2013.04.03, Version 0.10.3 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.3">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.3</a>.

## 2013.03.28, Version 0.10.2 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.2">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.2</a>.

## 2013.03.21, Version 0.10.1 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.1">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.1</a>.

## 2013.03.11, Version 0.10.0 (Stable)

<a href="doc/changelogs/CHANGELOG_V010.md#0.10.0">Moved to doc/changelogs/CHANGELOG\_V010.md#0.10.0</a>.

## 2013.03.06, Version 0.9.12 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.12</a>.

## 2013.03.01, Version 0.9.11 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.11</a>.

## 2013.02.19, Version 0.9.10 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.10</a>.

## 2013.02.07, Version 0.9.9 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.9</a>.

## 2013.01.24, Version 0.9.8 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.8</a>.

## 2013.01.18, Version 0.9.7 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.7</a>.

## 2013.01.11, Version 0.9.6 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.6</a>.

## 2012.12.30, Version 0.9.5 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.5</a>.

## 2012.12.21, Version 0.9.4 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.4</a>.

## 2012.10.24, Version 0.9.3 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.3</a>.

## 2012.09.17, Version 0.9.2 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.2</a>.

## 2012.08.28, Version 0.9.1 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.1</a>.

## 2012.07.20, Version 0.9.0 (Unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.9.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.9.0</a>.

## 2013.06.13, Version 0.8.25 (maintenance)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.25">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.25</a>.

## 2013.06.04, Version 0.8.24 (maintenance)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.24">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.24</a>.

## 2013.04.09, Version 0.8.23 (maintenance)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.23">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.23</a>.

## 2013.03.07, Version 0.8.22 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.22">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.22</a>.

## 2013.02.25, Version 0.8.21 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.21">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.21</a>.

## 2013.02.15, Version 0.8.20 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.20">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.20</a>.

## 2013.02.06, Version 0.8.19 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.19">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.19</a>.

## 2013.01.18, Version 0.8.18 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.18">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.18</a>.

## 2013.01.09, Version 0.8.17 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.17">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.17</a>.

## 2012.12.13, Version 0.8.16 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.16">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.16</a>.

## 2012.11.26, Version 0.8.15 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.15">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.15</a>.

## 2012.10.25, Version 0.8.14 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.14">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.14</a>.

## 2012.10.25, Version 0.8.13 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.13">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.13</a>.

## 2012.10.12, Version 0.8.12 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.12</a>.

## 2012.09.27, Version 0.8.11 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.11</a>.

## 2012.09.25, Version 0.8.10 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.10</a>.

## 2012.09.11, Version 0.8.9 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.9</a>.

## 2012.08.22, Version 0.8.8 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.8</a>.

## 2012.08.15, Version 0.8.7 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.7</a>.

## 2012.08.07, Version 0.8.6 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.6</a>.

## 2012.08.02, Version 0.8.5 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.5</a>.

## 2012.07.25, Version 0.8.4 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.4</a>.

## 2012.07.19, Version 0.8.3 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.3</a>.

## 2012.07.09, Version 0.8.2 (Stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.2</a>.

## 2012.06.29, Version 0.8.1 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.1</a>.

## 2012.06.25, Version 0.8.0 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.8.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.8.0</a>.

## 2012.06.19, Version 0.7.12 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.12</a>.

## 2012.06.15, Version 0.7.11 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.11</a>.

## 2012.06.11, Version 0.7.10 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.10</a>.

## 2012.05.28, Version 0.7.9 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.9</a>.

## 2012.04.18, Version 0.7.8 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.8</a>.

## 2012.03.30, Version 0.7.7 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.7</a>.

## 2012.03.13, Version 0.7.6 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.6</a>.

## 2012.02.23, Version 0.7.5 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.5</a>.

## 2012.02.14, Version 0.7.4 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.4</a>.

## 2012.02.07, Version 0.7.3 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.3</a>.

## 2012.02.01, Version 0.7.2 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.2</a>.

## 2012.01.23, Version 0.7.1 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.1</a>.

## 2012.01.16, Version 0.7.0 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.7.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.7.0</a>.

## 2012.07.10 Version 0.6.20 (maintenance)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.20">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.20</a>.

## 2012.06.06 Version 0.6.19 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.19">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.19</a>.

## 2012.05.15 Version 0.6.18 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.18">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.18</a>.

## 2012.05.04 Version 0.6.17 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.17">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.17</a>.

## 2012.04.30 Version 0.6.16 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.16">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.16</a>.

## 2012.04.09 Version 0.6.15 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.15">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.15</a>.

## 2012.03.22 Version 0.6.14 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.14">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.14</a>.

## 2012.03.15 Version 0.6.13 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.13">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.13</a>.

## 2012.03.02 Version 0.6.12 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.12</a>.

## 2012.02.17 Version 0.6.11 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.11</a>.

## 2012.02.02, Version 0.6.10 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.10</a>.

## 2012.01.27, Version 0.6.9 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.9</a>.

## 2012.01.19, Version 0.6.8 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.8</a>.

## 2012.01.06, Version 0.6.7 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.7</a>.

## 2011.12.14, Version 0.6.6 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.6</a>.

## 2011.12.04, Version 0.6.5 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.5</a>.

## 2011.12.02, Version 0.6.4 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.4</a>.

## 2011.11.25, Version 0.6.3 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.3</a>.

## 2011.11.18, Version 0.6.2 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.2</a>.

## 2011.11.11, Version 0.6.1 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.1</a>.

## 2011.11.04, Version 0.6.0 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.6.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.6.0</a>.

## 2011.10.21, Version 0.5.10 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.10</a>.

## 2011.10.10, Version 0.5.9 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.9</a>.

## 2011.09.30, Version 0.5.8 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.8</a>.

## 2011.09.16, Version 0.5.7 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.7</a>.

## 2011.09.08, Version 0.5.6 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.6</a>.

## 2011.08.26, Version 0.5.5 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.5</a>.

## 2011.08.12, Version 0.5.4 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.4</a>.

## 2011.08.01, Version 0.5.3 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.3</a>.

## 2011.07.22, Version 0.5.2 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.2</a>.

## 2011.07.14, Version 0.5.1 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.1</a>.

## 2011.07.05, Version 0.5.0 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.5.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.5.0</a>.

## 2011.09.15, Version 0.4.12 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.12</a>.

## 2011.08.17, Version 0.4.11 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.11</a>.

## 2011.07.19, Version 0.4.10 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.10</a>.

## 2011.06.29, Version 0.4.9 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.9</a>.

## 2011.05.20, Version 0.4.8 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.8</a>.

## 2011.04.22, Version 0.4.7 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.7</a>.

## 2011.04.13, Version 0.4.6 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.6</a>.

## 2011.04.01, Version 0.4.5 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.5</a>.

## 2011.03.26, Version 0.4.4 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.4</a>.

## 2011.03.18, Version 0.4.3 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.3</a>.

## 2011.03.02, Version 0.4.2 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.2</a>.

## 2011.02.19, Version 0.4.1 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.1</a>.

## 2011.02.10, Version 0.4.0 (stable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.4.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.4.0</a>.

## 2011.02.04, Version 0.3.8 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.8</a>.

## 2011.01.27, Version 0.3.7 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.7</a>.

## 2011.01.21, Version 0.3.6 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.6</a>.

## 2011.01.16, Version 0.3.5 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.5</a>.

## 2011.01.08, Version 0.3.4 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.4</a>.

## 2011.01.02, Version 0.3.3 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.3</a>.

## 2010.12.16, Version 0.3.2 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.2</a>.

## 2010.11.16, Version 0.3.1 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.1</a>.

## 2010.10.23, Version 0.3.0 (unstable)

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.3.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.3.0</a>.

## 2010.08.20, Version 0.2.0

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.2.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.2.0</a>.

## 2010.08.13, Version 0.1.104

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.104">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.104</a>.

## 2010.08.04, Version 0.1.103

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.103">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.103</a>.

## 2010.07.25, Version 0.1.102

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.102">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.102</a>.

## 2010.07.16, Version 0.1.101

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.101">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.101</a>.

## 2010.07.03, Version 0.1.100

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.100">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.100</a>.

## 2010.06.21, Version 0.1.99

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.99">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.99</a>.

## 2010.06.11, Version 0.1.98

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.98">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.98</a>.

## 2010.05.29, Version 0.1.97

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.97">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.97</a>.

## 2010.05.21, Version 0.1.96

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.96">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.96</a>.

## 2010.05.13, Version 0.1.95

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.95">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.95</a>.

## 2010.05.06, Version 0.1.94

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.94">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.94</a>.

## 2010.04.29, Version 0.1.93

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.93">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.93</a>.

## 2010.04.23, Version 0.1.92

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.92">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.92</a>.

## 2010.04.15, Version 0.1.91

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.91">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.91</a>.

## 2010.04.09, Version 0.1.90

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.90">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.90</a>.

## 2010.03.19, Version 0.1.33

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.33">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.33</a>.

## 2010.03.12, Version 0.1.32

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.32">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.32</a>.

## 2010.03.05, Version 0.1.31

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.31">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.31</a>.

## 2010.02.22, Version 0.1.30

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.30">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.30</a>.

## 2010.02.17, Version 0.1.29

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.29">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.29</a>.

## 2010.02.09, Version 0.1.28

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.28">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.28</a>.

## 2010.02.03, Version 0.1.27

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.27">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.27</a>.

## 2010.01.20, Version 0.1.26

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.26">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.26</a>.

## 2010.01.09, Version 0.1.25

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.25">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.25</a>.

## 2009.12.31, Version 0.1.24

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.24">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.24</a>.

## 2009.12.22, Version 0.1.23

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.23">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.23</a>.

## 2009.12.19, Version 0.1.22

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.22">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.22</a>.

## 2009.12.06, Version 0.1.21

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.21">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.21</a>.

## 2009.11.28, Version 0.1.20

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.20">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.20</a>.

## 2009.11.28, Version 0.1.19

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.19">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.19</a>.

## 2009.11.17, Version 0.1.18

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.18">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.18</a>.

## 2009.11.07, Version 0.1.17

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.17">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.17</a>.

## 2009.11.03, Version 0.1.16

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.16">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.16</a>.

## 2009.10.28, Version 0.1.15

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.15">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.15</a>.

## 2009.10.09, Version 0.1.14

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.14">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.14</a>.

## 2009.09.30, Version 0.1.13

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.13">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.13</a>.

## 2009.09.24, Version 0.1.12

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.12">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.12</a>.

## 2009.09.18, Version 0.1.11

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.11">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.11</a>.

## 2009.09.11, Version 0.1.10

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.10">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.10</a>.

## 2009.09.05, Version 0.1.9

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.9">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.9</a>.

## 2009.09.04, Version 0.1.8

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.8">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.8</a>.

## 2009.08.27, Version 0.1.7

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.7">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.7</a>.

## 2009.08.22, Version 0.1.6

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.6</a>.

## 2009.08.21, Version 0.1.5

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.5">Moved to doc/changelogs/CHANGELOG\_V6.md#6.0.0</a>.

## 2009.08.13, Version 0.1.4

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.4</a>.

## 2009.08.06, Version 0.1.3

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.3</a>.

## 2009.08.01, Version 0.1.2

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.2">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.2</a>.

## 2009.07.27, Version 0.1.1

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.1">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.1</a>.

## 2009.06.30, Version 0.1.0

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.1.0">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.1.0</a>.

## 2009.06.24, Version 0.0.6

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.0.6">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.0.6</a>.

## 2009.06.18, Version 0.0.5

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.0.5">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.0.5</a>.

## 2009.06.13, Version 0.0.4

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.0.4">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.0.4</a>.

## 2009.06.11, Version 0.0.3

<a href="doc/changelogs/CHANGELOG_ARCHIVE.md#0.0.3">Moved to doc/changelogs/CHANGELOG\_ARCHIVE.md#0.0.3</a>.

```

## File: `.\node-portable\node-v20.11.0-win-x64\corepack`
```text
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ -x "$basedir/node" ]; then
  exec "$basedir/node"  "$basedir/node_modules/corepack/dist/corepack.js" "$@"
else
  exec node  "$basedir/node_modules/corepack/dist/corepack.js" "$@"
fi

```

## File: `.\node-portable\node-v20.11.0-win-x64\corepack.cmd`
```cmd
@SETLOCAL
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\corepack\dist\corepack.js" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\node_modules\corepack\dist\corepack.js" %*
)

```

## File: `.\node-portable\node-v20.11.0-win-x64\install_tools.bat`
```bat
@echo off

setlocal
title Install Additional Tools for Node.js

cls

echo ====================================================
echo Tools for Node.js Native Modules Installation Script
echo ====================================================
echo.
echo This script will install Python and the Visual Studio Build Tools, necessary
echo to compile Node.js native modules. Note that Chocolatey and required Windows
echo updates will also be installed.
echo.
echo This will require about 3 GiB of free disk space, plus any space necessary to
echo install Windows updates. This will take a while to run.
echo.
echo Please close all open programs for the duration of the installation. If the
echo installation fails, please ensure Windows is fully updated, reboot your
echo computer and try to run this again. This script can be found in the
echo Start menu under Node.js.
echo.
echo You can close this window to stop now. Detailed instructions to install these
echo tools manually are available at https://github.com/nodejs/node-gyp#on-windows
echo.
pause

cls

REM Adapted from https://github.com/Microsoft/windows-dev-box-setup-scripts/blob/79bbe5bdc4867088b3e074f9610932f8e4e192c2/README.md#legal
echo Using this script downloads third party software
echo ------------------------------------------------
echo This script will direct to Chocolatey to install packages. By using
echo Chocolatey to install a package, you are accepting the license for the
echo application, executable(s), or other artifacts delivered to your machine as a
echo result of a Chocolatey install. This acceptance occurs whether you know the
echo license terms or not. Read and understand the license terms of the packages
echo being installed and their dependencies prior to installation:
echo - https://chocolatey.org/packages/chocolatey
echo - https://chocolatey.org/packages/python
echo - https://chocolatey.org/packages/visualstudio2019-workload-vctools
echo.
echo This script is provided AS-IS without any warranties of any kind
echo ----------------------------------------------------------------
echo Chocolatey has implemented security safeguards in their process to help
echo protect the community from malicious or pirated software, but any use of this
echo script is at your own risk. Please read the Chocolatey's legal terms of use
echo as well as how the community repository for Chocolatey.org is maintained.
echo.
pause

cls

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command Start-Process '%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe' -ArgumentList '-NoProfile -InputFormat None -ExecutionPolicy Bypass -Command [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iex ((New-Object System.Net.WebClient).DownloadString(''https://chocolatey.org/install.ps1'')); choco upgrade -y python visualstudio2019-workload-vctools; Read-Host ''Type ENTER to exit'' ' -Verb RunAs

```

## File: `.\node-portable\node-v20.11.0-win-x64\LICENSE`
```text
Node.js is licensed for use as follows:

"""
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""

This license applies to parts of Node.js originating from the
https://github.com/joyent/node repository:

"""
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""

The Node.js license applies to all parts of Node.js that are not externally
maintained libraries.

The externally maintained libraries used by Node.js are:

- Acorn, located at deps/acorn, is licensed as follows:
  """
    MIT License

    Copyright (C) 2012-2022 by various contributors (see AUTHORS)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
  """

- c-ares, located at deps/cares, is licensed as follows:
  """
    MIT License

    Copyright (c) 1998 Massachusetts Institute of Technology
    Copyright (c) 2007 - 2023 Daniel Stenberg with many contributors, see AUTHORS
    file.

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice (including the next
    paragraph) shall be included in all copies or substantial portions of the
    Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
  """

- cjs-module-lexer, located at deps/cjs-module-lexer, is licensed as follows:
  """
    MIT License
    -----------

    Copyright (C) 2018-2020 Guy Bedford

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- ittapi, located at deps/v8/third_party/ittapi, is licensed as follows:
  """
    Copyright (c) 2019 Intel Corporation. All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- ICU, located at deps/icu-small, is licensed as follows:
  """
    UNICODE, INC. LICENSE AGREEMENT - DATA FILES AND SOFTWARE

    See Terms of Use
    for definitions of Unicode Inc.’s Data Files and Software.

    NOTICE TO USER: Carefully read the following legal agreement.
    BY DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING UNICODE INC.'S
    DATA FILES ("DATA FILES"), AND/OR SOFTWARE ("SOFTWARE"),
    YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
    TERMS AND CONDITIONS OF THIS AGREEMENT.
    IF YOU DO NOT AGREE, DO NOT DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE
    THE DATA FILES OR SOFTWARE.

    COPYRIGHT AND PERMISSION NOTICE

    Copyright © 1991-2023 Unicode, Inc. All rights reserved.
    Distributed under the Terms of Use in https://www.unicode.org/copyright.html.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of the Unicode data files and any associated documentation
    (the "Data Files") or Unicode software and any associated documentation
    (the "Software") to deal in the Data Files or Software
    without restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, and/or sell copies of
    the Data Files or Software, and to permit persons to whom the Data Files
    or Software are furnished to do so, provided that either
    (a) this copyright and permission notice appear with all copies
    of the Data Files or Software, or
    (b) this copyright and permission notice appear in associated
    Documentation.

    THE DATA FILES AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF
    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT OF THIRD PARTY RIGHTS.
    IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS
    NOTICE BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL
    DAMAGES, OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
    DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
    TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THE DATA FILES OR SOFTWARE.

    Except as contained in this notice, the name of a copyright holder
    shall not be used in advertising or otherwise to promote the sale,
    use or other dealings in these Data Files or Software without prior
    written authorization of the copyright holder.

    ----------------------------------------------------------------------

    Third-Party Software Licenses

    This section contains third-party software notices and/or additional
    terms for licensed third-party software components included within ICU
    libraries.

    ----------------------------------------------------------------------

    ICU License - ICU 1.8.1 to ICU 57.1

    COPYRIGHT AND PERMISSION NOTICE

    Copyright (c) 1995-2016 International Business Machines Corporation and others
    All rights reserved.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, and/or sell copies of the Software, and to permit persons
    to whom the Software is furnished to do so, provided that the above
    copyright notice(s) and this permission notice appear in all copies of
    the Software and that both the above copyright notice(s) and this
    permission notice appear in supporting documentation.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
    OF THIRD PARTY RIGHTS. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
    HOLDERS INCLUDED IN THIS NOTICE BE LIABLE FOR ANY CLAIM, OR ANY
    SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES, OR ANY DAMAGES WHATSOEVER
    RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
    CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    Except as contained in this notice, the name of a copyright holder
    shall not be used in advertising or otherwise to promote the sale, use
    or other dealings in this Software without prior written authorization
    of the copyright holder.

    All trademarks and registered trademarks mentioned herein are the
    property of their respective owners.

    ----------------------------------------------------------------------

    Chinese/Japanese Word Break Dictionary Data (cjdict.txt)

     #     The Google Chrome software developed by Google is licensed under
     # the BSD license. Other software included in this distribution is
     # provided under other licenses, as set forth below.
     #
     #  The BSD License
     #  http://opensource.org/licenses/bsd-license.php
     #  Copyright (C) 2006-2008, Google Inc.
     #
     #  All rights reserved.
     #
     #  Redistribution and use in source and binary forms, with or without
     # modification, are permitted provided that the following conditions are met:
     #
     #  Redistributions of source code must retain the above copyright notice,
     # this list of conditions and the following disclaimer.
     #  Redistributions in binary form must reproduce the above
     # copyright notice, this list of conditions and the following
     # disclaimer in the documentation and/or other materials provided with
     # the distribution.
     #  Neither the name of  Google Inc. nor the names of its
     # contributors may be used to endorse or promote products derived from
     # this software without specific prior written permission.
     #
     #
     #  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
     # CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
     # INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
     # MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     # DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
     # LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
     # CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
     # SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
     # BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     # LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     # NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     # SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     #
     #
     #  The word list in cjdict.txt are generated by combining three word lists
     # listed below with further processing for compound word breaking. The
     # frequency is generated with an iterative training against Google web
     # corpora.
     #
     #  * Libtabe (Chinese)
     #    - https://sourceforge.net/project/?group_id=1519
     #    - Its license terms and conditions are shown below.
     #
     #  * IPADIC (Japanese)
     #    - http://chasen.aist-nara.ac.jp/chasen/distribution.html
     #    - Its license terms and conditions are shown below.
     #
     #  ---------COPYING.libtabe ---- BEGIN--------------------
     #
     #  /*
     #   * Copyright (c) 1999 TaBE Project.
     #   * Copyright (c) 1999 Pai-Hsiang Hsiao.
     #   * All rights reserved.
     #   *
     #   * Redistribution and use in source and binary forms, with or without
     #   * modification, are permitted provided that the following conditions
     #   * are met:
     #   *
     #   * . Redistributions of source code must retain the above copyright
     #   *   notice, this list of conditions and the following disclaimer.
     #   * . Redistributions in binary form must reproduce the above copyright
     #   *   notice, this list of conditions and the following disclaimer in
     #   *   the documentation and/or other materials provided with the
     #   *   distribution.
     #   * . Neither the name of the TaBE Project nor the names of its
     #   *   contributors may be used to endorse or promote products derived
     #   *   from this software without specific prior written permission.
     #   *
     #   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     #   * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     #   * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
     #   * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     #   * REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
     #   * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     #   * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     #   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     #   * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
     #   * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     #   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     #   * OF THE POSSIBILITY OF SUCH DAMAGE.
     #   */
     #
     #  /*
     #   * Copyright (c) 1999 Computer Systems and Communication Lab,
     #   *                    Institute of Information Science, Academia
     #       *                    Sinica. All rights reserved.
     #   *
     #   * Redistribution and use in source and binary forms, with or without
     #   * modification, are permitted provided that the following conditions
     #   * are met:
     #   *
     #   * . Redistributions of source code must retain the above copyright
     #   *   notice, this list of conditions and the following disclaimer.
     #   * . Redistributions in binary form must reproduce the above copyright
     #   *   notice, this list of conditions and the following disclaimer in
     #   *   the documentation and/or other materials provided with the
     #   *   distribution.
     #   * . Neither the name of the Computer Systems and Communication Lab
     #   *   nor the names of its contributors may be used to endorse or
     #   *   promote products derived from this software without specific
     #   *   prior written permission.
     #   *
     #   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     #   * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     #   * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
     #   * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     #   * REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
     #   * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     #   * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     #   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     #   * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
     #   * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     #   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     #   * OF THE POSSIBILITY OF SUCH DAMAGE.
     #   */
     #
     #  Copyright 1996 Chih-Hao Tsai @ Beckman Institute,
     #      University of Illinois
     #  c-tsai4@uiuc.edu  http://casper.beckman.uiuc.edu/~c-tsai4
     #
     #  ---------------COPYING.libtabe-----END--------------------------------
     #
     #
     #  ---------------COPYING.ipadic-----BEGIN-------------------------------
     #
     #  Copyright 2000, 2001, 2002, 2003 Nara Institute of Science
     #  and Technology.  All Rights Reserved.
     #
     #  Use, reproduction, and distribution of this software is permitted.
     #  Any copy of this software, whether in its original form or modified,
     #  must include both the above copyright notice and the following
     #  paragraphs.
     #
     #  Nara Institute of Science and Technology (NAIST),
     #  the copyright holders, disclaims all warranties with regard to this
     #  software, including all implied warranties of merchantability and
     #  fitness, in no event shall NAIST be liable for
     #  any special, indirect or consequential damages or any damages
     #  whatsoever resulting from loss of use, data or profits, whether in an
     #  action of contract, negligence or other tortuous action, arising out
     #  of or in connection with the use or performance of this software.
     #
     #  A large portion of the dictionary entries
     #  originate from ICOT Free Software.  The following conditions for ICOT
     #  Free Software applies to the current dictionary as well.
     #
     #  Each User may also freely distribute the Program, whether in its
     #  original form or modified, to any third party or parties, PROVIDED
     #  that the provisions of Section 3 ("NO WARRANTY") will ALWAYS appear
     #  on, or be attached to, the Program, which is distributed substantially
     #  in the same form as set out herein and that such intended
     #  distribution, if actually made, will neither violate or otherwise
     #  contravene any of the laws and regulations of the countries having
     #  jurisdiction over the User or the intended distribution itself.
     #
     #  NO WARRANTY
     #
     #  The program was produced on an experimental basis in the course of the
     #  research and development conducted during the project and is provided
     #  to users as so produced on an experimental basis.  Accordingly, the
     #  program is provided without any warranty whatsoever, whether express,
     #  implied, statutory or otherwise.  The term "warranty" used herein
     #  includes, but is not limited to, any warranty of the quality,
     #  performance, merchantability and fitness for a particular purpose of
     #  the program and the nonexistence of any infringement or violation of
     #  any right of any third party.
     #
     #  Each user of the program will agree and understand, and be deemed to
     #  have agreed and understood, that there is no warranty whatsoever for
     #  the program and, accordingly, the entire risk arising from or
     #  otherwise connected with the program is assumed by the user.
     #
     #  Therefore, neither ICOT, the copyright holder, or any other
     #  organization that participated in or was otherwise related to the
     #  development of the program and their respective officials, directors,
     #  officers and other employees shall be held liable for any and all
     #  damages, including, without limitation, general, special, incidental
     #  and consequential damages, arising out of or otherwise in connection
     #  with the use or inability to use the program or any product, material
     #  or result produced or otherwise obtained by using the program,
     #  regardless of whether they have been advised of, or otherwise had
     #  knowledge of, the possibility of such damages at any time during the
     #  project or thereafter.  Each user will be deemed to have agreed to the
     #  foregoing by his or her commencement of use of the program.  The term
     #  "use" as used herein includes, but is not limited to, the use,
     #  modification, copying and distribution of the program and the
     #  production of secondary products from the program.
     #
     #  In the case where the program, whether in its original form or
     #  modified, was distributed or delivered to or received by a user from
     #  any person, organization or entity other than ICOT, unless it makes or
     #  grants independently of ICOT any specific warranty to the user in
     #  writing, such person, organization or entity, will also be exempted
     #  from and not be held liable to the user for any such damages as noted
     #  above as far as the program is concerned.
     #
     #  ---------------COPYING.ipadic-----END----------------------------------

    ----------------------------------------------------------------------

    Lao Word Break Dictionary Data (laodict.txt)

     # Copyright (C) 2016 and later: Unicode, Inc. and others.
     # License & terms of use: http://www.unicode.org/copyright.html
     # Copyright (c) 2015 International Business Machines Corporation
     # and others. All Rights Reserved.
     #
     # Project: https://github.com/rober42539/lao-dictionary
     # Dictionary: https://github.com/rober42539/lao-dictionary/laodict.txt
     # License: https://github.com/rober42539/lao-dictionary/LICENSE.txt
     #          (copied below)
     #
     # This file is derived from the above dictionary version of Nov 22, 2020
     #  ----------------------------------------------------------------------
     #  Copyright (C) 2013 Brian Eugene Wilson, Robert Martin Campbell.
     #  All rights reserved.
     #
     #  Redistribution and use in source and binary forms, with or without
     #  modification, are permitted provided that the following conditions are met:
     #
     #  Redistributions of source code must retain the above copyright notice, this
     #  list of conditions and the following disclaimer. Redistributions in binary
     #  form must reproduce the above copyright notice, this list of conditions and
     #  the following disclaimer in the documentation and/or other materials
     #  provided with the distribution.
     #
     # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     # "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     # LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
     # FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     # COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
     # INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     # (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     # SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     # HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
     # STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     # ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     # OF THE POSSIBILITY OF SUCH DAMAGE.
     #  --------------------------------------------------------------------------

    ----------------------------------------------------------------------

    Burmese Word Break Dictionary Data (burmesedict.txt)

     #  Copyright (c) 2014 International Business Machines Corporation
     #  and others. All Rights Reserved.
     #
     #  This list is part of a project hosted at:
     #    github.com/kanyawtech/myanmar-karen-word-lists
     #
     #  --------------------------------------------------------------------------
     #  Copyright (c) 2013, LeRoy Benjamin Sharon
     #  All rights reserved.
     #
     #  Redistribution and use in source and binary forms, with or without
     #  modification, are permitted provided that the following conditions
     #  are met: Redistributions of source code must retain the above
     #  copyright notice, this list of conditions and the following
     #  disclaimer.  Redistributions in binary form must reproduce the
     #  above copyright notice, this list of conditions and the following
     #  disclaimer in the documentation and/or other materials provided
     #  with the distribution.
     #
     #    Neither the name Myanmar Karen Word Lists, nor the names of its
     #    contributors may be used to endorse or promote products derived
     #    from this software without specific prior written permission.
     #
     #  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
     #  CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
     #  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
     #  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     #  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS
     #  BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     #  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
     #  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     #  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
     #  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
     #  TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
     #  THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
     #  SUCH DAMAGE.
     #  --------------------------------------------------------------------------

    ----------------------------------------------------------------------

    Time Zone Database

      ICU uses the public domain data and code derived from Time Zone
    Database for its time zone support. The ownership of the TZ database
    is explained in BCP 175: Procedure for Maintaining the Time Zone
    Database section 7.

     # 7.  Database Ownership
     #
     #    The TZ database itself is not an IETF Contribution or an IETF
     #    document.  Rather it is a pre-existing and regularly updated work
     #    that is in the public domain, and is intended to remain in the
     #    public domain.  Therefore, BCPs 78 [RFC5378] and 79 [RFC3979] do
     #    not apply to the TZ Database or contributions that individuals make
     #    to it.  Should any claims be made and substantiated against the TZ
     #    Database, the organization that is providing the IANA
     #    Considerations defined in this RFC, under the memorandum of
     #    understanding with the IETF, currently ICANN, may act in accordance
     #    with all competent court orders.  No ownership claims will be made
     #    by ICANN or the IETF Trust on the database or the code.  Any person
     #    making a contribution to the database or code waives all rights to
     #    future claims in that contribution or in the TZ Database.

    ----------------------------------------------------------------------

    Google double-conversion

    Copyright 2006-2011, the V8 project authors. All rights reserved.
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials provided
          with the distribution.
        * Neither the name of Google Inc. nor the names of its
          contributors may be used to endorse or promote products derived
          from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

    ----------------------------------------------------------------------

    File: aclocal.m4 (only for ICU4C)
    Section: pkg.m4 - Macros to locate and utilise pkg-config.

    Copyright © 2004 Scott James Remnant .
    Copyright © 2012-2015 Dan Nicholson

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA
    02111-1307, USA.

    As a special exception to the GNU General Public License, if you
    distribute this file as part of a program that contains a
    configuration script generated by Autoconf, you may include it under
    the same distribution terms that you use for the rest of that
    program.

    (The condition for the exception is fulfilled because
    ICU4C includes a configuration script generated by Autoconf,
    namely the `configure` script.)

    ----------------------------------------------------------------------

    File: config.guess (only for ICU4C)

    This file is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, see .

    As a special exception to the GNU General Public License, if you
    distribute this file as part of a program that contains a
    configuration script generated by Autoconf, you may include it under
    the same distribution terms that you use for the rest of that
    program.  This Exception is an additional permission under section 7
    of the GNU General Public License, version 3 ("GPLv3").

    (The condition for the exception is fulfilled because
    ICU4C includes a configuration script generated by Autoconf,
    namely the `configure` script.)

    ----------------------------------------------------------------------

    File: install-sh (only for ICU4C)

    Copyright 1991 by the Massachusetts Institute of Technology

    Permission to use, copy, modify, distribute, and sell this software and its
    documentation for any purpose is hereby granted without fee, provided that
    the above copyright notice appear in all copies and that both that
    copyright notice and this permission notice appear in supporting
    documentation, and that the name of M.I.T. not be used in advertising or
    publicity pertaining to distribution of the software without specific,
    written prior permission.  M.I.T. makes no representations about the
    suitability of this software for any purpose.  It is provided "as is"
    without express or implied warranty.
  """

- libuv, located at deps/uv, is licensed as follows:
  """
    Copyright (c) 2015-present libuv project contributors.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.
    This license applies to parts of libuv originating from the
    https://github.com/joyent/libuv repository:

    ====

    Copyright Joyent, Inc. and other Node contributors. All rights reserved.
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.

    ====

    This license applies to all parts of libuv that are not externally
    maintained libraries.

    The externally maintained libraries used by libuv are:

      - tree.h (from FreeBSD), copyright Niels Provos. Two clause BSD license.

      - inet_pton and inet_ntop implementations, contained in src/inet.c, are
        copyright the Internet Systems Consortium, Inc., and licensed under the ISC
        license.
  """

- llhttp, located at deps/llhttp, is licensed as follows:
  """
    This software is licensed under the MIT License.

    Copyright Fedor Indutny, 2018.

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to permit
    persons to whom the Software is furnished to do so, subject to the
    following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- corepack, located at deps/corepack, is licensed as follows:
  """
    **Copyright © Corepack contributors**

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- undici, located at deps/undici, is licensed as follows:
  """
    MIT License

    Copyright (c) Matteo Collina and Undici contributors

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
  """

- postject, located at test/fixtures/postject-copy, is licensed as follows:
  """
    Postject is licensed for use as follows:

    """
    MIT License

    Copyright (c) 2022 Postman, Inc

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    """

    The Postject license applies to all parts of Postject that are not externally
    maintained libraries.

    The externally maintained libraries used by Postject are:

    - LIEF, located at vendor/LIEF, is licensed as follows:
      """
                                         Apache License
                                   Version 2.0, January 2004
                                http://www.apache.org/licenses/

           TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

           1. Definitions.

              "License" shall mean the terms and conditions for use, reproduction,
              and distribution as defined by Sections 1 through 9 of this document.

              "Licensor" shall mean the copyright owner or entity authorized by
              the copyright owner that is granting the License.

              "Legal Entity" shall mean the union of the acting entity and all
              other entities that control, are controlled by, or are under common
              control with that entity. For the purposes of this definition,
              "control" means (i) the power, direct or indirect, to cause the
              direction or management of such entity, whether by contract or
              otherwise, or (ii) ownership of fifty percent (50%) or more of the
              outstanding shares, or (iii) beneficial ownership of such entity.

              "You" (or "Your") shall mean an individual or Legal Entity
              exercising permissions granted by this License.

              "Source" form shall mean the preferred form for making modifications,
              including but not limited to software source code, documentation
              source, and configuration files.

              "Object" form shall mean any form resulting from mechanical
              transformation or translation of a Source form, including but
              not limited to compiled object code, generated documentation,
              and conversions to other media types.

              "Work" shall mean the work of authorship, whether in Source or
              Object form, made available under the License, as indicated by a
              copyright notice that is included in or attached to the work
              (an example is provided in the Appendix below).

              "Derivative Works" shall mean any work, whether in Source or Object
              form, that is based on (or derived from) the Work and for which the
              editorial revisions, annotations, elaborations, or other modifications
              represent, as a whole, an original work of authorship. For the purposes
              of this License, Derivative Works shall not include works that remain
              separable from, or merely link (or bind by name) to the interfaces of,
              the Work and Derivative Works thereof.

              "Contribution" shall mean any work of authorship, including
              the original version of the Work and any modifications or additions
              to that Work or Derivative Works thereof, that is intentionally
              submitted to Licensor for inclusion in the Work by the copyright owner
              or by an individual or Legal Entity authorized to submit on behalf of
              the copyright owner. For the purposes of this definition, "submitted"
              means any form of electronic, verbal, or written communication sent
              to the Licensor or its representatives, including but not limited to
              communication on electronic mailing lists, source code control systems,
              and issue tracking systems that are managed by, or on behalf of, the
              Licensor for the purpose of discussing and improving the Work, but
              excluding communication that is conspicuously marked or otherwise
              designated in writing by the copyright owner as "Not a Contribution."

              "Contributor" shall mean Licensor and any individual or Legal Entity
              on behalf of whom a Contribution has been received by Licensor and
              subsequently incorporated within the Work.

           2. Grant of Copyright License. Subject to the terms and conditions of
              this License, each Contributor hereby grants to You a perpetual,
              worldwide, non-exclusive, no-charge, royalty-free, irrevocable
              copyright license to reproduce, prepare Derivative Works of,
              publicly display, publicly perform, sublicense, and distribute the
              Work and such Derivative Works in Source or Object form.

           3. Grant of Patent License. Subject to the terms and conditions of
              this License, each Contributor hereby grants to You a perpetual,
              worldwide, non-exclusive, no-charge, royalty-free, irrevocable
              (except as stated in this section) patent license to make, have made,
              use, offer to sell, sell, import, and otherwise transfer the Work,
              where such license applies only to those patent claims licensable
              by such Contributor that are necessarily infringed by their
              Contribution(s) alone or by combination of their Contribution(s)
              with the Work to which such Contribution(s) was submitted. If You
              institute patent litigation against any entity (including a
              cross-claim or counterclaim in a lawsuit) alleging that the Work
              or a Contribution incorporated within the Work constitutes direct
              or contributory patent infringement, then any patent licenses
              granted to You under this License for that Work shall terminate
              as of the date such litigation is filed.

           4. Redistribution. You may reproduce and distribute copies of the
              Work or Derivative Works thereof in any medium, with or without
              modifications, and in Source or Object form, provided that You
              meet the following conditions:

              (a) You must give any other recipients of the Work or
                  Derivative Works a copy of this License; and

              (b) You must cause any modified files to carry prominent notices
                  stating that You changed the files; and

              (c) You must retain, in the Source form of any Derivative Works
                  that You distribute, all copyright, patent, trademark, and
                  attribution notices from the Source form of the Work,
                  excluding those notices that do not pertain to any part of
                  the Derivative Works; and

              (d) If the Work includes a "NOTICE" text file as part of its
                  distribution, then any Derivative Works that You distribute must
                  include a readable copy of the attribution notices contained
                  within such NOTICE file, excluding those notices that do not
                  pertain to any part of the Derivative Works, in at least one
                  of the following places: within a NOTICE text file distributed
                  as part of the Derivative Works; within the Source form or
                  documentation, if provided along with the Derivative Works; or,
                  within a display generated by the Derivative Works, if and
                  wherever such third-party notices normally appear. The contents
                  of the NOTICE file are for informational purposes only and
                  do not modify the License. You may add Your own attribution
                  notices within Derivative Works that You distribute, alongside
                  or as an addendum to the NOTICE text from the Work, provided
                  that such additional attribution notices cannot be construed
                  as modifying the License.

              You may add Your own copyright statement to Your modifications and
              may provide additional or different license terms and conditions
              for use, reproduction, or distribution of Your modifications, or
              for any such Derivative Works as a whole, provided Your use,
              reproduction, and distribution of the Work otherwise complies with
              the conditions stated in this License.

           5. Submission of Contributions. Unless You explicitly state otherwise,
              any Contribution intentionally submitted for inclusion in the Work
              by You to the Licensor shall be under the terms and conditions of
              this License, without any additional terms or conditions.
              Notwithstanding the above, nothing herein shall supersede or modify
              the terms of any separate license agreement you may have executed
              with Licensor regarding such Contributions.

           6. Trademarks. This License does not grant permission to use the trade
              names, trademarks, service marks, or product names of the Licensor,
              except as required for reasonable and customary use in describing the
              origin of the Work and reproducing the content of the NOTICE file.

           7. Disclaimer of Warranty. Unless required by applicable law or
              agreed to in writing, Licensor provides the Work (and each
              Contributor provides its Contributions) on an "AS IS" BASIS,
              WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
              implied, including, without limitation, any warranties or conditions
              of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
              PARTICULAR PURPOSE. You are solely responsible for determining the
              appropriateness of using or redistributing the Work and assume any
              risks associated with Your exercise of permissions under this License.

           8. Limitation of Liability. In no event and under no legal theory,
              whether in tort (including negligence), contract, or otherwise,
              unless required by applicable law (such as deliberate and grossly
              negligent acts) or agreed to in writing, shall any Contributor be
              liable to You for damages, including any direct, indirect, special,
              incidental, or consequential damages of any character arising as a
              result of this License or out of the use or inability to use the
              Work (including but not limited to damages for loss of goodwill,
              work stoppage, computer failure or malfunction, or any and all
              other commercial damages or losses), even if such Contributor
              has been advised of the possibility of such damages.

           9. Accepting Warranty or Additional Liability. While redistributing
              the Work or Derivative Works thereof, You may choose to offer,
              and charge a fee for, acceptance of support, warranty, indemnity,
              or other liability obligations and/or rights consistent with this
              License. However, in accepting such obligations, You may act only
              on Your own behalf and on Your sole responsibility, not on behalf
              of any other Contributor, and only if You agree to indemnify,
              defend, and hold each Contributor harmless for any liability
              incurred by, or claims asserted against, such Contributor by reason
              of your accepting any such warranty or additional liability.

           END OF TERMS AND CONDITIONS

           APPENDIX: How to apply the Apache License to your work.

              To apply the Apache License to your work, attach the following
              boilerplate notice, with the fields enclosed by brackets "{}"
              replaced with your own identifying information. (Don't include
              the brackets!)  The text should be enclosed in the appropriate
              comment syntax for the file format. We also recommend that a
              file or class name and description of purpose be included on the
              same "printed page" as the copyright notice for easier
              identification within third-party archives.

           Copyright 2017 - 2022 R. Thomas
           Copyright 2017 - 2022 Quarkslab

           Licensed under the Apache License, Version 2.0 (the "License");
           you may not use this file except in compliance with the License.
           You may obtain a copy of the License at

               http://www.apache.org/licenses/LICENSE-2.0

           Unless required by applicable law or agreed to in writing, software
           distributed under the License is distributed on an "AS IS" BASIS,
           WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
           See the License for the specific language governing permissions and
           limitations under the License.
      """
  """

- OpenSSL, located at deps/openssl, is licensed as follows:
  """
                                     Apache License
                               Version 2.0, January 2004
                            https://www.apache.org/licenses/

       TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

       1. Definitions.

          "License" shall mean the terms and conditions for use, reproduction,
          and distribution as defined by Sections 1 through 9 of this document.

          "Licensor" shall mean the copyright owner or entity authorized by
          the copyright owner that is granting the License.

          "Legal Entity" shall mean the union of the acting entity and all
          other entities that control, are controlled by, or are under common
          control with that entity. For the purposes of this definition,
          "control" means (i) the power, direct or indirect, to cause the
          direction or management of such entity, whether by contract or
          otherwise, or (ii) ownership of fifty percent (50%) or more of the
          outstanding shares, or (iii) beneficial ownership of such entity.

          "You" (or "Your") shall mean an individual or Legal Entity
          exercising permissions granted by this License.

          "Source" form shall mean the preferred form for making modifications,
          including but not limited to software source code, documentation
          source, and configuration files.

          "Object" form shall mean any form resulting from mechanical
          transformation or translation of a Source form, including but
          not limited to compiled object code, generated documentation,
          and conversions to other media types.

          "Work" shall mean the work of authorship, whether in Source or
          Object form, made available under the License, as indicated by a
          copyright notice that is included in or attached to the work
          (an example is provided in the Appendix below).

          "Derivative Works" shall mean any work, whether in Source or Object
          form, that is based on (or derived from) the Work and for which the
          editorial revisions, annotations, elaborations, or other modifications
          represent, as a whole, an original work of authorship. For the purposes
          of this License, Derivative Works shall not include works that remain
          separable from, or merely link (or bind by name) to the interfaces of,
          the Work and Derivative Works thereof.

          "Contribution" shall mean any work of authorship, including
          the original version of the Work and any modifications or additions
          to that Work or Derivative Works thereof, that is intentionally
          submitted to Licensor for inclusion in the Work by the copyright owner
          or by an individual or Legal Entity authorized to submit on behalf of
          the copyright owner. For the purposes of this definition, "submitted"
          means any form of electronic, verbal, or written communication sent
          to the Licensor or its representatives, including but not limited to
          communication on electronic mailing lists, source code control systems,
          and issue tracking systems that are managed by, or on behalf of, the
          Licensor for the purpose of discussing and improving the Work, but
          excluding communication that is conspicuously marked or otherwise
          designated in writing by the copyright owner as "Not a Contribution."

          "Contributor" shall mean Licensor and any individual or Legal Entity
          on behalf of whom a Contribution has been received by Licensor and
          subsequently incorporated within the Work.

       2. Grant of Copyright License. Subject to the terms and conditions of
          this License, each Contributor hereby grants to You a perpetual,
          worldwide, non-exclusive, no-charge, royalty-free, irrevocable
          copyright license to reproduce, prepare Derivative Works of,
          publicly display, publicly perform, sublicense, and distribute the
          Work and such Derivative Works in Source or Object form.

       3. Grant of Patent License. Subject to the terms and conditions of
          this License, each Contributor hereby grants to You a perpetual,
          worldwide, non-exclusive, no-charge, royalty-free, irrevocable
          (except as stated in this section) patent license to make, have made,
          use, offer to sell, sell, import, and otherwise transfer the Work,
          where such license applies only to those patent claims licensable
          by such Contributor that are necessarily infringed by their
          Contribution(s) alone or by combination of their Contribution(s)
          with the Work to which such Contribution(s) was submitted. If You
          institute patent litigation against any entity (including a
          cross-claim or counterclaim in a lawsuit) alleging that the Work
          or a Contribution incorporated within the Work constitutes direct
          or contributory patent infringement, then any patent licenses
          granted to You under this License for that Work shall terminate
          as of the date such litigation is filed.

       4. Redistribution. You may reproduce and distribute copies of the
          Work or Derivative Works thereof in any medium, with or without
          modifications, and in Source or Object form, provided that You
          meet the following conditions:

          (a) You must give any other recipients of the Work or
              Derivative Works a copy of this License; and

          (b) You must cause any modified files to carry prominent notices
              stating that You changed the files; and

          (c) You must retain, in the Source form of any Derivative Works
              that You distribute, all copyright, patent, trademark, and
              attribution notices from the Source form of the Work,
              excluding those notices that do not pertain to any part of
              the Derivative Works; and

          (d) If the Work includes a "NOTICE" text file as part of its
              distribution, then any Derivative Works that You distribute must
              include a readable copy of the attribution notices contained
              within such NOTICE file, excluding those notices that do not
              pertain to any part of the Derivative Works, in at least one
              of the following places: within a NOTICE text file distributed
              as part of the Derivative Works; within the Source form or
              documentation, if provided along with the Derivative Works; or,
              within a display generated by the Derivative Works, if and
              wherever such third-party notices normally appear. The contents
              of the NOTICE file are for informational purposes only and
              do not modify the License. You may add Your own attribution
              notices within Derivative Works that You distribute, alongside
              or as an addendum to the NOTICE text from the Work, provided
              that such additional attribution notices cannot be construed
              as modifying the License.

          You may add Your own copyright statement to Your modifications and
          may provide additional or different license terms and conditions
          for use, reproduction, or distribution of Your modifications, or
          for any such Derivative Works as a whole, provided Your use,
          reproduction, and distribution of the Work otherwise complies with
          the conditions stated in this License.

       5. Submission of Contributions. Unless You explicitly state otherwise,
          any Contribution intentionally submitted for inclusion in the Work
          by You to the Licensor shall be under the terms and conditions of
          this License, without any additional terms or conditions.
          Notwithstanding the above, nothing herein shall supersede or modify
          the terms of any separate license agreement you may have executed
          with Licensor regarding such Contributions.

       6. Trademarks. This License does not grant permission to use the trade
          names, trademarks, service marks, or product names of the Licensor,
          except as required for reasonable and customary use in describing the
          origin of the Work and reproducing the content of the NOTICE file.

       7. Disclaimer of Warranty. Unless required by applicable law or
          agreed to in writing, Licensor provides the Work (and each
          Contributor provides its Contributions) on an "AS IS" BASIS,
          WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
          implied, including, without limitation, any warranties or conditions
          of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
          PARTICULAR PURPOSE. You are solely responsible for determining the
          appropriateness of using or redistributing the Work and assume any
          risks associated with Your exercise of permissions under this License.

       8. Limitation of Liability. In no event and under no legal theory,
          whether in tort (including negligence), contract, or otherwise,
          unless required by applicable law (such as deliberate and grossly
          negligent acts) or agreed to in writing, shall any Contributor be
          liable to You for damages, including any direct, indirect, special,
          incidental, or consequential damages of any character arising as a
          result of this License or out of the use or inability to use the
          Work (including but not limited to damages for loss of goodwill,
          work stoppage, computer failure or malfunction, or any and all
          other commercial damages or losses), even if such Contributor
          has been advised of the possibility of such damages.

       9. Accepting Warranty or Additional Liability. While redistributing
          the Work or Derivative Works thereof, You may choose to offer,
          and charge a fee for, acceptance of support, warranty, indemnity,
          or other liability obligations and/or rights consistent with this
          License. However, in accepting such obligations, You may act only
          on Your own behalf and on Your sole responsibility, not on behalf
          of any other Contributor, and only if You agree to indemnify,
          defend, and hold each Contributor harmless for any liability
          incurred by, or claims asserted against, such Contributor by reason
          of your accepting any such warranty or additional liability.

       END OF TERMS AND CONDITIONS
  """

- Punycode.js, located at lib/punycode.js, is licensed as follows:
  """
    Copyright Mathias Bynens <https://mathiasbynens.be/>

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- V8, located at deps/v8, is licensed as follows:
  """
    This license applies to all parts of V8 that are not externally
    maintained libraries.  The externally maintained libraries used by V8
    are:

      - PCRE test suite, located in
        test/mjsunit/third_party/regexp-pcre/regexp-pcre.js.  This is based on the
        test suite from PCRE-7.3, which is copyrighted by the University
        of Cambridge and Google, Inc.  The copyright notice and license
        are embedded in regexp-pcre.js.

      - Layout tests, located in test/mjsunit/third_party/object-keys.  These are
        based on layout tests from webkit.org which are copyrighted by
        Apple Computer, Inc. and released under a 3-clause BSD license.

      - Strongtalk assembler, the basis of the files assembler-arm-inl.h,
        assembler-arm.cc, assembler-arm.h, assembler-ia32-inl.h,
        assembler-ia32.cc, assembler-ia32.h, assembler-x64-inl.h,
        assembler-x64.cc, assembler-x64.h, assembler.cc and assembler.h.
        This code is copyrighted by Sun Microsystems Inc. and released
        under a 3-clause BSD license.

      - Valgrind client API header, located at src/third_party/valgrind/valgrind.h
        This is released under the BSD license.

      - The Wasm C/C++ API headers, located at third_party/wasm-api/wasm.{h,hh}
        This is released under the Apache license. The API's upstream prototype
        implementation also formed the basis of V8's implementation in
        src/wasm/c-api.cc.

    These libraries have their own licenses; we recommend you read them,
    as their terms may differ from the terms below.

    Further license information can be found in LICENSE files located in
    sub-directories.

    Copyright 2014, the V8 project authors. All rights reserved.
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials provided
          with the distribution.
        * Neither the name of Google Inc. nor the names of its
          contributors may be used to endorse or promote products derived
          from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- SipHash, located at deps/v8/src/third_party/siphash, is licensed as follows:
  """
    SipHash reference C implementation

    Copyright (c) 2016 Jean-Philippe Aumasson <jeanphilippe.aumasson@gmail.com>

    To the extent possible under law, the author(s) have dedicated all
    copyright and related and neighboring rights to this software to the public
    domain worldwide. This software is distributed without any warranty.
  """

- zlib, located at deps/zlib, is licensed as follows:
  """
    zlib.h -- interface of the 'zlib' general purpose compression library
    version 1.2.13.1, October xxth, 2022

    Copyright (C) 1995-2022 Jean-loup Gailly and Mark Adler

    This software is provided 'as-is', without any express or implied
    warranty.  In no event will the authors be held liable for any damages
    arising from the use of this software.

    Permission is granted to anyone to use this software for any purpose,
    including commercial applications, and to alter it and redistribute it
    freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.
    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.
    3. This notice may not be removed or altered from any source distribution.

    Jean-loup Gailly        Mark Adler
    jloup@gzip.org          madler@alumni.caltech.edu
  """

- simdutf, located at deps/simdutf, is licensed as follows:
  """
    Copyright 2021 The simdutf authors

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- ada, located at deps/ada, is licensed as follows:
  """
    Copyright 2023 Yagiz Nizipli and Daniel Lemire

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- minimatch, located at deps/minimatch, is licensed as follows:
  """
    The ISC License

    Copyright (c) 2011-2023 Isaac Z. Schlueter and Contributors

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
    IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
  """

- npm, located at deps/npm, is licensed as follows:
  """
    The npm application
    Copyright (c) npm, Inc. and Contributors
    Licensed on the terms of The Artistic License 2.0

    Node package dependencies of the npm application
    Copyright (c) their respective copyright owners
    Licensed on their respective license terms

    The npm public registry at https://registry.npmjs.org
    and the npm website at https://www.npmjs.com
    Operated by npm, Inc.
    Use governed by terms published on https://www.npmjs.com

    "Node.js"
    Trademark Joyent, Inc., https://joyent.com
    Neither npm nor npm, Inc. are affiliated with Joyent, Inc.

    The Node.js application
    Project of Node Foundation, https://nodejs.org

    The npm Logo
    Copyright (c) Mathias Pettersson and Brian Hammond

    "Gubblebum Blocky" typeface
    Copyright (c) Tjarda Koster, https://jelloween.deviantart.com
    Used with permission

    --------

    The Artistic License 2.0

    Copyright (c) 2000-2006, The Perl Foundation.

    Everyone is permitted to copy and distribute verbatim copies
    of this license document, but changing it is not allowed.

    Preamble

    This license establishes the terms under which a given free software
    Package may be copied, modified, distributed, and/or redistributed.
    The intent is that the Copyright Holder maintains some artistic
    control over the development of that Package while still keeping the
    Package available as open source and free software.

    You are always permitted to make arrangements wholly outside of this
    license directly with the Copyright Holder of a given Package.  If the
    terms of this license do not permit the full use that you propose to
    make of the Package, you should contact the Copyright Holder and seek
    a different licensing arrangement.

    Definitions

        "Copyright Holder" means the individual(s) or organization(s)
        named in the copyright notice for the entire Package.

        "Contributor" means any party that has contributed code or other
        material to the Package, in accordance with the Copyright Holder's
        procedures.

        "You" and "your" means any person who would like to copy,
        distribute, or modify the Package.

        "Package" means the collection of files distributed by the
        Copyright Holder, and derivatives of that collection and/or of
        those files. A given Package may consist of either the Standard
        Version, or a Modified Version.

        "Distribute" means providing a copy of the Package or making it
        accessible to anyone else, or in the case of a company or
        organization, to others outside of your company or organization.

        "Distributor Fee" means any fee that you charge for Distributing
        this Package or providing support for this Package to another
        party.  It does not mean licensing fees.

        "Standard Version" refers to the Package if it has not been
        modified, or has been modified only in ways explicitly requested
        by the Copyright Holder.

        "Modified Version" means the Package, if it has been changed, and
        such changes were not explicitly requested by the Copyright
        Holder.

        "Original License" means this Artistic License as Distributed with
        the Standard Version of the Package, in its current version or as
        it may be modified by The Perl Foundation in the future.

        "Source" form means the source code, documentation source, and
        configuration files for the Package.

        "Compiled" form means the compiled bytecode, object code, binary,
        or any other form resulting from mechanical transformation or
        translation of the Source form.

    Permission for Use and Modification Without Distribution

    (1)  You are permitted to use the Standard Version and create and use
    Modified Versions for any purpose without restriction, provided that
    you do not Distribute the Modified Version.

    Permissions for Redistribution of the Standard Version

    (2)  You may Distribute verbatim copies of the Source form of the
    Standard Version of this Package in any medium without restriction,
    either gratis or for a Distributor Fee, provided that you duplicate
    all of the original copyright notices and associated disclaimers.  At
    your discretion, such verbatim copies may or may not include a
    Compiled form of the Package.

    (3)  You may apply any bug fixes, portability changes, and other
    modifications made available from the Copyright Holder.  The resulting
    Package will still be considered the Standard Version, and as such
    will be subject to the Original License.

    Distribution of Modified Versions of the Package as Source

    (4)  You may Distribute your Modified Version as Source (either gratis
    or for a Distributor Fee, and with or without a Compiled form of the
    Modified Version) provided that you clearly document how it differs
    from the Standard Version, including, but not limited to, documenting
    any non-standard features, executables, or modules, and provided that
    you do at least ONE of the following:

        (a)  make the Modified Version available to the Copyright Holder
        of the Standard Version, under the Original License, so that the
        Copyright Holder may include your modifications in the Standard
        Version.

        (b)  ensure that installation of your Modified Version does not
        prevent the user installing or running the Standard Version. In
        addition, the Modified Version must bear a name that is different
        from the name of the Standard Version.

        (c)  allow anyone who receives a copy of the Modified Version to
        make the Source form of the Modified Version available to others
        under

            (i)  the Original License or

            (ii)  a license that permits the licensee to freely copy,
            modify and redistribute the Modified Version using the same
            licensing terms that apply to the copy that the licensee
            received, and requires that the Source form of the Modified
            Version, and of any works derived from it, be made freely
            available in that license fees are prohibited but Distributor
            Fees are allowed.

    Distribution of Compiled Forms of the Standard Version
    or Modified Versions without the Source

    (5)  You may Distribute Compiled forms of the Standard Version without
    the Source, provided that you include complete instructions on how to
    get the Source of the Standard Version.  Such instructions must be
    valid at the time of your distribution.  If these instructions, at any
    time while you are carrying out such distribution, become invalid, you
    must provide new instructions on demand or cease further distribution.
    If you provide valid instructions or cease distribution within thirty
    days after you become aware that the instructions are invalid, then
    you do not forfeit any of your rights under this license.

    (6)  You may Distribute a Modified Version in Compiled form without
    the Source, provided that you comply with Section 4 with respect to
    the Source of the Modified Version.

    Aggregating or Linking the Package

    (7)  You may aggregate the Package (either the Standard Version or
    Modified Version) with other packages and Distribute the resulting
    aggregation provided that you do not charge a licensing fee for the
    Package.  Distributor Fees are permitted, and licensing fees for other
    components in the aggregation are permitted. The terms of this license
    apply to the use and Distribution of the Standard or Modified Versions
    as included in the aggregation.

    (8) You are permitted to link Modified and Standard Versions with
    other works, to embed the Package in a larger work of your own, or to
    build stand-alone binary or bytecode versions of applications that
    include the Package, and Distribute the result without restriction,
    provided the result does not expose a direct interface to the Package.

    Items That are Not Considered Part of a Modified Version

    (9) Works (including, but not limited to, modules and scripts) that
    merely extend or make use of the Package, do not, by themselves, cause
    the Package to be a Modified Version.  In addition, such works are not
    considered parts of the Package itself, and are not subject to the
    terms of this license.

    General Provisions

    (10)  Any use, modification, and distribution of the Standard or
    Modified Versions is governed by this Artistic License. By using,
    modifying or distributing the Package, you accept this license. Do not
    use, modify, or distribute the Package, if you do not accept this
    license.

    (11)  If your Modified Version has been derived from a Modified
    Version made by someone other than you, you are nevertheless required
    to ensure that your Modified Version complies with the requirements of
    this license.

    (12)  This license does not grant you the right to use any trademark,
    service mark, tradename, or logo of the Copyright Holder.

    (13)  This license includes the non-exclusive, worldwide,
    free-of-charge patent license to make, have made, use, offer to sell,
    sell, import and otherwise transfer the Package with respect to any
    patent claims licensable by the Copyright Holder that are necessarily
    infringed by the Package. If you institute patent litigation
    (including a cross-claim or counterclaim) against any party alleging
    that the Package constitutes direct or contributory patent
    infringement, then this Artistic License to you shall terminate on the
    date that such litigation is filed.

    (14)  Disclaimer of Warranty:
    THE PACKAGE IS PROVIDED BY THE COPYRIGHT HOLDER AND CONTRIBUTORS "AS
    IS' AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES. THE IMPLIED
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
    NON-INFRINGEMENT ARE DISCLAIMED TO THE EXTENT PERMITTED BY YOUR LOCAL
    LAW. UNLESS REQUIRED BY LAW, NO COPYRIGHT HOLDER OR CONTRIBUTOR WILL
    BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
    DAMAGES ARISING IN ANY WAY OUT OF THE USE OF THE PACKAGE, EVEN IF
    ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

    --------
  """

- GYP, located at tools/gyp, is licensed as follows:
  """
    Copyright (c) 2020 Node.js contributors. All rights reserved.
    Copyright (c) 2009 Google Inc. All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

       * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following disclaimer
    in the documentation and/or other materials provided with the
    distribution.
       * Neither the name of Google Inc. nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- inspector_protocol, located at tools/inspector_protocol, is licensed as follows:
  """
    // Copyright 2016 The Chromium Authors. All rights reserved.
    //
    // Redistribution and use in source and binary forms, with or without
    // modification, are permitted provided that the following conditions are
    // met:
    //
    //    * Redistributions of source code must retain the above copyright
    // notice, this list of conditions and the following disclaimer.
    //    * Redistributions in binary form must reproduce the above
    // copyright notice, this list of conditions and the following disclaimer
    // in the documentation and/or other materials provided with the
    // distribution.
    //    * Neither the name of Google Inc. nor the names of its
    // contributors may be used to endorse or promote products derived from
    // this software without specific prior written permission.
    //
    // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- jinja2, located at tools/inspector_protocol/jinja2, is licensed as follows:
  """
    Copyright (c) 2009 by the Jinja Team, see AUTHORS for more details.

    Some rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials provided
          with the distribution.

        * The names of the contributors may not be used to endorse or
          promote products derived from this software without specific
          prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- markupsafe, located at tools/inspector_protocol/markupsafe, is licensed as follows:
  """
    Copyright (c) 2010 by Armin Ronacher and contributors.  See AUTHORS
    for more details.

    Some rights reserved.

    Redistribution and use in source and binary forms of the software as well
    as documentation, with or without modification, are permitted provided
    that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above
      copyright notice, this list of conditions and the following
      disclaimer in the documentation and/or other materials provided
      with the distribution.

    * The names of the contributors may not be used to endorse or
      promote products derived from this software without specific
      prior written permission.

    THIS SOFTWARE AND DOCUMENTATION IS PROVIDED BY THE COPYRIGHT HOLDERS AND
    CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT
    NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
    OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
    EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
    LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE AND DOCUMENTATION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
    DAMAGE.
  """

- cpplint.py, located at tools/cpplint.py, is licensed as follows:
  """
    Copyright (c) 2009 Google Inc. All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

       * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following disclaimer
    in the documentation and/or other materials provided with the
    distribution.
       * Neither the name of Google Inc. nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- ESLint, located at tools/node_modules/eslint, is licensed as follows:
  """
    Copyright OpenJS Foundation and other contributors, <www.openjsf.org>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
  """

- gtest, located at deps/googletest, is licensed as follows:
  """
    Copyright 2008, Google Inc.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

        * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following disclaimer
    in the documentation and/or other materials provided with the
    distribution.
        * Neither the name of Google Inc. nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- nghttp2, located at deps/nghttp2, is licensed as follows:
  """
    The MIT License

    Copyright (c) 2012, 2014, 2015, 2016 Tatsuhiro Tsujikawa
    Copyright (c) 2012, 2014, 2015, 2016 nghttp2 contributors

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- large_pages, located at src/large_pages, is licensed as follows:
  """
     Copyright (C) 2018 Intel Corporation

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"),
     to deal in the Software without restriction, including without limitation
     the rights to use, copy, modify, merge, publish, distribute, sublicense,
     and/or sell copies of the Software, and to permit persons to whom
     the Software is furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included
     in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
     OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
     OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
     ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
     OR OTHER DEALINGS IN THE SOFTWARE.
  """

- caja, located at lib/internal/freeze_intrinsics.js, is licensed as follows:
  """
     Adapted from SES/Caja - Copyright (C) 2011 Google Inc.
     Copyright (C) 2018 Agoric

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  """

- brotli, located at deps/brotli, is licensed as follows:
  """
    Copyright (c) 2009, 2010, 2013-2016 by the Brotli Authors.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
  """

- HdrHistogram, located at deps/histogram, is licensed as follows:
  """
    The code in this repository code was Written by Gil Tene, Michael Barker,
    and Matt Warren, and released to the public domain, as explained at
    http://creativecommons.org/publicdomain/zero/1.0/

    For users of this code who wish to consume it under the "BSD" license
    rather than under the public domain or CC0 contribution text mentioned
    above, the code found under this directory is *also* provided under the
    following license (commonly referred to as the BSD 2-Clause License). This
    license does not detract from the above stated release of the code into
    the public domain, and simply represents an additional license granted by
    the Author.

    -----------------------------------------------------------------------------
    ** Beginning of "BSD 2-Clause License" text. **

     Copyright (c) 2012, 2013, 2014 Gil Tene
     Copyright (c) 2014 Michael Barker
     Copyright (c) 2014 Matt Warren
     All rights reserved.

     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions are met:

     1. Redistributions of source code must retain the above copyright notice,
        this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.

     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
     ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
     LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
     CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
     SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
     INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
     CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
     THE POSSIBILITY OF SUCH DAMAGE.
  """

- highlight.js, located at doc/api_assets/highlight.pack.js, is licensed as follows:
  """
    BSD 3-Clause License

    Copyright (c) 2006, Ivan Sagalaev.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this
      list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

    * Neither the name of the copyright holder nor the names of its
      contributors may be used to endorse or promote products derived from
      this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

- node-heapdump, located at src/heap_utils.cc, is licensed as follows:
  """
    ISC License

    Copyright (c) 2012, Ben Noordhuis <info@bnoordhuis.nl>

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    === src/compat.h src/compat-inl.h ===

    ISC License

    Copyright (c) 2014, StrongLoop Inc.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
  """

- rimraf, located at lib/internal/fs/rimraf.js, is licensed as follows:
  """
    The ISC License

    Copyright (c) Isaac Z. Schlueter and Contributors

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
    IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
  """

- uvwasi, located at deps/uvwasi, is licensed as follows:
  """
    MIT License

    Copyright (c) 2019 Colin Ihrig and Contributors

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
  """

- ngtcp2, located at deps/ngtcp2/ngtcp2/, is licensed as follows:
  """
    The MIT License

    Copyright (c) 2016 ngtcp2 contributors

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- nghttp3, located at deps/ngtcp2/nghttp3/, is licensed as follows:
  """
    The MIT License

    Copyright (c) 2019 nghttp3 contributors

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- node-fs-extra, located at lib/internal/fs/cp, is licensed as follows:
  """
    (The MIT License)

    Copyright (c) 2011-2017 JP Richardson

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
    (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
     merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
    OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
     ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  """

- base64, located at deps/base64/base64/, is licensed as follows:
  """
    Copyright (c) 2005-2007, Nick Galbreath
    Copyright (c) 2015-2018, Wojciech Muła
    Copyright (c) 2016-2017, Matthieu Darbois
    Copyright (c) 2013-2022, Alfred Klomp
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

    - Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

    - Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
    IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
    TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
    PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
    TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
    LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  """

```

## File: `.\node-portable\node-v20.11.0-win-x64\nodevars.bat`
```bat
@echo off

rem Ensure this Node.js and npm are first in the PATH
set "PATH=%APPDATA%\npm;%~dp0;%PATH%"

setlocal enabledelayedexpansion
pushd "%~dp0"

rem Figure out the Node.js version.
set print_version=.\node.exe -p -e "process.versions.node + ' (' + process.arch + ')'"
for /F "usebackq delims=" %%v in (`%print_version%`) do set version=%%v

rem Print message.
if exist npm.cmd (
  echo Your environment has been set up for using Node.js !version! and npm.
) else (
  echo Your environment has been set up for using Node.js !version!.
)

popd
endlocal

rem If we're in the Node.js directory, change to the user's home dir.
if "%CD%\"=="%~dp0" cd /d "%HOMEDRIVE%%HOMEPATH%"

```

## File: `.\node-portable\node-v20.11.0-win-x64\npm`
```text
#!/usr/bin/env bash

# This is used by the Node.js installer, which expects the cygwin/mingw
# shell script to already be present in the npm dependency folder.

(set -o igncr) 2>/dev/null && set -o igncr; # cygwin encoding fix

basedir=`dirname "$0"`

case `uname` in
  *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ `uname` = 'Linux' ] && type wslpath &>/dev/null ; then
  IS_WSL="true"
fi

function no_node_dir {
  # if this didn't work, then everything else below will fail
  echo "Could not determine Node.js install directory" >&2
  exit 1
}

NODE_EXE="$basedir/node.exe"
if ! [ -x "$NODE_EXE" ]; then
  NODE_EXE="$basedir/node"
fi
if ! [ -x "$NODE_EXE" ]; then
  NODE_EXE=node
fi

# this path is passed to node.exe, so it needs to match whatever
# kind of paths Node.js thinks it's using, typically win32 paths.
CLI_BASEDIR="$("$NODE_EXE" -p 'require("path").dirname(process.execPath)' 2> /dev/null)"
if [ $? -ne 0 ]; then
  # this fails under WSL 1 so add an additional message. we also suppress stderr above
  # because the actual error raised is not helpful. in WSL 1 node.exe cannot handle
  # output redirection properly. See https://github.com/microsoft/WSL/issues/2370
  if [ "$IS_WSL" == "true" ]; then
    echo "WSL 1 is not supported. Please upgrade to WSL 2 or above." >&2
  fi
  no_node_dir
fi
NPM_CLI_JS="$CLI_BASEDIR/node_modules/npm/bin/npm-cli.js"
NPM_PREFIX=`"$NODE_EXE" "$NPM_CLI_JS" prefix -g`
if [ $? -ne 0 ]; then
  no_node_dir
fi
NPM_PREFIX_NPM_CLI_JS="$NPM_PREFIX/node_modules/npm/bin/npm-cli.js"

# a path that will fail -f test on any posix bash
NPM_WSL_PATH="/.."

# WSL can run Windows binaries, so we have to give it the win32 path
# however, WSL bash tests against posix paths, so we need to construct that
# to know if npm is installed globally.
if [ "$IS_WSL" == "true" ]; then
  NPM_WSL_PATH=`wslpath "$NPM_PREFIX_NPM_CLI_JS"`
fi
if [ -f "$NPM_PREFIX_NPM_CLI_JS" ] || [ -f "$NPM_WSL_PATH" ]; then
  NPM_CLI_JS="$NPM_PREFIX_NPM_CLI_JS"
fi

"$NODE_EXE" "$NPM_CLI_JS" "$@"

```

## File: `.\node-portable\node-v20.11.0-win-x64\npm.cmd`
```cmd
:: Created by npm, please don't edit manually.
@ECHO OFF

SETLOCAL

SET "NODE_EXE=%~dp0\node.exe"
IF NOT EXIST "%NODE_EXE%" (
  SET "NODE_EXE=node"
)

SET "NPM_CLI_JS=%~dp0\node_modules\npm\bin\npm-cli.js"
FOR /F "delims=" %%F IN ('CALL "%NODE_EXE%" "%NPM_CLI_JS%" prefix -g') DO (
  SET "NPM_PREFIX_NPM_CLI_JS=%%F\node_modules\npm\bin\npm-cli.js"
)
IF EXIST "%NPM_PREFIX_NPM_CLI_JS%" (
  SET "NPM_CLI_JS=%NPM_PREFIX_NPM_CLI_JS%"
)

"%NODE_EXE%" "%NPM_CLI_JS%" %*

```

## File: `.\node-portable\node-v20.11.0-win-x64\npx`
```text
#!/usr/bin/env bash

# This is used by the Node.js installer, which expects the cygwin/mingw
# shell script to already be present in the npm dependency folder.

(set -o igncr) 2>/dev/null && set -o igncr; # cygwin encoding fix

basedir=`dirname "$0"`

case `uname` in
  *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ `uname` = 'Linux' ] && type wslpath &>/dev/null ; then
  IS_WSL="true"
fi

function no_node_dir {
  # if this didn't work, then everything else below will fail
  echo "Could not determine Node.js install directory" >&2
  exit 1
}

NODE_EXE="$basedir/node.exe"
if ! [ -x "$NODE_EXE" ]; then
  NODE_EXE="$basedir/node"
fi
if ! [ -x "$NODE_EXE" ]; then
  NODE_EXE=node
fi

# this path is passed to node.exe, so it needs to match whatever
# kind of paths Node.js thinks it's using, typically win32 paths.
CLI_BASEDIR="$("$NODE_EXE" -p 'require("path").dirname(process.execPath)' 2> /dev/null)"
if [ $? -ne 0 ]; then
  # this fails under WSL 1 so add an additional message. we also suppress stderr above
  # because the actual error raised is not helpful. in WSL 1 node.exe cannot handle
  # output redirection properly. See https://github.com/microsoft/WSL/issues/2370
  if [ "$IS_WSL" == "true" ]; then
    echo "WSL 1 is not supported. Please upgrade to WSL 2 or above." >&2
  fi
  no_node_dir
fi
NPM_CLI_JS="$CLI_BASEDIR/node_modules/npm/bin/npm-cli.js"
NPX_CLI_JS="$CLI_BASEDIR/node_modules/npm/bin/npx-cli.js"
NPM_PREFIX=`"$NODE_EXE" "$NPM_CLI_JS" prefix -g`
if [ $? -ne 0 ]; then
  no_node_dir
fi
NPM_PREFIX_NPX_CLI_JS="$NPM_PREFIX/node_modules/npm/bin/npx-cli.js"

# a path that will fail -f test on any posix bash
NPX_WSL_PATH="/.."

# WSL can run Windows binaries, so we have to give it the win32 path
# however, WSL bash tests against posix paths, so we need to construct that
# to know if npm is installed globally.
if [ "$IS_WSL" == "true" ]; then
  NPX_WSL_PATH=`wslpath "$NPM_PREFIX_NPX_CLI_JS"`
fi
if [ -f "$NPM_PREFIX_NPX_CLI_JS" ] || [ -f "$NPX_WSL_PATH" ]; then
  NPX_CLI_JS="$NPM_PREFIX_NPX_CLI_JS"
fi

"$NODE_EXE" "$NPX_CLI_JS" "$@"

```

## File: `.\node-portable\node-v20.11.0-win-x64\npx.cmd`
```cmd
:: Created by npm, please don't edit manually.
@ECHO OFF

SETLOCAL

SET "NODE_EXE=%~dp0\node.exe"
IF NOT EXIST "%NODE_EXE%" (
  SET "NODE_EXE=node"
)

SET "NPM_CLI_JS=%~dp0\node_modules\npm\bin\npm-cli.js"
SET "NPX_CLI_JS=%~dp0\node_modules\npm\bin\npx-cli.js"
FOR /F "delims=" %%F IN ('CALL "%NODE_EXE%" "%NPM_CLI_JS%" prefix -g') DO (
  SET "NPM_PREFIX_NPX_CLI_JS=%%F\node_modules\npm\bin\npx-cli.js"
)
IF EXIST "%NPM_PREFIX_NPX_CLI_JS%" (
  SET "NPX_CLI_JS=%NPM_PREFIX_NPX_CLI_JS%"
)

"%NODE_EXE%" "%NPX_CLI_JS%" %*

```

## File: `.\node-portable\node-v20.11.0-win-x64\package-lock.json`
```json
{
  "name": "node-v20.11.0-win-x64",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "dependencies": {
        "pg": "^8.21.0"
      }
    },
    "node_modules/pg": {
      "version": "8.21.0",
      "resolved": "https://registry.npmjs.org/pg/-/pg-8.21.0.tgz",
      "integrity": "sha512-AUP1EYJuHraQGsVoCQVIcM7TEJVGtDzxWtGFZd8rds9d+CCXlU5Js1rYgfLNvxy9iJrpHjGrRjoi/3BT9fRyiA==",
      "dependencies": {
        "pg-connection-string": "^2.13.0",
        "pg-pool": "^3.14.0",
        "pg-protocol": "^1.14.0",
        "pg-types": "2.2.0",
        "pgpass": "1.0.5"
      },
      "engines": {
        "node": ">= 16.0.0"
      },
      "optionalDependencies": {
        "pg-cloudflare": "^1.4.0"
      },
      "peerDependencies": {
        "pg-native": ">=3.0.1"
      },
      "peerDependenciesMeta": {
        "pg-native": {
          "optional": true
        }
      }
    },
    "node_modules/pg-cloudflare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/pg-cloudflare/-/pg-cloudflare-1.4.0.tgz",
      "integrity": "sha512-Vo7z/6rrQYxpNRylp4Tlob2elzbh+N/MOQbxFVWCxS7oEx6jF53GTJFxK2WWpKuBRkmiin4Mt+xofFDjx09R0A==",
      "optional": true
    },
    "node_modules/pg-connection-string": {
      "version": "2.13.0",
      "resolved": "https://registry.npmjs.org/pg-connection-string/-/pg-connection-string-2.13.0.tgz",
      "integrity": "sha512-EMnU9E2fSULdsbErBbMaXJvFeD9B4+nPcM3f+4lsiCR0BHLPrLVjv3DbyM2hgQQviKJaTWIRRTjKjWlHg3p2ig=="
    },
    "node_modules/pg-int8": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/pg-int8/-/pg-int8-1.0.1.tgz",
      "integrity": "sha512-WCtabS6t3c8SkpDBUlb1kjOs7l66xsGdKpIPZsg4wR+B3+u9UAum2odSsF9tnvxg80h4ZxLWMy4pRjOsFIqQpw==",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/pg-pool": {
      "version": "3.14.0",
      "resolved": "https://registry.npmjs.org/pg-pool/-/pg-pool-3.14.0.tgz",
      "integrity": "sha512-gKtPkFdQPU3DksooVLi9LsjZxrsBUZIpa+7aVx+LV5pNh0KzP4Zleud2po+ConrxbuXGBJ6Hfer6hdgpIBpBaw==",
      "peerDependencies": {
        "pg": ">=8.0"
      }
    },
    "node_modules/pg-protocol": {
      "version": "1.14.0",
      "resolved": "https://registry.npmjs.org/pg-protocol/-/pg-protocol-1.14.0.tgz",
      "integrity": "sha512-n5taZ1kO3s9ngDTVxsEznOqCyToTgz0FLuPq0B33COy5pPpuWJpY3/2oRBVETuOgzdqRXfWpM9HIhp2LBBT1BA=="
    },
    "node_modules/pg-types": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/pg-types/-/pg-types-2.2.0.tgz",
      "integrity": "sha512-qTAAlrEsl8s4OiEQY69wDvcMIdQN6wdz5ojQiOy6YRMuynxenON0O5oCpJI6lshc6scgAY8qvJ2On/p+CXY0GA==",
      "dependencies": {
        "pg-int8": "1.0.1",
        "postgres-array": "~2.0.0",
        "postgres-bytea": "~1.0.0",
        "postgres-date": "~1.0.4",
        "postgres-interval": "^1.1.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/pgpass": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/pgpass/-/pgpass-1.0.5.tgz",
      "integrity": "sha512-FdW9r/jQZhSeohs1Z3sI1yxFQNFvMcnmfuj4WBMUTxOrAyLMaTcE1aAMBiTlbMNaXvBCQuVi0R7hd8udDSP7ug==",
      "dependencies": {
        "split2": "^4.1.0"
      }
    },
    "node_modules/postgres-array": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/postgres-array/-/postgres-array-2.0.0.tgz",
      "integrity": "sha512-VpZrUqU5A69eQyW2c5CA1jtLecCsN2U/bD6VilrFDWq5+5UIEVO7nazS3TEcHf1zuPYO/sqGvUvW62g86RXZuA==",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postgres-bytea": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/postgres-bytea/-/postgres-bytea-1.0.1.tgz",
      "integrity": "sha512-5+5HqXnsZPE65IJZSMkZtURARZelel2oXUEO8rH83VS/hxH5vv1uHquPg5wZs8yMAfdv971IU+kcPUczi7NVBQ==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-date": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/postgres-date/-/postgres-date-1.0.7.tgz",
      "integrity": "sha512-suDmjLVQg78nMK2UZ454hAG+OAW+HQPZ6n++TNDUX+L0+uUlLywnoxJKDou51Zm+zTCjrCl0Nq6J9C5hP9vK/Q==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-interval": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/postgres-interval/-/postgres-interval-1.2.0.tgz",
      "integrity": "sha512-9ZhXKM/rw350N1ovuWHbGxnGh/SNJ4cnxHiM0rxE4VN41wsg8P8zWn9hv/buK00RP4WvlOyr/RBDiptyxVbkZQ==",
      "dependencies": {
        "xtend": "^4.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/split2": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/split2/-/split2-4.2.0.tgz",
      "integrity": "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==",
      "engines": {
        "node": ">= 10.x"
      }
    },
    "node_modules/xtend": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/xtend/-/xtend-4.0.2.tgz",
      "integrity": "sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==",
      "engines": {
        "node": ">=0.4"
      }
    }
  }
}

```

## File: `.\node-portable\node-v20.11.0-win-x64\package.json`
```json
{
  "dependencies": {
    "pg": "^8.21.0"
  }
}

```

## File: `.\node-portable\node-v20.11.0-win-x64\README.md`
```md
# Node.js

Node.js is an open-source, cross-platform JavaScript runtime environment.

For information on using Node.js, see the [Node.js website][].

The Node.js project uses an [open governance model](./GOVERNANCE.md). The
[OpenJS Foundation][] provides support for the project.

Contributors are expected to act in a collaborative manner to move
the project forward. We encourage the constructive exchange of contrary
opinions and compromise. The [TSC](./GOVERNANCE.md#technical-steering-committee)
reserves the right to limit or block contributors who repeatedly act in ways
that discourage, exhaust, or otherwise negatively affect other participants.

**This project has a [Code of Conduct][].**

## Table of contents

* [Support](#support)
* [Release types](#release-types)
  * [Download](#download)
    * [Current and LTS releases](#current-and-lts-releases)
    * [Nightly releases](#nightly-releases)
    * [API documentation](#api-documentation)
  * [Verifying binaries](#verifying-binaries)
* [Building Node.js](#building-nodejs)
* [Security](#security)
* [Contributing to Node.js](#contributing-to-nodejs)
* [Current project team members](#current-project-team-members)
  * [TSC (Technical Steering Committee)](#tsc-technical-steering-committee)
  * [Collaborators](#collaborators)
  * [Triagers](#triagers)
  * [Release keys](#release-keys)
* [License](#license)

## Support

Looking for help? Check out the
[instructions for getting support](.github/SUPPORT.md).

## Release types

* **Current**: Under active development. Code for the Current release is in the
  branch for its major version number (for example,
  [v19.x](https://github.com/nodejs/node/tree/v19.x)). Node.js releases a new
  major version every 6 months, allowing for breaking changes. This happens in
  April and October every year. Releases appearing each October have a support
  life of 8 months. Releases appearing each April convert to LTS (see below)
  each October.
* **LTS**: Releases that receive Long Term Support, with a focus on stability
  and security. Every even-numbered major version will become an LTS release.
  LTS releases receive 12 months of _Active LTS_ support and a further 18 months
  of _Maintenance_. LTS release lines have alphabetically-ordered code names,
  beginning with v4 Argon. There are no breaking changes or feature additions,
  except in some special circumstances.
* **Nightly**: Code from the Current branch built every 24-hours when there are
  changes. Use with caution.

Current and LTS releases follow [semantic versioning](https://semver.org). A
member of the Release Team [signs](#release-keys) each Current and LTS release.
For more information, see the
[Release README](https://github.com/nodejs/Release#readme).

### Download

Binaries, installers, and source tarballs are available at
<https://nodejs.org/en/download/>.

#### Current and LTS releases

<https://nodejs.org/download/release/>

The [latest](https://nodejs.org/download/release/latest/) directory is an
alias for the latest Current release. The latest-_codename_ directory is an
alias for the latest release from an LTS line. For example, the
[latest-hydrogen](https://nodejs.org/download/release/latest-hydrogen/)
directory contains the latest Hydrogen (Node.js 18) release.

#### Nightly releases

<https://nodejs.org/download/nightly/>

Each directory name and filename contains a date (in UTC) and the commit
SHA at the HEAD of the release.

#### API documentation

Documentation for the latest Current release is at <https://nodejs.org/api/>.
Version-specific documentation is available in each release directory in the
_docs_ subdirectory. Version-specific documentation is also at
<https://nodejs.org/download/docs/>.

### Verifying binaries

Download directories contain a `SHASUMS256.txt` file with SHA checksums for the
files.

To download `SHASUMS256.txt` using `curl`:

```bash
curl -O https://nodejs.org/dist/vx.y.z/SHASUMS256.txt
```

To check that a downloaded file matches the checksum, run
it through `sha256sum` with a command such as:

```bash
grep node-vx.y.z.tar.gz SHASUMS256.txt | sha256sum -c -
```

For Current and LTS, the GPG detached signature of `SHASUMS256.txt` is in
`SHASUMS256.txt.sig`. You can use it with `gpg` to verify the integrity of
`SHASUMS256.txt`. You will first need to import
[the GPG keys of individuals authorized to create releases](#release-keys). To
import the keys:

```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys 4ED778F539E3634C779C87C6D7062848A1AB005C
```

See [Release keys](#release-keys) for a script to import active release keys.

Next, download the `SHASUMS256.txt.sig` for the release:

```bash
curl -O https://nodejs.org/dist/vx.y.z/SHASUMS256.txt.sig
```

Then use `gpg --verify SHASUMS256.txt.sig SHASUMS256.txt` to verify
the file's signature.

## Building Node.js

See [BUILDING.md](BUILDING.md) for instructions on how to build Node.js from
source and a list of supported platforms.

## Security

For information on reporting security vulnerabilities in Node.js, see
[SECURITY.md](./SECURITY.md).

## Contributing to Node.js

* [Contributing to the project][]
* [Working Groups][]
* [Strategic initiatives][]
* [Technical values and prioritization][]

## Current project team members

For information about the governance of the Node.js project, see
[GOVERNANCE.md](./GOVERNANCE.md).

<!-- node-core-utils and find-inactive-tsc.mjs depend on the format of the TSC
     list. If the format changes, those utilities need to be tested and
     updated. -->

### TSC (Technical Steering Committee)

#### TSC voting members

<!--lint disable prohibited-strings-->

* [aduh95](https://github.com/aduh95) -
  **Antoine du Hamel** <<duhamelantoine1995@gmail.com>> (he/him)
* [anonrig](https://github.com/anonrig) -
  **Yagiz Nizipli** <<yagiz.nizipli@sentry.io>> (he/him)
* [apapirovski](https://github.com/apapirovski) -
  **Anatoli Papirovski** <<apapirovski@mac.com>> (he/him)
* [benjamingr](https://github.com/benjamingr) -
  **Benjamin Gruenbaum** <<benjamingr@gmail.com>>
* [BridgeAR](https://github.com/BridgeAR) -
  **Ruben Bridgewater** <<ruben@bridgewater.de>> (he/him)
* [GeoffreyBooth](https://github.com/geoffreybooth) -
  **Geoffrey Booth** <<webadmin@geoffreybooth.com>> (he/him)
* [gireeshpunathil](https://github.com/gireeshpunathil) -
  **Gireesh Punathil** <<gpunathi@in.ibm.com>> (he/him)
* [jasnell](https://github.com/jasnell) -
  **James M Snell** <<jasnell@gmail.com>> (he/him)
* [joyeecheung](https://github.com/joyeecheung) -
  **Joyee Cheung** <<joyeec9h3@gmail.com>> (she/her)
* [legendecas](https://github.com/legendecas) -
  **Chengzhong Wu** <<legendecas@gmail.com>> (he/him)
* [mcollina](https://github.com/mcollina) -
  **Matteo Collina** <<matteo.collina@gmail.com>> (he/him)
* [mhdawson](https://github.com/mhdawson) -
  **Michael Dawson** <<midawson@redhat.com>> (he/him)
* [MoLow](https://github.com/MoLow) -
  **Moshe Atlow** <<moshe@atlow.co.il>> (he/him)
* [RafaelGSS](https://github.com/RafaelGSS) -
  **Rafael Gonzaga** <<rafael.nunu@hotmail.com>> (he/him)
* [RaisinTen](https://github.com/RaisinTen) -
  **Darshan Sen** <<raisinten@gmail.com>> (he/him)
* [richardlau](https://github.com/richardlau) -
  **Richard Lau** <<rlau@redhat.com>>
* [ronag](https://github.com/ronag) -
  **Robert Nagy** <<ronagy@icloud.com>>
* [ruyadorno](https://github.com/ruyadorno) -
  **Ruy Adorno** <<ruyadorno@google.com>> (he/him)
* [targos](https://github.com/targos) -
  **Michaël Zasso** <<targos@protonmail.com>> (he/him)
* [tniessen](https://github.com/tniessen) -
  **Tobias Nießen** <<tniessen@tnie.de>> (he/him)

#### TSC regular members

* [BethGriggs](https://github.com/BethGriggs) -
  **Beth Griggs** <<bethanyngriggs@gmail.com>> (she/her)
* [bnoordhuis](https://github.com/bnoordhuis) -
  **Ben Noordhuis** <<info@bnoordhuis.nl>>
* [ChALkeR](https://github.com/ChALkeR) -
  **Сковорода Никита Андреевич** <<chalkerx@gmail.com>> (he/him)
* [cjihrig](https://github.com/cjihrig) -
  **Colin Ihrig** <<cjihrig@gmail.com>> (he/him)
* [codebytere](https://github.com/codebytere) -
  **Shelley Vohr** <<shelley.vohr@gmail.com>> (she/her)
* [danbev](https://github.com/danbev) -
  **Daniel Bevenius** <<daniel.bevenius@gmail.com>> (he/him)
* [danielleadams](https://github.com/danielleadams) -
  **Danielle Adams** <<adamzdanielle@gmail.com>> (she/her)
* [fhinkel](https://github.com/fhinkel) -
  **Franziska Hinkelmann** <<franziska.hinkelmann@gmail.com>> (she/her)
* [gabrielschulhof](https://github.com/gabrielschulhof) -
  **Gabriel Schulhof** <<gabrielschulhof@gmail.com>>
* [mscdex](https://github.com/mscdex) -
  **Brian White** <<mscdex@mscdex.net>>
* [MylesBorins](https://github.com/MylesBorins) -
  **Myles Borins** <<myles.borins@gmail.com>> (he/him)
* [rvagg](https://github.com/rvagg) -
  **Rod Vagg** <<r@va.gg>>
* [TimothyGu](https://github.com/TimothyGu) -
  **Tiancheng "Timothy" Gu** <<timothygu99@gmail.com>> (he/him)
* [Trott](https://github.com/Trott) -
  **Rich Trott** <<rtrott@gmail.com>> (he/him)

<details>

<summary>TSC emeriti members</summary>

#### TSC emeriti members

* [addaleax](https://github.com/addaleax) -
  **Anna Henningsen** <<anna@addaleax.net>> (she/her)
* [chrisdickinson](https://github.com/chrisdickinson) -
  **Chris Dickinson** <<christopher.s.dickinson@gmail.com>>
* [evanlucas](https://github.com/evanlucas) -
  **Evan Lucas** <<evanlucas@me.com>> (he/him)
* [Fishrock123](https://github.com/Fishrock123) -
  **Jeremiah Senkpiel** <<fishrock123@rocketmail.com>> (he/they)
* [gibfahn](https://github.com/gibfahn) -
  **Gibson Fahnestock** <<gibfahn@gmail.com>> (he/him)
* [indutny](https://github.com/indutny) -
  **Fedor Indutny** <<fedor@indutny.com>>
* [isaacs](https://github.com/isaacs) -
  **Isaac Z. Schlueter** <<i@izs.me>>
* [joshgav](https://github.com/joshgav) -
  **Josh Gavant** <<josh.gavant@outlook.com>>
* [mmarchini](https://github.com/mmarchini) -
  **Mary Marchini** <<oss@mmarchini.me>> (she/her)
* [nebrius](https://github.com/nebrius) -
  **Bryan Hughes** <<bryan@nebri.us>>
* [ofrobots](https://github.com/ofrobots) -
  **Ali Ijaz Sheikh** <<ofrobots@google.com>> (he/him)
* [orangemocha](https://github.com/orangemocha) -
  **Alexis Campailla** <<orangemocha@nodejs.org>>
* [piscisaureus](https://github.com/piscisaureus) -
  **Bert Belder** <<bertbelder@gmail.com>>
* [sam-github](https://github.com/sam-github) -
  **Sam Roberts** <<vieuxtech@gmail.com>>
* [shigeki](https://github.com/shigeki) -
  **Shigeki Ohtsu** <<ohtsu@ohtsu.org>> (he/him)
* [thefourtheye](https://github.com/thefourtheye) -
  **Sakthipriyan Vairamani** <<thechargingvolcano@gmail.com>> (he/him)
* [trevnorris](https://github.com/trevnorris) -
  **Trevor Norris** <<trev.norris@gmail.com>>

</details>

<!-- node-core-utils and find-inactive-collaborators.mjs depend on the format
     of the collaborator list. If the format changes, those utilities need to be
     tested and updated. -->

### Collaborators

* [addaleax](https://github.com/addaleax) -
  **Anna Henningsen** <<anna@addaleax.net>> (she/her)
* [aduh95](https://github.com/aduh95) -
  **Antoine du Hamel** <<duhamelantoine1995@gmail.com>> (he/him)
* [anonrig](https://github.com/anonrig) -
  **Yagiz Nizipli** <<yagiz.nizipli@sentry.io>> (he/him)
* [antsmartian](https://github.com/antsmartian) -
  **Anto Aravinth** <<anto.aravinth.cse@gmail.com>> (he/him)
* [apapirovski](https://github.com/apapirovski) -
  **Anatoli Papirovski** <<apapirovski@mac.com>> (he/him)
* [AshCripps](https://github.com/AshCripps) -
  **Ash Cripps** <<email@ashleycripps.co.uk>>
* [atlowChemi](https://github.com/atlowChemi) -
  **Chemi Atlow** <<chemi@atlow.co.il>> (he/him)
* [Ayase-252](https://github.com/Ayase-252) -
  **Qingyu Deng** <<i@ayase-lab.com>>
* [bengl](https://github.com/bengl) -
  **Bryan English** <<bryan@bryanenglish.com>> (he/him)
* [benjamingr](https://github.com/benjamingr) -
  **Benjamin Gruenbaum** <<benjamingr@gmail.com>>
* [BethGriggs](https://github.com/BethGriggs) -
  **Beth Griggs** <<bethanyngriggs@gmail.com>> (she/her)
* [bmeck](https://github.com/bmeck) -
  **Bradley Farias** <<bradley.meck@gmail.com>>
* [bnb](https://github.com/bnb) -
  **Tierney Cyren** <<hello@bnb.im>> (they/them)
* [bnoordhuis](https://github.com/bnoordhuis) -
  **Ben Noordhuis** <<info@bnoordhuis.nl>>
* [BridgeAR](https://github.com/BridgeAR) -
  **Ruben Bridgewater** <<ruben@bridgewater.de>> (he/him)
* [cclauss](https://github.com/cclauss) -
  **Christian Clauss** <<cclauss@me.com>> (he/him)
* [ChALkeR](https://github.com/ChALkeR) -
  **Сковорода Никита Андреевич** <<chalkerx@gmail.com>> (he/him)
* [cjihrig](https://github.com/cjihrig) -
  **Colin Ihrig** <<cjihrig@gmail.com>> (he/him)
* [codebytere](https://github.com/codebytere) -
  **Shelley Vohr** <<shelley.vohr@gmail.com>> (she/her)
* [cola119](https://github.com/cola119) -
  **Kohei Ueno** <<kohei.ueno119@gmail.com>> (he/him)
* [daeyeon](https://github.com/daeyeon) -
  **Daeyeon Jeong** <<daeyeon.dev@gmail.com>> (he/him)
* [danbev](https://github.com/danbev) -
  **Daniel Bevenius** <<daniel.bevenius@gmail.com>> (he/him)
* [danielleadams](https://github.com/danielleadams) -
  **Danielle Adams** <<adamzdanielle@gmail.com>> (she/her)
* [debadree25](https://github.com/debadree25) -
  **Debadree Chatterjee** <<debadree333@gmail.com>> (he/him)
* [deokjinkim](https://github.com/deokjinkim) -
  **Deokjin Kim** <<deokjin81.kim@gmail.com>> (he/him)
* [devnexen](https://github.com/devnexen) -
  **David Carlier** <<devnexen@gmail.com>>
* [devsnek](https://github.com/devsnek) -
  **Gus Caplan** <<me@gus.host>> (they/them)
* [edsadr](https://github.com/edsadr) -
  **Adrian Estrada** <<edsadr@gmail.com>> (he/him)
* [erickwendel](https://github.com/erickwendel) -
  **Erick Wendel** <<erick.workspace@gmail.com>> (he/him)
* [Ethan-Arrowood](https://github.com/Ethan-Arrowood) -
  **Ethan Arrowood** <<ethan@arrowood.dev>> (he/him)
* [fhinkel](https://github.com/fhinkel) -
  **Franziska Hinkelmann** <<franziska.hinkelmann@gmail.com>> (she/her)
* [F3n67u](https://github.com/F3n67u) -
  **Feng Yu** <<F3n67u@outlook.com>> (he/him)
* [Flarna](https://github.com/Flarna) -
  **Gerhard Stöbich** <<deb2001-github@yahoo.de>> (he/they)
* [gabrielschulhof](https://github.com/gabrielschulhof) -
  **Gabriel Schulhof** <<gabrielschulhof@gmail.com>>
* [gengjiawen](https://github.com/gengjiawen) -
  **Jiawen Geng** <<technicalcute@gmail.com>>
* [GeoffreyBooth](https://github.com/geoffreybooth) -
  **Geoffrey Booth** <<webadmin@geoffreybooth.com>> (he/him)
* [gireeshpunathil](https://github.com/gireeshpunathil) -
  **Gireesh Punathil** <<gpunathi@in.ibm.com>> (he/him)
* [guybedford](https://github.com/guybedford) -
  **Guy Bedford** <<guybedford@gmail.com>> (he/him)
* [H4ad](https://github.com/H4ad) -
  **Vinícius Lourenço Claro Cardoso** <<contact@viniciusl.com.br>> (he/him)
* [HarshithaKP](https://github.com/HarshithaKP) -
  **Harshitha K P** <<harshitha014@gmail.com>> (she/her)
* [himself65](https://github.com/himself65) -
  **Zeyu "Alex" Yang** <<himself65@outlook.com>> (he/him)
* [iansu](https://github.com/iansu) -
  **Ian Sutherland** <<ian@iansutherland.ca>>
* [JacksonTian](https://github.com/JacksonTian) -
  **Jackson Tian** <<shyvo1987@gmail.com>>
* [JakobJingleheimer](https://github.com/JakobJingleheimer) -
  **Jacob Smith** <<jacob@frende.me>> (he/him)
* [jasnell](https://github.com/jasnell) -
  **James M Snell** <<jasnell@gmail.com>> (he/him)
* [jkrems](https://github.com/jkrems) -
  **Jan Krems** <<jan.krems@gmail.com>> (he/him)
* [joesepi](https://github.com/joesepi) -
  **Joe Sepi** <<sepi@joesepi.com>> (he/him)
* [joyeecheung](https://github.com/joyeecheung) -
  **Joyee Cheung** <<joyeec9h3@gmail.com>> (she/her)
* [juanarbol](https://github.com/juanarbol) -
  **Juan José Arboleda** <<soyjuanarbol@gmail.com>> (he/him)
* [JungMinu](https://github.com/JungMinu) -
  **Minwoo Jung** <<nodecorelab@gmail.com>> (he/him)
* [KhafraDev](https://github.com/KhafraDev) -
  **Matthew Aitken** <<maitken033380023@gmail.com>> (he/him)
* [kuriyosh](https://github.com/kuriyosh) -
  **Yoshiki Kurihara** <<yosyos0306@gmail.com>> (he/him)
* [kvakil](https://github.com/kvakil) -
  **Keyhan Vakil** <<kvakil@sylph.kvakil.me>>
* [legendecas](https://github.com/legendecas) -
  **Chengzhong Wu** <<legendecas@gmail.com>> (he/him)
* [linkgoron](https://github.com/linkgoron) -
  **Nitzan Uziely** <<linkgoron@gmail.com>>
* [LiviaMedeiros](https://github.com/LiviaMedeiros) -
  **LiviaMedeiros** <<livia@cirno.name>>
* [lpinca](https://github.com/lpinca) -
  **Luigi Pinca** <<luigipinca@gmail.com>> (he/him)
* [lukekarrys](https://github.com/lukekarrys) -
  **Luke Karrys** <<luke@lukekarrys.com>> (he/him)
* [Lxxyx](https://github.com/Lxxyx) -
  **Zijian Liu** <<lxxyxzj@gmail.com>> (he/him)
* [marco-ippolito](https://github.com/marco-ippolito) -
  **Marco Ippolito** <<marcoippolito54@gmail.com>> (he/him)
* [marsonya](https://github.com/marsonya) -
  **Akhil Marsonya** <<akhil.marsonya27@gmail.com>> (he/him)
* [mcollina](https://github.com/mcollina) -
  **Matteo Collina** <<matteo.collina@gmail.com>> (he/him)
* [meixg](https://github.com/meixg) -
  **Xuguang Mei** <<meixuguang@gmail.com>> (he/him)
* [Mesteery](https://github.com/Mesteery) -
  **Mestery** <<mestery@protonmail.com>> (he/him)
* [mhdawson](https://github.com/mhdawson) -
  **Michael Dawson** <<midawson@redhat.com>> (he/him)
* [miladfarca](https://github.com/miladfarca) -
  **Milad Fa** <<mfarazma@redhat.com>> (he/him)
* [mildsunrise](https://github.com/mildsunrise) -
  **Alba Mendez** <<me@alba.sh>> (she/her)
* [MoLow](https://github.com/MoLow) -
  **Moshe Atlow** <<moshe@atlow.co.il>> (he/him)
* [MrJithil](https://github.com/MrJithil) -
  **Jithil P Ponnan** <<jithil@outlook.com>> (he/him)
* [mscdex](https://github.com/mscdex) -
  **Brian White** <<mscdex@mscdex.net>>
* [MylesBorins](https://github.com/MylesBorins) -
  **Myles Borins** <<myles.borins@gmail.com>> (he/him)
* [ovflowd](https://github.com/ovflowd) -
  **Claudio Wunder** <<cwunder@gnome.org>> (he/they)
* [oyyd](https://github.com/oyyd) -
  **Ouyang Yadong** <<oyydoibh@gmail.com>> (he/him)
* [panva](https://github.com/panva) -
  **Filip Skokan** <<panva.ip@gmail.com>> (he/him)
* [Qard](https://github.com/Qard) -
  **Stephen Belanger** <<admin@stephenbelanger.com>> (he/him)
* [RafaelGSS](https://github.com/RafaelGSS) -
  **Rafael Gonzaga** <<rafael.nunu@hotmail.com>> (he/him)
* [RaisinTen](https://github.com/RaisinTen) -
  **Darshan Sen** <<raisinten@gmail.com>> (he/him)
* [rluvaton](https://github.com/rluvaton) -
  **Raz Luvaton** <<rluvaton@gmail.com>> (he/him)
* [richardlau](https://github.com/richardlau) -
  **Richard Lau** <<rlau@redhat.com>>
* [rickyes](https://github.com/rickyes) -
  **Ricky Zhou** <<0x19951125@gmail.com>> (he/him)
* [ronag](https://github.com/ronag) -
  **Robert Nagy** <<ronagy@icloud.com>>
* [ruyadorno](https://github.com/ruyadorno) -
  **Ruy Adorno** <<ruyadorno@google.com>> (he/him)
* [rvagg](https://github.com/rvagg) -
  **Rod Vagg** <<rod@vagg.org>>
* [ryzokuken](https://github.com/ryzokuken) -
  **Ujjwal Sharma** <<ryzokuken@disroot.org>> (he/him)
* [santigimeno](https://github.com/santigimeno) -
  **Santiago Gimeno** <<santiago.gimeno@gmail.com>>
* [shisama](https://github.com/shisama) -
  **Masashi Hirano** <<shisama07@gmail.com>> (he/him)
* [ShogunPanda](https://github.com/ShogunPanda) -
  **Paolo Insogna** <<paolo@cowtech.it>> (he/him)
* [srl295](https://github.com/srl295) -
  **Steven R Loomis** <<srl295@gmail.com>>
* [sxa](https://github.com/sxa) -
  **Stewart X Addison** <<sxa@redhat.com>> (he/him)
* [targos](https://github.com/targos) -
  **Michaël Zasso** <<targos@protonmail.com>> (he/him)
* [theanarkh](https://github.com/theanarkh) -
  **theanarkh** <<theratliter@gmail.com>> (he/him)
* [TimothyGu](https://github.com/TimothyGu) -
  **Tiancheng "Timothy" Gu** <<timothygu99@gmail.com>> (he/him)
* [tniessen](https://github.com/tniessen) -
  **Tobias Nießen** <<tniessen@tnie.de>> (he/him)
* [trivikr](https://github.com/trivikr) -
  **Trivikram Kamat** <<trivikr.dev@gmail.com>>
* [Trott](https://github.com/Trott) -
  **Rich Trott** <<rtrott@gmail.com>> (he/him)
* [vdeturckheim](https://github.com/vdeturckheim) -
  **Vladimir de Turckheim** <<vlad2t@hotmail.com>> (he/him)
* [vmoroz](https://github.com/vmoroz) -
  **Vladimir Morozov** <<vmorozov@microsoft.com>> (he/him)
* [VoltrexKeyva](https://github.com/VoltrexKeyva) -
  **Mohammed Keyvanzadeh** <<mohammadkeyvanzade94@gmail.com>> (he/him)
* [watilde](https://github.com/watilde) -
  **Daijiro Wachi** <<daijiro.wachi@gmail.com>> (he/him)
* [XadillaX](https://github.com/XadillaX) -
  **Khaidi Chu** <<i@2333.moe>> (he/him)
* [yashLadha](https://github.com/yashLadha) -
  **Yash Ladha** <<yash@yashladha.in>> (he/him)
* [ZYSzys](https://github.com/ZYSzys) -
  **Yongsheng Zhang** <<zyszys98@gmail.com>> (he/him)

<details>

<summary>Emeriti</summary>

<!-- find-inactive-collaborators.mjs depends on the format of the emeriti list.
     If the format changes, those utilities need to be tested and updated. -->

### Collaborator emeriti

* [ak239](https://github.com/ak239) -
  **Aleksei Koziatinskii** <<ak239spb@gmail.com>>
* [andrasq](https://github.com/andrasq) -
  **Andras** <<andras@kinvey.com>>
* [AnnaMag](https://github.com/AnnaMag) -
  **Anna M. Kedzierska** <<anna.m.kedzierska@gmail.com>>
* [AndreasMadsen](https://github.com/AndreasMadsen) -
  **Andreas Madsen** <<amwebdk@gmail.com>> (he/him)
* [aqrln](https://github.com/aqrln) -
  **Alexey Orlenko** <<eaglexrlnk@gmail.com>> (he/him)
* [bcoe](https://github.com/bcoe) -
  **Ben Coe** <<bencoe@gmail.com>> (he/him)
* [bmeurer](https://github.com/bmeurer) -
  **Benedikt Meurer** <<benedikt.meurer@gmail.com>>
* [boneskull](https://github.com/boneskull) -
  **Christopher Hiller** <<boneskull@boneskull.com>> (he/him)
* [brendanashworth](https://github.com/brendanashworth) -
  **Brendan Ashworth** <<brendan.ashworth@me.com>>
* [bzoz](https://github.com/bzoz) -
  **Bartosz Sosnowski** <<bartosz@janeasystems.com>>
* [calvinmetcalf](https://github.com/calvinmetcalf) -
  **Calvin Metcalf** <<calvin.metcalf@gmail.com>>
* [chrisdickinson](https://github.com/chrisdickinson) -
  **Chris Dickinson** <<christopher.s.dickinson@gmail.com>>
* [claudiorodriguez](https://github.com/claudiorodriguez) -
  **Claudio Rodriguez** <<cjrodr@yahoo.com>>
* [DavidCai1993](https://github.com/DavidCai1993) -
  **David Cai** <<davidcai1993@yahoo.com>> (he/him)
* [davisjam](https://github.com/davisjam) -
  **Jamie Davis** <<davisjam@vt.edu>> (he/him)
* [digitalinfinity](https://github.com/digitalinfinity) -
  **Hitesh Kanwathirtha** <<digitalinfinity@gmail.com>> (he/him)
* [dmabupt](https://github.com/dmabupt) -
  **Xu Meng** <<dmabupt@gmail.com>> (he/him)
* [dnlup](https://github.com/dnlup)
  **dnlup** <<dnlup.dev@gmail.com>>
* [eljefedelrodeodeljefe](https://github.com/eljefedelrodeodeljefe) -
  **Robert Jefe Lindstaedt** <<robert.lindstaedt@gmail.com>>
* [estliberitas](https://github.com/estliberitas) -
  **Alexander Makarenko** <<estliberitas@gmail.com>>
* [eugeneo](https://github.com/eugeneo) -
  **Eugene Ostroukhov** <<eostroukhov@google.com>>
* [evanlucas](https://github.com/evanlucas) -
  **Evan Lucas** <<evanlucas@me.com>> (he/him)
* [firedfox](https://github.com/firedfox) -
  **Daniel Wang** <<wangyang0123@gmail.com>>
* [Fishrock123](https://github.com/Fishrock123) -
  **Jeremiah Senkpiel** <<fishrock123@rocketmail.com>> (he/they)
* [gdams](https://github.com/gdams) -
  **George Adams** <<gadams@microsoft.com>> (he/him)
* [geek](https://github.com/geek) -
  **Wyatt Preul** <<wpreul@gmail.com>>
* [gibfahn](https://github.com/gibfahn) -
  **Gibson Fahnestock** <<gibfahn@gmail.com>> (he/him)
* [glentiki](https://github.com/glentiki) -
  **Glen Keane** <<glenkeane.94@gmail.com>> (he/him)
* [hashseed](https://github.com/hashseed) -
  **Yang Guo** <<yangguo@chromium.org>> (he/him)
* [hiroppy](https://github.com/hiroppy) -
  **Yuta Hiroto** <<hello@hiroppy.me>> (he/him)
* [iarna](https://github.com/iarna) -
  **Rebecca Turner** <<me@re-becca.org>>
* [imran-iq](https://github.com/imran-iq) -
  **Imran Iqbal** <<imran@imraniqbal.org>>
* [imyller](https://github.com/imyller) -
  **Ilkka Myller** <<ilkka.myller@nodefield.com>>
* [indutny](https://github.com/indutny) -
  **Fedor Indutny** <<fedor@indutny.com>>
* [isaacs](https://github.com/isaacs) -
  **Isaac Z. Schlueter** <<i@izs.me>>
* [italoacasas](https://github.com/italoacasas) -
  **Italo A. Casas** <<me@italoacasas.com>> (he/him)
* [jasongin](https://github.com/jasongin) -
  **Jason Ginchereau** <<jasongin@microsoft.com>>
* [jbergstroem](https://github.com/jbergstroem) -
  **Johan Bergström** <<bugs@bergstroem.nu>>
* [jdalton](https://github.com/jdalton) -
  **John-David Dalton** <<john.david.dalton@gmail.com>>
* [jhamhader](https://github.com/jhamhader) -
  **Yuval Brik** <<yuval@brik.org.il>>
* [joaocgreis](https://github.com/joaocgreis) -
  **João Reis** <<reis@janeasystems.com>>
* [joshgav](https://github.com/joshgav) -
  **Josh Gavant** <<josh.gavant@outlook.com>>
* [julianduque](https://github.com/julianduque) -
  **Julian Duque** <<julianduquej@gmail.com>> (he/him)
* [kfarnung](https://github.com/kfarnung) -
  **Kyle Farnung** <<kfarnung@microsoft.com>> (he/him)
* [kunalspathak](https://github.com/kunalspathak) -
  **Kunal Pathak** <<kunal.pathak@microsoft.com>>
* [lance](https://github.com/lance) -
  **Lance Ball** <<lball@redhat.com>> (he/him)
* [Leko](https://github.com/Leko) -
  **Shingo Inoue** <<leko.noor@gmail.com>> (he/him)
* [lucamaraschi](https://github.com/lucamaraschi) -
  **Luca Maraschi** <<luca.maraschi@gmail.com>> (he/him)
* [lundibundi](https://github.com/lundibundi) -
  **Denys Otrishko** <<shishugi@gmail.com>> (he/him)
* [lxe](https://github.com/lxe) -
  **Aleksey Smolenchuk** <<lxe@lxe.co>>
* [maclover7](https://github.com/maclover7) -
  **Jon Moss** <<me@jonathanmoss.me>> (he/him)
* [mafintosh](https://github.com/mafintosh) -
  **Mathias Buus** <<mathiasbuus@gmail.com>> (he/him)
* [matthewloring](https://github.com/matthewloring) -
  **Matthew Loring** <<mattloring@google.com>>
* [micnic](https://github.com/micnic) -
  **Nicu Micleușanu** <<micnic90@gmail.com>> (he/him)
* [mikeal](https://github.com/mikeal) -
  **Mikeal Rogers** <<mikeal.rogers@gmail.com>>
* [misterdjules](https://github.com/misterdjules) -
  **Julien Gilli** <<jgilli@netflix.com>>
* [mmarchini](https://github.com/mmarchini) -
  **Mary Marchini** <<oss@mmarchini.me>> (she/her)
* [monsanto](https://github.com/monsanto) -
  **Christopher Monsanto** <<chris@monsan.to>>
* [MoonBall](https://github.com/MoonBall) -
  **Chen Gang** <<gangc.cxy@foxmail.com>>
* [not-an-aardvark](https://github.com/not-an-aardvark) -
  **Teddy Katz** <<teddy.katz@gmail.com>> (he/him)
* [ofrobots](https://github.com/ofrobots) -
  **Ali Ijaz Sheikh** <<ofrobots@google.com>> (he/him)
* [Olegas](https://github.com/Olegas) -
  **Oleg Elifantiev** <<oleg@elifantiev.ru>>
* [orangemocha](https://github.com/orangemocha) -
  **Alexis Campailla** <<orangemocha@nodejs.org>>
* [othiym23](https://github.com/othiym23) -
  **Forrest L Norvell** <<ogd@aoaioxxysz.net>> (they/them/themself)
* [petkaantonov](https://github.com/petkaantonov) -
  **Petka Antonov** <<petka_antonov@hotmail.com>>
* [phillipj](https://github.com/phillipj) -
  **Phillip Johnsen** <<johphi@gmail.com>>
* [piscisaureus](https://github.com/piscisaureus) -
  **Bert Belder** <<bertbelder@gmail.com>>
* [pmq20](https://github.com/pmq20) -
  **Minqi Pan** <<pmq2001@gmail.com>>
* [PoojaDurgad](https://github.com/PoojaDurgad) -
  **Pooja D P** <<Pooja.D.P@ibm.com>> (she/her)
* [princejwesley](https://github.com/princejwesley) -
  **Prince John Wesley** <<princejohnwesley@gmail.com>>
* [psmarshall](https://github.com/psmarshall) -
  **Peter Marshall** <<petermarshall@chromium.org>> (he/him)
* [puzpuzpuz](https://github.com/puzpuzpuz) -
  **Andrey Pechkurov** <<apechkurov@gmail.com>> (he/him)
* [refack](https://github.com/refack) -
  **Refael Ackermann (רפאל פלחי)** <<refack@gmail.com>> (he/him/הוא/אתה)
* [rexagod](https://github.com/rexagod) -
  **Pranshu Srivastava** <<rexagod@gmail.com>> (he/him)
* [rlidwka](https://github.com/rlidwka) -
  **Alex Kocharin** <<alex@kocharin.ru>>
* [rmg](https://github.com/rmg) -
  **Ryan Graham** <<r.m.graham@gmail.com>>
* [robertkowalski](https://github.com/robertkowalski) -
  **Robert Kowalski** <<rok@kowalski.gd>>
* [romankl](https://github.com/romankl) -
  **Roman Klauke** <<romaaan.git@gmail.com>>
* [ronkorving](https://github.com/ronkorving) -
  **Ron Korving** <<ron@ronkorving.nl>>
* [RReverser](https://github.com/RReverser) -
  **Ingvar Stepanyan** <<me@rreverser.com>>
* [rubys](https://github.com/rubys) -
  **Sam Ruby** <<rubys@intertwingly.net>>
* [saghul](https://github.com/saghul) -
  **Saúl Ibarra Corretgé** <<s@saghul.net>>
* [sam-github](https://github.com/sam-github) -
  **Sam Roberts** <<vieuxtech@gmail.com>>
* [sebdeckers](https://github.com/sebdeckers) -
  **Sebastiaan Deckers** <<sebdeckers83@gmail.com>>
* [seishun](https://github.com/seishun) -
  **Nikolai Vavilov** <<vvnicholas@gmail.com>>
* [shigeki](https://github.com/shigeki) -
  **Shigeki Ohtsu** <<ohtsu@ohtsu.org>> (he/him)
* [silverwind](https://github.com/silverwind) -
  **Roman Reiss** <<me@silverwind.io>>
* [starkwang](https://github.com/starkwang) -
  **Weijia Wang** <<starkwang@126.com>>
* [stefanmb](https://github.com/stefanmb) -
  **Stefan Budeanu** <<stefan@budeanu.com>>
* [tellnes](https://github.com/tellnes) -
  **Christian Tellnes** <<christian@tellnes.no>>
* [thefourtheye](https://github.com/thefourtheye) -
  **Sakthipriyan Vairamani** <<thechargingvolcano@gmail.com>> (he/him)
* [thlorenz](https://github.com/thlorenz) -
  **Thorsten Lorenz** <<thlorenz@gmx.de>>
* [trevnorris](https://github.com/trevnorris) -
  **Trevor Norris** <<trev.norris@gmail.com>>
* [tunniclm](https://github.com/tunniclm) -
  **Mike Tunnicliffe** <<m.j.tunnicliffe@gmail.com>>
* [vkurchatkin](https://github.com/vkurchatkin) -
  **Vladimir Kurchatkin** <<vladimir.kurchatkin@gmail.com>>
* [vsemozhetbyt](https://github.com/vsemozhetbyt) -
  **Vse Mozhet Byt** <<vsemozhetbyt@gmail.com>> (he/him)
* [watson](https://github.com/watson) -
  **Thomas Watson** <<w@tson.dk>>
* [whitlockjc](https://github.com/whitlockjc) -
  **Jeremy Whitlock** <<jwhitlock@apache.org>>
* [yhwang](https://github.com/yhwang) -
  **Yihong Wang** <<yh.wang@ibm.com>>
* [yorkie](https://github.com/yorkie) -
  **Yorkie Liu** <<yorkiefixer@gmail.com>>
* [yosuke-furukawa](https://github.com/yosuke-furukawa) -
  **Yosuke Furukawa** <<yosuke.furukawa@gmail.com>>

</details>

<!--lint enable prohibited-strings-->

Collaborators follow the [Collaborator Guide](./doc/contributing/collaborator-guide.md) in
maintaining the Node.js project.

### Triagers

* [atlowChemi](https://github.com/atlowChemi) -
  **Chemi Atlow** <<chemi@atlow.co.il>> (he/him)
* [Ayase-252](https://github.com/Ayase-252) -
  **Qingyu Deng** <<i@ayase-lab.com>>
* [bmuenzenmeyer](https://github.com/bmuenzenmeyer) -
  **Brian Muenzenmeyer** <<brian.muenzenmeyer@gmail.com>> (he/him)
* [CanadaHonk](https://github.com/CanadaHonk) -
  **Oliver Medhurst** <<honk@goose.icu>> (they/them)
* [daeyeon](https://github.com/daeyeon) -
  **Daeyeon Jeong** <<daeyeon.dev@gmail.com>> (he/him)
* [F3n67u](https://github.com/F3n67u) -
  **Feng Yu** <<F3n67u@outlook.com>> (he/him)
* [himadriganguly](https://github.com/himadriganguly) -
  **Himadri Ganguly** <<himadri.tech@gmail.com>> (he/him)
* [iam-frankqiu](https://github.com/iam-frankqiu) -
  **Frank Qiu** <<iam.frankqiu@gmail.com>> (he/him)
* [marsonya](https://github.com/marsonya) -
  **Akhil Marsonya** <<akhil.marsonya27@gmail.com>> (he/him)
* [meixg](https://github.com/meixg) -
  **Xuguang Mei** <<meixuguang@gmail.com>> (he/him)
* [mertcanaltin](https://github.com/mertcanaltin) -
  **Mert Can Altin** <<mertgold60@gmail.com>>
* [Mesteery](https://github.com/Mesteery) -
  **Mestery** <<mestery@protonmail.com>> (he/him)
* [preveen-stack](https://github.com/preveen-stack) -
  **Preveen Padmanabhan** <<wide4head@gmail.com>> (he/him)
* [PoojaDurgad](https://github.com/PoojaDurgad) -
  **Pooja Durgad** <<Pooja.D.P@ibm.com>>
* [RaisinTen](https://github.com/RaisinTen) -
  **Darshan Sen** <<raisinten@gmail.com>>
* [VoltrexKeyva](https://github.com/VoltrexKeyva) -
  **Mohammed Keyvanzadeh** <<mohammadkeyvanzade94@gmail.com>> (he/him)

Triagers follow the [Triage Guide](./doc/contributing/issues.md#triaging-a-bug-report) when
responding to new issues.

### Release keys

Primary GPG keys for Node.js Releasers (some Releasers sign with subkeys):

* **Beth Griggs** <<bethanyngriggs@gmail.com>>
  `4ED778F539E3634C779C87C6D7062848A1AB005C`
* **Bryan English** <<bryan@bryanenglish.com>>
  `141F07595B7B3FFE74309A937405533BE57C7D57`
* **Danielle Adams** <<adamzdanielle@gmail.com>>
  `74F12602B6F1C4E913FAA37AD3A89613643B6201`
* **Juan José Arboleda** <<soyjuanarbol@gmail.com>>
  `DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7`
* **Michaël Zasso** <<targos@protonmail.com>>
  `8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600`
* **Myles Borins** <<myles.borins@gmail.com>>
  `C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8`
* **RafaelGSS** <<rafael.nunu@hotmail.com>>
  `890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4`
* **Richard Lau** <<rlau@redhat.com>>
  `C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C`
* **Ruy Adorno** <<ruyadorno@hotmail.com>>
  `108F52B48DB57BB0CC439B2997B01419BD92F80A`
* **Ulises Gascón** <<ulisesgascongonzalez@gmail.com>>
  `A363A499291CBBC940DD62E41F10027AF002F8B0`

To import the full set of trusted release keys (including subkeys possibly used
to sign releases):

```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys 4ED778F539E3634C779C87C6D7062848A1AB005C
gpg --keyserver hkps://keys.openpgp.org --recv-keys 141F07595B7B3FFE74309A937405533BE57C7D57
gpg --keyserver hkps://keys.openpgp.org --recv-keys 74F12602B6F1C4E913FAA37AD3A89613643B6201
gpg --keyserver hkps://keys.openpgp.org --recv-keys DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7
gpg --keyserver hkps://keys.openpgp.org --recv-keys 8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600
gpg --keyserver hkps://keys.openpgp.org --recv-keys C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8
gpg --keyserver hkps://keys.openpgp.org --recv-keys 890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4
gpg --keyserver hkps://keys.openpgp.org --recv-keys C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C
gpg --keyserver hkps://keys.openpgp.org --recv-keys 108F52B48DB57BB0CC439B2997B01419BD92F80A
gpg --keyserver hkps://keys.openpgp.org --recv-keys A363A499291CBBC940DD62E41F10027AF002F8B0
```

See [Verifying binaries](#verifying-binaries) for how to use these keys to
verify a downloaded file.

<details>

<summary>Other keys used to sign some previous releases</summary>

* **Chris Dickinson** <<christopher.s.dickinson@gmail.com>>
  `9554F04D7259F04124DE6B476D5A82AC7E37093B`
* **Colin Ihrig** <<cjihrig@gmail.com>>
  `94AE36675C464D64BAFA68DD7434390BDBE9B9C5`
* **Danielle Adams** <<adamzdanielle@gmail.com>>
  `1C050899334244A8AF75E53792EF661D867B9DFA`
* **Evan Lucas** <<evanlucas@me.com>>
  `B9AE9905FFD7803F25714661B63B535A4C206CA9`
* **Gibson Fahnestock** <<gibfahn@gmail.com>>
  `77984A986EBC2AA786BC0F66B01FBB92821C587A`
* **Isaac Z. Schlueter** <<i@izs.me>>
  `93C7E9E91B49E432C2F75674B0A78B0A6C481CF6`
* **Italo A. Casas** <<me@italoacasas.com>>
  `56730D5401028683275BD23C23EFEFE93C4CFFFE`
* **James M Snell** <<jasnell@keybase.io>>
  `71DCFD284A79C3B38668286BC97EC7A07EDE3FC1`
* **Jeremiah Senkpiel** <<fishrock@keybase.io>>
  `FD3A5288F042B6850C66B31F09FE44734EB7990E`
* **Juan José Arboleda** <<soyjuanarbol@gmail.com>>
  `61FC681DFB92A079F1685E77973F295594EC4689`
* **Julien Gilli** <<jgilli@fastmail.fm>>
  `114F43EE0176B71C7BC219DD50A3051F888C628D`
* **Rod Vagg** <<rod@vagg.org>>
  `DD8F2338BAE7501E3DD5AC78C273792F7D83545D`
* **Ruben Bridgewater** <<ruben@bridgewater.de>>
  `A48C2BEE680E841632CD4E44F07496B3EB3C1762`
* **Shelley Vohr** <<shelley.vohr@gmail.com>>
  `B9E2F5981AA6E0CD28160D9FF13993A75599653C`
* **Timothy J Fontaine** <<tjfontaine@gmail.com>>
  `7937DFD2AB06298B2293C3187D33FF9D0246406D`

</details>

### Security release stewards

When possible, the commitment to take slots in the
security release steward rotation is made by companies in order
to ensure individuals who act as security stewards have the
support and recognition from their employer to be able to
prioritize security releases. Security release stewards manage security
releases on a rotation basis as outlined in the
[security release process](./doc/contributing/security-release-process.md).

* Datadog
  * [bengl](https://github.com/bengl) -
    **Bryan English** <<bryan@bryanenglish.com>> (he/him)
* NearForm
  * [RafaelGSS](https://github.com/RafaelGSS) -
    **Rafael Gonzaga** <<rafael.nunu@hotmail.com>> (he/him)
* NodeSource
  * [juanarbol](https://github.com/juanarbol) -
    **Juan José Arboleda** <<soyjuanarbol@gmail.com>> (he/him)
* Platformatic
  * [mcollina](https://github.com/mcollina) -
    **Matteo Collina** <<matteo.collina@gmail.com>> (he/him)
* Red Hat and IBM
  * [joesepi](https://github.com/joesepi) -
    **Joe Sepi** <<joesepi@ibm.com>> (he/him)
  * [mhdawson](https://github.com/mhdawson) -
    **Michael Dawson** <<midawson@redhat.com>> (he/him)

## License

Node.js is available under the
[MIT license](https://opensource.org/licenses/MIT). Node.js also includes
external libraries that are available under a variety of licenses.  See
[LICENSE](https://github.com/nodejs/node/blob/HEAD/LICENSE) for the full
license text.

[Code of Conduct]: https://github.com/nodejs/admin/blob/HEAD/CODE_OF_CONDUCT.md
[Contributing to the project]: CONTRIBUTING.md
[Node.js website]: https://nodejs.org/
[OpenJS Foundation]: https://openjsf.org/
[Strategic initiatives]: doc/contributing/strategic-initiatives.md
[Technical values and prioritization]: doc/contributing/technical-values.md
[Working Groups]: https://github.com/nodejs/TSC/blob/HEAD/WORKING_GROUPS.md

```

## File: `.\node-portable\node-v20.11.0-win-x64\setup-db.js`
```javascript
﻿const { Client } = require('pg');

// URL encode the password to handle the '@' symbol in connection string
const connectionString = 'postgresql://postgres:Ashutosh9784%40@db.ooyoyxjxavusiuabomzv.supabase.co:5432/postgres';

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

```

