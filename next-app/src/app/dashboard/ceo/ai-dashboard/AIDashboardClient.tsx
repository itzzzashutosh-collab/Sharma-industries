"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { 
  Sparkles, Send, Bot, User, TrendingUp, AlertCircle, CheckCircle2, 
  ArrowRight, Database, Cpu, RefreshCw, HelpCircle, Brain, Zap, 
  DollarSign, Package, ShoppingCart, Factory, Users, BarChart2, Shield, X
} from "lucide-react";
import { chatWithGlobalAI } from "@/actions/chatActions";
import { saveAIChatMessage, clearAIChatHistory, saveAIInsight } from "./actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRESET_QUERIES = [
  "What is our total active painter count and top loyalty scanner?",
  "Check total revenue and count of unpaid outstanding invoices",
  "Analyze paint product margins and cost-effective formulations",
  "Provide a manufacturing efficiency check and material depletion risks"
];

const DOMAINS = [
  { key: "sales",       label: "Sales & Revenue",     icon: DollarSign,   color: "text-emerald-500",  bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "inventory",   label: "Inventory & Stock",   icon: Package,      color: "text-amber-500",    bg: "bg-amber-500/10 border-amber-500/20" },
  { key: "suppliers",   label: "Procurement",         icon: ShoppingCart, color: "text-blue-500",     bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "production",  label: "Manufacturing",       icon: Factory,      color: "text-violet-500",   bg: "bg-violet-500/10 border-violet-500/20" },
  { key: "customers",   label: "Customer Intelligence", icon: Users,      color: "text-rose-500",     bg: "bg-rose-500/10 border-rose-500/20" },
  { key: "cashflow",    label: "Financial Health",    icon: BarChart2,    color: "text-primary",      bg: "bg-primary/10 border-primary/20" },
  { key: "competitors", label: "Competitor Analysis", icon: Shield,       color: "text-orange-500",   bg: "bg-orange-500/10 border-orange-500/20" },
];

const DOMAIN_PROMPTS: Record<string, string> = {
  sales:       "Analyze our sales and revenue situation: total sales, unpaid invoices, and key trends. Give a 3-5 point executive summary with actionable recommendations.",
  inventory:   "Analyze our inventory and product catalog: how many products exist, what cost and margin averages look like, and flag any procurement or stock risks.",
  suppliers:   "Analyze our procurement and supplier setup: total procurement spend, supplier count, and provide 3-5 strategic procurement recommendations.",
  production:  "Analyze our manufacturing health: production efficiency, raw material dependencies, and flag anything that might risk production continuity.",
  customers:   "Analyze our customer and dealer intelligence from the business data: revenue per customer segment, payment behavior, and relationship risks.",
  cashflow:    "Analyze our financial health comprehensively: balance of receivables vs payables, cash flow risks, and key financial recommendations.",
  competitors: "Analyze our competitor intelligence data. How many competitor SKUs and brands are tracked? What is their average MRP vs ours? Which brands have the most SKUs? Give 3-5 competitive strategy recommendations for Sharma Industries based on this data.",
};

const DUMMY_ACTIONS = [
  "Increase Rustic Royale production batch by 20% to meet growing demand.",
  "Schedule collection call with overdue dealers — priority: Ravi Traders (₹2.4L).",
  "Raise Acrylic Emulsion purchase order immediately.",
  "Review and approve 3 pending dealer registrations.",
  "Negotiate bulk discount on Titanium Dioxide with primary supplier.",
  "Launch WhatsApp campaign to reactivate 15 inactive painters.",
  "Review outstanding payables to suppliers before month-end."
];

interface InsightEntry {
  domain: string;
  content: string;
  loading: boolean;
  error?: string;
}

