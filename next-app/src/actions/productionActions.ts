"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Formulation Formulations Registry

export async function getProductRecipe(productId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_recipes")
      .select("*, raw_materials(material_name, unit_of_measure, avg_purchase_price)")
      .eq("product_id", productId);
    
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching recipe:", err);
    return { success: false, error: err.message };
  }
}

export async function saveProductRecipe(
  productId: string, 
  recipeItems: { raw_material_id: string, quantity_per_unit: number }[]
) {
  try {
    // 1. Delete existing recipe for this product (full replace)
    const { error: deleteErr } = await supabaseAdmin
      .from("product_recipes")
      .delete()
      .eq("product_id", productId);
      
    if (deleteErr) throw deleteErr;

    // 2. Insert new recipe rows
    if (recipeItems.length > 0) {
      const rows = recipeItems.map(item => ({
        id: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product_id: productId,
        raw_material_id: item.raw_material_id,
        quantity_per_unit: item.quantity_per_unit
      }));

      const { error: insertErr } = await supabaseAdmin
        .from("product_recipes")
        .insert(rows);
        
      if (insertErr) throw insertErr;
    }

    revalidatePath("/dashboard/factory/production");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving recipe:", err);
    return { success: false, error: err.message };
  }
}

// Production Batches Costing Actions

export async function startBatch(
  productId: string,
  targetYield: number,
  overheadCost: number,
  materialsUsed: { raw_material_id: string; quantity_used: number; unit_cost: number }[]
) {
  try {
    if (materialsUsed.length === 0) {
      throw new Error("Cannot start a batch with no ingredients.");
    }

    // 1. Verify stock of all raw materials
    const materialIds = materialsUsed.map(m => m.raw_material_id);
    const { data: stockData, error: stockErr } = await supabaseAdmin
      .from("raw_materials")
      .select("id, material_name, current_stock")
      .in("id", materialIds);

    if (stockErr) throw stockErr;

    const deductions: any[] = [];
    for (const item of materialsUsed) {
      const currentStock = Number(stockData?.find(s => s.id === item.raw_material_id)?.current_stock || 0);
      if (currentStock < item.quantity_used) {
        const matName = stockData?.find(s => s.id === item.raw_material_id)?.material_name || "Raw Material";
        throw new Error(`Insufficient stock for "${matName}". Required: ${item.quantity_used}, Available: ${currentStock}`);
      }
      deductions.push({
        raw_material_id: item.raw_material_id,
        quantity_used: item.quantity_used,
        unit_cost: item.unit_cost,
        remainingStock: currentStock - item.quantity_used
      });
    }

    // 2. Generate Batch ID
    const batchId = `BATCH-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];

    // 3. Deduct raw material stocks & log
    for (const ded of deductions) {
      const { error: updateErr } = await supabaseAdmin
        .from("raw_materials")
        .update({ current_stock: ded.remainingStock })
        .eq("id", ded.raw_material_id);

      if (updateErr) throw updateErr;

      // Log to material_logs
      await supabaseAdmin.from("material_logs").insert([{
        id: `LOG-MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        material_id: ded.raw_material_id,
        date: today,
        type: "OUT",
        qty: ded.quantity_used,
        reason: `Production Batch Consumed (${batchId})`,
        reference: batchId,
        resulting_stock: ded.remainingStock
      }]);

      // Log to unified stock_ledger
      await supabaseAdmin.from("stock_ledger").insert([{
        id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: today,
        item_id: ded.raw_material_id,
        item_type: "RAW_MATERIAL",
        type: "OUT",
        qty: ded.quantity_used,
        reference: batchId,
        supplier_or_buyer: "Factory Production",
        resulting_stock: ded.remainingStock
      }]);
    }

    // 4. Calculate material cost
    const totalMaterialCost = materialsUsed.reduce((sum, m) => sum + (m.quantity_used * m.unit_cost), 0);
    const totalCost = totalMaterialCost + overheadCost;

    // 5. Insert batch header record
    const { error: batchErr } = await supabaseAdmin
      .from("production_batches")
      .insert([{
        id: batchId,
        product_id: productId,
        target_yield: targetYield,
        quantity_produced: 0, // set upon completion
        actual_yield: 0,      // set upon completion
        status: "IN_PROGRESS",
        total_material_cost: totalMaterialCost,
        overhead_cost: overheadCost,
        total_cost: totalCost,
        unit_cost: 0,         // computed on completion
        batch_date: today
      }]);

    if (batchErr) throw batchErr;

    // 6. Insert batch consumption line items
    const consumptionRows = materialsUsed.map(m => ({
      id: `CONS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      batch_id: batchId,
      raw_material_id: m.raw_material_id,
      quantity_used: m.quantity_used,
      unit_cost: m.unit_cost,
      total_cost: m.quantity_used * m.unit_cost
    }));

    const { error: consInsertErr } = await supabaseAdmin
      .from("batch_consumption")
      .insert(consumptionRows);

    if (consInsertErr) throw consInsertErr;

    revalidatePath("/dashboard/factory/production");
    return { success: true, batchId };
  } catch (err: any) {
    console.error("Error starting batch:", err);
    return { success: false, error: err.message };
  }
}

export async function completeBatch(batchId: string, actualYield: number) {
  try {
    // 1. Fetch batch details
    const { data: batchData, error: fetchErr } = await supabaseAdmin
      .from("production_batches")
      .select("product_id, status, total_cost")
      .eq("id", batchId)
      .single();

    if (fetchErr) throw fetchErr;
    if (batchData.status === "COMPLETED") throw new Error("Batch is already completed.");

    const unitCost = actualYield > 0 ? (Number(batchData.total_cost) / actualYield) : 0;
    const today = new Date().toISOString().split("T")[0];

    // 2. Update production_batches record
    const { error: batchErr } = await supabaseAdmin
      .from("production_batches")
      .update({
        status: "COMPLETED",
        actual_yield: actualYield,
        quantity_produced: actualYield,
        unit_cost: unitCost,
        completed_at: new Date().toISOString()
      })
      .eq("id", batchId);

    if (batchErr) throw batchErr;

    // 3. Increment actual_stock of the product
    const { data: prodData, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("actual_stock")
      .eq("id", batchData.product_id)
      .single();

    if (prodErr) throw prodErr;

    const currentStock = parseFloat(prodData.actual_stock) || 0;
    const newStock = currentStock + actualYield;

    // Update product stock and average manufacturing cost profile
    const { error: prodUpdateErr } = await supabaseAdmin
      .from("products")
      .update({ 
        actual_stock: newStock,
        mfg_cost: unitCost 
      })
      .eq("id", batchData.product_id);

    if (prodUpdateErr) throw prodUpdateErr;

    // 4. Log finished goods addition to stock_logs
    await supabaseAdmin.from("stock_logs").insert([{
      id: `LOG-PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id: batchData.product_id,
      date: today,
      type: "IN",
      qty: actualYield,
      reason: "Production Batch Completed",
      reference: batchId,
      resulting_stock: newStock
    }]);

    // 5. Log finished goods to unified stock_ledger
    await supabaseAdmin.from("stock_ledger").insert([{
      id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: today,
      item_id: batchData.product_id,
      item_type: "PRODUCT",
      type: "IN",
      qty: actualYield,
      rate: unitCost,
      total: batchData.total_cost,
      reference: batchId,
      supplier_or_buyer: "Factory Production",
      resulting_stock: newStock
    }]);

    revalidatePath("/dashboard/factory/production");
    return { success: true };
  } catch (err: any) {
    console.error("Error completing batch:", err);
    return { success: false, error: err.message };
  }
}

