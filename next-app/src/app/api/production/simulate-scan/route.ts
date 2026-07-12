import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { qrCode, painterId } = await request.json();

    if (!qrCode || !painterId) {
      return NextResponse.json(
        { success: false, error: "Missing qrCode or painterId." },
        { status: 400 }
      );
    }

    // 1. Fetch QR code details
    const { data: qr, error: qrErr } = await supabase
      .from("qr_registry")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (qrErr || !qr) {
      return NextResponse.json(
        { success: false, error: "QR Coupon Code not found in registry." },
        { status: 404 }
      );
    }

    if (qr.is_scanned) {
      return NextResponse.json(
        { success: false, error: "This QR coupon has already been redeemed." },
        { status: 400 }
      );
    }

    // 2. Fetch painter details
    const { data: painter, error: painterErr } = await supabase
      .from("painters")
      .select("*")
      .eq("id", painterId)
      .single();

    if (painterErr || !painter) {
      return NextResponse.json(
        { success: false, error: "Selected Painter not found." },
        { status: 404 }
      );
    }

    const rewardValue = Number(qr.token_value) || 50;

    // 3. Mark coupon as scanned and update tracking fields
    const { error: updateQrErr } = await supabase
      .from("qr_registry")
      .update({
        is_scanned: true,
        scanned_by: painterId,
        scanned_at: new Date().toISOString(),
        status: "SCANNED"
      })
      .eq("qr_code", qrCode);

    if (updateQrErr) throw updateQrErr;

    // 4. Credit painter total_tokens in database
    const currentTokens = Number(painter.total_tokens) || 0;
    const newTokens = currentTokens + rewardValue;

    const { error: updatePainterErr } = await supabase
      .from("painters")
      .update({
        total_tokens: newTokens
      })
      .eq("id", painterId);

    if (updatePainterErr) throw updatePainterErr;

    return NextResponse.json({
      success: true,
      message: `Coupon redeemed successfully! ₹${rewardValue} credited to ${painter.name}.`,
      rewardValue,
      painterName: painter.name,
      newBalance: newTokens
    });
  } catch (err: any) {
    console.error("Simulate Scan Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
