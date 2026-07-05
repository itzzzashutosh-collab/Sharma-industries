# Project Summary: Sharma Industries ERP System

This document provides a comprehensive architectural overview, technical breakdown, database schema catalog, and user-role specification for the Sharma Industries ERP.

---

## 1. Project Overview & Tech Stack

Sharma Industries ERP is a production-grade enterprise resource planning platform engineered to optimize chemical formulations, raw material stocks, finished goods packaging, dealer networks, and CA compliance structures. 

### Core Technologies:
*   **Backend & Frontend Core**: Next.js 15 (React 19) utilizing Server Actions for strict type-safe database queries.
*   **Database Engine**: Supabase (PostgreSQL) with connection pooling and storage bucket systems.
*   **Aesthetics & Style**: TailwindCSS coupled with Vanilla CSS variables for premium dark-themed command interfaces.
*   **AI Integrations**: OpenAI GPT-4o-mini API for processing, structured JSON extraction, and auto-tagging of invoice files.
*   **Utility & Scanning**: Barcode & QR Code generator with client-side camera scanning support.

---

## 2. Folder & Directory Tree

Below is the directory tree highlighting the key elements of the ERP project layout:

```
next-app/
├── public/                 # Static assets, branding logos, icons
├── src/
│   ├── actions/            # Core Server Actions
│   │   ├── productionActions.ts  # Batch controls, recipe logs, ledger updates
│   │   └── purchaseActions.ts    # Invoice storage, tax calculations, supplier syncs
│   ├── components/         # Shared React Components
│   │   ├── Sidebar.tsx           # Role-based workspace layout links
│   │   ├── LanguageProvider.tsx  # Dual-language translations (EN/HI)
│   │   └── LanguageToggle.tsx    # Localization selector
│   └── app/                # App Router Layouts & Pages
│       ├── api/            # Server endpoints (QR scanner, painter ledgers)
│       ├── login/          # Secure user session router
│       └── dashboard/      # Role-based workspace routes
│           ├── ceo/        # CEO analytics, settings, and suppliers
│           ├── factory/    # Batch tracking and QR registers
│           ├── dealer/     # Retail storefronts and POS billing
│           ├── ca-portal/  # Chartered accountant audit views
│           ├── salesman/   # Partner listings and order forms
│           └── purchase/   # Purchase history scans
```

---

## 3. Database Schema Catalog

### Table: `attendance`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `employee_id` | `text` | `YES` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `status` | `text` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |

### Table: `batch_consumption`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `batch_id` | `text` | `YES` | `NULL` |
| `raw_material_id` | `text` | `YES` | `NULL` |
| `quantity_used` | `numeric` | `YES` | `NULL` |

### Table: `clients`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `phone` | `text` | `YES` | `NULL` |
| `gstin` | `text` | `YES` | `NULL` |
| `address` | `text` | `YES` | `NULL` |
| `state_code` | `text` | `YES` | `NULL` |
| `pincode` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |

### Table: `company_details`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `company_name` | `text` | `NO` | `NULL` |
| `address` | `text` | `YES` | `NULL` |
| `state_code` | `text` | `YES` | `NULL` |
| `gstin` | `text` | `YES` | `NULL` |
| `phone` | `text` | `YES` | `NULL` |
| `bank_details` | `jsonb` | `YES` | `NULL` |
| `signature_url` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |
| `pincode` | `text` | `YES` | `NULL` |
| `owner_name` | `text` | `YES` | `NULL` |
| `bank_name` | `text` | `YES` | `NULL` |
| `account_number` | `text` | `YES` | `NULL` |
| `ifsc_code` | `text` | `YES` | `NULL` |
| `upi_id` | `text` | `YES` | `NULL` |
| `terms_and_conditions` | `text` | `YES` | `NULL` |
| `notes` | `text` | `YES` | `NULL` |
| `company_stamp_url` | `text` | `YES` | `NULL` |

