"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getAIChatMessages() {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_chat_messages")
      .select("role, content, created_at")
      .eq("session_id", "default")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Error fetching AI messages:", err);
    return { success: false, error: err.message };
  }
}

export async function saveAIChatMessage(role: "user" | "assistant", content: string) {
  try {
    const { error } = await supabaseAdmin
      .from("ai_chat_messages")
      .insert({
        session_id: "default",
        role,
        content
      });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error saving AI message:", err);
    return { success: false, error: err.message };
  }
}

export async function clearAIChatHistory() {
  try {
    const { error } = await supabaseAdmin
      .from("ai_chat_messages")
      .delete()
      .eq("session_id", "default");

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error clearing AI chat history:", err);
    return { success: false, error: err.message };
  }
}

export async function getLatestAIInsights() {
  try {
    // Select latest insights grouping by domain
    const { data, error } = await supabaseAdmin
      .from("ai_insights_history")
      .select("domain, content, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filter to get only the latest unique domain records
    const latest: Record<string, { content: string; created_at: string }> = {};
    if (data) {
      data.forEach((row) => {
        if (!latest[row.domain]) {
          latest[row.domain] = { content: row.content, created_at: row.created_at };
        }
      });
    }

    return { success: true, data: latest };
  } catch (err: any) {
    console.error("Error getting AI insights:", err);
    return { success: false, error: err.message };
  }
}

export async function saveAIInsight(domain: string, content: string) {
  try {
    const { error } = await supabaseAdmin
      .from("ai_insights_history")
      .insert({
        domain,
        content
      });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error saving AI insight:", err);
    return { success: false, error: err.message };
  }
}
