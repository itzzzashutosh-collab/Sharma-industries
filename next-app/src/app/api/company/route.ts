import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("company_details").select("*").eq("id", "1").single();

    if (error) {
      if (error.code === "PGRST116") return NextResponse.json({ success: true, data: null });
      throw error;
    }

    // Map database snake_case to frontend camelCase
    const mappedData = {
      companyName: data.company_name,
      ownerName: data.owner_name,
      address: data.address,
      stateCode: data.state_code,
      pincode: data.pincode,
      gstin: data.gstin,
      phone: data.phone,
      bankName: data.bank_name || "",
      accountNumber: data.account_number || "",
      ifsc: data.ifsc_code || "",
      upiId: data.upi_id || "",
      signature_url: data.signature_url, // InvoiceEngine specifically looks for signature_url
      termsAndConditions: data.terms_and_conditions || "",
      notes: data.notes || "",
      companyStampUrl: data.company_stamp_url || ""
    };

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createAdminClient();

    const payload = {
      id: "1",
      company_name: body.companyName,
      address: body.address,
      state_code: body.stateCode,
      gstin: body.gstin,
      phone: body.phone,
      bank_details: {
        bank_name: body.bankName,
        ac_number: body.accountNumber,
        ifsc: body.ifsc,
        upi_id: body.upiId
      },
      signature_url: body.signature_url || body.signatureUrl
    };

    const { data, error } = await supabase
      .from("company_details")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
