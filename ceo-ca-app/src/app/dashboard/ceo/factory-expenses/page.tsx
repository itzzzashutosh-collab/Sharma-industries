import { createClient } from "@/utils/supabase/server";
import { FactoryExpensesClient } from "./FactoryExpensesClient";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Factory Operations & Expenses | Sharma ERP",
  };
}

export default async function FactoryExpensesDashboard() {
  const supabase = await createClient();

  // Fetch expenses
  const { data: expenses } = await supabase
    .from("factory_expenses")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch assets
  const { data: assets } = await supabase
    .from("factory_assets")
    .select("*")
    .order("created_at", { ascending: false });

  // Group expenses for the Pie Chart
  const expenseMap: Record<string, number> = {};
  let totalExpenses = 0;

  if (expenses) {
    expenses.forEach((exp) => {
      expenseMap[exp.category] = (expenseMap[exp.category] || 0) + Number(exp.amount);
      totalExpenses += Number(exp.amount);
    });
  }

  const pieChartData = Object.keys(expenseMap).map((key) => ({
    name: key,
    value: expenseMap[key],
  }));

  const totalAssetValue = assets?.reduce((sum, a) => sum + Number(a.current_value), 0) || 0;

  return (
    <FactoryExpensesClient
      expenses={expenses || []}
      assets={assets || []}
      pieChartData={pieChartData}
      totalExpenses={totalExpenses}
      totalAssetValue={totalAssetValue}
    />
  );
}
