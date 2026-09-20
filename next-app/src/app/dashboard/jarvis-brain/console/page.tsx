"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, Shield, Cpu, Play, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  sender: "ceo" | "hermes" | "tracy";
  title: string;
  content: string;
  time: string;
}

export default function CeoCommandConsolePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "hermes",
      title: "HERMES / JARVIS AI CORE",
      content:
        "Pranam Ashutosh Sir! Sovereign Command Channel live hai (+91 9079609627). Main sirf aapse connected hoon aur niche Division Heads (Brian Tracy - Sales, Taiichi Ohno - Operations, Warren Buffett - Finance) ko command karta hoon. Brian Tracy ke under 12-Pillar Sales Pipeline active hai. Bataiye Sir, aaj ka aadesh?",
      time: "10:55 AM",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const executeCommand = (cmdText: string) => {
    if (!cmdText.trim() || isProcessing) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const ceoMsg: Message = {
      id: Date.now().toString(),
      sender: "ceo",
      title: "ASHUTOSH SHARMA (CEO)",
      content: cmdText,
      time: timeStr,
    };

    setMessages((prev) => [...prev, ceoMsg]);
    setInput("");
    setIsProcessing(true);

    // Hermes receives & routes to Brian Tracy
    setTimeout(() => {
      const hermesMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "hermes",
        title: "HERMES / JARVIS AI CORE",
        content: `Aadesh praapt hua Ashutosh Sir! Directive: "${cmdText}". Main Sales Division Head Brian Tracy ko task delegate kar raha hoon aur pipeline status verify karwa raha hoon.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, hermesMsg]);

      // Brian Tracy acknowledges & runs pipeline
      setTimeout(() => {
        const tracyMsg: Message = {
          id: (Date.now() + 2).toString(),
          sender: "tracy",
          title: "BRIAN TRACY (CHIEF SALES OFFICER)",
          content:
            "Hukum Ashutosh Sir & Hermes! 12-Pillar Sales Pipeline live activate ho chuki hai. Alex Hormozi (Margin Bundles), John McMahon (B2B MEDDPICC), Neil Rackham (SPIN), Jeb Blount (Prospecting) aur Sonu Kumar (Field Rep) ko synchronize kar diya gaya hai. Daily sales discipline and conversion target locked.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, tracyMsg]);

        setTimeout(() => {
          const finalHermes: Message = {
            id: (Date.now() + 3).toString(),
            sender: "hermes",
            title: "HERMES / JARVIS AI CORE",
            content:
              "Ashutosh Sir, Brian Tracy ki report verify ho chuki hai. 92,700+ master directory se Rajasthan mandis ke dealers shortlist hain, Swatch Rustic Texture ka counter quote locked hai (₹550 base, ₹650-700 dealer, ₹1150 MRP). Zero unapproved outbound messaging firewall active hai.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, finalHermes]);
          setIsProcessing(false);
        }, 1800);
      }, 1200);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(245,158,11,0.12),transparent_60%)] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-amber-500/20 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/jarvis-brain"
            className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO NEURAL MESH
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse" />
            <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              CEO Direct Command Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <Shield className="w-3.5 h-3.5" /> Ashutosh Sir Authority (Active)
          </span>
          <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            <Cpu className="w-3.5 h-3.5" /> Hermes Bridge: Connected
          </span>
        </div>
      </header>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto flex flex-col gap-4 z-10">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1 max-w-[85%] ${
              m.sender === "ceo"
                ? "self-end items-end"
                : m.sender === "tracy"
                ? "self-start ml-8 items-start"
                : "self-start items-start"
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider">
              <span
                className={
                  m.sender === "ceo"
                    ? "text-amber-400"
                    : m.sender === "tracy"
                    ? "text-amber-500"
                    : "text-cyan-400"
                }
              >
                {m.title}
              </span>
              <span className="text-slate-500 text-[10px]">{m.time}</span>
            </div>
            <div
              className={`p-4 rounded-xl text-sm leading-relaxed ${
                m.sender === "ceo"
                  ? "bg-gradient-to-br from-amber-500/25 to-orange-600/25 border border-amber-400/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : m.sender === "tracy"
                  ? "bg-slate-900/80 border border-amber-500/30 text-amber-100"
                  : "bg-slate-900/90 border border-cyan-500/30 text-slate-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="self-start flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse p-3 bg-slate-900/60 rounded-lg border border-cyan-500/20">
            <Sparkles className="w-4 h-4" /> Hermes synthesizing directives & communicating with Brian Tracy...
          </div>
        )}
      </div>

      {/* Quick Action Presets */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-center gap-2 overflow-x-auto z-10 shrink-0">
        <button
          onClick={() => executeCommand("Brian Tracy se bolo 12-Pillar Sales Pipeline run kare")}
          className="text-xs bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <Play className="w-3 h-3 text-amber-400" /> Run 12-Pillar Pipeline
        </button>
        <button
          onClick={() => executeCommand("Swatch Rustic Texture ka dealer margin bundle review karo")}
          className="text-xs bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <CheckCircle2 className="w-3 h-3 text-amber-400" /> Review Rustic 20kg Margins
        </button>
        <button
          onClick={() => executeCommand("Sonu Kumar ke daily field route aur targets verify karo")}
          className="text-xs bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <CheckCircle2 className="w-3 h-3 text-amber-400" /> Check Sonu Field Route
        </button>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-amber-500/20 z-10 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeCommand(input)}
            placeholder="Ashutosh Sir, type your executive directive to Hermes..."
            className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
          />
          <button
            onClick={() => executeCommand(input)}
            disabled={isProcessing}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> SEND DIRECTIVE
          </button>
        </div>
      </div>
    </div>
  );
}