### Table: `competitor_products`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `brand` | `text` | `YES` | `NULL` |
| `category` | `text` | `YES` | `NULL` |
| `subcategory` | `text` | `YES` | `NULL` |
| `product_name` | `text` | `YES` | `NULL` |
| `description` | `text` | `YES` | `NULL` |
| `pack_size` | `text` | `YES` | `NULL` |
| `mrp` | `numeric` | `YES` | `NULL` |
| `finish` | `text` | `YES` | `NULL` |
| `coverage` | `text` | `YES` | `NULL` |
| `drying_time` | `text` | `YES` | `NULL` |
| `recoat_time` | `text` | `YES` | `NULL` |
| `application_area` | `text` | `YES` | `NULL` |
| `recommended_surface` | `jsonb` | `YES` | `NULL` |
| `features` | `jsonb` | `YES` | `NULL` |
| `benefits` | `jsonb` | `YES` | `NULL` |
| `available_colours` | `jsonb` | `YES` | `NULL` |
| `technology` | `text` | `YES` | `NULL` |
| `warranty` | `text` | `YES` | `NULL` |
| `interior_exterior` | `text` | `YES` | `NULL` |
| `washability` | `text` | `YES` | `NULL` |
| `voc` | `text` | `YES` | `NULL` |
| `sheen` | `text` | `YES` | `NULL` |
| `texture` | `text` | `YES` | `NULL` |
| `source` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `customers`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `gstin` | `text` | `YES` | `NULL` |
| `address` | `text` | `YES` | `NULL` |
| `city` | `text` | `YES` | `NULL` |
| `state` | `text` | `YES` | `NULL` |
| `pincode` | `text` | `YES` | `NULL` |
| `phone` | `text` | `YES` | `NULL` |
| `email` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |

### Table: `daily_expenses`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `category_id` | `text` | `YES` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `date` | `date` | `YES` | `CURRENT_DATE` |
| `description` | `text` | `YES` | `NULL` |
| `staff_name` | `text` | `YES` | `NULL` |

### Table: `data_entry_queue`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `uuid_generate_v4()` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `image_url` | `text` | `NO` | `NULL` |
| `status` | `text` | `YES` | `'Pending'::text` |
| `operator_id` | `uuid` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |

### Table: `dealer_expenses`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `uuid_generate_v4()` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `category` | `text` | `NO` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `expense_date` | `date` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |

### Table: `dealer_settings`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `dealer_id` | `uuid` | `NO` | `NULL` |
| `shop_name` | `text` | `NO` | `NULL` |
| `upi_id` | `text` | `YES` | `NULL` |
| `shop_logo_url` | `text` | `YES` | `NULL` |
| `terms_conditions` | `text` | `YES` | `NULL` |
| `onboarding_completed` | `boolean` | `YES` | `false` |

### Table: `dealers`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `gen_random_uuid()` |
| `name` | `text` | `NO` | `NULL` |
| `address` | `text` | `YES` | `NULL` |
| `localities` | `text` | `YES` | `NULL` |
| `designation` | `text` | `NO` | `NULL` |
| `gst_number` | `text` | `YES` | `NULL` |
| `assigned_salesman_id` | `text` | `YES` | `NULL` |
| `pan_card_url` | `text` | `YES` | `NULL` |
| `aadhaar_front_url` | `text` | `YES` | `NULL` |
| `aadhaar_back_url` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |

### Table: `employees`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `designation` | `text` | `NO` | `NULL` |
| `salary` | `numeric` | `NO` | `NULL` |
| `joining_date` | `text` | `NO` | `NULL` |
| `status` | `text` | `YES` | `'Active'::text` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |
| `aadhaar_front` | `text` | `YES` | `NULL` |
| `aadhaar_back` | `text` | `YES` | `NULL` |
| `pan_card` | `text` | `YES` | `NULL` |
| `aadhaar_back_url` | `text` | `YES` | `NULL` |

### Table: `expense_categories`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `description` | `text` | `YES` | `NULL` |
| `budget_limit` | `numeric` | `YES` | `0` |

### Table: `expenses`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `category` | `text` | `NO` | `NULL` |
| `description` | `text` | `YES` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `type` | `text` | `YES` | `'Debit'::text` |
| `payment_mode` | `text` | `YES` | `'Bank'::text` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `expense_frequency` | `text` | `YES` | `'Daily'::text` |

