"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getFinanceDashboardData() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoISO = sixMonthsAgo.toISOString();

    // 1. Fetch Revenue (From ledger_entries or invoices)
    // We'll use ledger_entries with credit > 0 as incoming payments for cash flow revenue,
    // and invoices for billed amounts.
    const { data: payments, error: payError } = await supabaseAdmin
      .from('ledger_entries')
      .select('date, credit')
      .gte('date', sixMonthsAgoISO);
    
    const { data: invoices, error: invError } = await supabaseAdmin
      .from('invoices')
      .select('date, grand_total, created_at');

    // 2. Fetch Purchases (From purchase_master)
    const { data: purchases, error: purError } = await supabaseAdmin
      .from('purchase_master')
      .select('date, grand_total')
      .gte('date', sixMonthsAgoISO);

    let expenses: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('expenses')
        .select('date, amount, category')
        .gte('date', sixMonthsAgoISO);
      if (data) expenses = data;
    } catch {
      // Safe fallback
    }

    // If any critical error
    if (invError) throw invError;
    if (purError) throw purError;

    // --- CALCULATE KPIs ---
    
    // Total Revenue (Sum of all incoming payments)
    const totalRevenue = (payments || []).reduce((sum: number, p: any) => sum + (Number(p.credit) || 0), 0);
    
    // Total Expenses = Purchases + Operational Expenses
    const totalPurchases = (purchases || []).reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);
    const totalOperational = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    const totalExpenses = totalPurchases + totalOperational;
    
    // Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // Receivables = Total Billed (Invoices) - Total Paid (Payments)
    // For absolute receivables, we look at all time, not just 6 months
    const totalBilled = (invoices || []).reduce((sum: number, i: any) => sum + (Number(i.grand_total) || 0), 0);
    
    // Fetch all-time payments for accurate receivables
    const { data: allPayments } = await supabaseAdmin
      .from('ledger_entries')
      .select('credit');
    const totalPaidAllTime = (allPayments || []).reduce((sum: number, p: any) => sum + (Number(p.credit) || 0), 0);
    const receivables = totalBilled - totalPaidAllTime;

    // Average Burn Rate (Monthly expense over 6 months)
    const avgBurnRate = totalExpenses / 6;


    // --- CALCULATE CHARTS ---

    // Initialize last 6 months buckets
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartMap = new Map();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = monthNames[d.getMonth()];
      chartMap.set(monthStr, { month: monthStr, revenue: 0, expenses: 0, year: d.getFullYear(), mIdx: d.getMonth() });
    }

    // Populate Chart Data
    (payments || []).forEach((p: any) => {
      if (!p.date) return;
      const d = new Date(p.date);
      const mStr = monthNames[d.getMonth()];
      if (chartMap.has(mStr)) {
        chartMap.get(mStr).revenue += Number(p.credit) || 0;
      }
    });

    (purchases || []).forEach((p: any) => {
      if (!p.date) return;
      const d = new Date(p.date);
      const mStr = monthNames[d.getMonth()];
      if (chartMap.has(mStr)) {
        chartMap.get(mStr).expenses += Number(p.grand_total) || 0;
      }
    });

    expenses.forEach((e: any) => {
      if (!e.date) return;
      const d = new Date(e.date);
      const mStr = monthNames[d.getMonth()];
      if (chartMap.has(mStr)) {
        chartMap.get(mStr).expenses += Number(e.amount) || 0;
      }
    });

    // Sort chart data chronologically
    const revenueVsExpenseChart = Array.from(chartMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.mIdx - b.mIdx;
    }).map(c => ({ month: c.month, revenue: c.revenue, expenses: c.expenses }));

    // Expense Distribution
    const expenseCategories = new Map();
    
    // Add Purchases as a category
    if (totalPurchases > 0) {
      expenseCategories.set("Raw Materials & Purchases", totalPurchases);
    }

    // Add other expenses
    expenses.forEach((e: any) => {
      const cat = e.category || "Other Operations";
      const amt = Number(e.amount) || 0;
      expenseCategories.set(cat, (expenseCategories.get(cat) || 0) + amt);
    });

    const expenseDistributionChart = Array.from(expenseCategories.entries()).map(([name, value]) => ({
      name,
      value
    }));

    return { 
      success: true, 
      data: {
        metrics: {
          totalRevenue,
          netProfit,
          receivables,
          avgBurnRate
        },
        charts: {
          revenueVsExpenseChart,
          expenseDistributionChart
        }
      }, 
      error: null 
    };
  } catch (err: any) {
    console.error("Dashboard Error:", err);
    return { success: false, data: null, error: err.message };
  }
}
