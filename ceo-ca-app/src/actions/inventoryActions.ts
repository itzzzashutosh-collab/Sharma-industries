"use server";

import { createAdminClient } from "@/utils/supabase/server";

export async function getInventorySummary() {
  try {
    const supabase = await createAdminClient();
    const { data: rawMaterials, error } = await supabase
      .from("raw_materials")
      .select("*")
      .order("material_name", { ascending: true });

    if (error || !rawMaterials || rawMaterials.length === 0) {
      return { success: false, error: "No data" };
    }

    const { data: latestLogs } = await supabase
      .from("stock_ledger")
      .select("item_id, supplier_or_buyer")
      .eq("item_type", "RAW_MATERIAL")
      .eq("type", "IN")
      .order("created_at", { ascending: false });

    const supplierMap: Record<string, string> = {};
    if (latestLogs && latestLogs.length > 0) {
      latestLogs.forEach((log: any) => {
        if (!supplierMap[log.item_id] && log.supplier_or_buyer) {
          supplierMap[log.item_id] = log.supplier_or_buyer;
        }
      });
    }

    const allMaterials = rawMaterials.map((mat) => {
      const stock = parseFloat(mat.current_stock) || 0;
      const minStock = parseFloat(mat.min_stock) || 0;
      return {
        id: mat.id,
        name: mat.material_name,
        category: mat.category,
        unit: mat.unit_of_measure || "KG",
        current_stock: stock,
        min_threshold: minStock,
        stock,
        min_stock: minStock,
        is_low_stock: stock <= minStock,
        supplier: supplierMap[mat.id] || "—"
      };
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
      .from("stock_ledger")
      .select("id, date, type, qty, reference, supplier_or_buyer, resulting_stock")
      .eq("item_id", materialId)
      .eq("item_type", "RAW_MATERIAL")
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      success: true,
      data: {
        formulations: formulationsData || [],
        purchaseHistory: (logsData || []).filter((l: any) => l.type === "IN").map((l: any) => ({
          date: l.date,
          reason: `Inward from ${l.supplier_or_buyer}`,
          qty: l.qty,
          reference: l.reference,
          vendor: l.supplier_or_buyer
        })),
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
    const id = `RM_${Date.now().toString().slice(-6)}`;
    const { data: result, error } = await supabase
      .from("raw_materials")
      .insert({
        id,
        material_name: data.name,
        category: data.category,
        unit_of_measure: data.unit,
        min_stock: data.min_stock,
        current_stock: 0,
        avg_purchase_price: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: result.id,
        name: result.material_name,
        category: result.category,
        unit: result.unit_of_measure || "KG",
        current_stock: 0,
        min_threshold: Number(result.min_stock)
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function inwardStock(entries: { material_id: string; qty: number; vendor: string; rate: number; invoice_ref: string }[]) {
  try {
    const supabase = await createAdminClient();
    for (const entry of entries) {
      const { data: mat } = await supabase
        .from("raw_materials")
        .select("current_stock")
        .eq("id", entry.material_id)
        .single();

      const newStock = parseFloat(mat?.current_stock || 0) + entry.qty;
      await supabase.from("raw_materials").update({ current_stock: newStock }).eq("id", entry.material_id);
      
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