### Table: `factory_assets`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `gen_random_uuid()` |
| `name` | `text` | `NO` | `NULL` |
| `purchase_value` | `numeric` | `NO` | `NULL` |
| `current_value` | `numeric` | `NO` | `NULL` |
| `purchase_date` | `date` | `YES` | `CURRENT_DATE` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `factory_expenses`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `expense_name` | `text` | `NO` | `NULL` |
| `category` | `text` | `YES` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `due_date` | `date` | `YES` | `NULL` |
| `paid_date` | `date` | `YES` | `NULL` |
| `status` | `text` | `YES` | `'PENDING'::text` |
| `payment_mode` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `finance_ledger`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `transaction_date` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |
| `party_id` | `text` | `YES` | `NULL` |
| `reference_type` | `text` | `YES` | `NULL` |
| `reference_id` | `text` | `YES` | `NULL` |
| `description` | `text` | `YES` | `NULL` |
| `payment_mode` | `text` | `YES` | `NULL` |
| `debit_amount` | `numeric` | `YES` | `0` |
| `credit_amount` | `numeric` | `YES` | `0` |
| `balance` | `numeric` | `YES` | `0` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |
| `collected_by` | `text` | `YES` | `NULL` |
| `document_url` | `text` | `YES` | `NULL` |
| `is_gst_billed` | `boolean` | `YES` | `true` |
| `reference_no` | `text` | `YES` | `NULL` |

### Table: `finance_transactions`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `date` | `date` | `NO` | `NULL` |
| `type` | `text` | `NO` | `NULL` |
| `category_id` | `text` | `YES` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `payment_mode` | `text` | `YES` | `NULL` |
| `reference_id` | `text` | `YES` | `NULL` |
| `note` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `invoices`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `invoice_no` | `text` | `NO` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `due_date` | `text` | `YES` | `NULL` |
| `tax_type` | `text` | `YES` | `'exclusive'::text` |
| `supply_type` | `text` | `YES` | `'intra'::text` |
| `template` | `text` | `YES` | `'classic'::text` |
| `payment_mode` | `text` | `YES` | `'Cash'::text` |
| `payment_status` | `text` | `YES` | `'Unpaid'::text` |
| `customer_id` | `text` | `YES` | `NULL` |
| `customer` | `jsonb` | `NO` | `NULL` |
| `items` | `jsonb` | `NO` | `NULL` |
| `subtotal` | `numeric` | `YES` | `0` |
| `total_taxable` | `numeric` | `YES` | `0` |
| `total_gst` | `numeric` | `YES` | `0` |
| `cgst` | `numeric` | `YES` | `0` |
| `sgst` | `numeric` | `YES` | `0` |
| `igst` | `numeric` | `YES` | `0` |
| `freight` | `numeric` | `YES` | `0` |
| `discount` | `numeric` | `YES` | `0` |
| `round_off` | `numeric` | `YES` | `0` |
| `advance` | `numeric` | `YES` | `0` |
| `grand_total` | `numeric` | `YES` | `0` |
| `balance_due` | `numeric` | `YES` | `0` |
| `notes` | `text` | `YES` | `NULL` |
| `seller` | `jsonb` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `painter_id` | `uuid` | `YES` | `NULL` |
| `hidden_commission_amount` | `numeric` | `YES` | `0` |
| `client_id` | `text` | `YES` | `NULL` |
| `client_details` | `jsonb` | `YES` | `NULL` |
| `transport_details` | `jsonb` | `YES` | `NULL` |
| `payment_terms` | `jsonb` | `YES` | `NULL` |
| `is_tax_inclusive` | `boolean` | `YES` | `false` |
| `document_url` | `text` | `YES` | `NULL` |
| `additional_charges` | `jsonb` | `YES` | `'[]'::jsonb` |
| `client_type` | `text` | `YES` | `'Customer'::text` |
| `qr_range` | `text` | `YES` | `NULL` |

### Table: `labor_wages`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `staff_name` | `text` | `YES` | `NULL` |
| `days_worked` | `numeric` | `YES` | `NULL` |
| `rate_per_day` | `numeric` | `YES` | `NULL` |
| `total_payable` | `numeric` | `YES` | `NULL` |

### Table: `ledger_entries`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `client_id` | `text` | `YES` | `NULL` |
| `date` | `date` | `NO` | `NULL` |
| `description` | `text` | `NO` | `NULL` |
| `debit` | `numeric` | `YES` | `0` |
| `credit` | `numeric` | `YES` | `0` |
| `balance` | `numeric` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `payment_mode` | `text` | `YES` | `NULL` |
| `collected_by` | `text` | `YES` | `NULL` |
| `reference_no` | `text` | `YES` | `NULL` |
| `document_url` | `text` | `YES` | `NULL` |
| `is_gst_billed` | `boolean` | `YES` | `true` |

