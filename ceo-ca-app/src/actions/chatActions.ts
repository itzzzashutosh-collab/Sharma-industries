"use server";

import sql from "@/lib/db";
import { logAIUsage } from "@/utils/ai";

/**
 * Lowest-cost model tier for each provider.
 * Used for chatbot interactions to minimize spend.
 */
const CHEAPEST_MODELS: Record<string, string> = {
  gemini:    "gemini-2.0-flash",   // Free-tier supported, fast, capable
  openai:    "gpt-4o-mini",        // Lowest OpenAI cost per token
  anthropic: "claude-3-haiku-20240307", // Lowest Anthropic cost per token
};

/**
 * Reads the active AI configuration from the database (set in Settings page).
 * Always prefers Gemini if both Gemini and another provider are saved.
 * Falls back to environment variable OPENAI_API_KEY if nothing is configured.
 */
async function getChatAIConfig() {
  try {
    const rows = await sql`
      SELECT provider, api_key, selected_model, is_active
      FROM ai_config
      ORDER BY 
        CASE WHEN provider = 'gemini' THEN 0
             WHEN provider = 'openai' THEN 1
             ELSE 2
        END ASC
      LIMIT 3
    `;

    if (rows && rows.length > 0) {
      // Prefer active entry; if none marked active, use Gemini first
      const active = rows.find((r: any) => r.is_active) || rows[0];
      const provider: string = active.provider || "gemini";
      const apiKey: string = active.api_key || "";
      // Always use the cheapest model for chatbot — not the heavy analysis model
      const model: string = CHEAPEST_MODELS[provider] || CHEAPEST_MODELS["gemini"];

      if (apiKey) {
        return { provider, apiKey, model };
      }
    }
  } catch {
    // DB not initialized yet — fall through to env fallback
  }

  // Final fallback: use env key with cheapest model
  if (process.env.OPENAI_API_KEY) {
    return { provider: "openai", apiKey: process.env.OPENAI_API_KEY, model: CHEAPEST_MODELS["openai"] };
  }

  return null;
}

/**
 * Gathers a comprehensive snapshot of all key database tables to supply live context
 * to the AI assistant. Each query is wrapped independently so missing tables don't fail others.
 */
async function getCompanyDatabaseContext(): Promise<string> {
  const context: Record<string, any> = {
    company: "Sharma Industries — Paint Manufacturer, Rajasthan, India"
  };

  // 1. Invoices & Sales
  try {
    const res = await sql`
      SELECT
        COUNT(*)::int                                                             AS total_invoices,
        COALESCE(SUM(total_amount), 0)::float                                    AS total_sales_inr,
        COUNT(CASE WHEN payment_status != 'PAID' THEN 1 END)::int                AS unpaid_invoices,
        COALESCE(SUM(CASE WHEN payment_status != 'PAID' THEN total_amount END), 0)::float AS unpaid_amount_inr
      FROM invoices
    `;
    context.sales = res[0];
  } catch { context.sales = "No invoices data yet"; }

  // 2. Products Catalog
  try {
    const res = await sql`
      SELECT
        COUNT(*)::int                       AS total_products,
        COALESCE(AVG(cost), 0)::float       AS avg_cost_inr,
        COALESCE(AVG(mrp), 0)::float        AS avg_mrp_inr,
        COALESCE(AVG(mrp - cost), 0)::float AS avg_margin_inr
      FROM products
    `;
    context.products = res[0];
  } catch { context.products = "No products data yet"; }

  // 3. Purchase Bills / Procurement
  try {
    const res = await sql`
      SELECT
        COUNT(*)::int                          AS total_bills,
        COALESCE(SUM(total_amount), 0)::float  AS total_procurement_inr
      FROM purchase_master
    `;
    context.procurement = res[0];
  } catch { context.procurement = "No procurement data yet"; }

  // 4. Suppliers
  try {
    const res = await sql`SELECT COUNT(*)::int AS total_suppliers FROM suppliers`;
    context.suppliers = { total_suppliers: res[0]?.total_suppliers || 0 };
  } catch { context.suppliers = "No supplier data yet"; }

  // 5. Employees
  try {
    const res = await sql`SELECT COUNT(*)::int AS total_employees FROM employees`;
    context.employees = { total_employees: res[0]?.total_employees || 0 };
  } catch { context.employees = "No employee data yet"; }

  // 6. Quotations
  try {
    const res = await sql`
      SELECT
        COUNT(*)::int                                                                AS total_quotations,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END)::int                        AS accepted,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int                         AS pending
      FROM quotations
    `;
    context.quotations = res[0];
  } catch { context.quotations = "No quotations data yet"; }

  // 7. Recent invoices for trend
  try {
    const res = await sql`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COALESCE(SUM(total_amount), 0)::float AS monthly_sales
      FROM invoices
      WHERE created_at >= NOW() - INTERVAL '3 months'
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 3
    `;
    context.recent_monthly_sales = res;
  } catch { context.recent_monthly_sales = "Not available"; }

  // 8. Competitor Products Intelligence
  try {
    const res = await sql`
      SELECT
        COUNT(*)::int                                AS total_competitor_skus,
        COUNT(DISTINCT brand)::int                   AS total_brands,
        COUNT(DISTINCT category)::int                AS total_categories,
        COALESCE(AVG(mrp), 0)::float                 AS competitor_avg_mrp
      FROM competitor_products
    `;
    const topBrands = await sql`
      SELECT brand, COUNT(*)::int as sku_count
      FROM competitor_products
      GROUP BY brand
      ORDER BY sku_count DESC
      LIMIT 5
    `;
    context.competitors = { ...res[0], top_brands: topBrands };
  } catch { context.competitors = "No competitor data yet"; }

  return JSON.stringify(context, null, 2);
}

