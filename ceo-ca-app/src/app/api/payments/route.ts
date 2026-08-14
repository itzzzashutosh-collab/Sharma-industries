import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSemanticId } from "@/lib/idGenerator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    const supabase = await createClient();
    
    let query = supabase.from("payments").select("*").order("payment_date", { ascending: false });
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Need client details for semantic ID
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .eq("id", body.client_id)
      .single();
      
    if (clientErr || !client) throw new Error("Client not found for semantic ID generation.");

    const newId = await generateSemanticId(
      supabase,
      "payments",
      "PAY",
      client.name,
      client.pincode || client.state_code
    );

    const { data, error } = await supabase
      .from("payments")
      .insert([{
        id: newId,
        client_id: body.client_id,
        payment_date: body.payment_date || new Date().toISOString().split("T")[0],
        amount: body.amount,
        payment_mode: body.payment_mode || "Bank",
        reference_no: body.reference_no || null
      }])
      .select("*")
      .single();

    if (error) throw error;

    // Add to ledger_entries as well (Credit)
    const ledgerId = await generateSemanticId(
      supabase,
      "ledger_entries",
      "LED",
      client.name,
      "CR"
    );
    
    await supabase.from("ledger_entries").insert([{
        id: ledgerId,
        client_id: body.client_id,
        date: data.payment_date,
        description: `Payment Received (${data.payment_mode})`,
        credit: data.amount,
        debit: 0,
        balance: 0 // Will dynamically calculate during fetch
    }]);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
