"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addExpense(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // In a real app we would get the dealer_id from the session. 
    // Using a dummy dealer ID for the demonstration or 'null' to let the DB handle it or fetch from users.
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (!category || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount or category." };
    }

    const { error } = await supabase.from("dealer_expenses").insert({
      category,
      amount,
      expense_date: new Date().toISOString().split("T")[0],
      // dealer_id: 'USR_DLR_002' // using default or letting RLS handle it if setup
    });

    if (error) {
      console.error("Error inserting expense:", error);
      return { success: false, error: "Failed to add expense." };
    }

    revalidatePath("/dashboard/dealer/pnl");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Unexpected error occurred." };
  }
}
