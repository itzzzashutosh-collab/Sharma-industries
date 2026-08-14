"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSemanticId } from "@/lib/idGenerator";

export async function markInvoiceAsPaid(invoiceId: string, amount: number, paymentMode: string, notes: string) {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch the invoice to get balance and client details
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return { success: false, error: "Invoice not found." };
    }

    if (invoice.balance_due <= 0) {
      return { success: false, error: "Invoice is already fully paid." };
    }

    if (amount <= 0 || amount > invoice.balance_due) {
      return { success: false, error: "Invalid payment amount." };
    }

    const customerName = typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customer;

    // 2. Insert Payment Record
    const paymentId = await generateSemanticId(
      supabase,
      "payments",
      "PAY",
      customerName || "Unknown",
      "SETTLE"
    );

    const { error: paymentError } = await supabase.from("payments").insert([{
      id: paymentId,
      date: new Date().toISOString().split("T")[0],
      amount: amount,
      payment_mode: paymentMode,
      reference_no: invoiceId,
      notes: notes
    }]);

    if (paymentError) {
      console.error("Payment Error:", paymentError);
      return { success: false, error: "Failed to record payment: " + paymentError.message };
    }

    // 3. Update Invoice Balance
    const newBalance = invoice.balance_due - amount;
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ balance_due: newBalance })
      .eq("id", invoiceId);

    if (updateError) {
      return { success: false, error: "Failed to update invoice balance." };
    }

    // 4. Update Ledger
    const ledgerId = await generateSemanticId(supabase, "ledger_entries", "LED", customerName || "Unknown", "CR");
    await supabase.from("ledger_entries").insert([{
        id: ledgerId,
        client_id: invoice.client_id,
        date: new Date().toISOString().split("T")[0],
        description: `Payment Recd - ${invoiceId} ${notes ? `(${notes})` : ""}`,
        credit: amount,
        debit: 0,
        balance: 0 
    }]);

    revalidatePath("/dashboard/ceo/invoices");
    revalidatePath(`/dashboard/ceo/invoices/${invoiceId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelInvoice(invoiceId: string) {
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
      .update({ status: 'Cancelled' })
      .eq("id", invoiceId);

    if (updateError) {
      return { success: false, error: "Failed to cancel invoice: " + updateError.message };
    }

    // Record in ledger
    const customerName = typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customer;
    const ledgerId = await generateSemanticId(supabase, "ledger_entries", "LED", customerName || "Unknown", "DR");
    await supabase.from("ledger_entries").insert([{
        id: ledgerId,
        client_id: invoice.client_id,
        date: new Date().toISOString().split("T")[0],
        description: `Invoice Cancelled - ${invoiceId}`,
        credit: 0,
        debit: invoice.grand_total,
        balance: 0 
    }]);

    revalidatePath("/dashboard/ceo/invoices");
    revalidatePath(`/dashboard/ceo/invoices/${invoiceId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
