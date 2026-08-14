"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getSalesTeamData() {
  try {
    const { data: executives, error: execErr } = await supabaseAdmin
      .from("sales_executives")
      .select("*")
      .order("name", { ascending: true });
    if (execErr) throw execErr;

    const { data: visits, error: visitErr } = await supabaseAdmin
      .from("sales_visits")
      .select("*")
      .order("visit_date", { ascending: false });
    if (visitErr) throw visitErr;

    const { data: collections, error: colErr } = await supabaseAdmin
      .from("sales_collections")
      .select("*")
      .order("payment_date", { ascending: false });
    if (colErr) throw colErr;

    const { data: activities, error: actErr } = await supabaseAdmin
      .from("sales_activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (actErr) throw actErr;

    const { data: inputs, error: inputErr } = await supabaseAdmin
      .from("sales_inputs")
      .select("*")
      .order("issued_date", { ascending: false });
    if (inputErr) throw inputErr;

    return {
      success: true,
      data: {
        executives: executives || [],
        visits: visits || [],
        collections: collections || [],
        activities: activities || [],
        inputs: inputs || []
      }
    };
  } catch (err: any) {
    console.error("Error fetching sales team data:", err);
    return { success: false, error: err.message };
  }
}

export async function onboardSalesman(payload: {
  name: string;
  phone: string;
  email: string;
  designation: string;
  salary: number;
  incentive_rate: number;
  aadhar: string;
  pan: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  emergencyContact: string;
}) {
  try {
    const id = `SS-${Date.now().toString().slice(-4)}`;
    const { error } = await supabaseAdmin
      .from("sales_executives")
      .insert({
        id,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        designation: payload.designation,
        salary: payload.salary,
        incentive_rate: payload.incentive_rate,
        aadhar: payload.aadhar,
        pan: payload.pan,
        bank_name: payload.bankName,
        account_no: payload.accountNo,
        ifsc: payload.ifsc,
        emergency_contact: payload.emergencyContact,
        status: "Pending",
        date_of_joining: "Pending Approval"
      });

    if (error) throw error;

    revalidatePath("/dashboard/admin/sales-team");
    return { success: true };
  } catch (err: any) {
    console.error("Error onboarding salesman:", err);
    return { success: false, error: err.message };
  }
}

export async function approveSalesman(id: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabaseAdmin
      .from("sales_executives")
      .update({
        status: "Approved",
        date_of_joining: today
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/admin/sales-team");
    return { success: true };
  } catch (err: any) {
    console.error("Error approving salesman:", err);
    return { success: false, error: err.message };
  }
}

export async function updateSalesmanTarget(id: string, targetMonthly: number) {
  try {
    const { error } = await supabaseAdmin
      .from("sales_executives")
      .update({ target_monthly: targetMonthly })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/admin/sales-team");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating salesman target:", err);
    return { success: false, error: err.message };
  }
}
