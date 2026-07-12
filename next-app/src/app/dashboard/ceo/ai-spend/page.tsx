"use client";

import React, { useEffect, useState } from "react";
import { Cpu, DollarSign, ListCollapse, RefreshCw, BarChart2, TrendingUp, Calendar, Box, Activity } from "lucide-react";
import { getAiSpendSummary } from "../settings/actions";
import { useLanguage } from "@/components/LanguageProvider";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#374151"];

export default function AiSpendPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    const res = await getAiSpendSummary();
    if (res.success) {
      setLogs(res.logs || []);
      setAggregates(res.aggregate || []);
      setGrandTotal(res.grandTotal || 0);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format data for chart
  const chartData = aggregates.map((agg) => ({
    name: agg.model,
    cost: Number(Number(agg.total_cost).toFixed(2)),
    calls: agg.total_calls
  }));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">{t("Loading AI Spend Ledger...")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span>{t("Home")}</span>
          <span className="text-muted-foreground/45">/</span>
          <span>{t("Settings")}</span>
          <span className="text-muted-foreground/45">/</span>
          <span className="text-foreground">{t("AI Spend Ledger")}</span>
        </div>
        <button
          onClick={loadData}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-[10px] hover:text-foreground font-black text-muted-foreground uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          <RefreshCw size={10} className={isRefreshing ? "animate-spin" : ""} />
          {t("Refresh")}
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <Cpu className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("AI Spend & Token Analytics")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Track real-time API call counts, prompt/completion tokens, and total AI expenses in Indian Rupees.")}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Total Spent (Rupees)")}</p>
            <p className="text-3xl font-black text-emerald-500">₹{grandTotal.toFixed(4)}</p>
            <p className="text-[10px] text-muted-foreground">{t("Auto-reconciled on active exchange rates")}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 shrink-0">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Total API Calls")}</p>
            <p className="text-3xl font-black text-foreground">
              {aggregates.reduce((acc, curr) => acc + curr.total_calls, 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">{t("Successful AI completions triggered")}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary shrink-0">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Active AI Models")}</p>
            <p className="text-3xl font-black text-foreground">{aggregates.length}</p>
            <p className="text-[10px] text-muted-foreground">{t("Distinct LLM configurations configured")}</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500 shrink-0">
            <Box size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost breakdown chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            {t("Rupee Cost Breakdown per Model")}
          </h3>
          <div className="h-[250px] w-full">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {t("No chart data available")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      color: "var(--foreground)",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Model Calls Share */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            {t("API Call Share")}
          </h3>
          <div className="h-[180px] w-full flex items-center justify-center">
            {chartData.length === 0 ? (
              <div className="text-xs text-muted-foreground">{t("No chart data")}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="calls"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground border-t border-border pt-4">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Spend Logs Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">{t("AI Usage Log History")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("Audited transactions of completions with exact token and cost breakdowns.")}</p>
        </div>

        <div className="overflow-x-auto border border-border/60 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{t("Timestamp")}</th>
                <th className="py-3 px-4">{t("Purpose")}</th>
                <th className="py-3 px-4">{t("Model")}</th>
                <th className="py-3 px-4 text-center">{t("Prompt Tokens")}</th>
                <th className="py-3 px-4 text-center">{t("Completion Tokens")}</th>
                <th className="py-3 px-4 text-right">{t("Cost (₹)")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">
                    {t("No AI completions recorded yet.")}
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">{log.purpose}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-[10px] font-bold">
                        {log.model}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">{log.tokens_prompt}</td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">{log.tokens_completion}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-500">
                      ₹{Number(log.cost_rupees).toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
