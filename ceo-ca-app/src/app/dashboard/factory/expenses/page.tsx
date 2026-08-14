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

  // Fallbacks if database is empty
  const fallbackDaily = daily.length > 0 ? daily : [
    { id: "EXP-D1", expense_name: "Tea / Coffee refreshments", category: "DAILY", amount: 450, status: "PAID" as const, created_at: "2026-07-11T10:00:00Z", description: "Other", paid_date: "2026-07-11", payment_mode: "CASH" },
    { id: "EXP-D2", expense_name: "Chemical solvent logistics delivery", category: "DAILY", amount: 12500, status: "PENDING" as const, created_at: "2026-07-12T09:30:00Z", description: "Logistics" },
    { id: "EXP-D3", expense_name: "Electricity utility bill (Plant)", category: "DAILY", amount: 48000, status: "PENDING" as const, created_at: "2026-07-12T08:00:00Z", description: "Utilities", due_date: "2026-07-20" }
  ];

  const fallbackPermanent = permanent.length > 0 ? permanent : [
    { id: "EXP-P1", expense_name: "Main Factory Warehouse Rent", category: "PERMANENT", amount: 120000, status: "PAID" as const, created_at: "2026-07-05T00:00:00Z", description: "Rent", paid_date: "2026-07-05", payment_mode: "BANK" },
    { id: "EXP-P2", expense_name: "Executive & Worker Salaries", category: "PERMANENT", amount: 85000, status: "PENDING" as const, created_at: "2026-07-10T00:00:00Z", description: "Salaries", due_date: "2026-07-15" },
    { id: "EXP-P3", expense_name: "Bulk Titanium Dioxide raw pigments", category: "PERMANENT", amount: 180000, status: "PENDING" as const, created_at: "2026-07-08T00:00:00Z", description: "Raw Material", due_date: "2026-07-18" }
  ];

  return (
    <FactoryExpensesClient
      initialDaily={fallbackDaily}
      initialPermanent={fallbackPermanent}
    />
  );
}
