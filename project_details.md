# Technical Reference Manual: Sharma Industries ERP

This reference manual provides a comprehensive analysis of the tech stack, folder architecture, database schemas, role-based workflows, session tracking, and the development roadmap for the Sharma Industries ERP application.

---

## 1. Tech Stack Overview

Sharma Industries ERP is structured using a unified modern web development stack:
*   **Core Framework**: Next.js 15 (React 19) utilising Server Actions for secure, type-safe data mutation and database access without exposing REST API routes.
*   **Database Engine**: Supabase (PostgreSql) with row-level security (RLS) policies and transaction-level connection pooling.
*   **Localization**: Integrated dual-language dictionary system supporting English (EN) and Hindi (HI), toggled globally across workspace sidebars.
*   **Styling & Design System**: TailwindCSS combined with Vanilla CSS variables in `index.css` for a dark-themed, glassmorphic UI aesthetic.
*   **AI Integration**: OpenAI API integrations for automated OCR scan processing, information extraction, and structured JSON parsing of invoices/bills.
*   **Barcode & Scanning Utilities**: Client-side QR generation and camera scanning engines.

---

## 2. Directory Layout & Key Modules

The project is structured under the `next-app` route layout:
```
next-app/
├── public/                 # Static branding assets, icons, and logos
├── src/
│   ├── actions/            # Server-side mutation and querying layer
│   │   ├── productionActions.ts  # Recipe formulations, batch records, inventory logs
│   │   └── purchaseActions.ts    # Supplier syncs, tax parsing, AI scanning
│   ├── components/         # Reusable React components
│   │   ├── Sidebar.tsx           # Role-based workspace layout navigations
│   │   ├── LanguageProvider.tsx  # Dual-language translations (EN/HI)
│   │   └── MilestoneTracker.tsx  # Gamification indicator for dealers
│   ├── i18n/               # Dual language locale dictionaries
│   │   └── dictionaries/
│   │       ├── en.json           # English localization values
│   │       └── hi.json           # Hindi localization values
│   └── app/                # Next.js App Router Page layouts
│       ├── login/          # Secure user login portal
│       └── dashboard/      # Role-restricted portals
│           ├── ceo/        # CEO analytics, supplier registers, quotes & invoices
│           ├── factory/    # Batch logs, QR codes, raw material assets
│           ├── dealer/     # Retail storefronts, P&L, POS invoices
│           ├── ca-portal/  # Auditor audit reports, sales GST grids
│           └── salesman/   # territory routes, KYC onboarding forms
```

---

## 3. User Session & Authentication Architecture

Sharma Industries handles sessions via a custom secure cookie:
*   **Cookie Name**: `si_session`
*   **Token Value**: JSON-serialized object containing:
    ```typescript
    interface Session {
      userId: string;       // User UUID in "users" table
      name: string;         // User full name
      role: string;         // Role: "ceo" | "dealer" | "salesman" | "ca-portal" | "factory"
      phone: string;        // 10-digit clean phone number
      loginAt: string;      // ISO string timestamp
    }
    ```
*   **Routing**: The Next.js middleware decrypts this cookie and automatically directs/restricts pages under `/dashboard/[role]`.

---

## 4. Database Schema Catalog

Key system tables in the Supabase PostgreSQL database:

### Table: `users`
Tracks system credentials, registration approvals, and system permissions.
*   `id` (uuid, primary key)
*   `phone` (text, unique)
*   `password_hash` (text)
*   `name` (text)
*   `role` (text) - e.g. `'ceo'`, `'dealer'`, `'salesman'`, `'factory'`, `'ca-portal'`
*   `is_active` (boolean)
*   `is_approved` (boolean)
*   `last_login` (timestamp)

### Table: `dealers`
Enterprise regional partners and retailers.
*   `id` (uuid, primary key)
*   `name` (text)
*   `address` (text)
*   `localities` (text)
*   `designation` (text)
*   `gst_number` (text)
*   `assigned_salesman_id` (text, links to salesman users)
*   `pan_card_url` (text)
*   `aadhaar_front_url` (text)
*   `aadhaar_back_url` (text)
*   `created_at` (timestamp)

