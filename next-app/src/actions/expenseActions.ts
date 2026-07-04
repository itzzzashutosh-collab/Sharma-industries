"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function recordExpense(data: { expense_name: string, category: string, amount: number, due_date?: string }) {
  try {
    const { error } = await supabaseAdmin.from("factory_expenses").insert([{
      id: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      expense_name: data.expense_name,
      category: data.category,
      amount: data.amount,
      due_date: data.due_date || null,
      status: "PENDING"
    }]);

    if (error) throw error;
    
    revalidatePath("/dashboard/factory/expenses");
    return { success: true };
  } catch (err: any) {
    console.error("Error recording expense:", err);
    return { success: false, error: err.message };
  }
}

export async function markAsPaid(expenseId: string, paymentDetails: { payment_mode: string }) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabaseAdmin
      .from("factory_expenses")
      .update({
        status: "PAID",
        paid_date: today,
        payment_mode: paymentDetails.payment_mode
      })
      .eq("id", expenseId);

    if (error) throw error;

    // Trigger revalidation for Master Dashboard and Factory Expenses so profit figures update
    revalidatePath("/dashboard/factory/expenses");
    revalidatePath("/dashboard/ceo");
    
    return { success: true };
  } catch (err: any) {
    console.error("Error marking expense as paid:", err);
    return { success: false, error: err.message };
  }
}

export async function getExpenses() {
  try {
    const { data, error } = await supabaseAdmin
      .from("factory_expenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Grouping logic for the frontend
    const daily: any[] = [];
    const permanent: any[] = [];

    data?.forEach(expense => {
      if (expense.category === 'DAILY') {
        daily.push(expense);
      } else if (expense.category === 'PERMANENT') {
        permanent.push(expense);
      }
    });

    return { success: true, data: { daily, permanent } };
  } catch (err: any) {
    console.error("Error fetching expenses:", err);
    return { success: false, error: err.message };
  }
}