### Table: `market_feedback`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `customer_id` | `text` | `YES` | `NULL` |
| `feedback_type` | `text` | `YES` | `NULL` |
| `competitor_brand` | `text` | `YES` | `NULL` |
| `notes` | `text` | `YES` | `NULL` |
| `sentiment_score` | `integer` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `material_bills`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `bill_no` | `text` | `NO` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `supplier_name` | `text` | `NO` | `NULL` |
| `items` | `jsonb` | `NO` | `NULL` |
| `subtotal` | `numeric` | `YES` | `0` |
| `tax_rate` | `numeric` | `YES` | `18` |
| `tax_amount` | `numeric` | `YES` | `0` |
| `grand_total` | `numeric` | `YES` | `0` |
| `payment_status` | `text` | `YES` | `'Paid'::text` |
| `notes` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |

### Table: `material_logs`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `material_id` | `text` | `YES` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `type` | `text` | `NO` | `NULL` |
| `qty` | `numeric` | `NO` | `NULL` |
| `reference` | `text` | `YES` | `NULL` |
| `reason` | `text` | `YES` | `NULL` |
| `resulting_stock` | `numeric` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |

### Table: `materials`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `category` | `text` | `YES` | `NULL` |
| `description` | `text` | `YES` | `NULL` |
| `sku` | `text` | `YES` | `NULL` |
| `hsn_code` | `text` | `YES` | `NULL` |
| `unit` | `text` | `YES` | `NULL` |
| `purchase_price` | `numeric` | `YES` | `0` |
| `stock` | `numeric` | `YES` | `0` |
| `min_stock` | `numeric` | `YES` | `10` |
| `location` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |
| `status` | `text` | `YES` | `'ACTIVE'::text` |

### Table: `milestone_targets`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `uuid_generate_v4()` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `target_revenue_required` | `numeric` | `NO` | `NULL` |
| `current_revenue_achieved` | `numeric` | `YES` | `0` |
| `reward_amount` | `numeric` | `NO` | `NULL` |
| `is_unlocked` | `boolean` | `YES` | `false` |

### Table: `order_items`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `gen_random_uuid()` |
| `order_id` | `text` | `YES` | `NULL` |
| `product_name` | `text` | `NO` | `NULL` |
| `size` | `text` | `NO` | `NULL` |
| `quantity` | `integer` | `NO` | `NULL` |
| `unit_price` | `numeric` | `NO` | `NULL` |
| `stock_status` | `text` | `NO` | `NULL` |

### Table: `orders`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `date` | `date` | `YES` | `CURRENT_DATE` |
| `dealer_name` | `text` | `NO` | `NULL` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `salesman_name` | `text` | `NO` | `NULL` |
| `total_amount` | `numeric` | `NO` | `NULL` |
| `payment_terms` | `text` | `NO` | `NULL` |
| `status` | `text` | `NO` | `NULL` |
| `transporter_name` | `text` | `YES` | `NULL` |
| `vehicle_no` | `text` | `YES` | `NULL` |
| `lr_bilty_no` | `text` | `YES` | `NULL` |
| `eway_bill_no` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |

### Table: `painter_ledger`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `uuid_generate_v4()` |
| `painter_id` | `uuid` | `YES` | `NULL` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `transaction_type` | `text` | `YES` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `reference_invoice_id` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |

### Table: `painters`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `gen_random_uuid()` |
| `name` | `text` | `NO` | `NULL` |
| `phone` | `text` | `NO` | `NULL` |
| `dealer_id` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `total_tokens` | `integer` | `YES` | `0` |
| `swatch_id` | `text` | `YES` | `NULL` |
| `address` | `text` | `YES` | `NULL` |
| `aadhar_no` | `text` | `YES` | `NULL` |
| `locality` | `text` | `YES` | `NULL` |
| `total_redeemed` | `integer` | `YES` | `0` |

### Table: `parties`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `YES` | `NULL` |
| `type` | `text` | `YES` | `NULL` |
| `gstin` | `text` | `YES` | `NULL` |
| `address` | `text` | `YES` | `NULL` |

### Table: `payments`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `customer_id` | `text` | `YES` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `payment_mode` | `text` | `NO` | `NULL` |
| `reference_no` | `text` | `YES` | `NULL` |
| `notes` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `collected_by` | `text` | `YES` | `NULL` |
| `document_url` | `text` | `YES` | `NULL` |
| `is_gst_billed` | `boolean` | `YES` | `true` |

