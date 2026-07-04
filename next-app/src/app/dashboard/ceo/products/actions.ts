"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createMasterProduct(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("si_session");
    if (!sessionCookie?.value) {
      return { success: false, error: "Unauthorized. Please log in." };
    }
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "ceo") {
      return { success: false, error: "Unauthorized. Only CEO can add products." };
    }

    const supabase = await createAdminClient();

    const name = formData.get("name") as string;
    const hsn_code = formData.get("hsn_code") as string;
    const purchase_price = parseFloat(formData.get("manufacturing_price") as string) || 0;
    const selling_price = parseFloat(formData.get("selling_price") as string) || 0;
    const mrp = parseFloat(formData.get("mrp") as string) || 0;
    const tax_rate = parseFloat(formData.get("tax_rate") as string) || 18;
    const stock = parseFloat(formData.get("stock") as string) || 0;
    const min_stock = parseFloat(formData.get("min_stock") as string) || 10;
    const packaging_type = formData.get("packaging_type") as string;
    const packing_size_amount = parseFloat(formData.get("packing_size_amount") as string) || 0;
    const packing_size_unit = formData.get("packing_size_unit") as string;
    const tagsJsonStr = formData.get("tags") as string;
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsJsonStr);
    } catch {
      tags = tagsJsonStr ? tagsJsonStr.split(",").map(t => t.trim()) : [];
    }

    const imageFile = formData.get("image") as File | null;
    let imageUrl = "";

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileName = `${sanitizedName}-v1-${Date.now()}.${fileExt}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_assets')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          duplex: 'half'
        });

      if (uploadError) {
        console.error("Storage upload error in server action:", uploadError);
        return { success: false, error: `Failed to upload image: ${uploadError.message}` };
      }

      if (uploadData) {
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/company_assets/${fileName}`;
      }
    }



    const { error: dbError } = await supabase.from("products").insert([{
      product_name: name,
      hsn_code,
      mfg_cost: purchase_price,
      selling_cost: selling_price,
      mrp,
      tax_rate,
      actual_stock: stock,
      min_stock_threshold: min_stock,
      package_type: packaging_type,
      package_size: packing_size_amount,
      package_size_unit: packing_size_unit,
      tags: tags.join(','),
      image_url: imageUrl,
      is_master_product: true
    }]);

    if (dbError) {
      console.error("Database insert error in server action:", dbError);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    revalidatePath("/dashboard/ceo/products");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in createMasterProduct Server Action:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function updateMasterProduct(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("si_session");
    if (!sessionCookie?.value) {
      return { success: false, error: "Unauthorized. Please log in." };
    }
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "ceo") {
      return { success: false, error: "Unauthorized. Only CEO can edit products." };
    }

    const supabase = await createAdminClient();

    const productId = formData.get("product_id") as string;
    if (!productId) {
      return { success: false, error: "Product ID is required." };
    }

    const name = formData.get("name") as string;
    const hsn_code = formData.get("hsn_code") as string;
    const purchase_price = parseFloat(formData.get("manufacturing_price") as string) || 0;
    const selling_price = parseFloat(formData.get("selling_price") as string) || 0;
    const mrp = parseFloat(formData.get("mrp") as string) || 0;
    const tax_rate = parseFloat(formData.get("tax_rate") as string) || 18;
    const stock = parseFloat(formData.get("stock") as string) || 0;
    const min_stock = parseFloat(formData.get("min_stock") as string) || 0;
    const packaging_type = formData.get("packaging_type") as string;
    const packing_size_amount = parseFloat(formData.get("packing_size_amount") as string) || 0;
    const packing_size_unit = formData.get("packing_size_unit") as string;
    
    const tagsJsonStr = formData.get("tags") as string;
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsJsonStr);
    } catch {
      tags = tagsJsonStr ? tagsJsonStr.split(",").map(t => t.trim()) : [];
    }



    // Get current product details to check for image replacement
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", productId)
      .single();

    if (fetchError || !currentProduct) {
      return { success: false, error: "Product not found." };
    }

    const imageFile = formData.get("image") as File | null;
    let imageUrl = currentProduct.image_url || "";

    if (imageFile && imageFile.size > 0) {
      // 1. Upload new image
      const fileExt = imageFile.name.split('.').pop();
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileName = `${sanitizedName}-v1-${Date.now()}.${fileExt}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_assets')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          duplex: 'half'
        });

      if (uploadError) {
        console.error("Storage upload error in server action:", uploadError);
        return { success: false, error: `Failed to upload image: ${uploadError.message}` };
      }

      // 2. Delete old image if it exists
      if (currentProduct.image_url) {
        const oldImageUrl = currentProduct.image_url;
        let bucketName = oldImageUrl.includes("/company_assets/") ? "company_assets" : "Products";
        const bucketIndicator = `/storage/v1/object/public/${bucketName}/`;
        
        if (oldImageUrl.includes(bucketIndicator)) {
          let oldFileName = oldImageUrl.split(bucketIndicator).pop();
          if (oldFileName) {
            oldFileName = oldFileName.split('?')[0];
            console.log(`Deleting old image file from storage: ${oldFileName}`);
            const { error: storageError } = await supabase.storage
              .from(bucketName)
              .remove([oldFileName]);
            if (storageError) {
              console.error("Failed to delete old image from storage:", storageError);
            }
          }
        }
      }

      if (uploadData) {
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/company_assets/${fileName}`;
      }
    }

    // Update database row
    const { error: updateError } = await supabase
      .from("products")
      .update({
        product_name: name,
        hsn_code,
        mfg_cost: purchase_price,
        selling_cost: selling_price,
        mrp,
        tax_rate,
        actual_stock: stock,
        min_stock_threshold: min_stock,
        package_type: packaging_type,
        package_size: packing_size_amount,
        package_size_unit: packing_size_unit,
        tags: tags.join(','),
        image_url: imageUrl
      })
      .eq("id", productId)
      .eq("is_master_product", true);

    if (updateError) {
      console.error("Database update error in server action:", updateError);
      return { success: false, error: `Database error: ${updateError.message}` };
    }

    revalidatePath("/dashboard/ceo/products");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in updateMasterProduct Server Action:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function deleteMasterProduct(productId: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("si_session");
    if (!sessionCookie?.value) {
      return { success: false, error: "Unauthorized. Please log in." };
    }
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "ceo") {
      return { success: false, error: "Unauthorized. Only CEO can delete products." };
    }

    const supabase = await createAdminClient();

    // 1. Get product image url to clean up storage
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product for deletion:", fetchError);
      return { success: false, error: "Product not found." };
    }

    // 2. If product has an image stored in our bucket, delete it
    if (product && product.image_url) {
      const imageUrl = product.image_url;
      let bucketName = imageUrl.includes("/company_assets/") ? "company_assets" : "Products";
      const bucketIndicator = `/storage/v1/object/public/${bucketName}/`;
      
      if (imageUrl.includes(bucketIndicator)) {
        let fileName = imageUrl.split(bucketIndicator).pop();
        if (fileName) {
          fileName = fileName.split('?')[0];
          console.log(`Deleting image file from storage: ${fileName}`);
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([fileName]);
          if (storageError) {
            console.error("Failed to delete image from storage:", storageError);
          } else {
            console.log("Successfully deleted image from storage.");
          }
        }
      }
    }

    // 3. Delete product row from DB
    const { error: dbError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("is_master_product", true);

    if (dbError) {
      console.error("Database error deleting product:", dbError);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    revalidatePath("/dashboard/ceo/products");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in deleteMasterProduct Server Action:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
