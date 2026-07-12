const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Starting migration for Accounting Workspace tables...");

  try {
    // 1. Create ca_ledgers table
    await sql`
      CREATE TABLE IF NOT EXISTS ca_ledgers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        group_name TEXT NOT NULL,
        opening_balance NUMERIC DEFAULT 0,
        closing_balance NUMERIC DEFAULT 0,
        current_balance NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_ledgers' created/verified.");

    // 2. Create ca_journal_entries table
    await sql`
      CREATE TABLE IF NOT EXISTS ca_journal_entries (
        id TEXT PRIMARY KEY,
        voucher_number TEXT NOT NULL UNIQUE,
        date TIMESTAMPTZ DEFAULT now(),
        debit_ledger_id TEXT REFERENCES ca_ledgers(id),
        credit_ledger_id TEXT REFERENCES ca_ledgers(id),
        amount NUMERIC NOT NULL,
        narration TEXT,
        created_by TEXT,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_journal_entries' created/verified.");

    // 3. Create ca_receipts table
    await sql`
      CREATE TABLE IF NOT EXISTS ca_receipts (
        id TEXT PRIMARY KEY,
        receipt_number TEXT NOT NULL UNIQUE,
        customer TEXT,
        invoice_ref TEXT,
        amount NUMERIC NOT NULL,
        payment_mode TEXT,
        reference_number TEXT,
        remarks TEXT,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_receipts' created/verified.");

    // 4. Create ca_payments table
    await sql`
      CREATE TABLE IF NOT EXISTS ca_payments (
        id TEXT PRIMARY KEY,
        payment_number TEXT NOT NULL UNIQUE,
        supplier TEXT,
        expense_category TEXT,
        purchase_bill_ref TEXT,
        amount NUMERIC NOT NULL,
        payment_mode TEXT,
        transaction_id TEXT,
        remarks TEXT,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_payments' created/verified.");

    // 5. Create ca_contra table
    await sql`
      CREATE TABLE IF NOT EXISTS ca_contra (
        id TEXT PRIMARY KEY,
        date TIMESTAMPTZ DEFAULT now(),
        contra_type TEXT NOT NULL,
        from_account TEXT NOT NULL,
        to_account TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        narration TEXT,
        reference TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_contra' created/verified.");

    // 6. Create ca_bank_accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS ca_bank_accounts (
        id TEXT PRIMARY KEY,
        account_name TEXT NOT NULL,
        account_number TEXT NOT NULL UNIQUE,
        bank_name TEXT NOT NULL,
        ifsc_code TEXT NOT NULL,
        opening_balance NUMERIC DEFAULT 0,
        current_balance NUMERIC DEFAULT 0,
        reconciliation_status TEXT DEFAULT 'Pending',
        statement_status TEXT DEFAULT 'Not Uploaded',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Table 'ca_bank_accounts' created/verified.");

    // Seed default ledgers if empty
    const ledgersCount = await sql`SELECT count(*) FROM ca_ledgers`;
    if (parseInt(ledgersCount[0].count) === 0) {
      console.log("Seeding default ledger accounts...");
      const defaultLedgers = [
        { id: "LEDG_001", name: "Cash Account", code: "CASH001", group_name: "Cash-in-hand", opening: 50000 },
        { id: "LEDG_002", name: "State Bank of India", code: "BANK001", group_name: "Bank Accounts", opening: 450000 },
        { id: "LEDG_003", name: "HDFC Bank", code: "BANK002", group_name: "Bank Accounts", opening: 250000 },
        { id: "LEDG_004", name: "Sales Revenue", code: "REV001", group_name: "Sales Accounts", opening: 0 },
        { id: "LEDG_005", name: "Purchase Account", code: "EXP001", group_name: "Purchase Accounts", opening: 0 },
        { id: "LEDG_006", name: "Factory Rent Expense", code: "EXP002", group_name: "Indirect Expenses", opening: 0 },
        { id: "LEDG_007", name: "Electricity Expense", code: "EXP003", group_name: "Indirect Expenses", opening: 0 },
        { id: "LEDG_008", name: "GST Input Tax Credit", code: "TAX001", group_name: "Duties & Taxes", opening: 0 },
        { id: "LEDG_009", name: "GST Output Tax Liability", code: "TAX002", group_name: "Duties & Taxes", opening: 0 },
        { id: "LEDG_010", name: "Capital Account", code: "CAP001", group_name: "Capital Account", opening: 750000 },
      ];

      for (const ledg of defaultLedgers) {
        await sql`
          INSERT INTO ca_ledgers (id, name, code, group_name, opening_balance, closing_balance, current_balance)
          VALUES (${ledg.id}, ${ledg.name}, ${ledg.code}, ${ledg.group_name}, ${ledg.opening}, ${ledg.opening}, ${ledg.opening})
        `;
      }
      console.log("✅ Seeding ca_ledgers completed.");
    }

    // Seed default bank accounts if empty
    const bankCount = await sql`SELECT count(*) FROM ca_bank_accounts`;
    if (parseInt(bankCount[0].count) === 0) {
      console.log("Seeding default bank accounts...");
      await sql`
        INSERT INTO ca_bank_accounts (id, account_name, account_number, bank_name, ifsc_code, opening_balance, current_balance, reconciliation_status, statement_status)
        VALUES 
          ('BANK_ACT_001', 'State Bank of India', '33012948194', 'State Bank of India', 'SBIN0001234', 450000, 450000, 'Reconciled', 'Uploaded'),
          ('BANK_ACT_002', 'HDFC Bank', '50100293819', 'HDFC Bank', 'HDFC0000123', 250000, 250000, 'Pending', 'Not Uploaded')
      `;
      console.log("✅ Seeding bank accounts completed.");
    }

    // Now, let's look at existing invoices/purchase_master/factory_expenses to create linked ledger entries & receipts/payments
    console.log("Linking existing sales invoices to receipts...");
    const invoices = await sql`SELECT id, customer, grand_total, payment_mode, created_at, invoice_no FROM invoices`;
    for (const inv of invoices) {
      const receiptNo = `REC-${inv.invoice_no || inv.id.slice(0, 8)}`;
      await sql`
        INSERT INTO ca_receipts (id, receipt_number, customer, invoice_ref, amount, payment_mode, status, created_at)
        VALUES (${inv.id}, ${receiptNo}, ${inv.customer}, ${inv.id}, ${inv.grand_total}, ${inv.payment_mode || 'Bank'}, 'Paid', ${inv.created_at})
        ON CONFLICT (receipt_number) DO NOTHING
      `;
    }

    console.log("Linking existing purchase bills to payments...");
    const purchases = await sql`SELECT id, supplier_name, total_amount, payment_type, bill_date, invoice_no FROM purchase_master`;
    for (const pur of purchases) {
      const paymentNo = `PAY-${pur.invoice_no || pur.id.slice(0, 8)}`;
      await sql`
        INSERT INTO ca_payments (id, payment_number, supplier, expense_category, purchase_bill_ref, amount, payment_mode, status, created_at)
        VALUES (${pur.id}, ${paymentNo}, ${pur.supplier_name}, 'Purchases', ${pur.id}, ${pur.total_amount}, ${pur.payment_type || 'Bank'}, 'Paid', ${pur.bill_date})
        ON CONFLICT (payment_number) DO NOTHING
      `;
    }

    console.log("Linking existing factory expenses to payments...");
    const expenses = await sql`SELECT id, expense_name, category, amount, payment_mode, created_at FROM factory_expenses`;
    for (const exp of expenses) {
      const paymentNo = `PAY-EXP-${exp.id.slice(0, 8)}`;
      await sql`
        INSERT INTO ca_payments (id, payment_number, supplier, expense_category, amount, payment_mode, status, created_at)
        VALUES (${exp.id}, ${paymentNo}, 'Factory Vendor', ${exp.category}, ${exp.amount}, ${exp.payment_mode || 'Bank'}, 'Paid', ${exp.created_at})
        ON CONFLICT (payment_number) DO NOTHING
      `;
    }

    console.log("Syncing ledger balances based on receipts, payments, and journal entries...");
    // Update SBI current_balance
    const totalReceiptsSBI = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM ca_receipts WHERE payment_mode = 'Bank' OR payment_mode = 'UPI'`;
    const totalPaymentsSBI = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM ca_payments WHERE payment_mode = 'Bank' OR payment_mode = 'UPI'`;
    const sbiBalance = 450000 + parseFloat(totalReceiptsSBI[0].total) - parseFloat(totalPaymentsSBI[0].total);

    await sql`UPDATE ca_ledgers SET current_balance = ${sbiBalance}, closing_balance = ${sbiBalance} WHERE id = 'LEDG_002'`;
    await sql`UPDATE ca_bank_accounts SET current_balance = ${sbiBalance} WHERE id = 'BANK_ACT_001'`;

    // Update Cash current_balance
    const totalReceiptsCash = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM ca_receipts WHERE payment_mode = 'Cash'`;
    const totalPaymentsCash = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM ca_payments WHERE payment_mode = 'Cash'`;
    const cashBalance = 50000 + parseFloat(totalReceiptsCash[0].total) - parseFloat(totalPaymentsCash[0].total);

    await sql`UPDATE ca_ledgers SET current_balance = ${cashBalance}, closing_balance = ${cashBalance} WHERE id = 'LEDG_001'`;

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await sql.end();
  }
}

run();