### Table: `product_recipes`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `product_id` | `text` | `YES` | `NULL` |
| `raw_material_id` | `text` | `YES` | `NULL` |
| `quantity_per_unit` | `numeric` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `production_batches`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `product_id` | `text` | `YES` | `NULL` |
| `quantity_produced` | `numeric` | `YES` | `NULL` |
| `batch_date` | `date` | `YES` | `CURRENT_DATE` |
| `status` | `text` | `YES` | `NULL` |

### Table: `products`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `product_name` | `text` | `YES` | `NULL` |
| `category` | `text` | `YES` | `NULL` |
| `sku_number` | `text` | `YES` | `NULL` |
| `product_description` | `text` | `YES` | `NULL` |
| `hsn_code` | `text` | `YES` | `NULL` |
| `package_type` | `text` | `YES` | `NULL` |
| `package_size` | `numeric` | `YES` | `NULL` |
| `package_size_unit` | `text` | `YES` | `NULL` |
| `mrp` | `numeric` | `YES` | `NULL` |
| `mfg_cost` | `numeric` | `YES` | `NULL` |
| `freight_cost` | `numeric` | `YES` | `NULL` |
| `marketing_overhead` | `numeric` | `YES` | `NULL` |
| `selling_cost` | `numeric` | `YES` | `NULL` |
| `actual_stock` | `numeric` | `YES` | `0` |
| `min_stock_threshold` | `numeric` | `YES` | `NULL` |
| `tags` | `text` | `YES` | `NULL` |
| `image_url` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |
| `tax_rate` | `numeric` | `YES` | `18` |
| `is_master_product` | `boolean` | `YES` | `true` |
| `token_value` | `integer` | `YES` | `10` |

### Table: `profile_change_requests`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `user_id` | `text` | `NO` | `NULL` |
| `user_name` | `text` | `NO` | `NULL` |
| `requested_changes` | `jsonb` | `NO` | `NULL` |
| `status` | `text` | `NO` | `NULL` |
| `reason` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |

### Table: `purchase_items`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `purchase_bill_id` | `text` | `YES` | `NULL` |
| `raw_material_id` | `text` | `YES` | `NULL` |
| `quantity` | `numeric` | `YES` | `NULL` |
| `rate` | `numeric` | `YES` | `NULL` |
| `product_id` | `text` | `YES` | `NULL` |
| `hsn_code` | `text` | `YES` | `NULL` |
| `unit` | `text` | `YES` | `NULL` |
| `gst_tax` | `numeric` | `YES` | `NULL` |
| `cgst_amount` | `numeric` | `YES` | `NULL` |
| `sgst_amount` | `numeric` | `YES` | `NULL` |
| `igst_amount` | `numeric` | `YES` | `NULL` |
| `total_amount` | `numeric` | `YES` | `NULL` |

### Table: `purchase_master`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `invoice_no` | `text` | `YES` | `NULL` |
| `bill_date` | `date` | `YES` | `NULL` |
| `supplier_name` | `text` | `YES` | `NULL` |
| `supplier_gstin` | `text` | `YES` | `NULL` |
| `items` | `jsonb` | `YES` | `NULL` |
| `sub_total` | `numeric` | `YES` | `NULL` |
| `igst_amount` | `numeric` | `YES` | `NULL` |
| `cgst_amount` | `numeric` | `YES` | `NULL` |
| `sgst_amount` | `numeric` | `YES` | `NULL` |
| `total_amount` | `numeric` | `YES` | `NULL` |
| `transport_details` | `jsonb` | `YES` | `NULL` |
| `payment_status` | `text` | `YES` | `'UNPAID'::text` |
| `payment_type` | `text` | `YES` | `'CREDIT'::text` |
| `bill_file_path` | `text` | `YES` | `NULL` |

### Table: `qr_registry`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `gen_random_uuid()` |
| `qr_code` | `text` | `NO` | `NULL` |
| `invoice_id` | `text` | `YES` | `NULL` |
| `dealer_id` | `text` | `YES` | `NULL` |
| `status` | `text` | `YES` | `'AVAILABLE'::text` |
| `scanned_by` | `uuid` | `YES` | `NULL` |
| `scanned_at` | `timestamp with time zone` | `YES` | `NULL` |
| `token_value` | `integer` | `YES` | `10` |
| `is_scanned` | `boolean` | `YES` | `false` |
| `product_id` | `text` | `YES` | `NULL` |

