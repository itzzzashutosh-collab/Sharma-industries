"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDealers() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "dealer")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dealers:", error);
    return [];
  }
  return data || [];
}

export async function toggleDealerStatus(userId: string, isActive: boolean) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/dashboard/ceo/dealers");
  return { success: true };
}

export async function approveDealer(userId: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ is_approved: true, is_active: true })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/dashboard/ceo/dealers");
  return { success: true };
}

export async function updateDealerProfile(userId: string, data: { address: string; territory: string }) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ address: data.address, territory: data.territory })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/dashboard/ceo/dealers");
  return { success: true };
}

export async function getDealerInvoices(dealerId: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", dealerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dealer invoices:", error);
    return [];
  }
  return data || [];
}
