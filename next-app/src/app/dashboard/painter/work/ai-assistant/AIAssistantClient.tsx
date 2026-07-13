"use client";

import React, { useState } from "react";
import { Sparkles, Send, Brain, Bot, User } from "lucide-react";

export function AIAssistantClient() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste! I am your Swatch AI Assistant. Ask me how much primer or paint is needed, or which texture is best!" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let reply = "I recommend Swatch Weatherguard for exterior walls, requiring approximately 2 coats for maximum rain protection.";
      if (userText.toLowerCase().includes("primer")) {
        reply = "Swatch Premium Acrylic Primer is recommended. Coverage is about 120 sqft per litre. So for 1200 sqft, you will need 10 Litres of Primer.";
      } else if (userText.toLowerCase().includes("putty")) {
        reply = "For fine wall leveling, apply 2 coats of Swatch Acrylic Putty. Dries in 4-6 hours. Dries completely in 12 hours before sanding.";
      }
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Work</span><span className="opacity-40">/</span><span className="text-foreground">AI Assistant</span>
        </div>
        <h1 className="text-xl font-black text-foreground">AI Paint Assistant</h1>
      </div>

      {/* Chat Area */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 h-[350px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${
                m.role === "user" ? "bg-primary text-white" : "bg-muted text-primary"
              }`}>
                {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                m.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-muted/50 text-foreground rounded-tl-none"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-border/40 pt-3">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your painting question here..." className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
          <button type="submit" className="p-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