### Table: `quotations`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `quotation_no` | `text` | `YES` | `NULL` |
| `date` | `text` | `YES` | `NULL` |
| `due_date` | `text` | `YES` | `NULL` |
| `tax_type` | `text` | `YES` | `'exclusive'::text` |
| `supply_type` | `text` | `YES` | `'intra'::text` |
| `template` | `text` | `YES` | `'classic'::text` |
| `payment_mode` | `text` | `YES` | `'Cash'::text` |
| `payment_status` | `text` | `YES` | `'Unpaid'::text` |
| `customer_id` | `text` | `YES` | `NULL` |
| `customer` | `jsonb` | `YES` | `NULL` |
| `items` | `jsonb` | `YES` | `NULL` |
| `subtotal` | `numeric` | `YES` | `0` |
| `total_taxable` | `numeric` | `YES` | `0` |
| `total_gst` | `numeric` | `YES` | `0` |
| `cgst` | `numeric` | `YES` | `0` |
| `sgst` | `numeric` | `YES` | `0` |
| `igst` | `numeric` | `YES` | `0` |
| `freight` | `numeric` | `YES` | `0` |
| `discount` | `numeric` | `YES` | `0` |
| `round_off` | `numeric` | `YES` | `0` |
| `advance` | `numeric` | `YES` | `0` |
| `grand_total` | `numeric` | `YES` | `0` |
| `balance_due` | `numeric` | `YES` | `0` |
| `notes` | `text` | `YES` | `NULL` |
| `seller` | `jsonb` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |
| `dealer_id` | `uuid` | `YES` | `NULL` |
| `painter_id` | `uuid` | `YES` | `NULL` |
| `hidden_commission_amount` | `numeric` | `YES` | `0` |
| `client_id` | `text` | `YES` | `NULL` |
| `client_details` | `jsonb` | `YES` | `NULL` |
| `is_tax_inclusive` | `boolean` | `YES` | `false` |
| `document_url` | `text` | `YES` | `NULL` |
| `additional_charges` | `jsonb` | `YES` | `'[]'::jsonb` |

### Table: `raw_materials`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `material_name` | `text` | `NO` | `NULL` |
| `category` | `text` | `YES` | `NULL` |
| `hsn_code` | `text` | `YES` | `NULL` |
| `unit_of_measure` | `text` | `NO` | `NULL` |
| `current_stock` | `numeric` | `YES` | `0` |
| `avg_purchase_price` | `numeric` | `YES` | `0` |
| `min_stock` | `numeric` | `YES` | `100` |
| `tags` | `text` | `YES` | `NULL` |

### Table: `salary_advances`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `employee_id` | `text` | `YES` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `amount` | `numeric` | `NO` | `NULL` |
| `payment_mode` | `text` | `YES` | `'Bank'::text` |
| `status` | `text` | `YES` | `'Paid'::text` |
| `notes` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |

### Table: `salary_payments`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `employee_id` | `text` | `YES` | `NULL` |
| `month` | `text` | `NO` | `NULL` |
| `base_salary` | `numeric` | `NO` | `NULL` |
| `days_present` | `numeric` | `NO` | `NULL` |
| `gross_salary` | `numeric` | `NO` | `NULL` |
| `advances_deducted` | `numeric` | `NO` | `NULL` |
| `net_paid` | `numeric` | `NO` | `NULL` |
| `payment_mode` | `text` | `YES` | `'Bank'::text` |
| `payment_date` | `text` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |

### Table: `salesmen`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `phone` | `text` | `YES` | `NULL` |
| `region` | `text` | `YES` | `NULL` |

