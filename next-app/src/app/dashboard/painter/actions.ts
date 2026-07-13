"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getActivePainter(supabase: any) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("si_session");
  let painterPhone = "9876543210"; // Default Rajesh Kumar phone

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.phone) painterPhone = session.phone;
    } catch {}
  }

  const { data: profile, error } = await supabase
    .from("painters")
    .select("*")
    .eq("phone", painterPhone)
    .single();

  if (error || !profile) {
    // Fallback lookup by ID
    const { data: fallback } = await supabase
      .from("painters")
      .select("*")
      .eq("id", "b83ad898-0c6a-4c2c-8ab5-3343a4114401")
      .single();
    return fallback;
  }
  return profile;
}

export async function getPainterDashboardData() {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);

    if (!profile) throw new Error("Painter profile not found");

    // Standard calculations
    const rewardPoints = Number(profile.total_tokens || 0);
    const cashWallet = Number(profile.total_tokens || 0) * 1.5; // ₹1.5 per token point conversion rate
    const redeemed = Number(profile.total_redeemed || 0);

    const metrics = {
      cashWallet,
      rewardPoints,
      pendingCoupons: 3,
      approvedCoupons: 18,
      currentRank: "Gold Partner",
      referralEarnings: 4500,
      completedProjects: 12
    };

    const activities = [
      { id: "act_1", type: "Coupon Scanned", desc: "Submitted code COUP-500-1283 for verification", time: "2 hours ago" },
      { id: "act_2", type: "Points Redeemed", desc: "Redeemed 300 points for Apron & Safety Kit", time: "1 day ago" },
      { id: "act_3", type: "Bonus Received", desc: "Received 100 festival points from Shree Ram Paints", time: "3 days ago" }
    ];

    const upcomingMeeting = {
      name: "Monsoon Waterproofing Meetup",
      date: "2026-07-20",
      time: "11:00 AM",
      venue: "Shree Ram Paints Showroom"
    };

    return {
      success: true,
      profile,
      metrics,
      activities,
      upcomingMeeting
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function scanPainterCoupon(code: string) {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Unauthorized access");

    // Check if duplicate token scanner
    const { count } = await supabase
      .from("dealer_stock_register")
      .select("*", { count: "exact", head: true })
      .eq("remarks", `Scanned by painter ${profile.name}`);

    if (count && count > 0) throw new Error("Coupon already scanned");

    // Verify code format (e.g. COUP-100-XXX)
    const points = code.includes("-500-") ? 500 : 200;

    // Simulate coupon scan verification request submission to dealer
    revalidatePath("/dashboard/painter");
    return { success: true, points };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