### Table: `dealer_settings`
Dealer store profile options, headers, templates, terms, and onboarding indicators.
*   `dealer_id` (uuid, references `dealers.id` or `users.id`)
*   `shop_name` (text)
*   `upi_id` (text)
*   `shop_logo_url` (text)
*   `terms_conditions` (text)
*   `onboarding_completed` (boolean)

### Table: `invoices`
Sales bills, estimates, taxes (CGST/SGST/IGST), discount lines, and items.
*   `id` (text, primary key)
*   `invoice_no` (text)
*   `date` (text)
*   `due_date` (text)
*   `customer` (jsonb) - customer info object
*   `items` (jsonb) - array of itemized lines (name, qty, rate, taxable, total)
*   `subtotal` (numeric)
*   `total_gst` (numeric)
*   `cgst` (numeric)
*   `sgst` (numeric)
*   `igst` (numeric)
*   `discount` (numeric)
*   `round_off` (numeric)
*   `grand_total` (numeric)
*   `balance_due` (numeric)
*   `payment_status` (text) - e.g. `'Paid'`, `'Partial'`, `'Unpaid'`
*   `payment_mode` (text)
*   `dealer_id` (uuid) - foreign key referencing `dealers.id` when created by dealer
*   `client_id` (text) - references the billing `clients` table
*   `additional_charges` (jsonb) - array of custom/labor charges `{name: string, amount: number}`

### Table: `quotations`
Sales estimates and quotes before confirmation.
*   `id` (text, primary key)
*   `quotation_no` (text)
*   `date` (text)
*   `customer` (jsonb)
*   `items` (jsonb)
*   `subtotal` (numeric)
*   `total_gst` (numeric)
*   `grand_total` (numeric)
*   `additional_charges` (jsonb) - array of custom charges

### Table: `products`
The core catalog of raw chemical components, finished goods, and paint containers.
*   `id` (text, primary key)
*   `name` (text)
*   `category` (text)
*   `sku` (text)
*   `price` (numeric)
*   `tax_rate` (numeric) - e.g. `18` (18% GST)
*   `hsn_code` (text)
*   `current_stock` (numeric)

---

## 5. Current State of the Dealer Module

The dealer module is located at `next-app/src/app/dashboard/dealer/`:
1.  **Dashboard Homepage (`/page.tsx`)**:
    *   Welcomes the logged-in dealer session.
    *   Renders a gamification progress indicator (`MilestoneTracker`) for cumulative sales (e.g. bags sold vs. quarterly targets, showing rewards milestones).
    *   Features quick-navigation cards for orders, balances, POS, and profile configuration.
2.  **Point of Sale POS (`/pos/`)**:
    *   Interactive client-side billing interface (`POSForm.tsx`) allowing fast cashier invoicing.
    *   Saves finalized POS transactions into the database `invoices` table.
3.  **Profit & Loss / Expenses (`/pnl/`)**:
    *   Financial expense tracker (`page.tsx` & `ExpenseButtons.tsx`) for logging overheads, rent, transport, utility bills, and raw retail costs.

---

## 6. Next Steps & Development Roadmap: Dealer Dashboard

To build out the Dealer portal, the following features are planned:
1.  **Storefront / Order Placement**:
    *   An interface allowing dealers to place orders directly back to Sharma Industries (factory/CEO) for product stocks.
    *   A catalog browser linking to the `products` list, shopping cart state, and order logging.
2.  **Commission & Payments Ledger**:
    *   A historical view of outstanding balances, payments paid, and earned commissions/rebates.
    *   Direct settlement interfaces for tracking debit/credit balance sheets via the `finance_ledger` table.
3.  **Painter Network / Loyalty Integration**:
    *   Painters scan QR codes on Sharma Industries products to earn loyalty cashbacks.
    *   Dealers require a scanner audit panel to check painter scan logs and approve painter loyalty redemptions.
