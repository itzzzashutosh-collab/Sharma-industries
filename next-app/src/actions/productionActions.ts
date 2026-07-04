"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function saveProductRecipe(productId: string, recipeItems: { raw_material_id: string, quantity_per_unit: number }[]) {
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

    revalidatePath("/dashboard/production");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving recipe:", err);
    return { success: false, error: err.message };
  }
}

export async function startBatch(productId: string, targetYield: number) {
  try {
    // a) Fetch the recipe for the given productId
    const { data: recipeData, error: recipeErr } = await supabaseAdmin
      .from("product_recipes")
      .select("raw_material_id, quantity_per_unit, materials(name)")
      .eq("product_id", productId);

    if (recipeErr) throw recipeErr;
    
    if (!recipeData || recipeData.length === 0) {
      throw new Error("No formulation (recipe) found for this product.");
    }

    // b) Calculate total RM needed & c) Verify stock
    const materialIds = recipeData.map(r => r.raw_material_id);
    
    const { data: stockData, error: stockErr } = await supabaseAdmin
      .from("materials")
      .select("id, name, stock")
      .in("id", materialIds);

    if (stockErr) throw stockErr;

    const deductions: any[] = [];
    
    for (const item of recipeData) {
      const requiredQty = item.quantity_per_unit * targetYield;
      const currentStock = stockData.find(s => s.id === item.raw_material_id)?.stock || 0;
      
      if (currentStock < requiredQty) {
        throw new Error(`Insufficient stock for ${(item as any).materials?.name || 'Raw Material'}. Required: ${requiredQty}, Available: ${currentStock}`);
      }
      
      deductions.push({
        raw_material_id: item.raw_material_id,
        name: (item as any).materials?.name || 'Unknown',
        requiredQty,
        currentStock,
        remainingStock: currentStock - requiredQty
      });
    }

    // d) DEDUCT the calculated quantities from public.materials
    for (const ded of deductions) {
      const { error: updateErr } = await supabaseAdmin
        .from("materials")
        .update({ stock: ded.remainingStock })
        .eq("id", ded.raw_material_id);
        
      if (updateErr) throw updateErr;
      
      // Log the deduction
      await supabaseAdmin.from("material_logs").insert([{
        id: `LOG-MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        material_id: ded.raw_material_id,
        date: new Date().toISOString().split('T')[0],
        type: "OUT",
        qty: ded.requiredQty,
        reason: "Production Batch Consumed",
        resulting_stock: ded.remainingStock
      }]);
    }

    // e) Insert a new row in public.production_batches
    const batchId = `BATCH-${Date.now()}`;
    const { error: batchErr } = await supabaseAdmin
      .from("production_batches")
      .insert([{
        id: batchId,
        product_id: productId,
        target_yield: targetYield,
        status: "IN_PROGRESS",
        consumed_materials: deductions
      }]);

    if (batchErr) throw batchErr;

    revalidatePath("/dashboard/production");
    return { success: true, batchId };
  } catch (err: any) {
    console.error("Error starting batch:", err);
    return { success: false, error: err.message };
  }
}

export async function completeBatch(batchId: string, actualYield: number) {
  try {
    // a) Update batch status to COMPLETED
    const { data: batchData, error: fetchErr } = await supabaseAdmin
      .from("production_batches")
      .select("product_id, status")
      .eq("id", batchId)
      .single();

    if (fetchErr) throw fetchErr;
    if (batchData.status === "COMPLETED") throw new Error("Batch is already completed.");

    const { error: batchErr } = await supabaseAdmin
      .from("production_batches")
      .update({
        status: "COMPLETED",
        actual_yield: actualYield,
        completed_at: new Date().toISOString()
      })
      .eq("id", batchId);

    if (batchErr) throw batchErr;

    // b) Increment actual_stock (we use 'stock' field) by actualYield
    const { data: prodData, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("id", batchData.product_id)
      .single();

    if (prodErr) throw prodErr;

    const newStock = (parseFloat(prodData.stock) || 0) + actualYield;
    
    const { error: stockUpdateErr } = await supabaseAdmin
      .from("products")
      .update({ stock: newStock })
      .eq("id", batchData.product_id);

    if (stockUpdateErr) throw stockUpdateErr;
    
    // Log product stock addition
    await supabaseAdmin.from("stock_logs").insert([{
      id: `LOG-PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id: batchData.product_id,
      date: new Date().toISOString().split('T')[0],
      type: "IN",
      qty: actualYield,
      reason: "Production Batch Completed",
      reference: batchId,
      resulting_stock: newStock
    }]);

    revalidatePath("/dashboard/production");
    return { success: true };
  } catch (err: any) {
    console.error("Error completing batch:", err);
    return { success: false, error: err.message };
  }
}