export async function cancelBatch(batchId: string) {
  try {
    const { data: batch, error: fetchErr } = await supabaseAdmin
      .from("production_batches")
      .select("status")
      .eq("id", batchId)
      .single();

    if (fetchErr) throw fetchErr;
    if (batch.status !== "IN_PROGRESS") throw new Error("Only in-progress batches can be cancelled.");

    // 1. Fetch batch consumption items to restore stock
    const { data: consumption, error: consErr } = await supabaseAdmin
      .from("batch_consumption")
      .select("raw_material_id, quantity_used")
      .eq("batch_id", batchId);

    if (consErr) throw consErr;
    const today = new Date().toISOString().split("T")[0];

    // 2. Restore stocks in raw_materials
    for (const item of (consumption || [])) {
      const { data: rm } = await supabaseAdmin
        .from("raw_materials")
        .select("current_stock")
        .eq("id", item.raw_material_id)
        .single();
      
      const prevStock = Number(rm?.current_stock || 0);
      const restoredStock = prevStock + Number(item.quantity_used);

      await supabaseAdmin
        .from("raw_materials")
        .update({ current_stock: restoredStock })
        .eq("id", item.raw_material_id);

      // Log restoration to material_logs
      await supabaseAdmin.from("material_logs").insert([{
        id: `LOG-MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        material_id: item.raw_material_id,
        date: today,
        type: "IN",
        qty: Number(item.quantity_used),
        reason: `Production Batch Cancelled (${batchId}) - Stock Restored`,
        reference: batchId,
        resulting_stock: restoredStock
      }]);

      // Log restoration to unified stock_ledger
      await supabaseAdmin.from("stock_ledger").insert([{
        id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: today,
        item_id: item.raw_material_id,
        item_type: "RAW_MATERIAL",
        type: "IN",
        qty: Number(item.quantity_used),
        reference: batchId,
        supplier_or_buyer: "Batch Cancelled (Restoration)",
        resulting_stock: restoredStock
      }]);
    }

    // 3. Mark batch status as CANCELLED
    await supabaseAdmin
      .from("production_batches")
      .update({ status: "CANCELLED" })
      .eq("id", batchId);

    revalidatePath("/dashboard/factory/production");
    return { success: true };
  } catch (err: any) {
    console.error("Error cancelling batch:", err);
    return { success: false, error: err.message };
  }
}

export async function getProductionBatches() {
  try {
    const { data, error } = await supabaseAdmin
      .from("production_batches")
      .select("*, products(product_name)")
      .order("id", { ascending: false });
      
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching batches:", err);
    return { success: false, error: err.message };
  }
}

export async function getBatchDetails(batchId: string) {
  try {
    const { data: batch, error: batchErr } = await supabaseAdmin
      .from("production_batches")
      .select("*, products(product_name, package_size_unit)")
      .eq("id", batchId)
      .single();

    if (batchErr) throw batchErr;

    const { data: consumption, error: consErr } = await supabaseAdmin
      .from("batch_consumption")
      .select("*, raw_materials(material_name, unit_of_measure)")
      .eq("batch_id", batchId);

    if (consErr) throw consErr;

    return { success: true, data: { batch, consumption } };
  } catch (err: any) {
    console.error("Error fetching batch details:", err);
    return { success: false, error: err.message };
  }
}
