"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getEmployees() {
  try {
    const { data, error } = await supabaseAdmin
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching employees:", err);
    return { success: false, error: err.message };
  }
}

export async function addEmployee(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    
    // Extract text fields
    const employeeData = {
      id,
      name,
      designation: formData.get("designation") as string,
      payroll_type: formData.get("payroll_type") as string,
      salary_day: formData.get("salary_day") as string,
      work_details: formData.get("work_details") as string,
      contact_no: formData.get("contact_no") as string,
      emergency_contact: formData.get("emergency_contact") as string,
      aadhaar_no: formData.get("aadhaar_no") as string,
      pan_no: formData.get("pan_no") as string,
      bank_name: formData.get("bank_name") as string,
      account_name: formData.get("account_name") as string,
      account_no: formData.get("account_no") as string,
      ifsc_code: formData.get("ifsc_code") as string,
      status: "Active",
    };

    // Helper to upload file
    const uploadFile = async (file: File | null, docName: string) => {
      if (!file || file.size === 0) return null;
      
      const ext = file.name.split('.').pop();
      // Format: Ramesh_EMP001_AadhaarFront.jpg
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
      const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
      const newFileName = `${cleanName}_${cleanId}_${docName}.${ext}`;
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabaseAdmin.storage
        .from('company_assets')
        .upload(`employees/${newFileName}`, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${docName}:`, error);
        return null;
      }
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('company_assets')
        .getPublicUrl(`employees/${newFileName}`);

      return publicUrlData.publicUrl;
    };

    // Upload the 4 files
    const profile_pic_url = await uploadFile(formData.get("profile_pic") as File, "ProfilePic");
    const aadhaar_front_url = await uploadFile(formData.get("aadhaar_front") as File, "AadhaarFront");
    const aadhaar_back_url = await uploadFile(formData.get("aadhaar_back") as File, "AadhaarBack");
    const pan_front_url = await uploadFile(formData.get("pan_front") as File, "PANFront");

    // Insert into database
    const { error: insertError } = await supabaseAdmin
      .from("employees")
      .insert({
        ...employeeData,
        profile_pic_url,
        aadhaar_front_url,
        aadhaar_back_url,
        pan_front_url
      });

    if (insertError) throw insertError;

    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (err: any) {
    console.error("Error onboarding employee:", err);
    return { success: false, error: err.message };
  }
}
