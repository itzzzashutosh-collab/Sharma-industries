"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getRawMaterials() {
  try {
    const { data, error } = await supabaseAdmin
      .from("raw_materials")
      .select("*")
      .order("material_name", { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching raw materials:", err);
    return { success: false, error: err.message };
  }
}

export async function getRecentPurchases(filter: string = 'all') {
  try {
    let query = supabaseAdmin
      .from("purchase_master")
      .select("*")
      .order("bill_date", { ascending: false });

    const date = new Date();
    if (filter === 'year') {
      date.setFullYear(date.getFullYear() - 1);
      query = query.gte('bill_date', date.toISOString().split('T')[0]);
    } else if (filter === 'month') {
      date.setMonth(date.getMonth() - 1);
      query = query.gte('bill_date', date.toISOString().split('T')[0]);
    } else if (filter === 'week') {
      date.setDate(date.getDate() - 7);
      query = query.gte('bill_date', date.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching purchase bills:", err);
    return { success: false, error: err.message };
  }
}

export async function submitPurchaseBill(formData: FormData) {
  try {
    const invoice_no = formData.get("invoice_no") as string;
    const bill_date = formData.get("bill_date") as string;
    const supplier_name = formData.get("supplier_name") as string;
    const supplier_gstin = formData.get("supplier_gstin") as string;
    const itemsString = formData.get("items") as string;
    const payment_status = formData.get("payment_status") as string || "UNPAID";
    const payment_type = formData.get("payment_type") as string || "CREDIT";
    const sub_total = Number(formData.get("sub_total") || 0);
    const igst_amount = Number(formData.get("igst_amount") || 0);
    const cgst_amount = Number(formData.get("cgst_amount") || 0);
    const sgst_amount = Number(formData.get("sgst_amount") || 0);
    const total_amount = Number(formData.get("total_amount") || 0);
    const transport_details_str = formData.get("transport_details") as string;
    
    let transport_details = {};
    try {
      if (transport_details_str) transport_details = JSON.parse(transport_details_str);
    } catch(e) {
      transport_details = { raw: transport_details_str };
    }

    const items = JSON.parse(itemsString || "[]");
    
    // Generate IDs
    const masterId = `PM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. Insert header into purchase_master
    const { data: masterData, error: masterError } = await supabaseAdmin
      .from("purchase_master")
      .insert({
        id: masterId,
        invoice_no,
        date: bill_date,
        supplier_name,
        supplier_gstin,
        items, // Snapshot of items
        sub_total,
        igst_amount,
        cgst_amount,
        sgst_amount,
        grand_total: total_amount, 
        transport_details,
        payment_status,
        payment_type
      })
      .select("id")
      .single();

    if (masterError) {
      // Let's try with exact columns the user requested if grand_total/date fail
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("purchase_master")
        .insert({
          id: masterId,
          invoice_no,
          bill_date,
          supplier_name,
          supplier_gstin,
          items,
          sub_total,
          igst_amount,
          cgst_amount,
          sgst_amount,
          total_amount,
          transport_details,
          payment_status,
          payment_type
        })
        .select("id")
        .single();
        
      if (fallbackError) throw fallbackError;
      var purchase_bill_id = fallbackData.id;
    } else {
      var purchase_bill_id = masterData.id;
    }

    // 2. Iterate through items and insert into purchase_items
    for (const item of items) {
      const { raw_material_id, quantity, rate } = item;
      const itemId = `PI_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // Insert into purchase_items
      const { error: itemError } = await supabaseAdmin
        .from("purchase_items")
        .insert({
          id: itemId,
          purchase_bill_id,
          raw_material_id,
          quantity: Number(quantity),
          rate: Number(rate)
        });

      if (itemError) {
        console.error("Error inserting purchase item:", itemError);
        continue;
      }

      // CRITICAL TRIGGER: Update raw_materials current_stock
      // First, fetch current stock
      const { data: rmData, error: rmError } = await supabaseAdmin
        .from("raw_materials")
        .select("current_stock")
        .eq("id", raw_material_id)
        .single();

      if (!rmError && rmData) {
        const newStock = Number(rmData.current_stock) + Number(quantity);
        await supabaseAdmin
          .from("raw_materials")
          .update({ current_stock: newStock })
          .eq("id", raw_material_id);
      }
    }

    revalidatePath("/dashboard/factory");
    revalidatePath("/dashboard/ceo");

    return { success: true };
  } catch (err: any) {
    console.error("Error submitting purchase bill:", err);
    return { success: false, error: err.message };
  }
}
