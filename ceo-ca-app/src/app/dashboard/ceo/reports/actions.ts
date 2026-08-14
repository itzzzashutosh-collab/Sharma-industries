"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Helpers to get dates
const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};

export async function generateReportData(type: "daily" | "weekly" | "monthly" | "yearly" | "inventory" | "sales" | "production" | "financial") {
  try {
    let title = "";
    let data: any[] = [];
    let headers: string[] = [];

    if (type === "daily" || type === "weekly" || type === "monthly" || type === "yearly") {
      const days = type === "daily" ? 1 : type === "weekly" ? 7 : type === "monthly" ? 30 : 365;
      const startDate = getPastDate(days);
      title = `${type.toUpperCase()} Operations Summary (Since ${startDate})`;

      // Fetch sales count & sum
      const { data: salesData } = await supabaseAdmin
        .from("orders")
        .select("id, total_amount, created_at, status")
        .gte("created_at", startDate);

      // Fetch production count
      const { data: prodData } = await supabaseAdmin
        .from("production_batches")
        .select("id, batch_date, quantity_produced, status")
        .gte("batch_date", startDate);

      // Fetch expenses
      const { data: expData } = await supabaseAdmin
        .from("factory_expenses")
        .select("id, expense_name, amount, due_date, status")
        .gte("due_date", startDate);

      headers = ["Metric / Activity Name", "Category", "Date / Reference", "Status", "Amount / Value"];
      
      if (salesData) {
        salesData.forEach((s: any) => {
          data.push({
            name: `Customer Order: #${s.id.slice(-6)}`,
            category: "Sales",
            ref: s.created_at.split("T")[0],
            status: s.status || "COMPLETED",
            value: `₹${Number(s.total_amount || 0).toLocaleString()}`
          });
        });
      }

      if (prodData) {
        prodData.forEach((p: any) => {
          data.push({
            name: `Production Batch: #${p.id.slice(-6)}`,
            category: "Production",
            ref: p.batch_date,
            status: p.status || "COMPLETED",
            value: `${p.quantity_produced || 0} Buckets`
          });
        });
      }

      if (expData) {
        expData.forEach((e: any) => {
          data.push({
            name: `Factory Expense: ${e.expense_name}`,
            category: "Financial",
            ref: e.due_date,
            status: e.status || "PAID",
            value: `₹${Number(e.amount || 0).toLocaleString()}`
          });
        });
      }

      if (data.length === 0) {
        data.push({
          name: "No activities logged in this period",
          category: "N/A",
          ref: "-",
          status: "-",
          value: "-"
        });
      }

    } else if (type === "inventory") {
      title = "Raw Material Stock Audit Inventory Report";
      headers = ["Material Name", "UOM", "Current Stock", "Min Stock Level", "Status"];

      const { data: items, error } = await supabaseAdmin
        .from("raw_materials")
        .select("material_name, unit_of_measure, current_stock, min_stock")
        .order("material_name", { ascending: true });

      if (error) throw error;

      if (items) {
        items.forEach((item: any) => {
          const isLow = Number(item.current_stock) < Number(item.min_stock);
          data.push({
            name: item.material_name,
            category: item.unit_of_measure || "kg",
            ref: `${item.current_stock} ${item.unit_of_measure}`,
            status: isLow ? "LOW STOCK" : "OPTIMAL",
            value: `Min threshold: ${item.min_stock}`
          });
        });
      }
    } else if (type === "sales") {
      title = "Historical Dealer Sales Revenue Audit Report";
      headers = ["Order ID", "Dealer / Client ID", "Order Date", "Status", "Total Revenue"];

      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("id, dealer_id, total_amount, created_at, status")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (orders) {
        orders.forEach((o: any) => {
          data.push({
            name: `Order #${o.id.slice(-6)}`,
            category: "Sales Revenue",
            ref: o.created_at ? o.created_at.split("T")[0] : "-",
            status: o.status || "DELIVERED",
            value: `₹${Number(o.total_amount || 0).toLocaleString()}`
          });
        });
      }
    } else if (type === "production") {
      title = "Factory Manufacturing Yield Production Report";
      headers = ["Batch ID", "Product ID", "Batch Date", "Status", "Quantity Produced"];

      const { data: batches, error } = await supabaseAdmin
        .from("production_batches")
        .select("id, product_id, batch_date, status, quantity_produced")
        .order("batch_date", { ascending: false });

      if (error) throw error;

      if (batches) {
        batches.forEach((b: any) => {
          data.push({
            name: `Batch #${b.id}`,
            category: "Paint Manufacturing",
            ref: b.batch_date || "-",
            status: b.status || "COMPLETED",
            value: `${b.quantity_produced || 0} Buckets`
          });
        });
      }
    } else if (type === "financial") {
      title = "Consolidated Accounts & Expenditures Financial Report";
      headers = ["Payment / Bill Ref", "Category", "Due/Paid Date", "Payment Status", "Amount Due/Settled"];

      // Fetch expenses
      const { data: expenses } = await supabaseAdmin
        .from("factory_expenses")
        .select("id, expense_name, due_date, status, amount")
        .order("due_date", { ascending: false });

      // Fetch purchase bills
      const { data: purchaseBills } = await supabaseAdmin
        .from("purchase_master")
        .select("id, invoice_no, supplier_name, bill_date, payment_status, total_amount")
        .order("bill_date", { ascending: false });

      if (expenses) {
        expenses.forEach((e: any) => {
          data.push({
            name: `Expense: ${e.expense_name}`,
            category: "Operations Cost",
            ref: e.due_date,
            status: e.status || "PAID",
            value: `₹${Number(e.amount || 0).toLocaleString()}`
          });
        });
      }

      if (purchaseBills) {
        purchaseBills.forEach((p: any) => {
          data.push({
            name: `Procurement PO: ${p.invoice_no || p.id} - ${p.supplier_name}`,
            category: "Material Purchase",
            ref: p.bill_date,
            status: p.payment_status || "UNPAID",
            value: `₹${Number(p.total_amount || 0).toLocaleString()}`
          });
        });
      }

      if (data.length === 0) {
        data.push({
          name: "No financial logs found",
          category: "N/A",
          ref: "-",
          status: "-",
          value: "-"
        });
      }
    }

    return {
      success: true,
      report: {
        title,
        headers,
        rows: data
      }
    };
  } catch (err: any) {
    console.error("Error generating report:", err);
    return { success: false, error: err.message };
  }
}
