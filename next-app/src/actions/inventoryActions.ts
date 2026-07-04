"use server";

import { createAdminClient } from "@/utils/supabase/server";

export async function getInventorySummary() {
  try {
    const supabase = await createAdminClient();
    const { data: materials, error } = await supabase
      .from("materials")
      .select("*")
      .order("name", { ascending: true });

    if (error || !materials || materials.length === 0) {
      return { success: false, error: "No data" };
    }

    const allMaterials = materials.map((mat) => {
      const stock = parseFloat(mat.stock) || 0;
      const minStock = parseFloat(mat.min_stock) || 0;
      return { ...mat, is_low_stock: stock <= minStock };
    });

    return {
      success: true,
      data: {
        allMaterials,
        criticalItems: allMaterials.filter((m) => m.is_low_stock),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getMaterialDetails(materialId: string) {
  try {
    const supabase = await createAdminClient();

    const { data: formulationsData } = await supabase
      .from("product_recipes")
      .select("quantity_per_unit, usage_percentage, products(name, sku)")
      .eq("raw_material_id", materialId);

    const { data: logsData } = await supabase
      .from("material_logs")
      .select("id, date, type, qty, reference, reason, created_by, balance")
      .eq("material_id", materialId)
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      success: true,
      data: {
        formulations: formulationsData || [],
        purchaseHistory: (logsData || []).filter((l: any) => l.type === "IN"),
        stockLogs: logsData || [],
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addMaterial(data: {
  name: string;
  category: string;
  unit: string;
  min_stock: number;
}) {
  try {
    const supabase = await createAdminClient();
    const id = `MAT-${Date.now().toString().slice(-6)}`;
    const { data: result, error } = await supabase
      .from("materials")
      .insert({ id, ...data, stock: 0 })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function inwardStock(entries: { material_id: string; qty: number; vendor: string; rate: number; invoice_ref: string }[]) {
  try {
    const supabase = await createAdminClient();
    for (const entry of entries) {
      const { data: mat } = await supabase
        .from("materials")
        .select("stock")
        .eq("id", entry.material_id)
        .single();

      const newStock = parseFloat(mat?.stock || 0) + entry.qty;
      await supabase.from("materials").update({ stock: newStock }).eq("id", entry.material_id);
      await supabase.from("material_logs").insert({
        material_id: entry.material_id,
        type: "IN",
        qty: entry.qty,
        balance: newStock,
        reason: `Inward from ${entry.vendor}`,
        reference: entry.invoice_ref,
        date: new Date().toISOString().split("T")[0],
        created_by: "Quick Inward",
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
