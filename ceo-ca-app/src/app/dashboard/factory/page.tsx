import React from "react";
import FactoryOperationsClient from "./FactoryOperationsClient";
import { getFactoryDashboardData } from "./actions";
import { createClient } from "@/utils/supabase/server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Factory Control Panel | Sharma ERP",
  description: "Manage manufacturing batches, raw material stocks, labor sheets, and loyalty coupons.",
  };
}
export const dynamic = "force-dynamic";

export default async function FactoryOperationsPage() {
  const res = await getFactoryDashboardData();
  const supabase = await createClient();

  // Fetch products
  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, product_name, actual_stock, min_stock_threshold, token_value");

  // Fetch dealers (approved users with role='dealer')
  const { data: dbDealers } = await supabase
    .from("users")
    .select("id, name, gst_number")
    .eq("role", "dealer")
    .eq("is_approved", true);

  // Fetch painters
  const { data: dbPainters } = await supabase
    .from("painters")
    .select("id, name, total_tokens");

  const initialProducts = dbProducts ? dbProducts.map((p: any) => ({
    id: p.id,
    name: p.product_name,
    stock: Number(p.actual_stock) || 0,
    min_stock: Number(p.min_stock_threshold) || 10,
    token_value: Number(p.token_value) || 50
  })) : [];

  const initialDealers = dbDealers ? dbDealers.map((d: any) => ({
    id: d.id,
    name: d.name,
    gst_number: d.gst_number || ""
  })) : [];

  const initialPainters = dbPainters ? dbPainters.map((p: any) => ({
    id: p.id,
    name: p.name,
    total_tokens: Number(p.total_tokens) || 0
  })) : [];

  const initialData = res.success && res.data ? {
    batches: res.data.batches,
    rawMaterials: res.data.rawMaterials,
    labor: res.data.labor,
    attendance: res.data.attendance,
    expenses: res.data.expenses
  } : {
    batches: [],
    rawMaterials: [],
    labor: [],
    attendance: [],
    expenses: []
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <FactoryOperationsClient
        initialProducts={initialProducts}
        initialRawMaterials={initialData.rawMaterials}
        initialBatches={initialData.batches}
        initialLabor={initialData.labor}
        initialAttendance={initialData.attendance}
        initialExpenses={initialData.expenses}
        initialDealers={initialDealers}
        initialPainters={initialPainters}
      />
    </div>
  );
}
