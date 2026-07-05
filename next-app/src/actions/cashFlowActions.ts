"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function createCustomTransaction(payload: {
  date: string;
  type: "INFLOW" | "OUTFLOW";
  category: string;
  amount: number;
  payment_mode: string;
  note: string;
}) {
  try {
    const id = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { error } = await supabaseAdmin
      .from("finance_transactions")
      .insert({
        id,
        date: payload.date,
        type: payload.type,
        category_id: payload.category, // Stored in category_id column
        amount: payload.amount,
        payment_mode: payload.payment_mode,
        note: payload.note
      });

    if (error) throw error;
    
    revalidatePath("/dashboard/ceo/cash-flow");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating custom transaction:", err);
    return { success: false, error: err.message };
  }
}

export async function getCashFlowData(startDate: string, endDate: string) {
  try {
    // 1. Fetch Custom Transactions
    const { data: customTx, error: customErr } = await supabaseAdmin
      .from("finance_transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate);
    if (customErr) throw customErr;

    // 2. Fetch Sales Inflows (Paid Invoices)
    const { data: invoices, error: invoicesErr } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_no, date, grand_total, payment_mode, customer")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("payment_status", "PAID");
    if (invoicesErr) throw invoicesErr;

    // 3. Fetch Raw Material Purchase Outflows
    const { data: purchases, error: purchasesErr } = await supabaseAdmin
      .from("purchase_master")
      .select("id, invoice_no, bill_date, grand_total, total_amount, payment_mode, supplier_name")
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);
    if (purchasesErr) throw purchasesErr;

    // 4. Fetch Factory Operational Overheads (Paid Expenses)
    const { data: factoryExpenses, error: factoryExpensesErr } = await supabaseAdmin
      .from("factory_expenses")
      .select("id, expense_name, category, amount, paid_date, payment_mode")
      .gte("paid_date", startDate)
      .lte("paid_date", endDate)
      .eq("status", "PAID");
    if (factoryExpensesErr) throw factoryExpensesErr;

    // 5. Fetch Salary Outlays (Paid Salaries)
    const { data: salaries, error: salariesErr } = await supabaseAdmin
      .from("salary_payments")
      .select("id, employee_id, net_paid, payment_date, payment_mode")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);
    if (salariesErr) throw salariesErr;

    // Compile into a flat unified ledger list
    const ledgerList: any[] = [];

    // Map custom transactions
    (customTx || []).forEach(tx => {
      ledgerList.push({
        id: tx.id,
        date: tx.date,
        type: tx.type, // 'INFLOW' or 'OUTFLOW'
        category: tx.category_id || "Miscellaneous",
        amount: Number(tx.amount) || 0,
        payment_mode: tx.payment_mode || "Cash",
        reference: tx.reference_id || "Manual",
        description: tx.note || "Logged manually"
      });
    });

    // Map sales invoices
    (invoices || []).forEach(inv => {
      const clientName = inv.customer?.name || "Dealer / Retail Client";
      ledgerList.push({
        id: inv.id,
        date: inv.date,
        type: "INFLOW",
        category: "Product Sales",
        amount: Number(inv.grand_total) || 0,
        payment_mode: inv.payment_mode || "Bank Transfer",
        reference: inv.invoice_no,
        description: `Sales revenue from ${clientName}`
      });
    });

    // Map purchases
    (purchases || []).forEach(pur => {
      const amount = Number(pur.grand_total || pur.total_amount || 0);
      ledgerList.push({
        id: pur.id,
        date: pur.bill_date,
        type: "OUTFLOW",
        category: "Material Procurement",
        amount: amount,
        payment_mode: pur.payment_mode || "Credit",
        reference: pur.invoice_no,
        description: `Material purchase from ${pur.supplier_name}`
      });
    });

    // Map factory expenses
    (factoryExpenses || []).forEach(exp => {
      ledgerList.push({
        id: exp.id,
        date: exp.paid_date,
        type: "OUTFLOW",
        category: exp.category || "Factory Overheads",
        amount: Number(exp.amount) || 0,
        payment_mode: exp.payment_mode || "Cash",
        reference: "Overhead Bill",
        description: exp.expense_name
      });
    });

    // Map salary payments
    (salaries || []).forEach(sal => {
      ledgerList.push({
        id: sal.id,
        date: sal.payment_date,
        type: "OUTFLOW",
        category: "Salaries & Payroll",
        amount: Number(sal.net_paid) || 0,
        payment_mode: sal.payment_mode || "Bank Transfer",
        reference: "Payroll",
        description: `Salary disbursed for Employee ${sal.employee_id}`
      });
    });

    // Sort chronologically (descending)
    ledgerList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Opening Balance (historical values before startDate)
    const openingBalance = await calculateOpeningBalance(startDate);

    return {
      success: true,
      data: {
        ledgerList,
        openingBalance
      }
    };
  } catch (err: any) {
    console.error("Error compiling cash flow logs:", err);
    return { success: false, error: err.message };
  }
}

async function calculateOpeningBalance(startDate: string): Promise<number> {
  try {
    let totalInflow = 0;
    let totalOutflow = 0;

    // 1. Historical Custom Inflow/Outflows
    const { data: histCustom } = await supabaseAdmin
      .from("finance_transactions")
      .select("type, amount")
      .lt("date", startDate);
    
    (histCustom || []).forEach(c => {
      if (c.type === "INFLOW") totalInflow += Number(c.amount) || 0;
      else totalOutflow += Number(c.amount) || 0;
    });

    // 2. Historical Invoices
    const { data: histInvs } = await supabaseAdmin
      .from("invoices")
      .select("grand_total")
      .lt("date", startDate)
      .eq("payment_status", "PAID");
    
    (histInvs || []).forEach(i => {
      totalInflow += Number(i.grand_total) || 0;
    });

    // 3. Historical Purchases
    const { data: histPurchases } = await supabaseAdmin
      .from("purchase_master")
      .select("grand_total, total_amount")
      .lt("bill_date", startDate);
    
    (histPurchases || []).forEach(p => {
      totalOutflow += Number(p.grand_total || p.total_amount) || 0;
    });

    // 4. Historical Factory Expenses
    const { data: histFactory } = await supabaseAdmin
      .from("factory_expenses")
      .select("amount")
      .lt("paid_date", startDate)
      .eq("status", "PAID");
    
    (histFactory || []).forEach(f => {
      totalOutflow += Number(f.amount) || 0;
    });

    // 5. Historical Salaries
    const { data: histSalaries } = await supabaseAdmin
      .from("salary_payments")
      .select("net_paid")
      .lt("payment_date", startDate);
    
    (histSalaries || []).forEach(s => {
      totalOutflow += Number(s.net_paid) || 0;
    });

    return totalInflow - totalOutflow;
  } catch (e) {
    console.error("Error calculating opening balance:", e);
    return 0;
  }
}
