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
