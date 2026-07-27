"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, Brain, Bot, User, Shield, Copy, Check, Share2, MessageSquare, Wrench, Zap, CheckCircle2,
  HelpCircle, RefreshCw, Volume2
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Swatch AI Painter & Technical Technical Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_AI_OBJECTIONS = [
  {
    id: "AI_OBJ_1",
    category: "Coverage & Dry Time Datasheet",
    title: "How can AI help me explain paint coverage & coat drying time to clients?",
    problemText: "Homeowner is asking how long each paint coat will take to dry and if 2 coats are enough.",
    strategy: "Swatch AI Technical Datasheet (140 Sq Ft / Litre + 4-Hour Coat Dry Interval)",
    solutionHindi: "Ma'am/Sir, Swatch Royal Shine Emulsion ka coverage 140 Sq Ft per Litre hota hai. First coat ke baad 4 hours dry interval lagta hai for 100% smooth sheen finish!",
    salesPitch: "140 Sq Ft / Litre Coverage + 4-Hour Inter-Coat Dry Time Datasheet.",
    whatsappTemplate: "Namaste Sir! Swatch Royal Shine Technical Datasheet: Coverage 140 sq ft/Litre (2 Coats). Coat 1 drying time: 4 hours. Complete 100% washable gloss finish! 🎨"
  },
  {
    id: "AI_OBJ_2",
    category: "Full 3BHK Cost Estimation",
    title: "Can AI calculate total paint cost for a 3BHK apartment in Jaipur?",
    problemText: "Client wants an instant total budget estimate for interior + exterior waterproofing.",
    strategy: "Swatch AI Instant Estimation Breakdown (Putty + Primer + Emulsion + Labor)",
    solutionHindi: "Sir, Swatch AI Estimator ke according 2,000 Sq Ft 3BHK house ke liye: 20L Swatch Putty + 20L Swatch Primer + 30L Swatch Royal Shine Emulsion = ₹38,500 total material estimate!",
    salesPitch: "Instant 3BHK Complete Material Breakdown & Total Budget Estimate.",
    whatsappTemplate: "Sir, Swatch AI 3BHK Estimate: Putty (20L) + Acrylic Primer (20L) + Swatch Royal Shine Emulsion (30L). Estimated Material Total: ₹38,500! 📊"
  },
  {
    id: "AI_OBJ_3",
    category: "Seepage Hydro-Lok Guarantee",
    title: "What if client asks for proof of 7-Year Waterproofing Warranty?",
    problemText: "Homeowner wants written proof that seepage will not return in monsoon.",
    strategy: "Swatch AI Hydro-Lok 7-Year Factory Warranty Certificate Generator",
    solutionHindi: "Sir, Swatch Damp Kicker 7-Year Hydro-Lok Warranty certificate direct factory QR verified milta hai. Surface moisture 0% hone ki official 7-year guarantee!",
    salesPitch: "Official Swatch Factory Hydro-Lok 7-Year Warranty Certificate.",
    whatsappTemplate: "Sir, Swatch Damp Kicker 7-Year Hydro-Lok Warranty Certificate: Factory guaranteed 0% wall moisture & zero seepage for 7 years! 🛡️"
  }
];

export function AIAssistantClient() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste Master Applicator! I am your Swatch AI Master Painter. Ask me anything about wall coverage, seepage treatment, primer selection, or customer objection handling!"
    }
  ]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "playbook">("chat");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");

    // Simulate Swatch AI Paint Expert Response
    setTimeout(() => {
      let reply = "For Swatch Paints application, always ensure 2 coats of Swatch Acrylic Putty + 1 coat of Swatch Water Primer before final emulsion coats.";
      const q = userText.toLowerCase();

      if (q.includes("coverage") || q.includes("liter") || q.includes("litre") || q.includes("2000")) {
        reply = "🎨 Swatch Royal Shine Emulsion Coverage: 140-150 sq.ft per Litre (2 coats). For a 2,000 sq.ft area, you will need approx 14-15 Litres of paint (1 Bucket of 20L is ideal).";
      } else if (q.includes("seepage") || q.includes("waterproofing") || q.includes("damp")) {
        reply = "🛡️ Swatch Damp Kicker Treatment: Clean wall surface to bare brick/concrete. Apply 2 coats of Swatch Damp Kicker 7-Year Hydro-Lok Waterproofing. Allow 6 hours drying time between coats.";
      } else if (q.includes("primer") || q.includes("pop")) {
        reply = "🧱 POP & New Wall Primer: Apply 1 coat of Swatch Deep Penetrating Alkali Resistant Primer. Dries in 3 hours and seals POP chalkiness permanently.";
      } else if (q.includes("stencil") || q.includes("metallic")) {
        reply = "🌟 Swatch Rustic Royale Metallic Stencil: Apply Swatch Royal Shine base coat first. Use Swatch Stencil Roller with Clear-Shield Protective Coat for 100% washable feature wall!";
      }

      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    }, 700);
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & AI BANNER ═════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch AI Master Painter
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            Hindi & English AI Chat
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Bot size={18} className="text-indigo-400" /> Swatch AI Paint Assistant
            </h1>
            <p className="text-[10px] text-slate-400">Ask technical questions about coverage, damp treatment, and primer selection.</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "chat", label: "AI Paint Chatbot", icon: Bot },
          { id: "playbook", label: "Technical Playbook", icon: Shield, badge: "3 Strategies" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1 rounded-full text-[8px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: AI PAINT CHATBOT & QUICK CHIPS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "chat" && (
        <div className="space-y-3">
          {/* Quick Prompt Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[9px]">
            {[
              "2,000 sq ft paint coverage?",
              "Heavy wall seepage treatment?",
              "POP wall primer selection?",
              "Metallic stencil pitch?"
            ].map(chip => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold hover:bg-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                💡 {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Box */}
          <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-3 h-[380px] flex flex-col justify-between">
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                    m.role === "user" ? "bg-primary text-white border-primary" : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                  }`}>
                    {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
                  </div>

                  <div className={`p-3 rounded-2xl max-w-[85%] text-[10px] leading-relaxed space-y-1 ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-none font-medium"
                      : "bg-muted/40 border border-border/50 text-foreground rounded-tl-none"
                  }`}>
                    <p>{m.text}</p>
                    {m.role === "assistant" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.text);
                          alert("Swatch AI technical response copied for WhatsApp sharing!");
                        }}
                        className="text-[8px] font-bold text-indigo-500 flex items-center gap-1 mt-1 hover:underline cursor-pointer"
                      >
                        <Share2 size={10} /> Share AI Response on WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2 border-t border-border/40 pt-2.5"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Swatch AI (e.g. primer coverage, damp treatment)..."
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: TECHNICAL & ESTIMATION OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">AI Technical Datasheets & Warranty Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Use Swatch AI technical recommendations to answer homeowner questions on drying time, coverage, and budget estimates.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_AI_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5 text-[10px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Homeowner Query:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Technical Script</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-[9px] hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={11} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
