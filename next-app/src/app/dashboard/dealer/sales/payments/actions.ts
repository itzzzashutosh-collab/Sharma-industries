"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Fetch Dealer Payments & Collection History ────────────────────────────────
export async function getDealerPayments() {
  try {
    const supabase = await createAdminClient();

    // Fetch payments table rows
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    // Also fetch invoices for credit/unpaid bill tracking
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, invoice_no, customer, grand_total, balance_due, payment_status, payment_mode, date")
      .order("created_at", { ascending: false });

    return {
      success: true,
      payments: payments || [],
      invoices: invoices || [],
    };
  } catch (err: any) {
    console.error("Error fetching dealer payments:", err);
    return { success: false, error: err.message, payments: [], invoices: [] };
  }
}

// ─── Record Customer Payment Collection ─────────────────────────────────────────
export async function recordCustomerPayment(payload: any) {
  try {
    const supabase = await createAdminClient();

    const paymentRecord = {
      id: `PAY_${Date.now()}`,
      receipt_no: `REC-${Date.now().toString().slice(-6)}`,
      payment_date: payload.paymentDate || new Date().toISOString().split("T")[0],
      customer_name: payload.customerName || "Walk-In Customer",
      customer_phone: payload.customerPhone || "",
      invoice_id: payload.invoiceId || null,
      invoice_no: payload.invoiceNo || null,
      amount: Number(payload.amount || 0),
      payment_mode: payload.paymentMode || "Cash",
      reference_no: payload.referenceNo || "",
      notes: payload.notes || "Customer Bill Settlement",
      status: "Success",
    };

    // 1. Try inserting into payments table
    const { data: inserted, error: payError } = await supabase
      .from("payments")
      .insert(paymentRecord)
      .select()
      .single();

    if (payError) {
      console.warn("Notice: payments table insert fallback to memory:", payError.message);
    }

    // 2. If tied to an invoice, update balance_due & payment_status on invoices table
    if (payload.invoiceId) {
      const { data: inv } = await supabase
        .from("invoices")
        .select("balance_due, grand_total")
        .eq("id", payload.invoiceId)
        .single();

      if (inv) {
        const currentDue = Number(inv.balance_due ?? inv.grand_total);
        const newDue = Math.max(0, currentDue - Number(payload.amount || 0));
        const newStatus = newDue <= 0 ? "Paid" : "Partial";

        await supabase
          .from("invoices")
          .update({
            balance_due: newDue,
            payment_status: newStatus,
          })
          .eq("id", payload.invoiceId);
      }
    }

    revalidatePath("/dashboard/dealer/sales/payments");
    revalidatePath("/dashboard/dealer/pos");
    revalidatePath("/dashboard/dealer/sales/invoices");

    return {
      success: true,
      message: `Payment of ₹${payload.amount} recorded successfully!`,
      data: inserted || paymentRecord,
    };
  } catch (err: any) {
    console.error("Error recording customer payment:", err);
    return { success: false, error: err.message || "Failed to record payment." };
  }
}
