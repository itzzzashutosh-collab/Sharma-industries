"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSemanticId } from "@/lib/idGenerator";

export async function markDealerInvoiceAsPaid(
  invoiceId: string,
  amount: number,
  paymentMode: string,
  notes: string
) {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch the invoice
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return { success: false, error: "Invoice not found." };
    }

    if ((invoice.balance_due ?? 0) <= 0) {
      return { success: false, error: "Invoice is already fully paid." };
    }

    if (amount <= 0 || amount > invoice.balance_due) {
      return { success: false, error: "Invalid payment amount." };
    }

    const customerName =
      typeof invoice.customer === "object"
        ? invoice.customer?.name
        : invoice.customer;

    // 2. Insert Payment Record
    let paymentId: string;
    try {
      paymentId = await generateSemanticId(
        supabase,
        "payments",
        "PAY",
        customerName || "Unknown",
        "SETTLE"
      );
    } catch {
      paymentId = `PAY_${Date.now()}`;
    }

    const { error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          id: paymentId,
          date: new Date().toISOString().split("T")[0],
          amount: amount,
          payment_mode: paymentMode,
          reference_no: invoiceId,
          notes: notes,
        },
      ]);

    if (paymentError) {
      console.error("Payment Error:", paymentError);
      return {
        success: false,
        error: "Failed to record payment: " + paymentError.message,
      };
    }

    // 3. Update Invoice Balance
    const newBalance = invoice.balance_due - amount;
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ balance_due: newBalance })
      .eq("id", invoiceId);

    if (updateError) {
      return {
        success: false,
        error: "Failed to update invoice balance.",
      };
    }

    revalidatePath("/dashboard/dealer/sales/invoices");
    revalidatePath(`/dashboard/dealer/sales/invoices/${invoiceId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelDealerInvoice(invoiceId: string) {
  try {
    const supabase = await createAdminClient();
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return { success: false, error: "Invoice not found." };
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: "Cancelled" })
      .eq("id", invoiceId);

    if (updateError) {
      return {
        success: false,
        error: "Failed to cancel invoice: " + updateError.message,
      };
    }

    revalidatePath("/dashboard/dealer/sales/invoices");
    revalidatePath(`/dashboard/dealer/sales/invoices/${invoiceId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
