"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const salesmanId = "SM-101"; // Sandbox Rajesh Kumar ID
const salesmanName = "Rajesh Kumar";

export async function getSalesmanDashboardData() {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch assigned dealers
    const { data: dealers } = await supabase
      .from("dealers")
      .select("*")
      .eq("assigned_salesman_id", salesmanId);

    // 2. Fetch today's scheduled visits
    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: visits } = await supabase
      .from("sales_visits")
      .select("*")
      .eq("salesman_id", salesmanId)
      .eq("visit_date", todayStr);

    // 3. Fetch recent activities
    const { data: activities } = await supabase
      .from("sales_activities")
      .select("*")
      .eq("salesman_id", salesmanId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 4. Fetch orders to calculate performance
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("salesman_name", salesmanName);

    const mtdRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const targetStats = {
      mtdRevenue,
      targetRevenue: 500000,
      visitsCompleted: (visits || []).filter(v => v.status === "Completed").length,
      visitsTarget: (visits || []).length || 5,
      paintersRegistered: 4,
      paintersTarget: 10
    };

    return {
      success: true,
      dealers: dealers || [],
      visits: visits || [],
      activities: activities || [],
      targetStats
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSalesVisitStatus(visitId: string, status: string, outcome: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("sales_visits")
      .update({ status, outcome })
      .eq("id", visitId);

    if (error) throw error;

    // Log in activities
    await supabase
      .from("sales_activities")
      .insert({
        id: `ACT_${Date.now()}`,
        salesman_id: salesmanId,
        activity_type: "Visit Updated",
        description: `Marked visit as ${status}: ${outcome}`,
        created_at: new Date().toISOString()
      });

    revalidatePath("/dashboard/salesman");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createSalesVisit(visit: any) {
  try {
    const supabase = await createAdminClient();
    const id = `VISIT_${Date.now()}`;
    const { error } = await supabase
      .from("sales_visits")
      .insert({
        id,
        salesman_id: salesmanId,
        dealer_name: visit.dealer_name,
        location: visit.location || "Store Outlet",
        visit_date: visit.visit_date || new Date().toISOString().slice(0, 10),
        purpose: visit.purpose,
        status: "Pending"
      });

    if (error) throw error;

    revalidatePath("/dashboard/salesman");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
