"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getRawMaterials() {
  try {
    const { data, error } = await supabaseAdmin
      .from("raw_materials")
      .select("*")
      .order("material_name", { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching raw materials:", err);
    return { success: false, error: err.message };
  }
}

export async function getRecentPurchases(filter: string = 'all') {
  try {
    let query = supabaseAdmin
      .from("purchase_master")
      .select("*")
      .order("bill_date", { ascending: false });

    const date = new Date();
    if (filter === 'year') {
      date.setFullYear(date.getFullYear() - 1);
      query = query.gte('bill_date', date.toISOString().split('T')[0]);
    } else if (filter === 'month') {
      date.setMonth(date.getMonth() - 1);
      query = query.gte('bill_date', date.toISOString().split('T')[0]);
    } else if (filter === 'week') {
      date.setDate(date.getDate() - 7);
      query = query.gte('bill_date', date.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching purchase bills:", err);
    return { success: false, error: err.message };
  }
}

export async function submitPurchaseBill(formData: FormData) {
  try {
    const invoice_no = formData.get("invoice_no") as string;
    const bill_date = formData.get("bill_date") as string;
    const supplier_name = formData.get("supplier_name") as string;

    // Check duplicate invoice for the same supplier
    if (invoice_no && supplier_name) {
      const { data: existingBill, error: checkErr } = await supabaseAdmin
        .from("purchase_master")
        .select("id")
        .eq("invoice_no", invoice_no.trim())
        .ilike("supplier_name", supplier_name.trim())
        .limit(1)
        .maybeSingle();

      if (checkErr) {
        console.error("Error checking duplicate invoice:", checkErr);
      }
      if (existingBill) {
        return { success: false, error: "DUPLICATE_BILL", message: "This invoice bill has already been registered in the purchase history." };
      }
    }

    const supplier_gstin = formData.get("supplier_gstin") as string;
    const tax_type = formData.get("tax_type") as string || "LOCAL";
    const itemsString = formData.get("items") as string;
    const payment_status = formData.get("payment_status") as string || "UNPAID";
    const payment_type = formData.get("payment_type") as string || "CREDIT";
    const sub_total = Number(formData.get("sub_total") || 0);
    const igst_amount = Number(formData.get("igst_amount") || 0);
    const cgst_amount = Number(formData.get("cgst_amount") || 0);
    const sgst_amount = Number(formData.get("sgst_amount") || 0);
    const total_amount = Math.round(Number(formData.get("total_amount") || 0));
    const transport_details_str = formData.get("transport_details") as string;
    
    let transport_details = {};
    try {
      if (transport_details_str) transport_details = JSON.parse(transport_details_str);
    } catch(e) {
      transport_details = { raw: transport_details_str };
    }

    const items = JSON.parse(itemsString || "[]");

    const supplier_address = formData.get("supplier_address") as string || "";
    const bank_name = formData.get("bank_name") as string || "";
    const bank_account_no = formData.get("bank_account_no") as string || "";
    const bank_ifsc = formData.get("bank_ifsc") as string || "";
    const bank_branch = formData.get("bank_branch") as string || "";
    
    // Generate IDs
    const masterId = `PM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const billFile = formData.get("bill_file") as File | null;
    let bill_file_path: string | null = null;
    
    if (billFile && billFile.size > 0) {
      try {
        await supabaseAdmin.storage.createBucket("purchase_bills", { public: true });
      } catch (e) {}

      try {
        const supplierSlug = supplier_name.toLowerCase().trim().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
        const dotIndex = billFile.name.lastIndexOf(".");
        const ext = dotIndex !== -1 ? billFile.name.slice(dotIndex) : ".pdf";
        const fileName = `${supplierSlug}_${bill_date}${ext}`;
        const fileBuffer = Buffer.from(await billFile.arrayBuffer());
        
        const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
          .from("purchase_bills")
          .upload(fileName, fileBuffer, {
            contentType: billFile.type,
            upsert: true
          });
          
        if (uploadErr) {
          console.error("Error uploading bill file:", uploadErr);
        } else {
          bill_file_path = uploadData?.path || fileName;
        }
      } catch (e) {
        console.error("Failed to upload bill file:", e);
      }
    }

    // 1. Insert header into purchase_master
    const { data: masterData, error: masterError } = await supabaseAdmin
      .from("purchase_master")
      .insert({
        id: masterId,
        invoice_no,
        date: bill_date,
        bill_date,
        supplier_name,
        supplier_gstin,
        items,
        sub_total,
        igst_amount,
        cgst_amount,
        sgst_amount,
        grand_total: total_amount, 
        transport_details,
        payment_status,
        payment_type,
        bill_file_path
      })
      .select("id")
      .single();

    if (masterError) {
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("purchase_master")
        .insert({
          id: masterId,
          invoice_no,
          bill_date,
          supplier_name,
          supplier_gstin,
          items,
          sub_total,
          igst_amount,
          cgst_amount,
          sgst_amount,
          total_amount,
          transport_details,
          payment_status,
          payment_type,
          bill_file_path
        })
        .select("id")
        .single();
        
      if (fallbackError) throw fallbackError;
      var purchase_bill_id = fallbackData.id;
    } else {
      var purchase_bill_id = masterData.id;
    }

    // Synchronize Supplier Profile
    if (supplier_name) {
      try {
        const { data: supplierExists } = await supabaseAdmin
          .from("suppliers")
          .select("id, categories")
          .ilike("name", supplier_name.trim())
          .limit(1)
          .maybeSingle();

        const itemCategories = new Set<string>();
        for (const item of items) {
          if (item.product_id) {
            itemCategories.add("Finished Products");
          } else {
            const nameLower = (item.material_name || "").toLowerCase();
            if (nameLower.includes("bucket")) {
              itemCategories.add("Buckets");
            } else if (nameLower.includes("bottle")) {
              itemCategories.add("Bottles");
            } else if (nameLower.includes("sticker") || nameLower.includes("label") || nameLower.includes("print")) {
              itemCategories.add("Stickers & Labels");
            } else {
              itemCategories.add("Chemicals & Raw Materials");
            }
          }
        }

        const categoriesArray = Array.from(itemCategories);

        if (supplierExists) {
          const existingCats = supplierExists.categories || [];
          const updatedCats = Array.from(new Set([...existingCats, ...categoriesArray]));
          
          await supabaseAdmin
            .from("suppliers")
            .update({
              address: supplier_address || undefined,
              gstin: supplier_gstin || undefined,
              bank_name: bank_name || undefined,
              bank_account_no: bank_account_no || undefined,
              bank_ifsc: bank_ifsc || undefined,
              bank_branch: bank_branch || undefined,
              categories: updatedCats,
              updated_at: new Date().toISOString()
            })
            .eq("id", supplierExists.id);
        } else {
          const supplierId = `SUP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          await supabaseAdmin
            .from("suppliers")
            .insert({
              id: supplierId,
              name: supplier_name.trim(),
              address: supplier_address,
              gstin: supplier_gstin,
              categories: categoriesArray,
              bank_name,
              bank_account_no,
              bank_ifsc,
              bank_branch
            });
        }
      } catch (e) {
        console.error("Error updating supplier registry:", e);
      }
    }

    // 2. Iterate through items and insert into purchase_items
    for (const item of items) {
      const { raw_material_id, product_id, quantity, rate, material_name, hsn_code, unit, gst_tax } = item;
      let resolved_material_id = raw_material_id;
      let resolved_product_id = product_id;

      // Determine item_type: RAW_MATERIAL or PRODUCT
      let item_type: "RAW_MATERIAL" | "PRODUCT" = "RAW_MATERIAL";

      if (resolved_product_id) {
        item_type = "PRODUCT";
      } else if (resolved_material_id) {
        item_type = "RAW_MATERIAL";
      } else if (material_name) {
        const { data: prod } = await supabaseAdmin
          .from("products")
          .select("id")
          .ilike("product_name", material_name.trim())
          .limit(1)
          .maybeSingle();

        if (prod) {
          resolved_product_id = prod.id;
          item_type = "PRODUCT";
        } else {
          const { data: rm } = await supabaseAdmin
            .from("raw_materials")
            .select("id")
            .ilike("material_name", material_name.trim())
            .limit(1)
            .maybeSingle();

          if (rm) {
            resolved_material_id = rm.id;
            item_type = "RAW_MATERIAL";
          } else {
            const newRmId = `RM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { error: insertRmErr } = await supabaseAdmin
              .from("raw_materials")
              .insert({
                id: newRmId,
                material_name: material_name.trim(),
                category: "Chemicals",
                unit_of_measure: unit || "KG",
                current_stock: 0,
                avg_purchase_price: Number(rate),
                min_stock: 100,
                tags: supplier_name
              });
            if (!insertRmErr) {
              resolved_material_id = newRmId;
              item_type = "RAW_MATERIAL";
            } else {
              const { data: firstRm } = await supabaseAdmin
                .from("raw_materials")
                .select("id")
                .limit(1)
                .maybeSingle();
              resolved_material_id = firstRm?.id || "";
              item_type = "RAW_MATERIAL";
            }
          }
        }
      }

      const amountWithoutGst = Number(quantity) * Number(rate);
      const isLocal = tax_type !== "INTERSTATE";
      const gstRate = Number(gst_tax) || 18;
      const gstAmount = amountWithoutGst * (gstRate / 100);
      const cgstVal = isLocal ? gstAmount / 2 : 0;
      const sgstVal = isLocal ? gstAmount / 2 : 0;
      const igstVal = isLocal ? 0 : gstAmount;
      const itemTotal = amountWithoutGst + gstAmount;

      const itemId = `PI_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      await supabaseAdmin
        .from("purchase_items")
        .insert({
          id: itemId,
          purchase_bill_id,
          raw_material_id: resolved_material_id || null,
          product_id: resolved_product_id || null,
          quantity: Number(quantity),
          rate: Number(rate),
          hsn_code: hsn_code || "",
          unit: unit || "KG",
          gst_tax: gstRate,
          cgst_amount: cgstVal,
          sgst_amount: sgstVal,
          igst_amount: igstVal,
          total_amount: itemTotal
        });

      if (item_type === "PRODUCT" && resolved_product_id) {
        const { data: prodData } = await supabaseAdmin
          .from("products")
          .select("actual_stock")
          .eq("id", resolved_product_id)
          .single();

        const currentStock = Number(prodData?.actual_stock || 0);
        const newStock = currentStock + Number(quantity);

        await supabaseAdmin
          .from("products")
          .update({ actual_stock: newStock })
          .eq("id", resolved_product_id);

        await supabaseAdmin.from("stock_logs").insert([{
          id: `LOG-PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          product_id: resolved_product_id,
          date: bill_date || new Date().toISOString().split('T')[0],
          type: "IN",
          qty: Number(quantity),
          reason: `Purchase Inward (${supplier_name})`,
          reference: invoice_no,
          resulting_stock: newStock
        }]);

        await supabaseAdmin.from("stock_ledger").insert([{
          id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: bill_date || new Date().toISOString().split('T')[0],
          item_id: resolved_product_id,
          item_type: "PRODUCT",
          type: "IN",
          qty: Number(quantity),
          rate: Number(rate),
          gst_tax: gstRate,
          total: amountWithoutGst,
          reference: invoice_no,
          supplier_or_buyer: supplier_name,
          resulting_stock: newStock
        }]);

      } else if (item_type === "RAW_MATERIAL" && resolved_material_id) {
        const { data: rmData } = await supabaseAdmin
          .from("raw_materials")
          .select("current_stock")
          .eq("id", resolved_material_id)
          .single();

        const currentStock = Number(rmData?.current_stock || 0);
        const newStock = currentStock + Number(quantity);

        await supabaseAdmin
          .from("raw_materials")
          .update({ current_stock: newStock })
          .eq("id", resolved_material_id);

        await supabaseAdmin.from("material_logs").insert([{
          id: `LOG-MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          material_id: resolved_material_id,
          date: bill_date || new Date().toISOString().split('T')[0],
          type: "IN",
          qty: Number(quantity),
          reason: `Inward from ${supplier_name || 'Purchase Bill'}`,
          reference: invoice_no,
          balance: newStock
        }]);

        await supabaseAdmin.from("stock_ledger").insert([{
          id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: bill_date || new Date().toISOString().split('T')[0],
          item_id: resolved_material_id,
          item_type: "RAW_MATERIAL",
          type: "IN",
          qty: Number(quantity),
          rate: Number(rate),
          gst_tax: gstRate,
          total: amountWithoutGst,
          reference: invoice_no,
          supplier_or_buyer: supplier_name,
          resulting_stock: newStock
        }]);
      }
    }

    revalidatePath("/dashboard/factory");
    revalidatePath("/dashboard/ceo");

    return { success: true };
  } catch (err: any) {
    console.error("Error submitting purchase bill:", err);
    return { success: false, error: err.message };
  }
}

export async function analyzeInvoiceTextWithAI(text: string) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured in the server environment variables.");
    }

    const prompt = `
You are an expert data extraction assistant. Analyze the following raw OCR/PDF text extracted from a purchase bill/invoice.
Extract the billing details into the exact JSON format specified below.

JSON Format:
{
  "supplier_name": "Supplier company/business name",
  "supplier_gstin": "15-character GSTIN format, or empty string",
  "supplier_address": "Extracted supplier physical/billing address, or empty string",
  "invoice_no": "Invoice number or bill number",
  "bill_date": "Date of invoice in YYYY-MM-DD format",
  "due_date": "Due date of invoice in YYYY-MM-DD format (if not explicitly stated, use the same as bill_date)",
  "bank_name": "Bank name extracted from bank details section (e.g. HDFC Bank, ICICI Bank, State Bank of India, etc.), or empty string",
  "bank_account_no": "Bank account number extracted, or empty string",
  "bank_ifsc": "Bank IFSC / IFS code extracted, or empty string",
  "bank_branch": "Bank branch location name extracted, or empty string",
  "items": [
    {
      "material_name": "Exact name of item/material or product as printed on invoice",
      "hsn_code": "HSN or SAC code of the item, e.g. 3906, 3209, etc.",
      "quantity": number (quantity purchased),
      "unit": "unit of measure, e.g. kg, Ltr, bag, nos",
      "rate": number (rate per unit),
      "gst_tax": number (GST rate percentage, e.g. 18 or 5 or 12)
    }
  ]
}

Invoice text to analyze:
---
${text}
---

Return ONLY valid JSON that matches the format. Do not write any markdown code blocks, intro, explanation, or HTML tags. Output strict, clean JSON.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a precise data extractor. You only return valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    const parsedData = JSON.parse(content);

    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error("AI Invoice Parsing failed:", error);
    return { success: false, error: error.message };
  }
}

export async function getSuppliers() {
  try {
    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .select("*")
      .order("name", { ascending: true });
      
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching suppliers:", err);
    return { success: false, error: err.message };
  }
}

export async function addSupplier(supplierData: any) {
  try {
    const id = `SUP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const { error } = await supabaseAdmin
      .from("suppliers")
      .insert({
        id,
        ...supplierData
      });
      
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error adding supplier:", err);
    return { success: false, error: err.message };
  }
}

