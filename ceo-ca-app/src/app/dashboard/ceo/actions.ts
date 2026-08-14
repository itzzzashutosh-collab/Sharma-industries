"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
  try {
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("users")
      .update({ is_approved: true })
      .eq("id", userId);

    if (error) {
      console.error("Error approving user:", error);
      return { success: false, error: "Failed to approve user." };
    }

    // Revalidate the CEO dashboard to update the table immediately
    revalidatePath("/dashboard/ceo");
    return { success: true };
  } catch (err) {
    console.error("Exception in approveUser:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function getSalesmanTargets() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("salesman_targets")
      .select("*")
      .order("salesman_name", { ascending: true });

    if (error) throw error;
    return { success: true, targets: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSalesmanTarget(payload: {
  salesmanId: string;
  targetRevenue: number;
  targetCollections: number;
  targetPainters: number;
  assignedTerritory: string;
}) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("salesman_targets")
      .update({
        target_revenue: payload.targetRevenue,
        target_collections: payload.targetCollections,
        target_painters: payload.targetPainters,
        assigned_territory: payload.assignedTerritory,
        updated_at: new Date().toISOString()
      })
      .eq("salesman_id", payload.salesmanId);

    if (error) throw error;

    revalidatePath("/dashboard/ceo/sales-intelligence");
    revalidatePath("/dashboard/salesman/performance");
    revalidatePath("/dashboard/salesman/territory");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

