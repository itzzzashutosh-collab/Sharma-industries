"use server";

import { createAdminClient } from "@/utils/supabase/server";

export async function createMaterialAndLog(data: {
  name: string;
  category: string;
  unit: string;
  min_stock: number;
  initial_qty: number;
  rate: number;
  supplier: string;
  invoice_ref: string;
}) {
  try {
    const supabase = await createAdminClient();

    // 1. Insert into materials table
    const { data: material, error: matError } = await supabase
      .from("materials")
      .insert([
        {
          name: data.name,
          category: data.category,
          unit: data.unit,
          min_stock: data.min_stock,
          stock: data.initial_qty,
          purchase_price: data.rate,
          status: "ACTIVE"
        }
      ])
      .select()
      .single();

    if (matError) throw matError;

    // 2. If there is initial quantity, log it
    if (data.initial_qty > 0) {
      const { error: logError } = await supabase
        .from("material_logs")
        .insert([
          {
            material_id: material.id,
            date: new Date().toISOString().split("T")[0],
            type: "IN",
            qty: data.initial_qty,
            reference: data.invoice_ref || "-",
            reason: `Initial Stock from ${data.supplier || "Unknown"}`,
            resulting_stock: data.initial_qty
          }
        ]);
        
      if (logError) {
        console.error("Failed to insert material_log:", logError);
        // We don't throw here to avoid failing the material creation, 
        // but in a real app we might want a transaction.
      }
    }

    return { success: true, material };
  } catch (err: any) {
    console.error("Error creating material:", err);
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}