export async function getSupplierDetailData(supplierName: string) {
  try {
    const { data: bills, error: billsErr } = await supabaseAdmin
      .from("purchase_master")
      .select("id, invoice_no, bill_date, total_amount, payment_status, bill_file_path")
      .ilike("supplier_name", supplierName.trim())
      .order("bill_date", { ascending: false });

    if (billsErr) throw billsErr;

    const mappedBills = (bills || []).map(b => ({
      id: b.id,
      invoice_no: b.invoice_no,
      date: b.bill_date,
      grand_total: b.total_amount,
      payment_status: b.payment_status,
      bill_file_path: b.bill_file_path
    }));

    let suppliedItems: any[] = [];
    if (mappedBills && mappedBills.length > 0) {
      const { data: items, error: itemsErr } = await supabaseAdmin
        .from("purchase_items")
        .select(`
          quantity,
          rate,
          raw_materials (material_name, unit_of_measure),
          products (product_name, package_size_unit)
        `)
        .in(
          "purchase_bill_id", 
          mappedBills.map(b => b.id)
        );

      if (itemsErr) throw itemsErr;

      const itemMap: Record<string, { name: string; rate: number; unit: string }> = {};
      (items || []).forEach((it: any) => {
        const name = it.raw_materials?.material_name || it.products?.product_name || "Unknown Item";
        const unit = it.raw_materials?.unit_of_measure || it.products?.package_size_unit || "Unit";
        const rate = Number(it.rate) || 0;
        
        if (!itemMap[name] || itemMap[name].rate === 0) {
          itemMap[name] = { name, rate, unit };
        }
      });
      suppliedItems = Object.values(itemMap);
    }

    return { 
      success: true, 
      data: {
        bills: mappedBills,
        suppliedItems
      } 
    };
  } catch (err: any) {
    console.error("Error fetching supplier details:", err);
    return { success: false, error: err.message };
  }
}

export async function getSupplierByName(name: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .select("*")
      .ilike("name", name.trim())
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching supplier by name:", err);
    return { success: false, error: err.message };
  }
}