/**
 * Global AI chat server action.
 * - Reads Gemini API key from the database (Settings page config)
 * - Prefers Gemini; falls back to OpenAI or Anthropic
 * - Uses cheapest model tier to minimize API spend
 * - Feeds live DB context with every message
 * - Logs usage cost to AI Spend ledger
 */
export async function chatWithGlobalAI(
  message: string,
  history: { role: "user" | "model" | "assistant"; content: string }[]
) {
  try {
    // 1. Get config (prefers Gemini from Settings DB)
    const config = await getChatAIConfig();

    if (!config) {
      return {
        success: false,
        error: "No AI API key configured. Go to CEO Dashboard → Settings → AI Configuration and save your Gemini API key."
      };
    }

    const { provider, apiKey, model } = config;

    // 2. Gather live database context
    const dbContext = await getCompanyDatabaseContext();

    // 3. System prompt with data context
    const systemPrompt = `You are the Sharma Industries Intelligent Business Assistant — a smart, concise, data-aware advisor embedded inside the Sharma Industries OS.

You have LIVE access to the company's current operational database. Here is the current business snapshot in JSON:

${dbContext}

Guidelines:
- Answer naturally as a business advisor, never mention "JSON" or "table" directly
- Use Indian Rupee (₹) formatting for all financial figures  
- Be concise and direct — 3-6 sentences max unless asked for detail
- Use bullet points for lists and recommendations
- If data is missing for a query, say so and suggest where to find it in the dashboard
- You know the company is: Sharma Industries, a paint manufacturer in Rajasthan, India`;

    let reply = "";
    let promptTokens = 0;
    let completionTokens = 0;

    // 4. Call the appropriate provider
    if (provider === "gemini") {
      const { getGeminiClient } = await import("@/utils/geminiClient");
      const ai = getGeminiClient(apiKey);
      const cleanModel = model.replace("models/", "");

      // Build Gemini content array with history + system context injected in first user turn
      const contentsPayload = [
        // Inject system context into the first message
        {
          role: "user" as const,
          parts: [{ text: `${systemPrompt}\n\n---\n\nUser: ${history.length === 0 ? message : history[0]?.content || message}` }]
        },
        // Add middle history turns (skip first user message already injected)
        ...history.slice(1).map(h => ({
          role: (h.role === "assistant" || h.role === "model" ? "model" : "user") as "model" | "user",
          parts: [{ text: h.content }]
        })),
        // Add current message only if there was history (otherwise it's already in first turn)
        ...(history.length > 0
          ? [{ role: "user" as const, parts: [{ text: message }] }]
          : [])
      ];

      const response = await ai.models.generateContent({
        model: cleanModel,
        contents: contentsPayload,
        config: { temperature: 0.6, maxOutputTokens: 600 }
      });

      reply = response.text || "";
      promptTokens = response.usageMetadata?.promptTokenCount || Math.round((systemPrompt + message).length / 4);
      completionTokens = response.usageMetadata?.candidatesTokenCount || Math.round(reply.length / 4);

    } else if (provider === "openai") {
      const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({
          role: (h.role === "model" ? "assistant" : h.role) as "user" | "assistant" | "system",
          content: h.content
        })),
        { role: "user" as const, content: message }
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: messagesPayload, temperature: 0.6, max_tokens: 600 })
      });

      if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
      const result = await response.json();
      reply = result.choices[0].message.content || "";
      promptTokens = result.usage?.prompt_tokens || 0;
      completionTokens = result.usage?.completion_tokens || 0;

    } else if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          system: systemPrompt,
          messages: [
            ...history.map(h => ({ role: h.role === "model" ? "assistant" : h.role, content: h.content })),
            { role: "user", content: message }
          ],
          max_tokens: 600
        })
      });
      if (!response.ok) throw new Error(`Anthropic error: ${response.statusText}`);
      const result = await response.json();
      reply = result.content[0]?.text || "";
      promptTokens = result.usage?.input_tokens || 0;
      completionTokens = result.usage?.output_tokens || 0;
    }

    if (!reply) {
      return { success: false, error: "The AI returned an empty response. Please try again." };
    }

    // 5. Log usage to AI Spend ledger
    try {
      await logAIUsage(provider, model, promptTokens, completionTokens, `Chat: "${message.substring(0, 50)}"`);
    } catch { /* Non-critical — don't fail on logging error */ }

    return { success: true, reply };

  } catch (error: any) {
    console.error("[chatWithGlobalAI] Error:", error);
    return { success: false, error: error.message || "An internal error occurred. Please check Settings." };
  }
}
