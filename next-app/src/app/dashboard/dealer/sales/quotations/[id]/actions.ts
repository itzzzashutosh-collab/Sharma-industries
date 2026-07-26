"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDealerQuotationStatus(id: string, status: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("quotations")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating quotation status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/dealer/sales/quotations/${id}`);
    revalidatePath("/dashboard/dealer/sales/quotations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
