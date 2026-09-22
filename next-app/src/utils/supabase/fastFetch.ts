// Resilient Fast Fetch for Supabase with Zero-Hang Network Fallback
// When Supabase host is offline or DNS lookup fails, prevents 4x exponential retries (15s freeze)
// by returning an immediate clean empty response in <50ms.

let isSupabaseOffline = false;
let lastCheckTime = 0;
const OFFLINE_COOLDOWN_MS = 30000; // 30s before probing network again

export const fastFetch = async (url: any, options: any = {}) => {
  const urlStr = typeof url === "string" ? url : url?.toString?.() || "";
  const isSupabase = urlStr.includes("supabase.co");

  // Determine expected shape for Postgrest
  const accept =
    options?.headers?.["Accept"] ||
    options?.headers?.["accept"] ||
    (options?.headers?.get && options.headers.get("accept")) ||
    "";
  const isSingle = String(accept).includes("vnd.pgrst.object");
  const fallbackJson = isSingle ? "null" : "[]";

  // If Supabase was detected down within cooldown, return instant fallback in 0ms
  if (isSupabase && isSupabaseOffline && Date.now() - lastCheckTime < OFFLINE_COOLDOWN_MS) {
    return new Response(fallbackJson, {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  // Hard 800ms timeout signal
  const timeoutSignal = AbortSignal.timeout(800);
  const signals: AbortSignal[] = [timeoutSignal];
  if (options?.signal) signals.push(options.signal);
  const signal = (AbortSignal as any).any ? (AbortSignal as any).any(signals) : timeoutSignal;

  try {
    const res = await fetch(url, { ...options, signal });
    if (isSupabase) {
      isSupabaseOffline = false;
    }
    return res;
  } catch (err: any) {
    if (isSupabase) {
      isSupabaseOffline = true;
      lastCheckTime = Date.now();

      // Return clean fallback response so Postgrest does NOT enter a 15-second retry loop
      return new Response(fallbackJson, {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
    throw err;
  }
};
