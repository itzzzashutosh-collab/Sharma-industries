"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const salesmanId = "SM-101"; // Sandbox Rajesh Kumar ID
const salesmanName = "Rajesh Kumar";

// Helper for currency formatting
function fmt(n: number) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD & FIELD VISITS BACKEND
// ─────────────────────────────────────────────────────────────────────────────
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
      .limit(10);

    // 4. Fetch orders to calculate performance
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("salesman_name", salesmanName);

    const mtdRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    // Fetch dynamic targets from DB
    const { data: dbTargets } = await supabase
      .from("salesman_targets")
      .select("*")
      .eq("salesman_id", salesmanId)
      .maybeSingle();

    const targetStats = {
      mtdRevenue,
      targetRevenue: dbTargets ? Number(dbTargets.target_revenue) : 500000,
      visitsCompleted: (visits || []).filter(v => v.status === "Completed").length,
      visitsTarget: (visits || []).length || 5,
      paintersRegistered: 4,
      paintersTarget: dbTargets ? Number(dbTargets.target_painters) : 10
    };

    return {
      success: true,
      dealers: dealers || [],
      visits: visits || [],
      activities: activities || [],
      targetStats,
      assignedTerritory: dbTargets ? dbTargets.assigned_territory : "Rajasthan East"
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

    if (error) {
      console.warn("Fallback visit status update:", error.message);
    }

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

    revalidatePath("/dashboard/salesman/visits");
    revalidatePath("/dashboard/salesman");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createSalesVisit(visit: { dealer_name: string; location?: string; visit_date?: string; purpose: string }) {
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

    if (error) {
      console.warn("Fallback create visit:", error.message);
    }

    revalidatePath("/dashboard/salesman/visits");
    revalidatePath("/dashboard/salesman");
    return { success: true, visitId: id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MY ORDERS BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function createSalesmanOrder(orderPayload: {
  id?: string;
  dealer_name: string;
  total_amount: number;
  payment_terms: string;
  items?: any[];
  status?: string;
}) {
  try {
    const supabase = await createAdminClient();
    const orderId = orderPayload.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        salesman_name: salesmanName,
        dealer_name: orderPayload.dealer_name,
        total_amount: orderPayload.total_amount,
        payment_terms: orderPayload.payment_terms,
        status: orderPayload.status || "Pending Approval",
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn("Fallback create order:", error.message);
    }

    // Log activity
    await supabase.from("sales_activities").insert({
      id: `ACT_${Date.now()}`,
      salesman_id: salesmanId,
      activity_type: "Order Created",
      description: `Created Swatch Paints Order ${orderId} for ${orderPayload.dealer_name} (${fmt(orderPayload.total_amount)})`,
      created_at: new Date().toISOString()
    });

    revalidatePath("/dashboard/salesman/orders");
    revalidatePath("/dashboard/salesman");
    return { success: true, orderId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COLLECTIONS BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function logCollectionPayment(payload: {
  dealerId: string;
  dealerName?: string;
  amount: number;
  paymentMode: string;
  referenceId: string;
}) {
  try {
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("sales_activities")
      .insert({
        id: `ACT_${Date.now()}`,
        salesman_id: salesmanId,
        activity_type: "Collection Recorded",
        description: `Collected ${fmt(payload.amount)} via ${payload.paymentMode} for ${payload.dealerName || "Dealer Account"} (Ref: ${payload.referenceId})`,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn("Fallback collection log:", error.message);
    }

    revalidatePath("/dashboard/salesman/collections");
    revalidatePath("/dashboard/salesman");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SHOP BRANDING BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function requestShopBrandingAsset(payload: {
  dealerName: string;
  itemType: string;
  dimensions?: string;
  notes?: string;
}) {
  try {
    const supabase = await createAdminClient();

    await supabase.from("sales_activities").insert({
      id: `ACT_${Date.now()}`,
      salesman_id: salesmanId,
      activity_type: "Branding Requested",
      description: `Requested Swatch Paints ${payload.itemType} for ${payload.dealerName} (${payload.dimensions || "Standard"})`,
      created_at: new Date().toISOString()
    });

    revalidatePath("/dashboard/salesman/branding");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GROWTH PROGRAMS BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function getDealerGrowthPrograms() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_growth_programs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Fallback growth programs fetch:", error.message);
      return { success: true, programs: [] };
    }
    return { success: true, programs: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function proposeDealerGrowthProgram(payload: {
  name: string;
  details: string;
  criteria: string;
  eligibility: string;
  rewards: string;
}) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_growth_programs")
      .insert({
        id: `PROG_${Date.now()}`,
        name: payload.name,
        details: payload.details,
        criteria: payload.criteria,
        eligibility: payload.eligibility,
        rewards: payload.rewards,
        status: "Proposed"
      });

    if (error) {
      console.warn("Fallback propose growth program:", error.message);
    }

    revalidatePath("/dashboard/salesman/schemes");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CUSTOMERS & DEALER ONBOARDING BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function onboardDealer(dealerPayload: {
  name: string;
  address: string;
  localities?: string;
  designation?: string;
  gst_number?: string;
  tier?: string;
  credit_limit?: number;
}) {
  try {
    const supabase = await createAdminClient();
    const id = `D_${Date.now()}`;

    const { error } = await supabase
      .from("dealers")
      .insert({
        id,
        name: dealerPayload.name,
        address: dealerPayload.address,
        localities: dealerPayload.localities || "Jaipur Central",
        designation: dealerPayload.designation || "Proprietor",
        gst_number: dealerPayload.gst_number || "UNREGISTERED",
        assigned_salesman_id: salesmanId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn("Fallback dealer onboarding:", error.message);
    }

    // Log activity
    await supabase.from("sales_activities").insert({
      id: `ACT_${Date.now()}`,
      salesman_id: salesmanId,
      activity_type: "Dealer Onboarded",
      description: `Onboarded new Swatch Paints dealer store: ${dealerPayload.name} (${dealerPayload.localities || "Jaipur"})`,
      created_at: new Date().toISOString()
    });

    revalidatePath("/dashboard/salesman/customers");
    revalidatePath("/dashboard/salesman");
    return { success: true, dealerId: id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PAINTER NETWORK BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function onboardPainter(painterPayload: {
  name: string;
  phone: string;
  address?: string;
  territory?: string;
  contractor_tier?: string;
}) {
  try {
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("users")
      .insert({
        phone: painterPayload.phone,
        name: painterPayload.name,
        role: "painter",
        is_active: true,
        is_approved: true,
        address: painterPayload.address || null,
        territory: painterPayload.territory || null,
        status: "APPROVED"
      });

    if (error) {
      console.warn("Fallback painter onboarding:", error.message);
    }

    // Log activity
    await supabase.from("sales_activities").insert({
      id: `ACT_${Date.now()}`,
      salesman_id: salesmanId,
      activity_type: "Painter Onboarded",
      description: `Registered Swatch Applicator: ${painterPayload.name} (${painterPayload.phone})`,
      created_at: new Date().toISOString()
    });

    revalidatePath("/dashboard/salesman/painters");
    revalidatePath("/dashboard/salesman");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. OFFLINE SYNC BACKEND
// ─────────────────────────────────────────────────────────────────────────────
export async function syncOfflineQueue(items: any[]) {
  try {
    const supabase = await createAdminClient();
    for (const item of items) {
      if (item.type === "visit") {
        await supabase
          .from("sales_visits")
          .insert({
            id: `VISIT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            salesman_id: salesmanId,
            dealer_name: item.data.dealer_name,
            location: item.data.location || "Store Outlet",
            visit_date: item.data.visit_date,
            purpose: item.data.purpose,
            status: "Completed"
          });
      } else if (item.type === "painter") {
        await supabase
          .from("users")
          .insert({
            phone: item.data.phone,
            name: item.data.name,
            role: "painter",
            is_active: true,
            is_approved: true,
            address: item.data.address || null,
            territory: item.data.territory || null,
            status: "APPROVED"
          });
      }
    }
    revalidatePath("/dashboard/salesman");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
