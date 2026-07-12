"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, RefreshCw, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithGlobalAI } from "@/actions/chatActions";
import { useLanguage } from "@/components/LanguageProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatAssistant() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am the Sharma Industries OS Intelligent Advisor. How can I help you analyze company metrics, inventories, or cash flows today?"
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Suggestions tags
  const SUGGESTIONS = [
    t("What is our total revenue?"),
    t("Check unpaid invoices count"),
    t("How many paint products exist?"),
    t("Verify suppliers registry count")
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMsg("");
    setIsSending(true);

    // Prepare history payload (matching action signature)
    const historyPayload = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" as const : "user" as const,
      content: m.content
    }));

    const res = await chatWithGlobalAI(textToSend, historyPayload);
    if (res.success && res.reply) {
      setMessages(prev => [...prev, { role: "assistant", content: res.reply! }]);
    } else {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: res.error || "An error occurred while connecting to the model settings. Make sure an active key is saved in Settings." 
        }
      ]);
    }
    setIsSending(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Assistant"
          className="relative group p-4 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center focus:outline-none cursor-pointer"
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          </motion.div>
          
          {/* Pulsing Sparkles Alert Indicator */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background animate-pulse">
              <Sparkles size={8} className="text-white" />
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[380px] bg-background/95 backdrop-blur-md border-l border-border flex flex-col shadow-2xl overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="h-[72px] bg-muted/30 border-b border-border px-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Cpu size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground leading-none">{t("SI Intelligent Assistant")}</h3>
                  <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    {t("Active Database Context")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body & Scroll area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 scrollbar-thin"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-muted/40 border border-border/60 text-foreground rounded-tl-none markdown-body"
                    }`}
                  >
                    {/* Render text paragraphs safely */}
                    {m.content.split("\n").map((para, pIdx) => (
                      <p key={pIdx} className={pIdx > 0 ? "mt-1.5" : ""}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-muted/40 border border-border/60 rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center gap-1 text-muted-foreground">
                    <RefreshCw size={10} className="animate-spin" />
                    <span>{t("Analyzing business context...")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions Quick Buttons */}
            {messages.length === 1 && (
              <div className="px-5 pb-3 flex flex-col gap-1.5 shrink-0">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  {t("Quick Queries")}
                </span>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTIONS.map((sKey, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(sKey)}
                      className="bg-muted/30 hover:bg-primary/10 border border-border/60 hover:border-primary/20 text-muted-foreground hover:text-primary px-3 py-1.5 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer"
                    >
                      {sKey}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Footer Input */}
            <div className="p-4 border-t border-border bg-muted/10 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMsg);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={t("Ask me anything about Sharma Industries...")}
                  className="flex-1 bg-background text-foreground border border-border rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs font-semibold"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isSending}
                  className="p-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
