import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
      packing_size_unit: p.package_size_unit
    }));

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