### Table: `settings`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `integer` | `NO` | `1` |
| `data` | `jsonb` | `NO` | `NULL` |
| `updated_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |

### Table: `stock_ledger`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `date` | `date` | `YES` | `CURRENT_DATE` |
| `item_id` | `text` | `NO` | `NULL` |
| `item_type` | `text` | `NO` | `NULL` |
| `type` | `text` | `NO` | `NULL` |
| `qty` | `numeric` | `NO` | `NULL` |
| `rate` | `numeric` | `YES` | `NULL` |
| `gst_tax` | `numeric` | `YES` | `NULL` |
| `total` | `numeric` | `YES` | `NULL` |
| `reference` | `text` | `YES` | `NULL` |
| `supplier_or_buyer` | `text` | `YES` | `NULL` |
| `resulting_stock` | `numeric` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `stock_logs`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `product_id` | `text` | `YES` | `NULL` |
| `date` | `text` | `NO` | `NULL` |
| `type` | `text` | `NO` | `NULL` |
| `qty` | `numeric` | `NO` | `NULL` |
| `reference` | `text` | `YES` | `NULL` |
| `reason` | `text` | `YES` | `NULL` |
| `notes` | `text` | `YES` | `NULL` |
| `resulting_stock` | `numeric` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |

### Table: `suppliers`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `address` | `text` | `YES` | `NULL` |
| `gstin` | `text` | `YES` | `NULL` |
| `phone` | `text` | `YES` | `NULL` |
| `email` | `text` | `YES` | `NULL` |
| `categories` | `ARRAY` | `YES` | `'{}'::text[]` |
| `bank_name` | `text` | `YES` | `NULL` |
| `bank_account_no` | `text` | `YES` | `NULL` |
| `bank_ifsc` | `text` | `YES` | `NULL` |
| `bank_branch` | `text` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `now()` |
| `updated_at` | `timestamp with time zone` | `YES` | `now()` |

### Table: `users`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `NO` | `NULL` |
| `phone` | `text` | `NO` | `NULL` |
| `password_hash` | `text` | `NO` | `NULL` |
| `name` | `text` | `NO` | `NULL` |
| `role` | `text` | `NO` | `NULL` |
| `is_active` | `boolean` | `YES` | `true` |
| `last_login` | `timestamp with time zone` | `YES` | `NULL` |
| `created_at` | `timestamp with time zone` | `NO` | `timezone('utc'::text, now())` |
| `updated_at` | `timestamp with time zone` | `YES` | `NULL` |
| `is_approved` | `boolean` | `YES` | `false` |
| `address` | `text` | `YES` | `NULL` |
| `territory` | `text` | `YES` | `NULL` |
| `status` | `text` | `YES` | `'PENDING'::text` |
| `emergency_contact` | `text` | `YES` | `NULL` |
| `bank_name` | `text` | `YES` | `NULL` |
| `account_name` | `text` | `YES` | `NULL` |
| `account_no` | `text` | `YES` | `NULL` |
| `ifsc_code` | `text` | `YES` | `NULL` |
| `aadhaar_no` | `text` | `YES` | `NULL` |
| `pan_no` | `text` | `YES` | `NULL` |
| `aadhaar_front_url` | `text` | `YES` | `NULL` |
| `aadhaar_back_url` | `text` | `YES` | `NULL` |
| `pan_front_url` | `text` | `YES` | `NULL` |

### Table: `withdrawal_history`

| Column | Data Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `NO` | `gen_random_uuid()` |
| `painter_id` | `uuid` | `YES` | `NULL` |
| `amount` | `integer` | `NO` | `NULL` |
| `created_at` | `timestamp with time zone` | `YES` | `CURRENT_TIMESTAMP` |



### Database Relationships (Foreign Keys)

| Table | Column | References Table | References Column |
| :--- | :--- | :--- | :--- |
| `purchase_items` | `purchase_bill_id` | `purchase_master` | `id` |
| `purchase_items` | `raw_material_id` | `raw_materials` | `id` |
| `quotations` | `client_id` | `clients` | `id` |
| `payments` | `customer_id` | `customers` | `id` |
| `attendance` | `employee_id` | `employees` | `id` |
| `salary_advances` | `employee_id` | `employees` | `id` |
| `salary_payments` | `employee_id` | `employees` | `id` |
| `product_recipes` | `product_id` | `products` | `id` |
| `invoices` | `client_id` | `clients` | `id` |
| `ledger_entries` | `client_id` | `clients` | `id` |
| `finance_transactions` | `category_id` | `expense_categories` | `id` |
| `batch_consumption` | `batch_id` | `production_batches` | `id` |
| `market_feedback` | `customer_id` | `customers` | `id` |
| `product_recipes` | `raw_material_id` | `raw_materials` | `id` |
| `material_logs` | `material_id` | `raw_materials` | `id` |
| `qr_registry` | `invoice_id` | `invoices` | `id` |
| `qr_registry` | `scanned_by` | `painters` | `id` |
| `withdrawal_history` | `painter_id` | `painters` | `id` |
| `qr_registry` | `product_id` | `products` | `id` |
| `orders` | `dealer_id` | `dealers` | `id` |
| `order_items` | `order_id` | `orders` | `id` |
| `profile_change_requests` | `user_id` | `users` | `id` |



---

## 4. Role-Based Access Control (RBAC) & User Modes

Sharma Industries ERP runs on a role-restricted session engine based on cookie verification. Users are dynamically assigned specific modes:

### CEO Mode
*   **Dashboard Features**: High-level command center displaying total sales, painter milestones, market feedbacks, active factory batch monitors, and product margins.
*   **Access Level**: Full admin read/write controls across all modules (quotations, settings, invoices, products, and employee rosters).
*   **Suppliers Registry**: Dedicated panel to check company suppliers, categories supplied, historic invoices, and banking profiles.

### Dealer Mode
*   **POS Billing**: Fast storefront invoicing interface for painter orders.
*   **Specific Workflows**: Logs storefront retail expenses, tracks personal Profit & Loss statements, and displays earned rewards/targets.

### CA (Chartered Accountant) Mode
*   **Financial Access**: Safe read-only reporting access restricted to invoice records.
*   **Reporting Features**: Direct ledger sheets and sales breakdown summaries optimized for direct auditing.

### Factory Manager Mode
*   **Batch Controls**: Start and complete production batches, logging exact consumption ratios.
*   **QR Engines**: Batch QR code generators and scanner decoders for product tracing.
*   **Inventory Panel**: Material directories listing remaining raw stocks and low-stock alerts.

### Salesman Mode
*   **Workflows**: Direct customer onboarding forms, partner listings, and salesman order booking logs.

---

## 5. Pages & Routing Registry

Below is a catalog of the main routes inside the Sharma Industries Next.js application:

| Route Link | Target Role | Page Purpose & Description |
| :--- | :--- | :--- |
| `/login` | Public | Secure user validation and cookie creation. |
| `/dashboard/ceo` | CEO | Command center statistics panel. |
| `/dashboard/ceo/products` | CEO | Add/modify finished goods, packaging types, and stock thresholds. |
| `/dashboard/ceo/suppliers` | CEO | Browse, add, and query suppliers, rates history, and bank credentials. |
| `/dashboard/ceo/invoices` | CEO | Generates and reviews retail client invoice records. |
| `/dashboard/ceo/quotations` | CEO | Formulates pricing estimations for dealer bids. |
| `/dashboard/ceo/market-intelligence` | CEO | Displays painter market reviews and feedback. |
| `/dashboard/ceo/dealers` | CEO | Admin list of registered dealer settings. |
| `/dashboard/factory` | Factory Manager / CEO | Live batch controls and KPI indicators. |
| `/dashboard/factory/inventory` | Factory Manager / CEO | Dynamic raw material registry and low stock warnings. |
| `/dashboard/factory/expenses` | Factory Manager / CEO | Factory specific overhead entry logs. |
| `/dashboard/purchase` | CEO / Factory Manager | Purchase bill ledger history with View attachment download links. |
| `/dashboard/purchase/new` | CEO / Factory Manager | OCR Invoice file upload scanner and automated ledger ledger. |
| `/dashboard/dealer` | Dealer | POS shop panel and store settings. |
| `/dashboard/dealer/pnl` | Dealer | Multi-dimensional store margin tracking charts. |
| `/dashboard/ca-portal` | CA | Audit records dashboard view. |
| `/dashboard/salesman` | Salesman | Mobile order booking and lead lists. |

---

## 6. Core API & Authorization Logic

*   **Cookie Authentication**: Secure user roles are validated on page loads by checking the `si_session` cookie payload inside `src/app/dashboard/layout.tsx` and `src/components/Sidebar.tsx`. Unauthorized users are redirected to `/login`.
*   **Storage Access Control**: Original purchase invoices are archived inside the public `purchase_bills` bucket in Supabase Storage with dynamic URL resolving.
*   **Transactions Engine**: The database processes raw material additions (purchases) and withdrawals (production batch consumption) in a double-entry transaction history (`stock_ledger`).

---

## 7. Current State & Functioning Systems

### Working Components
*   **Invoice OCR & Auto-Fill**: Fast parsing and pre-filling of GST totals, dates, item arrays, and banking routing details.
*   **Double-Entry Stock Registry**: Automatic increments on purchase and decrements on batch formulation completions.
*   **Suppliers Manager**: Syncs invoice data with profile states automatically.
*   **Factory Controls**: Dynamic live batch logs, inventory lists, and QR triggers.

### Excluded Mock Components
*   All previous hardcoded test data has been truncated. The database tables are a clean sheet, fully ready to support production data entry.
