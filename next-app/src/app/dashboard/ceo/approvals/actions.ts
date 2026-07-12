"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getApprovalsData() {
  try {
    // 1. Fetch pending users
    const { data: pendingUsers, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id, name, phone, role, created_at")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });
    if (userErr) throw userErr;

    // 2. Fetch pending factory expenses
    const { data: pendingExpenses, error: expErr } = await supabaseAdmin
      .from("factory_expenses")
      .select("id, expense_name, category, amount, due_date")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
    if (expErr) throw expErr;

    // 3. Fetch unpaid purchase bills
    const { data: pendingPurchases, error: purErr } = await supabaseAdmin
      .from("purchase_master")
      .select("id, invoice_no, supplier_name, total_amount, bill_date")
      .eq("payment_status", "UNPAID")
      .order("bill_date", { ascending: false });
    if (purErr) throw purErr;

    // 4. Fetch audit logs
    const { data: auditLogs, error: auditErr } = await supabaseAdmin
      .from("approval_audits")
      .select("*")
      .order("created_at", { ascending: false });
    if (auditErr) throw auditErr;

    return {
      success: true,
      data: {
        pendingUsers: pendingUsers || [],
        pendingExpenses: pendingExpenses || [],
        pendingPurchases: pendingPurchases || [],
        auditLogs: auditLogs || []
      }
    };
  } catch (err: any) {
    console.error("Error fetching approvals data:", err);
    return { success: false, error: err.message };
  }
}

export async function approveOrRejectUserRegistration(
  userId: string,
  userName: string,
  role: string,
  action: "Approved" | "Rejected"
) {
  try {
    if (action === "Approved") {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_approved: true })
        .eq("id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", userId);
      if (error) throw error;
    }

    // Log audit trail
    await supabaseAdmin
      .from("approval_audits")
      .insert({
        item_id: userId,
        category: "Dealer Approval",
        title: `${userName} - ${role.toUpperCase()} access request`,
        action: action,
        actor: "CEO"
      });

    revalidatePath("/dashboard/ceo/approvals");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating user registration status:", err);
    return { success: false, error: err.message };
  }
}

export async function approveOrRejectExpense(
  expenseId: string,
  expenseName: string,
  amount: number,
  action: "Approved" | "Rejected"
) {
  try {
    const status = action === "Approved" ? "PAID" : "REJECTED";
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabaseAdmin
      .from("factory_expenses")
      .update({
        status,
        paid_date: action === "Approved" ? today : null
      })
      .eq("id", expenseId);
    if (error) throw error;

    // Log audit trail
    await supabaseAdmin
      .from("approval_audits")
      .insert({
        item_id: expenseId,
        category: "Expense Approval",
        title: `${expenseName} (Amount: ₹${amount.toLocaleString()})`,
        action: action,
        actor: "CEO"
      });

    revalidatePath("/dashboard/ceo/approvals");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating expense approval status:", err);
    return { success: false, error: err.message };
  }
}

export async function approveOrRejectPurchaseBill(
  billId: string,
  invoiceNo: string,
  supplierName: string,
  amount: number,
  action: "Approved" | "Rejected"
) {
  try {
    const payment_status = action === "Approved" ? "PAID" : "REJECTED";

    const { error } = await supabaseAdmin
      .from("purchase_master")
      .update({ payment_status })
      .eq("id", billId);
    if (error) throw error;

    // Log audit trail
    await supabaseAdmin
      .from("approval_audits")
      .insert({
        item_id: billId,
        category: "Purchase Approval",
        title: `PO ${invoiceNo || "N/A"} - Supplier: ${supplierName} (Amount: ₹${amount.toLocaleString()})`,
        action: action,
        actor: "CEO"
      });

    revalidatePath("/dashboard/ceo/approvals");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating purchase PO approval status:", err);
    return { success: false, error: err.message };
  }
}
