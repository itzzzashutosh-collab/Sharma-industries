"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  try {
    const supabase = await createClient();

    // Parse Customer Details
    const customer = {
      name: formData.get("customer_name") as string,
      phone: formData.get("customer_phone") as string,
    };

    // Parse Painter Details (Internal)
    const painter_id = formData.get("painter_id") as string;
    const hidden_commission_amount = parseFloat(formData.get("hidden_commission") as string) || 0;

    // Parse Items (Sent as stringified JSON from client)
    const itemsRaw = formData.get("items") as string;
    const items = itemsRaw ? JSON.parse(itemsRaw) : [];

    // Calculations
    const subtotal = items.reduce((acc: number, item: any) => acc + item.total, 0);
    // Simple 18% GST for demo
    const total_gst = subtotal * 0.18;
    const grand_total = subtotal + total_gst;

    // Generate Invoice Number
    const invoice_no = `INV-${Date.now().toString().slice(-6)}`;

    // Insert Invoice
    const { data, error } = await supabase.from("invoices").insert({
      id: `INV_${Date.now()}`,
      invoice_no,
      date: new Date().toISOString().split("T")[0],
      customer,
      items,
      subtotal,
      total_gst,
      grand_total,
      balance_due: grand_total, // Assume unpaid initially
      payment_status: "Pending",
      painter_id: painter_id || null,
      hidden_commission_amount: hidden_commission_amount || null,
    }).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Database error saving invoice." };
    }

    // If there's a painter commission, we should ideally add it to painter_ledger here.
    if (painter_id && hidden_commission_amount > 0) {
      const { error: ledgerError } = await supabase.from("painter_ledger").insert({
        painter_id,
        transaction_type: "commission_earned",
        amount: hidden_commission_amount,
        reference_invoice_id: data.id,
      });
      if (ledgerError) console.error("Ledger error:", ledgerError);
    }

    revalidatePath("/dashboard/dealer/pos");
    return { success: true, message: `Invoice ${invoice_no} created successfully!` };
  } catch (err) {
    console.error("Error creating invoice:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
