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

    // 1. Insert into raw_materials table
    const { data: material, error: matError } = await supabase
      .from("raw_materials")
      .insert([
        {
          material_name: data.name,
          category: data.category,
          unit_of_measure: data.unit,
          min_stock: data.min_stock,
          current_stock: data.initial_qty,
          avg_purchase_price: data.rate
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

export async function updateMaterialThreshold(id: string, min_stock: number) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("raw_materials")
      .update({ min_stock })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error updating material threshold:", err);
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function adjustStock(data: {
  materialId: string;
  qtyChange: number;
  reference: string;
  reason: string;
}) {
  try {
    const supabase = await createAdminClient();

    // 1. Get current stock
    const { data: material, error: fetchErr } = await supabase
      .from("raw_materials")
      .select("current_stock")
      .eq("id", data.materialId)
      .single();

    if (fetchErr || !material) {
      throw new Error("Material not found: " + (fetchErr?.message || ""));
    }

    const currentStock = Number(material.current_stock || 0);
    const newStock = currentStock + data.qtyChange;

    if (newStock < 0) {
      throw new Error("Resulting stock cannot be negative.");
    }

    // 2. Update stock
    const { error: updateErr } = await supabase
      .from("raw_materials")
      .update({ current_stock: newStock })
      .eq("id", data.materialId);

    if (updateErr) throw updateErr;

    // 3. Insert stock log
    const { error: logErr } = await supabase
      .from("material_logs")
      .insert([
        {
          material_id: data.materialId,
          date: new Date().toISOString().split("T")[0],
          type: "ADJUST",
          qty: Math.abs(data.qtyChange),
          reference: data.reference || "ADJUSTMENT",
          reason: data.reason || "Manual inventory adjustment",
          resulting_stock: newStock
        }
      ]);

    if (logErr) {
      console.error("Failed to insert stock adjustment log:", logErr);
    }

    return { success: true, newStock };
  } catch (err: any) {
    console.error("Error adjusting stock:", err);
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function transferStock(data: {
  sourceId: string;
  targetId: string;
  qty: number;
  reference: string;
}) {
  try {
    const supabase = await createAdminClient();

    // 1. Fetch source and target current stock
    const { data: source, error: sourceErr } = await supabase
      .from("raw_materials")
      .select("current_stock, material_name")
      .eq("id", data.sourceId)
      .single();

    const { data: target, error: targetErr } = await supabase
      .from("raw_materials")
      .select("current_stock, material_name")
      .eq("id", data.targetId)
      .single();

    if (sourceErr || !source) throw new Error("Source material not found.");
    if (targetErr || !target) throw new Error("Target material not found.");

    const sourceStock = Number(source.current_stock || 0);
    const targetStock = Number(target.current_stock || 0);

    if (sourceStock < data.qty) {
      throw new Error(`Insufficient stock in source material. Available: ${sourceStock}`);
    }

    const nextSourceStock = sourceStock - data.qty;
    const nextTargetStock = targetStock + data.qty;

    // 2. Perform updates
    const { error: sourceUpdateErr } = await supabase
      .from("raw_materials")
      .update({ current_stock: nextSourceStock })
      .eq("id", data.sourceId);

    if (sourceUpdateErr) throw sourceUpdateErr;

    const { error: targetUpdateErr } = await supabase
      .from("raw_materials")
      .update({ current_stock: nextTargetStock })
      .eq("id", data.targetId);

    if (targetUpdateErr) throw targetUpdateErr;

    const today = new Date().toISOString().split("T")[0];

    // 3. Log OUT for source
    await supabase
      .from("material_logs")
      .insert([
        {
          material_id: data.sourceId,
          date: today,
          type: "OUT",
          qty: data.qty,
          reference: data.reference || "TRANSFER",
          reason: `Stock Transfer OUT to ${target.material_name}`,
          resulting_stock: nextSourceStock
        }
      ]);

    // 4. Log IN for target
    await supabase
      .from("material_logs")
      .insert([
        {
          material_id: data.targetId,
          date: today,
          type: "IN",
          qty: data.qty,
          reference: data.reference || "TRANSFER",
          reason: `Stock Transfer IN from ${source.material_name}`,
          resulting_stock: nextTargetStock
        }
      ]);

    return { success: true };
  } catch (err: any) {
    console.error("Error transferring stock:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function consumeMaterial(data: {
  materialId: string;
  qty: number;
  reference: string;
  reason: string;
}) {
  try {
    const supabase = await createAdminClient();

    // 1. Get current stock
    const { data: material, error: fetchErr } = await supabase
      .from("raw_materials")
      .select("current_stock, material_name")
      .eq("id", data.materialId)
      .single();

    if (fetchErr || !material) {
      throw new Error("Material not found: " + (fetchErr?.message || ""));
    }

    const currentStock = Number(material.current_stock || 0);
    if (currentStock < data.qty) {
      throw new Error(`Insufficient stock. Available: ${currentStock}`);
    }

    const newStock = currentStock - data.qty;

    // 2. Update stock
    const { error: updateErr } = await supabase
      .from("raw_materials")
      .update({ current_stock: newStock })
      .eq("id", data.materialId);

    if (updateErr) throw updateErr;

    // 3. Log OUT
    const { error: logErr } = await supabase
      .from("material_logs")
      .insert([
        {
          material_id: data.materialId,
          date: new Date().toISOString().split("T")[0],
          type: "OUT",
          qty: data.qty,
          reference: data.reference || "CONSUMPTION",
          reason: data.reason || `Consumed for production: ${data.reference}`,
          resulting_stock: newStock
        }
      ]);

    if (logErr) {
      console.error("Failed to log material consumption:", logErr);
    }

    return { success: true, newStock };
  } catch (err: any) {
    console.error("Error consuming material:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}
