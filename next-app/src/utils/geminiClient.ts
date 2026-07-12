import { GoogleGenAI } from "@google/genai";

let geminiClientInstance: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

/**
 * Returns a reusable singleton instance of the official GoogleGenAI SDK client.
 * Reinitializes the client dynamically only if the API key changes.
 */
export function getGeminiClient(apiKey: string): GoogleGenAI {
  if (!apiKey) {
    throw new Error("Gemini API key is required to initialize the client.");
  }

  if (!geminiClientInstance || currentApiKey !== apiKey) {
    geminiClientInstance = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
  }

  return geminiClientInstance;
}
