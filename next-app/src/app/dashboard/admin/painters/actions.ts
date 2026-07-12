"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── 1. REDEEM PAINTER POINTS ───
export async function redeemPainterPoints(painterId: string, points: number) {
  try {
    const supabase = await createAdminClient();
    
    const { data: painter, error: fetchErr } = await supabase
      .from("painters")
      .select("total_tokens, total_redeemed")
      .eq("id", painterId)
      .single();

    if (fetchErr || !painter) throw new Error("Painter not found");

    const tokens = Number(painter.total_tokens) || 0;
    const redeemed = Number(painter.total_redeemed) || 0;

    if (tokens < points) {
      throw new Error("Insufficient tokens balance");
    }

    const { error: updateErr } = await supabase
      .from("painters")
      .update({
        total_tokens: tokens - points,
        total_redeemed: redeemed + points
      })
      .eq("id", painterId);

    if (updateErr) throw updateErr;

    // Log to a transaction table if available, otherwise complete
    revalidatePath("/dashboard/admin/painters");
    return { success: true };
  } catch (err: any) {
    console.error("Error in redeemPainterPoints server action:", err);
    return { success: false, error: err.message };
  }
}

// ─── 2. PROCESS PAINTER PAYOUT ───
export async function processPainterPayout(painterId: string, amount: number) {
  try {
    const supabase = await createAdminClient();
    
    const { data: painter, error: fetchErr } = await supabase
      .from("painters")
      .select("total_tokens, total_redeemed")
      .eq("id", painterId)
      .single();

    if (fetchErr || !painter) throw new Error("Painter not found");

    const tokens = Number(painter.total_tokens) || 0;
    const redeemed = Number(painter.total_redeemed) || 0;

    if (tokens < amount) {
      throw new Error("Insufficient balance to process cash payout");
    }

    const { error: updateErr } = await supabase
      .from("painters")
      .update({
        total_tokens: tokens - amount,
        total_redeemed: redeemed + amount
      })
      .eq("id", painterId);

    if (updateErr) throw updateErr;

    revalidatePath("/dashboard/admin/painters");
    return { success: true };
  } catch (err: any) {
    console.error("Error in processPainterPayout server action:", err);
    return { success: false, error: err.message };
  }
}

// ─── 3. APPROVE PAINTER PROFILE ───
export async function approvePainter(painterId: string) {
  try {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
      .from("painters")
      .update({ status: "approved" })
      .eq("id", painterId);

    if (error) throw error;

    revalidatePath("/dashboard/admin/painters");
    return { success: true };
  } catch (err: any) {
    console.error("Error in approvePainter server action:", err);
    return { success: false, error: err.message };
  }
}

// ─── 4. ADD NEW REWARD TO CATALOG ───
export async function addRewardItem({ name, points, category }: { name: string; points: number; category: string }) {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from("rewards_catalog")
      .insert([{ name, points, category }])
      .select();

    if (error) throw error;

    revalidatePath("/dashboard/admin/painters");
    return { success: true, item: data[0] as { id: string; name: string; points: number; category: string } };
  } catch (err: any) {
    console.error("Error in addRewardItem server action:", err);
    return { success: false, error: err.message, item: undefined };
  }
}

// ─── 5. ADD NEW SCHEME ───
export async function addScheme({ title, description, start_date, end_date, points_multiplier }: {
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  points_multiplier: number;
}) {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from("schemes")
      .insert([{ 
        title, 
        description, 
        start_date: start_date || null, 
        end_date: end_date || null, 
        points_multiplier 
      }])
      .select();

    if (error) throw error;

    revalidatePath("/dashboard/admin/painters");
    return { success: true, scheme: data[0] as { id: string; title: string; description: string | null; start_date: string | null; end_date: string | null; points_multiplier: number } };
  } catch (err: any) {
    console.error("Error in addScheme server action:", err);
    return { success: false, error: err.message, scheme: undefined };
  }
}

// ─── 6. ADD NEW COMPETITION ───
export async function addCompetition({ title, description, rules, criteria, start_date, end_date }: {
  title: string;
  description: string | null;
  rules: string;
  criteria: string;
  start_date: string | null;
  end_date: string | null;
}) {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from("competitions")
      .insert([{ 
        title, 
        description, 
        rules, 
        criteria, 
        start_date: start_date || null, 
        end_date: end_date || null 
      }])
      .select();

    if (error) throw error;

    revalidatePath("/dashboard/admin/painters");
    return { success: true, competition: data[0] as { id: string; title: string; description: string | null; rules: string | null; criteria: string | null; start_date: string | null; end_date: string | null } };
  } catch (err: any) {
    console.error("Error in addCompetition server action:", err);
    return { success: false, error: err.message, competition: undefined };
  }
}
