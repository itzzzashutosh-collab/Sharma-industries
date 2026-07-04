"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSmartInvoice(data: any) {
  try {
    const supabase = await createAdminClient();

    // 1. We don't provide ID manually so uuid_generate_v4() triggers
    const { error } = await supabase.from("invoices").insert({
      invoice_no: data.invoiceNo,
      client_type: data.clientType || 'Customer',
      customer_id: data.customerId || null,
      client_details: {
        name: data.customerName,
        gstin: data.gstin,
        state: data.state,
        phone: data.customerPhone,
        address: data.customerAddress,
        seller: data.seller
      },
      items: data.items,
      tax_breakdown: {
        cgst: data.cgst || 0,
        sgst: data.sgst || 0,
        igst: data.igst || 0
      },
      subtotal: data.subtotal,
      total_tax: data.totalTax,
      grand_total: data.grandTotal,
      is_tax_inclusive: data.taxType === "inclusive",
      signature_data: data.signatureData || null
    });

    if (error) {
      console.error("Error saving invoice:", error);
      return { success: false, error: error.message || "Failed to save invoice to database." };
    }

    revalidatePath("/dashboard/ceo/invoices");
    return { success: true };
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: "Internal server error." };
  }
}

export async function getNextInvoiceNumber() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_no")
    .like("invoice_no", "SP(INV)-%")
    .order("invoice_no", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return "SP(INV)-0001";
  }

  const latestNo = data[0].invoice_no;
  const match = latestNo.match(/SP\(INV\)-(\d+)/);
  if (match && match[1]) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `SP(INV)-${nextNum.toString().padStart(4, '0')}`;
  }

  return "SP(INV)-0001";
}
