"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function addCompetitorProduct(payload: {
  brand: string;
  category: string;
  subcategory: string;
  product_name: string;
  pack_size: string;
  mrp: number;
  finish: string;
  coverage: string;
  drying_time: string;
  recoat_time: string;
  technology: string;
  warranty: string;
  interior_exterior: string;
  washability: string;
  voc: string;
  trade_price: number;
  dealer_margin_pct: number;
  installer_margin_pct: number;
  brand_color: string;
  features: string[];
}) {
  try {
    const id = `COMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const description = JSON.stringify({
      trade_price: payload.trade_price,
      dealer_margin_pct: payload.dealer_margin_pct,
      installer_margin_pct: payload.installer_margin_pct,
      brand_color: payload.brand_color,
      image_url: ""
    });

    const { error } = await supabaseAdmin
      .from("competitor_products")
      .insert({
        id,
        brand: payload.brand,
        category: payload.category,
        subcategory: payload.subcategory,
        product_name: payload.product_name,
        pack_size: payload.pack_size,
        mrp: payload.mrp,
        finish: payload.finish,
        coverage: payload.coverage,
        drying_time: payload.drying_time,
        recoat_time: payload.recoat_time,
        technology: payload.technology,
        warranty: payload.warranty,
        interior_exterior: payload.interior_exterior,
        washability: payload.washability,
        voc: payload.voc,
        features: payload.features,
        description,
        sheen: payload.brand_color, // Using sheen to store brand color hex
        source: "Manual_Entry"
      });

    if (error) throw error;

    revalidatePath("/dashboard/ceo/competitors");
    return { success: true };
  } catch (err: any) {
    console.error("Error adding competitor SKU:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteCompetitorProduct(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("competitor_products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/ceo/competitors");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting competitor SKU:", err);
    return { success: false, error: err.message };
  }
}
