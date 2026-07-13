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

    // 1. Check duplicate coupon code
    const { data: duplicate } = await supabase
      .from("painter_coupons")
      .select("id")
      .eq("coupon_code", code)
      .maybeSingle();

    if (duplicate) throw new Error("Coupon already scanned");

    const points = code.includes("-500-") ? 500 : 200;

    // 2. Insert scanned coupon
    const { error } = await supabase
      .from("painter_coupons")
      .insert({
        painter_id: profile.id,
        coupon_code: code,
        points,
        status: "Pending",
        remarks: "Submitted via Painter Companion App Portal"
      });

    if (error) throw error;

    revalidatePath("/dashboard/painter");
    revalidatePath("/dashboard/painter/rewards/coupons");
    return { success: true, points };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPainterRewardsData() {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Painter profile not found");

    const [
      { data: coupons },
      { data: ledger },
      { data: catalog }
    ] = await Promise.all([
      supabase.from("painter_coupons").select("*").eq("painter_id", profile.id).order("scanned_at", { ascending: false }),
      supabase.from("painter_ledger").select("*").eq("painter_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("rewards_catalog").select("*").order("points", { ascending: true })
    ]);

    return {
      success: true,
      profile,
      coupons: coupons || [],
      ledger: ledger || [],
      catalog: catalog || []
    };
  } catch (err: any) {
    return { success: false, error: err.message, profile: null, coupons: [], ledger: [], catalog: [] };
  }
}

export async function redeemCatalogReward(itemId: string, itemPoints: number) {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Unauthorized access");

    if (Number(profile.total_tokens || 0) < itemPoints) {
      throw new Error("Insufficient points balance in rewards wallet");
    }

    // Subtract points from painter profile
    const newPoints = Number(profile.total_tokens || 0) - itemPoints;
    const { error: errUpdate } = await supabase
      .from("painters")
      .update({ total_tokens: newPoints })
      .eq("id", profile.id);

    if (errUpdate) throw errUpdate;

    // Log withdrawal
    const { error: errWithdraw } = await supabase
      .from("withdrawal_history")
      .insert({
        painter_id: profile.id,
        amount: itemPoints
      });

    if (errWithdraw) throw errWithdraw;

    revalidatePath("/dashboard/painter");
    revalidatePath("/dashboard/painter/rewards/store");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function getPainterPortfolioData() {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Painter profile not found");

    const [
      { data: projects },
      { data: reviews }
    ] = await Promise.all([
      supabase.from("painter_projects").select("*").eq("painter_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("painter_reviews").select("*").eq("painter_id", profile.id).order("created_at", { ascending: false })
    ]);

    return {
      success: true,
      profile,
      projects: projects || [],
      reviews: reviews || []
    };
  } catch (err: any) {
    return { success: false, error: err.message, profile: null, projects: [], reviews: [] };
  }
}

export async function createPainterProject(proj: any) {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Unauthorized access");

    const { error } = await supabase
      .from("painter_projects")
      .insert({
        painter_id: profile.id,
        project_name: proj.project_name,
        customer_name: proj.customer_name || null,
        project_type: proj.project_type || "Residential House",
        area_sqft: Number(proj.area_sqft || 0),
        description: proj.description || null,
        status: "Pending",
        rating: 5,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/painter/portfolio");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPainterReferrals() {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Painter profile not found");

    const { data: list, error } = await supabase
      .from("painters")
      .select("id, name, phone, status, total_tokens, created_at")
      .eq("referred_by", profile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      profile,
      list: list || []
    };
  } catch (err: any) {
    return { success: false, error: err.message, profile: null, list: [] };
  }
}

export async function getPainterEstimations() {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Painter profile not found");

    const { data: estimations, error } = await supabase
      .from("painter_estimations")
      .select("*")
      .eq("painter_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      profile,
      estimations: estimations || []
    };
  } catch (err: any) {
    return { success: false, error: err.message, profile: null, estimations: [] };
  }
}

export async function createPainterEstimation(est: any) {
  try {
    const supabase = await createAdminClient();
    const profile = await getActivePainter(supabase);
    if (!profile) throw new Error("Unauthorized access");

    const { error } = await supabase
      .from("painter_estimations")
      .insert({
        painter_id: profile.id,
        customer_name: est.customer_name,
        project_name: est.project_name,
        area_sqft: Number(est.area_sqft),
        material_cost: Number(est.material_cost || 0),
        labour_cost: Number(est.labour_cost || 0),
        total_cost: Number(est.material_cost || 0) + Number(est.labour_cost || 0),
        status: "Saved",
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    revalidatePath("/dashboard/painter/work/calculator");
    revalidatePath("/dashboard/painter/work/ai-assistant");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}



