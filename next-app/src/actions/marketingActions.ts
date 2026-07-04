"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwqjdhwlfuwhyslqtpwd.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getTerritoryPerformance() {
  try {
    const { data, error } = await supabaseAdmin
      .from("view_territory_sales")
      .select("*")
      .order("total_revenue", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching territory performance:", err);
    return { success: false, error: err.message };
  }
}

export async function logFeedback(customerId: string, feedbackData: any) {
  try {
    const { error } = await supabaseAdmin.from("market_feedback").insert([{
      id: `FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customer_id: customerId,
      feedback_type: feedbackData.feedback_type,
      competitor_brand: feedbackData.competitor_brand,
      notes: feedbackData.notes,
      sentiment_score: feedbackData.sentiment_score
    }]);

    if (error) throw error;

    revalidatePath("/dashboard/intelligence");
    return { success: true };
  } catch (err: any) {
    console.error("Error logging feedback:", err);
    return { success: false, error: err.message };
  }
}

export async function getSalesTrends() {
  try {
    // 1. Fetch invoices from the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const dateStr = threeMonthsAgo.toISOString().split('T')[0];

    const { data: invoices, error } = await supabaseAdmin
      .from("invoices")
      .select("date, items")
      .gte("date", dateStr);

    if (error) throw error;

    // 2. Aggregate logic to calculate Demand Forecast
    // Structure: { "Rustic Royale": { totalQty: 1500, recentQty: 800 } }
    const productTrends: Record<string, { name: string, totalQty: number, trend_score: number }> = {};
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthStr = oneMonthAgo.toISOString().split('T')[0];

    invoices?.forEach(inv => {
      const isRecent = inv.date >= oneMonthStr;
      
      let itemsList = [];
      if (typeof inv.items === 'string') {
          try { itemsList = JSON.parse(inv.items); } catch(e){}
      } else if (Array.isArray(inv.items)) {
          itemsList = inv.items;
      }
      
      itemsList.forEach((item: any) => {
        if (!item.name) return;
        const qty = parseFloat(item.qty) || 0;
        
        if (!productTrends[item.name]) {
          productTrends[item.name] = { name: item.name, totalQty: 0, trend_score: 0 };
        }
        productTrends[item.name].totalQty += qty;
        
        // Weight recent sales heavier for trend prediction
        if (isRecent) {
          productTrends[item.name].trend_score += (qty * 1.5);
        } else {
          productTrends[item.name].trend_score += qty;
        }
      });
    });

    // Convert to array and sort by trend score
    const sortedTrends = Object.values(productTrends)
      .sort((a, b) => b.trend_score - a.trend_score)
      .slice(0, 5); // Top 5 in demand

    return { success: true, data: sortedTrends };
  } catch (err: any) {
    console.error("Error calculating sales trends:", err);
    return { success: false, error: err.message };
  }
}

export async function getMarketFeedback() {
  try {
    const { data, error } = await supabaseAdmin
      .from("market_feedback")
      .select("id, feedback_type, competitor_brand, notes, sentiment_score, created_at, customers(name, city)")
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching market feedback:", err);
    return { success: false, error: err.message };
  }
}
