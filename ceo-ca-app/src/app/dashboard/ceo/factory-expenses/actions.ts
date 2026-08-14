"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFactoryExpense(formData: FormData) {
  const supabase = await createClient();

  const category = formData.get("category") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr);

  if (!category || isNaN(amount) || amount <= 0) {
    return { success: false, error: "Invalid expense data." };
  }

  const { error } = await supabase.from("factory_expenses").insert({
    category,
    amount
  });

  if (error) {
    console.error("Error adding factory expense:", error);
    return { success: false, error: "Database error." };
  }

  revalidatePath("/dashboard/ceo/factory-expenses");
  revalidatePath("/dashboard/ceo/finance");
  return { success: true };
}

export async function addFactoryAsset(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const purchaseValueStr = formData.get("purchase_value") as string;
  const currentValueStr = formData.get("current_value") as string;
  
  const purchaseValue = parseFloat(purchaseValueStr);
  const currentValue = parseFloat(currentValueStr);

  if (!name || isNaN(purchaseValue) || isNaN(currentValue)) {
    return { success: false, error: "Invalid asset data." };
  }

  const { error } = await supabase.from("factory_assets").insert({
    name,
    purchase_value: purchaseValue,
    current_value: currentValue
  });

  if (error) {
    console.error("Error adding factory asset:", error);
    return { success: false, error: "Database error." };
  }

  revalidatePath("/dashboard/ceo/factory-expenses");
  revalidatePath("/dashboard/ceo/finance");
  return { success: true };
}
