import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    let data = await request.json();

    if (!Array.isArray(data)) {
      if (data.products && Array.isArray(data.products)) data = data.products;
      else if (data.data && Array.isArray(data.data)) data = data.data;
      else if (data.items && Array.isArray(data.items)) data = data.items;
      else data = [data]; // Assume single object
    }

    const processedData: any[] = [];
    data.forEach((item: any) => {
      let sizes = Array.isArray(item.pack_sizes) ? item.pack_sizes : [];
      if (sizes.length === 0 && item.pack_size) sizes = [item.pack_size];
      
      let mrps = Array.isArray(item.mrp) ? item.mrp : [];
      if (mrps.length === 0 && item.mrp && !Array.isArray(item.mrp)) mrps = [item.mrp];
      if (mrps.length === 0 && item.dealer_price) mrps = [item.dealer_price];
      
      const safeItem = {
        brand: item.brand || item.competitor_brand || item.Brand || item.Competitor_Brand || null,
        category: item.category || item.Category || null,
        subcategory: item.subcategory || item.Subcategory || null,
        product_name: item.product_name || item.Product_Name || item.product || item.ProductName || null,
        description: item.description || null,
        finish: item.finish || null,
        coverage: item.coverage || null,
        drying_time: item.drying_time || null,
        recoat_time: item.recoat_time || null,
        application_area: item.application_area || null,
        recommended_surface: item.recommended_surface || null,
        features: item.features || null,
        benefits: item.benefits || null,
        available_colours: item.available_colours || null,
        technology: item.technology || null,
        warranty: item.warranty || null,
        interior_exterior: item.interior_exterior || null,
        washability: item.washability || null,
        voc: item.voc || null,
        sheen: item.sheen || null,
        texture: item.texture || null,
        source: item.source || null,
      };
      
      if (sizes.length === 0) {
         const baseId = item.id || `${safeItem.brand || 'unknown'}_${safeItem.product_name || 'product'}`.replace(/[\s\/\\]+/g, '_').toLowerCase();
         processedData.push({
            ...safeItem,
            id: baseId,
            pack_size: null,
            mrp: mrps[0] ? Number(mrps[0]) : null
         });
      } else {
         sizes.forEach((size: any, idx: number) => {
            const baseId = item.id ? `${item.id}_${size}` : `${safeItem.brand || 'unknown'}_${safeItem.product_name || 'product'}_${size}`.replace(/[\s\/\\]+/g, '_').toLowerCase();
            processedData.push({
               ...safeItem,
               id: baseId,
               pack_size: size,
               mrp: mrps[idx] ? Number(mrps[idx]) : null
            });
         });
      }
    });

    // We no longer need to map over cleanedData to remove pack_sizes because safeItem doesn't include it.
    // So we can just use processedData directly.

    // Upsert products based on id
    const { data: inserted, error } = await supabase
      .from("competitor_products")
      .upsert(processedData, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase Upsert Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: inserted });
  } catch (error: any) {
    console.error("Internal API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
