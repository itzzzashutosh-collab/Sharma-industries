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
    
    return { success: true, url: signedData.signedUrl || "" };
  } catch (error) {
    console.error("Error in uploadCompanyStamp:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function testAiConnection(provider: "openai" | "gemini" | "anthropic", apiKey: string, model: string) {
  try {
    if (!apiKey) {
      return { success: false, error: "API Key cannot be empty." };
    }
    
    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 5
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || "OpenAI API returned an error." };
      }
    } else if (provider === "gemini") {
      // Gemini
      const { getGeminiClient } = await import("@/utils/geminiClient");
      const ai = getGeminiClient(apiKey);
      const cleanModel = (model || "gemini-3.5-flash").replace("models/", "");

      const response = await ai.models.generateContent({
        model: cleanModel,
        contents: "Say hello",
        config: { maxOutputTokens: 5 }
      });

      if (response && response.text) {
        return { success: true };
      } else {
        return { success: false, error: "Gemini API returned an empty response." };
      }
    } else if (provider === "anthropic") {
      // Anthropic
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: model || "claude-3-haiku-20240307",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 5
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || "Anthropic API returned an error." };
      }
    }
  } catch (error: any) {
    console.error("AI connection test failed:", error);
    return { success: false, error: error.message || "Connection timeout or network error." };
  }
}

export async function initAIDatabaseTables() {
  try {
    const sql = (await import("@/lib/db")).default;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_config (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        api_key TEXT NOT NULL,
        selected_model TEXT NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_usage_log (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        tokens_prompt INT DEFAULT 0,
        tokens_completion INT DEFAULT 0,
        cost_rupees NUMERIC(10,4) DEFAULT 0.0000,
        purpose TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      UPDATE ai_config 
      SET selected_model = 'gemini-3.5-flash' 
      WHERE selected_model LIKE 'gemini-1.5%'
    `;

    return { success: true };
  } catch (error: any) {
    console.error("Failed to initialize AI tables in database:", error);
    return { success: false, error: error.message };
  }
}

export async function getAiConfigs() {
  try {
    const sql = (await import("@/lib/db")).default;
    const rows = await sql`
      SELECT id, provider, api_key, selected_model, is_active 
      FROM ai_config 
      ORDER BY provider ASC
    `;
    return { success: true, data: rows };
  } catch (error: any) {
    console.error("Failed to fetch AI configs:", error);
    return { success: false, error: error.message };
  }
}

export async function saveAiConfigs(configs: { provider: string; api_key: string; selected_model: string; is_active: boolean }[]) {
  try {
    const sql = (await import("@/lib/db")).default;

    // Reset is_active for all configs if any is set active
    const hasActive = configs.some(c => c.is_active);
    if (hasActive) {
      await sql`UPDATE ai_config SET is_active = false`;
    }

    for (const c of configs) {
      const id = `AI_CONFIG_${c.provider.toUpperCase()}`;
      await sql`
        INSERT INTO ai_config (id, provider, api_key, selected_model, is_active, updated_at)
        VALUES (${id}, ${c.provider}, ${c.api_key}, ${c.selected_model}, ${c.is_active}, now())
        ON CONFLICT (id) DO UPDATE SET
          api_key = EXCLUDED.api_key,
          selected_model = EXCLUDED.selected_model,
          is_active = EXCLUDED.is_active,
          updated_at = now()
      `;
    }

    revalidatePath("/dashboard/ceo/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save AI configs:", error);
    return { success: false, error: error.message };
  }
}

export async function getAiSpendSummary() {
  try {
    const sql = (await import("@/lib/db")).default;
    const logs = await sql`
      SELECT id, provider, model, tokens_prompt, tokens_completion, cost_rupees, purpose, created_at
      FROM ai_usage_log
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    // Aggregate by provider/model
    const aggregate = await sql`
      SELECT provider, model, COUNT(*)::int as total_calls, SUM(cost_rupees)::float as total_cost
      FROM ai_usage_log
      GROUP BY provider, model
      ORDER BY total_cost DESC
    `;

    const totalCostRows = await sql`
      SELECT SUM(cost_rupees)::float as grand_total
      FROM ai_usage_log
    `;
    const grandTotal = totalCostRows[0]?.grand_total || 0;

    return { success: true, logs, aggregate, grandTotal };
  } catch (error: any) {
    console.error("Failed to calculate AI spend summary:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, name, phone, role, is_approved, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching users list in settings:", err);
    return { success: false, error: err.message };
  }
}

export async function updateUserRoleAndStatus(userId: string, role: string, isApproved: boolean) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ role, is_approved: isApproved })
      .eq("id", userId);

    if (error) throw error;
    revalidatePath("/dashboard/ceo/settings");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating user settings:", err);
    return { success: false, error: err.message };
  }
}

export async function backupDatabaseData() {
  try {
    const supabase = await createAdminClient();
    
    const tables = ["products", "employees", "orders", "raw_materials", "factory_expenses", "purchase_master"];
    const backup: Record<string, any> = {};

    for (const table of tables) {
      const { data } = await supabase.from(table).select("*");
      backup[table] = data || [];
    }

    return { success: true, backup };
  } catch (err: any) {
    console.error("Error backing up database:", err);
    return { success: false, error: err.message };
  }
}