export default function AIDashboardClient({
  initialMessages = [],
  initialInsights = {}
}: {
  initialMessages: Message[];
  initialInsights: Record<string, { content: string; created_at: string }>;
}) {
  const { t } = useLanguage();
  const [activeDashboardTab, setActiveDashboardTab] = useState<"chat" | "insights" | "advisor">("chat");

  // ─── CHAT STATE ───
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : [
      {
        role: "assistant",
        content: "Welcome to the Sharma Industries AI Dashboard. I have access to your active databases (Products, Inventory, Orders, Invoices, Dealers, Painters, and Ledger Logs). How can I assist you with business intelligence today?"
      }
    ]
  );
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── INSIGHTS STATE ───
  const [insights, setInsights] = useState<Record<string, InsightEntry>>(() => {
    const loaded: Record<string, InsightEntry> = {};
    DOMAINS.forEach((d) => {
      const initVal = initialInsights[d.key];
      if (initVal) {
        loaded[d.key] = { domain: d.key, content: initVal.content, loading: false };
      }
    });
    return loaded;
  });
  const [insightsTab, setInsightsTab] = useState<string>("sales");
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeDashboardTab === "chat") {
      scrollToBottom();
    }
  }, [messages, isPending, activeDashboardTab]);

  const handleSend = (text: string) => {
    if (!text.trim() || isPending) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    startTransition(async () => {
      await saveAIChatMessage("user", text);

      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await chatWithGlobalAI(text, historyPayload);
      if (res.success && res.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: res.reply! }]);
        await saveAIChatMessage("assistant", res.reply!);
      } else {
        const errorMsg = res.error || "Connection timed out. Please check your Supabase API setup.";
        setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
        await saveAIChatMessage("assistant", errorMsg);
      }
    });
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear the AI Chat History?")) {
      const res = await clearAIChatHistory();
      if (res.success) {
        setMessages([
          {
            role: "assistant",
            content: "Welcome to the Sharma Industries AI Dashboard. I have access to your active databases (Products, Inventory, Orders, Invoices, Dealers, Painters, and Ledger Logs). How can I assist you with business intelligence today?"
          }
        ]);
      }
    }
  };

  // ─── INSIGHT GENERATOR ───
  const fetchInsight = async (domainKey: string) => {
    setInsights(prev => ({
      ...prev,
      [domainKey]: { domain: domainKey, content: "", loading: true }
    }));

    const res = await chatWithGlobalAI(DOMAIN_PROMPTS[domainKey], []);
    if (res.success && res.reply) {
      setInsights(prev => ({
        ...prev,
        [domainKey]: { domain: domainKey, content: res.reply!, loading: false }
      }));
      await saveAIInsight(domainKey, res.reply!);
    } else {
      setInsights(prev => ({
        ...prev,
        [domainKey]: { domain: domainKey, content: "", loading: false, error: res.error || "Failed to get insight" }
      }));
    }
  };

  const loadAllInsights = async () => {
    setIsLoadingAll(true);
    await Promise.all(DOMAINS.map(d => fetchInsight(d.key)));
    setIsLoadingAll(false);
  };

  const activeDomain = DOMAINS.find(d => d.key === insightsTab);
  const activeInsight = insights[insightsTab];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Sparkles className="text-primary animate-pulse" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">AI Central Intelligence</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time LLM reasoning across live sales, inventories, production, and loyalty registries.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-center">
          <Database size={13} className="animate-pulse" />
          <span>Active Context Connected</span>
        </div>
      </div>

      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex gap-2.5 border-b border-border/60 pb-3 text-xs font-bold">
        {[
          { key: "chat", label: "AI Chat Assistant" },
          { key: "insights", label: "AI Insights Hub" },
          { key: "advisor", label: "Business Advisor recommendations" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveDashboardTab(tab.key as any);
              if (tab.key === "insights" && !insights[insightsTab]) {
                fetchInsight(insightsTab);
              }
            }}
            className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              activeDashboardTab === tab.key
                ? "bg-muted text-foreground border-border/80"
                : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* ─── TAB: CHAT INTERFACE ─── */}
      {activeDashboardTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Suggested Queries */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Cpu size={16} className="text-primary" /> Suggested Business Queries
              </h3>
              <p className="text-xs text-muted-foreground">Select a predefined query to analyze current database states immediately.</p>
              
              <div className="space-y-2">
                {PRESET_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="w-full text-left text-xs font-semibold text-foreground bg-muted/40 hover:bg-muted/80 border border-border/60 hover:border-primary/20 p-3 rounded-xl transition-all block cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-500" /> Recent Live Recommendations
              </h3>
              <div className="space-y-2 text-xs font-medium text-muted-foreground">
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <p className="font-bold text-foreground">Adjust Safety Stock Limits</p>
                  <p className="mt-0.5 text-[11px]">Acrylic Emulsion levels are critical. Reorder from Primary Vendor.</p>
                </div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <p className="font-bold text-foreground">Outstanding Invoice Notices</p>
                  <p className="mt-0.5 text-[11px]">4 dealers are overdue on invoice dues. Limit credit updates.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Central Chat Panel */}
          <div className="lg:col-span-2 flex flex-col h-[580px] bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-foreground">Intelligent Assistant Session</span>
              </div>
              <button 
                onClick={handleClearHistory}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} /> Reset Chat History
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                        isUser ? "bg-primary text-white border-primary/20" : "bg-muted text-foreground border-border"
                      }`}>
                        {isUser ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                        isUser ? "bg-primary text-white rounded-tr-none" : "bg-muted/40 border border-border/50 text-foreground rounded-tl-none whitespace-pre-wrap font-semibold"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-foreground border border-border">
                      <Bot size={14} />
                    </div>
                    <div className="p-4 rounded-3xl bg-muted/40 border border-border/50 text-foreground rounded-tl-none flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="p-4 border-t border-border bg-muted/10 flex gap-2.5 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask AI about revenue, unpaid invoices, painter scans or formula recipes..."
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-foreground font-semibold placeholder:font-medium"
              />
              <button
                type="submit"
                disabled={isPending || !input.trim()}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB: DOMAIN INSIGHTS ─── */}
      {activeDashboardTab === "insights" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground font-semibold">Select an operational domain for specialized AI telemetry and insights</p>
            <button
              onClick={loadAllInsights}
              disabled={isLoadingAll}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw size={12} className={isLoadingAll ? "animate-spin" : ""} />
              {isLoadingAll ? t("Generating...") : t("Run Full Audit")}
            </button>
          </div>

          {/* Domain grids */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DOMAINS.map((domain) => {
              const Icon = domain.icon;
              const ins = insights[domain.key];
              const isActive = insightsTab === domain.key;
              return (
                <button
                  key={domain.key}
                  onClick={() => {
                    setInsightsTab(domain.key);
                    if (!insights[domain.key]) fetchInsight(domain.key);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary/10 border-primary/30 shadow-md animate-pulse-slow"
                      : "bg-card border-border/60 hover:border-primary/20 hover:bg-muted/40"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isActive ? "bg-primary/15 border-primary/30" : domain.bg}`}>
                    <Icon size={16} className={isActive ? "text-primary" : domain.color} />
                  </div>
                  <span className={`text-[10px] font-bold text-center leading-tight ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {t(domain.label)}
                  </span>
                  {ins && !ins.loading && !ins.error && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  {ins?.loading && (
                    <RefreshCw size={9} className="text-primary animate-spin" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Domain insight text display */}
          <div className="bg-gradient-to-br from-primary/5 via-card to-violet-500/5 border border-primary/15 rounded-2xl p-6 min-h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {activeDomain && (
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${activeDomain.bg}`}>
                    {(() => { const Icon = activeDomain.icon; return <Icon size={16} className={activeDomain.color} />; })()}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold text-foreground">{activeDomain ? t(activeDomain.label) : ""} {t("Telemetry Audit")}</h2>
                  <p className="text-[10px] text-muted-foreground">{t("Aggregating live tables with active AI insights")}</p>
                </div>
              </div>
              <button
                onClick={() => fetchInsight(insightsTab)}
                disabled={activeInsight?.loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={11} className={activeInsight?.loading ? "animate-spin" : ""} />
                {activeInsight?.loading ? t("Analyzing...") : t("Refresh Analysis")}
              </button>
            </div>

            <div className="flex-1 text-xs font-semibold text-foreground/90">
              {!activeInsight && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
                  <Sparkles size={24} className="text-primary/40 animate-bounce" />
                  <p className="text-xs text-muted-foreground">Click generate to parse live database matrices</p>
                  <button onClick={() => fetchInsight(insightsTab)} className="px-4 py-2 bg-primary text-white rounded-xl font-bold mt-2 cursor-pointer">Generate Insight</button>
                </div>
              )}

              {activeInsight?.loading && (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-12 text-center text-muted-foreground">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                  <p>Running LLM diagnostic on Supabase tables...</p>
                </div>
              )}

              {activeInsight?.error && (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-12 text-center text-rose-500">
                  <AlertCircle size={24} />
                  <p>{activeInsight.error}</p>
                </div>
              )}

              {activeInsight?.content && !activeInsight.loading && (
                <div className="space-y-1.5">
                  {activeInsight.content.split("\n").map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={idx} className="h-1" />;
                    const html = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                      return (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="text-primary mt-1 shrink-0">•</span>
                          <p className="text-xs text-foreground/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s/, "") }} />
                        </div>
                      );
                    }
                    return <p key={idx} className="text-xs text-foreground/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB: BUSINESS ADVISOR ─── */}
      {activeDashboardTab === "advisor" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Strategic Recommendations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Automated recommended actions derived from current company operational telemetry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-500" /> Critical Warnings
              </h3>
              <div className="space-y-3">
                {[
                  { text: "Net profit margin dropped slightly from 30% to 28%. Action required: review raw material procurement invoice logs.", severity: "high" },
                  { text: "Overdue dealer payments exceed threshold limits. Follow up with Jaipur Hub distributors.", severity: "medium" },
                  { text: "Acrylic Emulsion inventory depletion speed has accelerated. Place order with primary suppliers.", severity: "high" }
                ].map((warn, i) => (
                  <div key={i} className="flex gap-2.5 p-3.5 bg-muted/20 border border-border/40 rounded-xl text-xs font-semibold text-muted-foreground">
                    <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="leading-relaxed"><strong className="text-foreground">[{warn.severity.toUpperCase()}]</strong> {warn.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" /> Recommended Action Items
              </h3>
              <div className="space-y-2">
                {DUMMY_ACTIONS.map((act, i) => (
                  <div key={i} className="flex gap-2.5 p-3.5 bg-background border border-border/60 hover:border-primary/20 rounded-xl text-xs font-semibold text-foreground/85 transition-colors">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <p className="leading-relaxed">{act}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
