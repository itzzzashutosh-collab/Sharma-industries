import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const painterId = searchParams.get("painterId");

    if (!painterId) {
      return NextResponse.json(
        { success: false, error: "Missing painterId parameter." },
        { status: 400 }
      );
    }

    // 1. Get painter details
    const { data: painter, error: painterErr } = await supabase
      .from("painters")
      .select("*")
      .eq("id", painterId)
      .single();

    // If painter isn't in main DB yet (still pending), return default zero values
    if (painterErr || !painter) {
      return NextResponse.json({
        success: true,
        data: {
          total_tokens: 0,
          scanned_bags: 0,
          withdrawal_history: []
        }
      });
    }

    // 2. Count scanned bags
    const { count: scannedBags, error: scanErr } = await supabase
      .from("qr_registry")
      .select("*", { count: "exact", head: true })
      .eq("scanned_by", painterId);

    if (scanErr) throw scanErr;

    // 3. Get withdrawal history
    const { data: withdrawals, error: withdrawErr } = await supabase
      .from("withdrawal_history")
      .select("*")
      .eq("painter_id", painterId)
      .order("created_at", { ascending: false });

    if (withdrawErr) throw withdrawErr;

    return NextResponse.json({
      success: true,
      data: {
        ...painter,
        scanned_bags: scannedBags || 0,
        withdrawal_history: withdrawals || []
      }
    });
  } catch (err: any) {
    console.error("Fetch painter profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
