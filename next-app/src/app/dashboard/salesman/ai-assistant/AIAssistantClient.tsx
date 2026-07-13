"use client";

import React, { useState, useTransition } from "react";
import { Sparkles, Send, HelpCircle, ArrowRight, MessageSquare, AlertCircle, RefreshCw, Trophy, Target } from "lucide-react";

export function AIAssistantClient() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Greetings Rajesh! I have analyzed your west region route. Sharma Paint Store is flagged at 92% reorder probability. ABC Traders has a pending invoice of ₹45,000 past due. How would you like to plan your route?" }
  ]);
  const [input, setInput] = useState("");
  const [selectedObjection, setSelectedObjection] = useState("Price Too High");

  const [isPending, startTransition] = useTransition();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    startTransition(async () => {
      // Simple offline simulated NLP response matching key words
      let reply = "I'm analyzing the transaction databases... Let me look that up.";
      const query = userMsg.toLowerCase();
      if (query.includes("reorder") || query.includes("order")) {
        reply = "Gupta Traders usually orders Shine Emulsion in mid-month. You should suggest a 10L pack addition to their bucket.";
      } else if (query.includes("outstanding") || query.includes("collect") || query.includes("payment")) {
        reply = "ABC Traders has INV-10824 outstanding (₹45,000, 49 days overdue). Best visit window: mornings between 10 AM and 12 PM.";
      } else if (query.includes("visit") || query.includes("route")) {
        reply = "Recommended Route: Visit Shree Ram Paints first for collection, followed by Mahadev Sanitary to verify their glow sign installation.";
      } else if (query.includes("hi") || query.includes("hello")) {
        reply = "Hello! I am your Swatch Territory Growth Coach. Ask me about reorders, collections, or objection handling tips.";
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    });
  };

  const salesScripts = {
    "Price Too High": {
      response: "Acknowledge value: 'I completely understand your concern, sir. While local primers are cheaper, Swatch Shine Emulsion offers double the square-foot coverage area per bucket, meaning your customers actually spend less per wall.'",
      tip: "Focus on the lower coverage cost per square foot, not the initial purchase MRP."
    },
    "Competitor Discount": {
      response: "Shift to loyalty benefits: 'Competitors might offer immediate discounts, but scanning Swatch paint coupons directly credits cash to your painter wallet. Plus, our Gold Partner circle unlocks exclusive festival hampers.'",
      tip: "Leverage the painter loyalty tokens ecosystem to drive dealer stock choices."
    }
  };

  const handleObjectionClick = (ob: string) => {
    setSelectedObjection(ob);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">AI Coach</span>
        </div>
        <h1 className="text-xl font-black text-foreground">AI Sales Assistant</h1>
      </div>

      {/* Proactive Briefing Section */}
      <div className="bg-card border border-primary/20 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={14} className="text-primary" /> Today's Priority Briefing</h3>
        <div className="space-y-2 border-l border-primary/20 pl-3">
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">1. High-Probability Reorder</p>
            <p className="text-[10px] text-muted-foreground">Sharma Paint Store (92% confidence) - Standard 28-day cycle reached.</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">2. Aging Invoice Warning</p>
            <p className="text-[10px] text-muted-foreground">ABC Traders (₹45,000) - Overdue by 49 days. Plan collections visit.</p>
          </div>
        </div>
      </div>

      {/* Sales Objection Helper Scripts */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Trophy size={14} className="text-primary" /> Objection Playbook</h3>
        <div className="flex gap-2">
          {Object.keys(salesScripts).map(ob => (
            <button key={ob} onClick={() => handleObjectionClick(ob)} className={`px-3 py-1.5 rounded-xl font-bold text-[10px] border transition-colors cursor-pointer ${
              selectedObjection === ob ? "bg-primary border-primary text-white" : "bg-muted/10 border-border text-muted-foreground"
            }`}>{ob}</button>
          ))}
        </div>
        <div className="p-3 bg-muted/40 rounded-xl space-y-2">
          <p className="font-bold text-foreground">Consultative Response Script:</p>
          <p className="text-muted-foreground leading-relaxed">{(salesScripts as any)[selectedObjection]?.response}</p>
          <p className="text-[9px] text-primary font-bold mt-1">💡 Coach Tip: {(salesScripts as any)[selectedObjection]?.tip}</p>
        </div>
      </div>

      {/* Chat Conversational Box */}
      <div className="bg-card border border-border rounded-3xl p-4 flex flex-col h-[320px] shadow-sm">
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-none">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                m.role === "user" ? "bg-primary text-white font-semibold" : "bg-muted/40 text-foreground border border-border/40"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-border/40">
          {["Who should I visit today?", "Show outstanding accounts"].map((chip) => (
            <button key={chip} onClick={() => setInput(chip)} className="px-2.5 py-1 rounded-lg border border-border bg-card text-[9px] font-bold text-muted-foreground whitespace-nowrap shrink-0 hover:bg-muted/10">
              {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-border/40">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your sales coach..." className="flex-1 bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground text-xs" />
          <button type="submit" className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
