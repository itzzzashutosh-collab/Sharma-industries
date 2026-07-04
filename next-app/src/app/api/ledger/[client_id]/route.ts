import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ client_id: string }> }
) {
  try {
    const { client_id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch all invoices for client (Debits)
    const { data: invoices, error: invError } = await supabase
      .from("invoices")
      .select("id, invoice_no, invoice_date, grand_total, created_at, payment_terms")
      .eq("client_id", clientId);
      
    if (invError) throw invError;

    // Fetch all payments for client (Credits)
    const { data: payments, error: payError } = await supabase
      .from("payments")
      .select("id, reference_no, payment_mode, payment_date, amount, created_at")
      .eq("client_id", clientId);

    if (payError) throw payError;

    // Map and Merge
    let entries: any[] = [];
    
    if (invoices) {
      invoices.forEach(inv => {
        let pMode = "Credit";
        if (inv.payment_terms && typeof inv.payment_terms === "object" && inv.payment_terms.payment_mode) {
          pMode = inv.payment_terms.payment_mode;
        }

        entries.push({
          id: inv.id,
          date: inv.invoice_date || inv.created_at.split("T")[0],
          particulars: `Sales - ${inv.invoice_no}`,
          vch_type: "Sales",
          debit: Number(inv.grand_total),
          credit: 0,
          created_at: inv.created_at,
          payment_mode: pMode
        });
      });
    }

    if (payments) {
      payments.forEach(pay => {
        entries.push({
          id: pay.id,
          date: pay.payment_date || pay.created_at.split("T")[0],
          particulars: `Payment Recd - ${pay.payment_mode} ${pay.reference_no ? `(Ref: ${pay.reference_no})` : ''}`,
          vch_type: "Receipt",
          debit: 0,
          credit: Number(pay.amount),
          created_at: pay.created_at,
          payment_mode: pay.payment_mode || "Bank"
        });
      });
    }

    // Sort chronologically by date and then created_at for tiebreakers
    entries.sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff === 0) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return dateDiff;
    });

    // Calculate Running Balance
    let balance = 0;
    const ledger = entries.map(entry => {
      balance = balance + entry.debit - entry.credit;
      return {
        ...entry,
        balance: balance
      };
    });

    return NextResponse.json({ success: true, data: ledger });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
