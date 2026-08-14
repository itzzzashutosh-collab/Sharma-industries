"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getFactoryDashboardData() {
  try {
    const { data: batches, error: batchErr } = await supabaseAdmin
      .from("production_batches")
      .select("id, product_id, status, quantity_produced, target_yield, batch_date, products(product_name)")
      .order("batch_date", { ascending: false });
    if (batchErr) throw batchErr;

    const { data: rawMaterials, error: matErr } = await supabaseAdmin
      .from("raw_materials")
      .select("*")
      .order("material_name", { ascending: true });
    if (matErr) throw matErr;

    const { data: labor, error: labErr } = await supabaseAdmin
      .from("factory_labor")
      .select("*")
      .order("name", { ascending: true });
    if (labErr) throw labErr;

    const today = new Date().toISOString().split("T")[0];
    const { data: attendance, error: attErr } = await supabaseAdmin
      .from("labor_attendance")
      .select("*")
      .eq("attendance_date", today);
    if (attErr) throw attErr;

    const { data: expenses, error: expErr } = await supabaseAdmin
      .from("factory_expenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (expErr) throw expErr;

    return {
      success: true,
      data: {
        batches: batches || [],
        rawMaterials: rawMaterials || [],
        labor: labor || [],
        attendance: attendance || [],
        expenses: expenses || []
      }
    };
  } catch (err: any) {
    console.error("Error fetching factory data:", err);
    return { success: false, error: err.message };
  }
}

export async function startNewProductionBatch(productId: string, targetYield: number) {
  try {
    const id = `BATCH-${Date.now().toString().slice(-4)}`;
    const { error } = await supabaseAdmin
      .from("production_batches")
      .insert({
        id,
        product_id: productId,
        target_yield: targetYield,
        status: "IN_PROGRESS",
        batch_date: new Date().toISOString().split("T")[0]
      });

    if (error) throw error;

    revalidatePath("/dashboard/factory");
    return { success: true };
  } catch (err: any) {
    console.error("Error starting batch:", err);
    return { success: false, error: err.message };
  }
}

export async function markLaborAttendance(laborId: string, status: "Present" | "Absent") {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Check if attendance already exists for today
    const { data: existing } = await supabaseAdmin
      .from("labor_attendance")
      .select("id")
      .eq("labor_id", laborId)
      .eq("attendance_date", today)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("labor_attendance")
        .update({ status })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("labor_attendance")
        .insert({
          labor_id: laborId,
          attendance_date: today,
          status
        });
      if (error) throw error;
    }

    revalidatePath("/dashboard/factory");
    return { success: true };
  } catch (err: any) {
    console.error("Error marking attendance:", err);
    return { success: false, error: err.message };
  }
}

export async function logFactoryExpense(payload: {
  expenseName: string;
  category: string;
  amount: number;
  dueDate: string;
}) {
  try {
    const id = `EXP_${Date.now().toString().slice(-4)}`;
    const { error } = await supabaseAdmin
      .from("factory_expenses")
      .insert({
        id,
        expense_name: payload.expenseName,
        category: payload.category,
        amount: payload.amount,
        due_date: payload.dueDate,
        status: "PENDING"
      });

    if (error) throw error;

    revalidatePath("/dashboard/factory");
    return { success: true };
  } catch (err: any) {
    console.error("Error logging expense:", err);
    return { success: false, error: err.message };
  }
}
