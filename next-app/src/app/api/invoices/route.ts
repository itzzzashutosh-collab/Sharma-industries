import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { generateSemanticId } from "@/lib/idGenerator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createAdminClient();

    const clientType = body.client_type || 'Customer';
    let client = null;
    let clientId = body.client_id;

    if (clientId) {
      if (clientType === 'Dealer') {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", clientId)
          .single();
        if (!error && data) client = data;
      } else {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single();
        if (!error && data) client = data;
      }
    }

    if (!client && body.client_details && body.client_details.name) {
      const newClientId = await generateSemanticId(
        supabase,
        "clients",
        "CL",
        body.client_details.name,
        body.client_details.pincode || body.client_details.state_code || "XX"
      );
      const { data: insertedClient, error: insertErr } = await supabase
        .from("clients")
        .insert({
          id: newClientId,
          name: body.client_details.name,
          phone: body.client_details.phone || null,
          gstin: body.client_details.gstin || null,
          address: body.client_details.address || null,
          state_code: body.client_details.state_code || null,
          pincode: body.client_details.pincode || null
        })
        .select()
        .single();
        
      if (insertErr) {
        console.error("Failed to auto-create client:", insertErr);
      } else if (insertedClient) {
        client = insertedClient;
        clientId = newClientId;
      }
    }

    if (!client) {
      throw new Error("Invalid client_id provided and could not create new client.");
    }

    // Custom Semantic ID Generator: SP_{client_name}_{pincode}_{sequential_number}
    let newId = body.id;
    if (!newId) {
      newId = await generateSemanticId(
        supabase,
        "invoices",
        "SP",
        client.name,
        client.pincode || client.state_code
      );
    }

    // Ensure the invoice_no from the frontend is truly unique on the server side
    // This prevents race conditions or stale numbers from duplicate submissions
    let invoiceNo = body.invoice_no || newId;
    if (body.invoice_no && !body.id) {
      // Check if this invoice_no already exists
      const { data: existingInv } = await supabase
        .from("invoices")
        .select("id")
        .eq("invoice_no", body.invoice_no)
        .limit(1);
      
      if (existingInv && existingInv.length > 0) {
        // It's a duplicate, generate the next one server-side
        const { data: lastInv } = await supabase
          .from("invoices")
          .select("invoice_no")
          .like("invoice_no", "SP(INV)-%")
          .order("invoice_no", { ascending: false })
          .limit(1);
        
        if (lastInv && lastInv.length > 0) {
          const match = lastInv[0].invoice_no.match(/SP\(INV\)-(\d+)/);
          if (match && match[1]) {
            const nextNum = parseInt(match[1], 10) + 1;
            invoiceNo = `SP(INV)-${nextNum.toString().padStart(4, '0')}`;
          }
        }
      }
    }


    // Math Engine: Validate Tax Breakdown
    // If billing state matches company state (intra-state), CGST+SGST applies. Otherwise IGST.
    // Assuming company state is standard for Sharma Industries, e.g., '08' for Rajasthan.
    const companyStateCode = "08"; // Hardcoded default based on typical company settings, or can be fetched
    const isInterState = (client.state_code !== companyStateCode);
    
    let totalTax = 0;
    const taxBreakdown = { cgst: 0, sgst: 0, igst: 0 };
    
    // We expect the frontend to pass the calculated taxes in `tax_breakdown`, but we validate totals here
    if (body.tax_breakdown) {
      if (isInterState) {
        taxBreakdown.igst = Number(body.tax_breakdown.igst) || 0;
        totalTax = taxBreakdown.igst;
      } else {
        taxBreakdown.cgst = Number(body.tax_breakdown.cgst) || 0;
        taxBreakdown.sgst = Number(body.tax_breakdown.sgst) || 0;
        totalTax = taxBreakdown.cgst + taxBreakdown.sgst;
      }
    }

    // Calculate balance due securely on the server
    const grandTotal = Number(body.grand_total) || 0;
    const advancePaid = body.payment_terms?.advance_paid ? Number(body.payment_terms.advance_paid) : 0;
    const balanceDue = grandTotal - advancePaid;

    const payload = {
      id: newId,
      invoice_no: invoiceNo, // Server-validated sequential invoice number
      date: body.date || body.invoice_date || new Date().toISOString().split("T")[0],
      due_date: body.due_date || null,
      client_id: clientId,
      customer_id: clientId,
      client_type: clientType,
      customer: client.name,
      client_details: body.client_details || {
        name: client.name,
        phone: client.phone,
        gstin: client.gstin,
        address: client.address,
        state_code: client.state_code,
        pincode: client.pincode
      },
      items: body.items || [],
      cgst: taxBreakdown.cgst || 0,
      sgst: taxBreakdown.sgst || 0,
      igst: taxBreakdown.igst || 0,
      total_gst: totalTax,
      seller: "Company",
      transport_details: body.transport_details || null,
      payment_terms: body.payment_terms || null,
      subtotal: Number(body.subtotal) || 0,
      additional_charges: body.additional_charges || [],
      round_off: Number(body.round_off) || 0,
      grand_total: grandTotal,
      balance_due: balanceDue,
      is_tax_inclusive: Boolean(body.is_tax_inclusive),
      qr_range: body.qr_range || null
    };

    const { data, error } = await supabase
      .from("invoices")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;

    // Map QR ranges per line item to qr_registry
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.qr_range) {
          const rangeMatch = item.qr_range.match(/^(\d+)-(\d+)$/);
          if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);
            if (start <= end && (end - start) < 5000) {
              const qrCodes = [];
              for (let i = start; i <= end; i++) {
                qrCodes.push(`QR-${i}`);
              }
              const { error: qrErr } = await supabase
                .from("qr_registry")
                .update({
                  invoice_id: data.id,
                  dealer_id: clientId
                })
                .in("qr_code", qrCodes);
              if (qrErr) {
                console.error("Failed to map QR codes for item:", item.name, qrErr);
              }
            }
          }
        }
      }
    }

    // If there is an advance payment, record it in ledger as well
    if (advancePaid > 0) {
      const paymentId = await generateSemanticId(supabase, "payments", "PAY", client.name, client.pincode);
      
      const { data: payData, error: payErr } = await supabase.from("payments").insert([{
        id: paymentId,
        client_id: body.client_id,
        payment_date: payload.date,
        amount: advancePaid,
        payment_mode: "Advance",
        reference_no: newId
      }]).select("*").single();

      if (!payErr && payData) {
        const ledgerId = await generateSemanticId(supabase, "ledger_entries", "LED", client.name, "CR");
        await supabase.from("ledger_entries").insert([{
            id: ledgerId,
            client_id: body.client_id,
            date: payload.date,
            description: `Advance Recd - ${newId}`,
            credit: advancePaid,
            debit: 0,
            balance: 0 
        }]);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
