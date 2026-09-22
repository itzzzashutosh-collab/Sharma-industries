"use server";

import { createAdminClient } from "@/utils/supabase/server";

export async function approveUser(userId: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("pending_users")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
