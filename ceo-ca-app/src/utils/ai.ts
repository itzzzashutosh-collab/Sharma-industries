import sql from "@/lib/db";

export interface AIConfig {
  id: string;
  provider: string;
  api_key: string;
  selected_model: string;
  is_active: boolean;
}

export interface AIUsageLog {
  id: string;
  provider: string;
  model: string;
  tokens_prompt: number;
  tokens_completion: number;
  cost_rupees: number;
  purpose: string;
  created_at: string;
}

// Model pricing in USD per 1K tokens. Exchange rate: 1 USD = 83 INR
const PRICE_MAP: Record<string, { input: number; output: number }> = {
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "gemini-2.0-flash": { input: 0.000075, output: 0.0003 },
  "gemini-2.5-flash": { input: 0.000075, output: 0.0003 },
  "gemini-3.5-flash": { input: 0.000075, output: 0.0003 },
  "gemini-3.1-pro": { input: 0.00125, output: 0.005 },
  "gemini-3.1-flash-lite": { input: 0.00003, output: 0.00015 },
  "gpt-4o": { input: 0.0025, output: 0.010 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
  "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 }
};

export async function getActiveAIConfig(): Promise<AIConfig | null> {
  try {
    const rows = await sql`
      SELECT id, provider, api_key, selected_model, is_active 
      FROM ai_config 
      WHERE is_active = true 
      LIMIT 1
    `;
    if (rows && rows.length > 0) {
      const dbModel = rows[0].selected_model || "";
      const selected_model = dbModel.startsWith("gemini-1.5") ? "gemini-3.5-flash" : dbModel;
      return {
        id: rows[0].id,
        provider: rows[0].provider,
        api_key: rows[0].api_key,
        selected_model,
        is_active: rows[0].is_active
      };
    }
    return null;
  } catch (err) {
    console.error("Failed to query active AI settings from database:", err);
    return null;
  }
}

export async function logAIUsage(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  purpose: string
) {
  try {
    const price = PRICE_MAP[model] || { input: 0.00015, output: 0.0006 }; // fallback to gpt-4o-mini pricing
    const costUsd = (promptTokens / 1000) * price.input + (completionTokens / 1000) * price.output;
    const costInr = costUsd * 83; // 83 INR per USD

    const id = `AILOG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await sql`
      INSERT INTO ai_usage_log (
        id, provider, model, tokens_prompt, tokens_completion, cost_rupees, purpose
      ) VALUES (
        ${id}, ${provider}, ${model}, ${promptTokens}, ${completionTokens}, ${costInr}, ${purpose}
      )
    `;
  } catch (err) {
    console.error("Failed to log AI usage to database:", err);
  }
}
