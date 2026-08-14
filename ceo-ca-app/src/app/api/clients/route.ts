import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { generateSemanticId } from "@/lib/idGenerator";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true }).limit(10000);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createAdminClient();

    const newClientId = await generateSemanticId(
      supabase,
      "clients",
      "CL",
      body.name,
      body.pincode || body.state_code || "XX"
    );

    const { data, error } = await supabase
      .from("clients")
      .insert([{ ...body, id: newClientId }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
