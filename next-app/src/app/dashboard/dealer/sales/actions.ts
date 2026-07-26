"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Dealer Invoice Number ─────────────────────────────────────────────────────
// Uses DL(INV)- prefix so dealer invoices are separate from CEO SP(INV)- series

export async function getDealerNextInvoiceNumber() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_no")
    .like("invoice_no", "DL(INV)-%")
    .order("invoice_no", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return "DL(INV)-0001";
  }

  const latestNo = data[0].invoice_no;
  const match = latestNo.match(/DL\(INV\)-(\d+)/);
  if (match && match[1]) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `DL(INV)-${nextNum.toString().padStart(4, "0")}`;
  }

  return "DL(INV)-0001";
}

// ─── Dealer Quotation Number ───────────────────────────────────────────────────
// Uses DL(Qno.)- prefix separate from CEO SP(Qno.)- series

export async function getDealerNextQuotationNumber() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("quotation_no")
    .like("quotation_no", "DL(Qno.)-%")
    .order("quotation_no", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return "DL(Qno.)-001";
  }

  const latestNo = data[0].quotation_no;
  const match = latestNo.match(/DL\(Qno\.\)-(\d+)/);
  if (match && match[1]) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `DL(Qno.)-${nextNum.toString().padStart(3, "0")}`;
  }

  return "DL(Qno.)-001";
}

// ─── Save Dealer Quotation ─────────────────────────────────────────────────────

export async function saveDealerQuotation(data: any) {
  try {
    const supabase = await createAdminClient();

    const { error } = await supabase.from("quotations").insert({
      quotation_no: data.quotationNo,
      client_type: data.clientType || "Customer",
      client_details: {
        name: data.customerName,
        gstin: data.gstin,
        state: data.state,
        phone: data.customerPhone,
        address: data.customerAddress,
      },
      items: data.items,
      tax_breakdown: {
        cgst: data.cgst || 0,
        sgst: data.sgst || 0,
        igst: data.igst || 0,
      },
      subtotal: data.subtotal,
      total_tax: data.totalTax,
      grand_total: data.grandTotal,
      is_tax_inclusive: data.taxType === "inclusive",
    });

    if (error) {
      console.error("Error saving dealer quotation:", error);
      return { success: false, error: error.message || "Failed to save quotation." };
    }

    revalidatePath("/dashboard/dealer/sales/quotations");
    return { success: true };
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: "Internal server error." };
  }
}
