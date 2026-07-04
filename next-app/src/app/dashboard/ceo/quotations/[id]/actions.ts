"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSemanticId } from "@/lib/idGenerator";

export async function markQuotationAsPaid(quotationId: string, amount: number, paymentMode: string, notes: string) {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch the quotation to get balance and client details
    const { data: quotation, error: fetchError } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", quotationId)
      .single();

    if (fetchError || !quotation) {
      return { success: false, error: "Quotation not found." };
    }

    if (quotation.balance_due <= 0) {
      return { success: false, error: "Quotation is already fully paid." };
    }

    if (amount <= 0 || amount > quotation.balance_due) {
      return { success: false, error: "Invalid payment amount." };
    }

    const customerName = typeof quotation.customer === 'object' ? quotation.customer.name : quotation.customer;

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
      reference_no: quotationId,
      notes: notes
    }]);

    if (paymentError) {
      console.error("Payment Error:", paymentError);
      return { success: false, error: "Failed to record payment: " + paymentError.message };
    }

    // 3. Update Quotation Balance
    const newBalance = quotation.balance_due - amount;
    const { error: updateError } = await supabase
      .from("quotations")
      .update({ balance_due: newBalance })
      .eq("id", quotationId);

    if (updateError) {
      return { success: false, error: "Failed to update quotation balance." };
    }

    // 4. Update Ledger
    const ledgerId = await generateSemanticId(supabase, "ledger_entries", "LED", customerName || "Unknown", "CR");
    await supabase.from("ledger_entries").insert([{
        id: ledgerId,
        client_id: quotation.client_id,
        date: new Date().toISOString().split("T")[0],
        description: `Payment Recd - ${quotationId} ${notes ? `(${notes})` : ""}`,
        credit: amount,
        debit: 0,
        balance: 0 
    }]);

    revalidatePath("/dashboard/ceo/quotations");
    revalidatePath(`/dashboard/ceo/quotations/${quotationId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
