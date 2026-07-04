import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { painterId, amount } = await request.json();

    if (!painterId || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing painterId or invalid amount." },
        { status: 400 }
      );
    }

    // 1. Get painter balance
    const { data: painter, error: painterErr } = await supabase
      .from("painters")
      .select("total_tokens, total_redeemed")
      .eq("id", painterId)
      .single();

    if (painterErr || !painter) {
      return NextResponse.json(
        { success: false, error: "Painter not found." },
        { status: 404 }
      );
    }

    const currentBalance = painter.total_tokens || 0;
    const currentRedeemed = painter.total_redeemed || 0;
    if (currentBalance < amount) {
      return NextResponse.json(
        { success: false, error: "Insufficient token balance." },
        { status: 400 }
      );
    }

    const newBalance = currentBalance - amount;
    const newRedeemed = currentRedeemed + amount;

    // 2. processWithdrawal - Deduct total_tokens and increment total_redeemed
    const { error: deductErr } = await supabase
      .from("painters")
      .update({ 
        total_tokens: newBalance,
        total_redeemed: newRedeemed
      })
      .eq("id", painterId);

    if (deductErr) throw deductErr;

    // 3. Create a record in withdrawal_history
    const { error: histErr } = await supabase
      .from("withdrawal_history")
      .insert({
        painter_id: painterId,
        amount: amount,
      });

    if (histErr) {
      // Rollback painter total_tokens & total_redeemed if history insert fails
      await supabase.from("painters").update({ 
        total_tokens: currentBalance,
        total_redeemed: currentRedeemed
      }).eq("id", painterId);
      throw histErr;
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal processed successfully.",
      debitedAmount: amount,
      remainingTokens: newBalance,
    });
  } catch (err: any) {
    console.error("Withdrawal error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
