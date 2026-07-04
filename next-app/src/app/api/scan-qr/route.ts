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

    // 1. Fetch and validate QR code
    const { data: qrData, error: qrError } = await supabase
      .from("qr_registry")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (qrError || !qrData) {
      return NextResponse.json(
        { success: false, error: "QR Code not found in registry." },
        { status: 404 }
      );
    }

    if (qrData.is_scanned) {
      return NextResponse.json(
        { success: false, error: "QR Code has already been scanned." },
        { status: 400 }
      );
    }

    // 2. Retrieve painter details
    const { data: painter, error: painterError } = await supabase
      .from("painters")
      .select("*")
      .eq("id", painterId)
      .single();

    if (painterError || !painter) {
      return NextResponse.json(
        { success: false, error: "Painter not found." },
        { status: 404 }
      );
    }

    let tokenValue = qrData.token_value || 10;
    if (qrData.product_id) {
      const { data: prod } = await supabase
        .from("products")
        .select("token_value")
        .eq("id", qrData.product_id)
        .single();
      if (prod && prod.token_value !== null && prod.token_value !== undefined) {
        tokenValue = prod.token_value;
      }
    }
    const newTotal = (painter.total_tokens || 0) + tokenValue;

    // 3. Update Painter's total_tokens
    const { error: updatePainterError } = await supabase
      .from("painters")
      .update({ total_tokens: newTotal })
      .eq("id", painterId);

    if (updatePainterError) throw updatePainterError;

    // 4. Update QR status to scanned
    const { error: updateQrError } = await supabase
      .from("qr_registry")
      .update({
        is_scanned: true,
        status: "SCANNED",
        scanned_by: painterId,
        scanned_at: new Date().toISOString(),
      })
      .eq("id", qrData.id);

    if (updateQrError) throw updateQrError;

    return NextResponse.json({
      success: true,
      message: "QR scanned and tokens credited successfully.",
      creditedTokens: tokenValue,
      newTotalTokens: newTotal,
      dealerId: qrData.dealer_id,
    });
  } catch (err: any) {
    console.error("Scan QR error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
