import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: qrs, error } = await supabase
      .from("qr_registry")
      .select("qr_code, scanned_by, scanned_at, token_value, product_id, dealer_id, is_scanned, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: qrs
    });
  } catch (err: any) {
    console.error("List QRs error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
