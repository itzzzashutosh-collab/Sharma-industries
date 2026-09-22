import React from "react";
import { getExpenses } from "@/actions/expenseActions";
import FactoryExpensesClient from "./FactoryExpensesClient";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Factory Expenses | Sharma ERP",
  };
}

export default async function FactoryExpensesPage() {
  const res = await getExpenses();
  
  const daily = res.success && res.data?.daily ? res.data.daily.map((exp: any) => ({
    id: exp.id,
    expense_name: exp.expense_name,
    category: exp.category,
    amount: Number(exp.amount) || 0,
    status: (exp.status === "PAID" ? "PAID" : "PENDING") as "PAID" | "PENDING",
    due_date: exp.due_date,
    paid_date: exp.paid_date,
    payment_mode: exp.payment_mode,
    created_at: exp.created_at,
    description: exp.description || (exp.expense_name.toLowerCase().includes("dye") || exp.expense_name.toLowerCase().includes("pigment") ? "Raw Material" : "Other")
  })) : [];

  const permanent = res.success && res.data?.permanent ? res.data.permanent.map((exp: any) => ({
    id: exp.id,
    expense_name: exp.expense_name,
    category: exp.category,
    amount: Number(exp.amount) || 0,
    status: (exp.status === "PAID" ? "PAID" : "PENDING") as "PAID" | "PENDING",
    due_date: exp.due_date,
    paid_date: exp.paid_date,
    payment_mode: exp.payment_mode,
    created_at: exp.created_at,
    description: exp.description || (exp.expense_name.toLowerCase().includes("rent") ? "Rent" : exp.expense_name.toLowerCase().includes("salary") ? "Salaries" : "Other")
  })) : [];

  return (
    <FactoryExpensesClient
      initialDaily={daily}
      initialPermanent={permanent}
    />
  );
}
