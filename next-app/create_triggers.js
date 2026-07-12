const postgres = require("postgres");

const connectionString = "postgresql://postgres:Ashutosh9784@db.mwqjdhwlfuwhyslqtpwd.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function run() {
  console.log("Setting up automated database triggers for double-entry bookkeeping synchronization...");
  try {
    // 1. Invoice Trigger
    await sql`
      CREATE OR REPLACE FUNCTION sync_invoice_to_ca_ledger()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Insert Receipt
        INSERT INTO ca_receipts (id, receipt_number, customer, invoice_ref, amount, payment_mode, status, created_at)
        VALUES (
          'REC_' || NEW.id,
          'REC-INV-' || COALESCE(NEW.invoice_no, NEW.id::text),
          NEW.customer,
          NEW.invoice_no,
          NEW.grand_total,
          'SBI',
          'Active',
          NEW.created_at
        ) ON CONFLICT DO NOTHING;

        -- Update Sales Revenue Ledger (LEDG_004) - credit (increase sales)
        UPDATE ca_ledgers 
        SET current_balance = current_balance + NEW.grand_total,
            closing_balance = closing_balance + NEW.grand_total,
            updated_at = now()
        WHERE id = 'LEDG_004';

        -- Update SBI Bank Account Ledger (LEDG_002) - debit (increase bank balance)
        UPDATE ca_ledgers 
        SET current_balance = current_balance + NEW.grand_total,
            closing_balance = closing_balance + NEW.grand_total,
            updated_at = now()
        WHERE id = 'LEDG_002';

        -- Log Activity
        INSERT INTO ca_activity_logs (user_name, role, module, action, prev_value, new_value, created_at)
        VALUES (
          'System Auto Sync',
          'trigger',
          'Invoices',
          'Sync Sales Invoice to Ledger',
          '',
          'Invoice #' || COALESCE(NEW.invoice_no, NEW.id::text) || ' total ' || NEW.grand_total::text,
          now()
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await sql`
      DROP TRIGGER IF EXISTS invoice_to_ca_trigger ON invoices;
    `;
    await sql`
      CREATE TRIGGER invoice_to_ca_trigger
      AFTER INSERT ON invoices
      FOR EACH ROW EXECUTE FUNCTION sync_invoice_to_ca_ledger();
    `;
    console.log("✅ Invoice trigger created.");

    // 2. Purchase Trigger
    await sql`
      CREATE OR REPLACE FUNCTION sync_purchase_to_ca_ledger()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Insert Payment
        INSERT INTO ca_payments (id, payment_number, supplier, amount, payment_mode, purchase_bill_ref, status, created_at)
        VALUES (
          'PAY_' || NEW.id,
          'PAY-BILL-' || COALESCE(NEW.invoice_no, NEW.id::text),
          NEW.supplier_name,
          NEW.total_amount,
          'SBI',
          NEW.invoice_no,
          'Active',
          NEW.bill_date
        ) ON CONFLICT DO NOTHING;

        -- Update Purchase Account Ledger (LEDG_005) - debit (increase expense)
        UPDATE ca_ledgers 
        SET current_balance = current_balance + NEW.total_amount,
            closing_balance = closing_balance + NEW.total_amount,
            updated_at = now()
        WHERE id = 'LEDG_005';

        -- Update SBI Bank Account Ledger (LEDG_002) - credit (decrease bank balance)
        UPDATE ca_ledgers 
        SET current_balance = current_balance - NEW.total_amount,
            closing_balance = closing_balance - NEW.total_amount,
            updated_at = now()
        WHERE id = 'LEDG_002';

        -- Log Activity
        INSERT INTO ca_activity_logs (user_name, role, module, action, prev_value, new_value, created_at)
        VALUES (
          'System Auto Sync',
          'trigger',
          'Purchases',
          'Sync Purchase Bill to Ledger',
          '',
          'Bill #' || COALESCE(NEW.invoice_no, NEW.id::text) || ' total ' || NEW.total_amount::text,
          now()
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await sql`
      DROP TRIGGER IF EXISTS purchase_to_ca_trigger ON purchase_master;
    `;
    await sql`
      CREATE TRIGGER purchase_to_ca_trigger
      AFTER INSERT ON purchase_master
      FOR EACH ROW EXECUTE FUNCTION sync_purchase_to_ca_ledger();
    `;
    console.log("✅ Purchase trigger created.");

    // 3. Expense Trigger
    await sql`
      CREATE OR REPLACE FUNCTION sync_expense_to_ca_ledger()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Insert Payment
        INSERT INTO ca_payments (id, payment_number, supplier, expense_category, amount, payment_mode, status, created_at)
        VALUES (
          'PAY_EXP_' || NEW.id,
          'PAY-EXP-' || NEW.id::text,
          'Factory Vendor',
          NEW.category,
          NEW.amount,
          'Cash',
          'Active',
          NEW.created_at
        ) ON CONFLICT DO NOTHING;

        -- Update Electricity Expense Ledger (LEDG_007) - debit (increase expense)
        UPDATE ca_ledgers 
        SET current_balance = current_balance + NEW.amount,
            closing_balance = closing_balance + NEW.amount,
            updated_at = now()
        WHERE id = 'LEDG_007';

        -- Update Cash Account Ledger (LEDG_001) - credit (decrease cash balance)
        UPDATE ca_ledgers 
        SET current_balance = current_balance - NEW.amount,
            closing_balance = closing_balance - NEW.amount,
            updated_at = now()
        WHERE id = 'LEDG_001';

        -- Log Activity
        INSERT INTO ca_activity_logs (user_name, role, module, action, prev_value, new_value, created_at)
        VALUES (
          'System Auto Sync',
          'trigger',
          'Expenses',
          'Sync Factory Expense to Ledger',
          '',
          'Expense Category: ' || NEW.category || ' amount ' || NEW.amount::text,
          now()
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await sql`
      DROP TRIGGER IF EXISTS expense_to_ca_trigger ON factory_expenses;
    `;
    await sql`
      CREATE TRIGGER expense_to_ca_trigger
      AFTER INSERT ON factory_expenses
      FOR EACH ROW EXECUTE FUNCTION sync_expense_to_ca_ledger();
    `;
    console.log("✅ Expense trigger created.");

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
