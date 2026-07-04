"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCompanySettings() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("company_details")
      .select("*")
      .eq("id", "1")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      console.error("Error fetching company settings:", error);
      return { success: false, error: "Failed to fetch settings." };
    }

    const mappedData = {
      companyName: data.company_name,
      ownerName: data.owner_name || "",
      address: data.address,
      stateCode: data.state_code,
      pincode: data.pincode || "",
      gstin: data.gstin,
      phone: data.phone,
      bankName: data.bank_name || "",
      accountNumber: data.account_number || "",
      ifsc: data.ifsc_code || "",
      upiId: data.upi_id || "",
      signatureUrl: data.signature_url,
      termsAndConditions: data.terms_and_conditions || "",
      notes: data.notes || "",
      companyStampUrl: data.company_stamp_url || ""
    };

    return { success: true, data: mappedData };
  } catch (error) {
    console.error("Error in getCompanySettings:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function saveCompanySettings(settingsData: any) {
  try {
    const supabase = await createAdminClient();
    
    const payload = {
      id: "1",
      company_name: settingsData.companyName,
      owner_name: settingsData.ownerName || null,
      address: settingsData.address,
      state_code: settingsData.stateCode,
      gstin: settingsData.gstin,
      phone: settingsData.phone,
      pincode: settingsData.pincode,
      bank_name: settingsData.bankName,
      account_number: settingsData.accountNumber,
      ifsc_code: settingsData.ifsc,
      upi_id: settingsData.upiId,
      signature_url: settingsData.signatureUrl,
      terms_and_conditions: settingsData.termsAndConditions,
      notes: settingsData.notes,
      company_stamp_url: settingsData.companyStampUrl
    };

    const { error } = await supabase
      .from("company_details")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("Error saving company settings:", error);
      return { success: false, error: "Failed to save settings to database." };
    }

    revalidatePath("/dashboard/ceo/settings");
    return { success: true };
  } catch (error) {
    console.error("Error in saveCompanySettings:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function uploadCompanyStamp(base64Image: string) {
  try {
    const supabase = await createAdminClient();
    
    // Convert base64 to buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // File name: Company Stamp with timestamp to prevent caching issues
    const fileName = `Company_Stamp_${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from("Company Assets (logos, Watermarks)")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true
      });
      
    if (error) {
      console.error("Storage upload error:", error);
      return { success: false, error: "Failed to upload stamp to storage." };
    }
    
    // Create signed URL for 10 years (at least 1 year)
    // 31536000 seconds = 1 year. 10 years = 315360000
    const { data: signedData, error: signedError } = await supabase.storage
      .from("Company Assets (logos, Watermarks)")
      .createSignedUrl(fileName, 315360000);
      
    if (signedError || !signedData) {
      console.error("Signed URL error:", signedError);
      return { success: false, error: "Failed to generate signed URL." };
    }
    
    return { success: true, url: signedData.signedUrl };
  } catch (error) {
    console.error("Error in uploadCompanyStamp:", error);
    return { success: false, error: "Internal server error." };
  }
}
