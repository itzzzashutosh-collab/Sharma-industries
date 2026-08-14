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

export async function getEmployeeDashboardData() {
  try {
    const { data: employees, error: empErr } = await supabaseAdmin
      .from("employees")
      .select("*")
      .order("name", { ascending: true });
    if (empErr) throw empErr;

    const today = new Date().toISOString().split("T")[0];
    const { data: todayAttendance, error: attErr } = await supabaseAdmin
      .from("attendance")
      .select("*")
      .eq("date", today);
    if (attErr) throw attErr;

    const { data: allAttendance, error: allAttErr } = await supabaseAdmin
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });
    if (allAttErr) throw allAttErr;

    const { data: payrollSlips, error: payErr } = await supabaseAdmin
      .from("salary_payments")
      .select("*")
      .order("month", { ascending: false });
    if (payErr) throw payErr;

    return {
      success: true,
      data: {
        employees: employees || [],
        todayAttendance: todayAttendance || [],
        allAttendance: allAttendance || [],
        payrollSlips: payrollSlips || []
      }
    };
  } catch (err: any) {
    console.error("Error fetching employee dashboard data:", err);
    return { success: false, error: err.message };
  }
}

export async function markEmployeeAttendance(employeeId: string, date: string, status: "Present" | "Absent") {
  try {
    // Check if attendance already exists for this employee and date
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("attendance")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("attendance")
        .update({ status })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const id = `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const { error } = await supabaseAdmin
        .from("attendance")
        .insert({
          id,
          employee_id: employeeId,
          date,
          status
        });
      if (error) throw error;
    }

    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (err: any) {
    console.error("Error marking attendance:", err);
    return { success: false, error: err.message };
  }
}

export async function generateSalarySlip(payload: {
  employeeId: string;
  month: string;
  baseSalary: number;
  daysPresent: number;
  advancesDeducted: number;
  paymentMode: string;
  paymentDate: string;
}) {
  try {
    const gross_salary = Number(payload.baseSalary);
    const net_paid = gross_salary - Number(payload.advancesDeducted);
    const id = `PAY-${Date.now().toString().slice(-4)}`;

    const { error } = await supabaseAdmin
      .from("salary_payments")
      .insert({
        id,
        employee_id: payload.employeeId,
        month: payload.month,
        base_salary: payload.baseSalary,
        days_present: payload.daysPresent,
        gross_salary,
        advances_deducted: payload.advancesDeducted,
        net_paid,
        payment_mode: payload.paymentMode,
        payment_date: payload.paymentDate
      });

    if (error) throw error;

    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (err: any) {
    console.error("Error generating salary slip:", err);
    return { success: false, error: err.message };
  }
}

export async function addEmployee(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const salaryVal = formData.get("salary") || formData.get("base_salary") || "0";
    
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
      salary: Number(salaryVal) || 0,
      status: "Active",
      joining_date: new Date().toISOString().split("T")[0]
    };

    // Helper to upload file
    const uploadFile = async (file: File | null, docName: string) => {
      if (!file || file.size === 0) return null;
      
      const ext = file.name.split('.').pop();
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
