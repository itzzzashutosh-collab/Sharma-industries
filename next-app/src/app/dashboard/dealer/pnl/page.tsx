import React from "react";
import { createClient } from "@/utils/supabase/server";
import PnLClient from "./PnLClient";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Profit & Loss Ledger | Sharma ERP",
  };
}

export default async function PnLDashboardPage() {
  const supabase = await createClient();

  // Fetch Invoices for dealer margins
  const { data: invoices } = await supabase
    .from("invoices")
    .select("grand_total, hidden_commission_amount");
  
  const totalSales = invoices?.reduce((acc, inv) => acc + (Number(inv.grand_total) || 0), 0) || 0;
  const totalCommission = invoices?.reduce((acc, inv) => acc + (Number(inv.hidden_commission_amount) || 0), 0) || 0;

  // Approximate purchase paint material cost (70% of gross invoice amount)
  const purchaseCost = totalSales * 0.7;

  // Fetch logged expenses
  const { data: expenses } = await supabase
    .from("dealer_expenses")
    .select("category, amount, expense_date")
    .order("expense_date", { ascending: false });

  const totalExpenses = expenses?.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0) || 0;
  
  // Parse expenses list for frontend render
  const expenseItems = expenses ? expenses.map((exp: any) => ({
    category: exp.category || "Other",
    amount: Number(exp.amount) || 0,
    expense_date: exp.expense_date || new Date().toISOString().split("T")[0]
  })) : [];

  const trueProfit = totalSales - purchaseCost - totalExpenses - totalCommission;

  return (
    <PnLClient
      totalSales={totalSales}
      purchaseCost={purchaseCost}
      totalExpenses={totalExpenses}
      totalCommission={totalCommission}
      trueProfit={trueProfit}
      expenseItems={expenseItems}
    />
  );
}
