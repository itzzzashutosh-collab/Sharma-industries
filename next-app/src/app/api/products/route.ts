import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { generateSemanticId } from "@/lib/idGenerator";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_master_product", true)
      .order("product_name", { ascending: true })
      .limit(10000);

    if (error) throw error;

    // Map database columns to the frontend Product interface
    const mappedData = data.map((p: any) => ({
      id: p.id,
      name: p.product_name,
      hsn_code: p.hsn_code,
      selling_price: p.selling_cost,
      tags: p.tags,
      packing_size_unit: p.package_size_unit,
      stock: p.actual_stock,
      min_stock: p.min_stock_threshold
    }));

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createAdminClient();

    const newProductId = await generateSemanticId(
      supabase,
      "products",
      "PR",
      body.product_name
    );

    const productToInsert = {
      id: newProductId,
      product_name: body.product_name,
      hsn_code: body.hsn_code || "3209",
      selling_cost: body.selling_price || 0,
      mrp: body.selling_price || 0,
      package_size_unit: body.packing_size_unit || "pcs",
      tags: body.tags ? (typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags)) : "[]",
      actual_stock: body.stock || 0,
      min_stock_threshold: body.min_stock || 10,
      is_master_product: true,
      tax_rate: body.tax_rate || 18,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([productToInsert])
      .select()
      .single();

    if (error) throw error;

    // Map back to frontend structure
    const mappedProduct = {
      id: data.id,
      name: data.product_name,
      hsn_code: data.hsn_code,
      selling_price: data.selling_cost,
      tags: data.tags,
      packing_size_unit: data.package_size_unit,
      stock: data.actual_stock,
      min_stock: data.min_stock_threshold
    };

    return NextResponse.json({ success: true, data: mappedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
