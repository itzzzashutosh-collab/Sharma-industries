"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, Trophy, Target, Zap, Brain, TrendingUp,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Star,
  Handshake, Shield, MessageSquare, BookOpen, Award, Cpu,
  BarChart3, Clock, Users, ArrowRight, RefreshCw, Mic,
  ThumbsUp, ThumbsDown, Lightbulb, Phone, Package, X
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const OBJECTIONS = [
  {
    id: "price",
    label: "Price Too High",
    category: "Pricing",
    icon: "💰",
    difficulty: "Medium",
    script: "Sir, main bilkul samajhta hoon. Lekin ek cheez dekhein — Swatch Shine Emulsion ki coverage 350 sqft/L hai jabki local brand sirf 200 sqft/L deti hai. Matlab aapke customer ko per wall actually kam kharcha aata hai. Asli sasta wohi hai jo zyada chalega.",
    english: "I completely understand, sir. However, Swatch Shine Emulsion covers 350 sqft/L vs 150–200 sqft for local brands. Your customers spend less per wall. Real savings come from better coverage.",
    tip: "Always convert MRP to cost-per-square-foot. Never defend the price — defend the value.",
    followUp: ["Would you like to see the coverage comparison chart?", "Shall I show you what our Gold Partner dealers earn back monthly?"],
    stage: "Early",
    winRate: 72
  },
  {
    id: "competitor",
    label: "Competitor Discount",
    category: "Competition",
    icon: "⚔️",
    difficulty: "Hard",
    script: "Samajh sakta hoon sir. Competitor discount deta hai ek baar, lekin Swatch mein har tin kharidte hi painter ke wallet mein seedha cash jata hai. Painter hi dealer choose karta hai — agar painter Swatch choose kare, toh aapki bikanat apne aap badhegi.",
    english: "Competitors offer one-time discounts. With Swatch, every 3 tins purchased credits the painter's wallet directly. Since painters influence dealer selection, your sales rise automatically when painters prefer Swatch.",
    tip: "Shift from dealer-vs-competitor to painter loyalty. The painter is the real decision-maker in B2B paint sales.",
    followUp: ["How many painters visit your shop per month?", "Want me to show you the Painter Loyalty Calculator?"],
    stage: "Mid",
    winRate: 58
  },
  {
    id: "stock",
    label: "Stock Already Full",
    category: "Inventory",
    icon: "📦",
    difficulty: "Easy",
    script: "Perfect sir! Matlab aapki bikanat achhi chal rahi hai. Yahi toh sahi time hai — festival season aane waali hai, aur Royale Glitz ki shortage 2 months mein start hogi. Abhi order karein toh priority allocation milegi aur koi shortage nahi hogi.",
    english: "Perfect — that means business is good! This is actually the right time to stock up before the festival season. Supply constraints on premium SKUs are expected in 2 months. Order now for priority allocation.",
    tip: "Use scarcity and seasonality as urgency triggers. Never push — instead, frame it as protecting their business.",
    followUp: ["Which SKU moves fastest at your store in festivals?", "Want me to share the upcoming seasonal demand forecast?"],
    stage: "Early",
    winRate: 81
  },
  {
    id: "credit",
    label: "Need More Credit Days",
    category: "Finance",
    icon: "📅",
    difficulty: "Hard",
    script: "Sir, main samjha aapki zaroorat. Abhi hamare Gold Partner dealers ko 30+15 net scheme milti hai. Agar aap next 2 orders time pe clear karein, toh main personally aapko Gold Partner status ke liye recommend karunga jisme 45-day credit milta hai.",
    english: "Sir, I understand. Our Gold Partner dealers get 30+15 net terms. If you clear the next 2 invoices on time, I will personally recommend you for Gold Partner status with 45-day credit. Let me initiate that today.",
    tip: "Never directly promise credit extensions. Instead, create a clear, achievable pathway to earn better terms. Makes them a partner, not a creditor.",
    followUp: ["Your current outstanding is ₹18,500 — want a payment plan?", "Shall I send you the Gold Partner eligibility criteria?"],
    stage: "Late",
    winRate: 63
  },
  {
    id: "loyalty",
    label: "Painter Doesn't Trust Brand",
    category: "Trust",
    icon: "🎨",
    difficulty: "Hard",
    script: "Bilkul sahi baat hai sir — painter trust sabse important hai. Isliye humne Swatch Painter App launch kiya hai jisme painter har job ke baad rating de sakta hai, warranty claim kar sakta hai, aur direct rewards le sakta hai. Painters jo app use karte hain unhe 85% brand pe trust aata hai within 3 months.",
    english: "Painter trust is everything — that's exactly why we launched the Swatch Painter App. Painters can rate each job, claim warranties, and earn direct rewards. 85% of app-registered painters show brand loyalty within 3 months.",
    tip: "Give the painter a direct stake in the brand. Loyalty tools beat discounts every time in paint B2B.",
    followUp: ["How many painters work in your area? I'll register them today.", "Want to see the Painter App demo on my phone right now?"],
    stage: "Mid",
    winRate: 68
  },
  {
    id: "delayed",
    label: "Decision Delayed / Not Now",
    category: "Stall",
    icon: "⏰",
    difficulty: "Medium",
    script: "Main samajhta hoon sir, koi jaldi nahi. Lekin ek baat bolunga — next week our regional head is doing a territory review and dealers who place orders before Friday get priority display rack allocation. Yeh chance dobara nahin milega is quarter mein.",
    english: "No rush at all, sir. However, our regional head is reviewing the territory this week and dealers who order before Friday receive priority display rack placement — that won't come around again this quarter.",
    tip: "Create a time-bound, specific reason to act now. Vague urgency doesn't work — attach urgency to a real event.",
    followUp: ["What specific concern should I address before your decision?", "Can I come again on Thursday with the sales manager?"],
    stage: "Late",
    winRate: 55
  },
  {
    id: "quality",
    label: "Quality Complaint on Last Batch",
    category: "Quality",
    icon: "⚠️",
    difficulty: "High",
    script: "Sir, yeh sunke mujhe bahut dukh hua. Pehle toh main genuinely maafi mangta hoon. Kya aap mujhe batch number bata sakte hain? Main abhi quality team ko escalate karta hoon. Swatch mein 100% replacement guarantee hai agar batch defect prove hoti hai. Aur main personally dekhunga ki replacement 48 hours mein pahunche.",
    english: "Sir, I'm genuinely sorry to hear this. May I have the batch number? I'll escalate to the quality team right now. Swatch offers 100% replacement guarantee for batch defects. I will personally ensure replacement arrives within 48 hours.",
    tip: "Never be defensive about quality complaints. Empathy + fast resolution turns complainers into your most loyal advocates.",
    followUp: ["Can I take a photo of the batch number for the claim?", "I'll call the quality helpline right now — shall I?"],
    stage: "Crisis",
    winRate: 79
  },
  {
    id: "referral",
    label: "Wants Referral Commission",
    category: "Incentive",
    icon: "🤝",
    difficulty: "Easy",
    script: "Excellent idea sir! Swatch Dealer Referral Program mein aapko har referred dealer ki first 3 orders pe 2% credit milta hai. Yeh credit aapki outstanding payments mein adjust ho sakta hai ya aap direct wallet transfer le sakte hain. Main abhi form fill karta hoon.",
    english: "Excellent idea! The Swatch Dealer Referral Program gives you 2% credit on the first 3 orders of every dealer you refer. Credit can offset outstanding payments or be transferred to your wallet. Let me fill out the form now.",
    tip: "Always carry referral forms physically. Dealers who refer others become your best retention anchors.",
    followUp: ["Which dealers in this area are you close to?", "How many referrals would you estimate you can make this month?"],
    stage: "Opportunity",
    winRate: 88
  }
];

const NEGOTIATION_PLAYBOOKS = [
  {
    title: "Anchoring First",
    icon: "⚓",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20",
    iconBg: "bg-blue-500/20 text-blue-500",
    scenario: "Dealer asks for your best price before you've pitched value",
    tactic: "Never give your best price first. Anchor high with a premium package, then 'concede' to your actual target. The concession feels like a win for the dealer.",
    example: "Start with: 'Our Premium Dealer Pack is ₹2,40,000 with full display support.' Then work down to your actual target of ₹1,80,000.",
    avoid: "Never say 'our price is negotiable' upfront — it signals weakness."
  },
  {
    title: "The Nibble Close",
    icon: "🎯",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20",
    iconBg: "bg-emerald-500/20 text-emerald-500",
    scenario: "Deal is almost closed but dealer wants 'something extra'",
    tactic: "After agreement is reached, add a small concession yourself ('I'll also get you 2 extra display stands') to eliminate their need to ask. This closes faster than waiting for their nibble.",
    example: "'Sir, since we've agreed on the main order, I'll also personally ensure your shop gets a Swatch Glow Sign installed within 10 days at no extra charge.'",
    avoid: "Don't nibble before commitment is confirmed — it reopens negotiation."
  },
  {
    title: "The Take-Away",
    icon: "🔄",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
    iconBg: "bg-violet-500/20 text-violet-500",
    scenario: "Dealer keeps delaying or demanding excessive discounts",
    tactic: "Withdraw something they want. 'Actually sir, the Painter App registration was available for your area, but I just checked and the slots filled up.' Scarcity restores urgency.",
    example: "'The 30-day credit offer I mentioned is only valid for dealers who order this week — otherwise standard 15-day terms apply.'",
    avoid: "Use sparingly — overuse destroys trust. Only deploy when truly stalling."
  },
  {
    title: "Value-Add vs Discount",
    icon: "💎",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20",
    iconBg: "bg-amber-500/20 text-amber-500",
    scenario: "Dealer demands straight price discount",
    tactic: "Never give cash discounts — they set permanent precedents. Instead, offer value-adds: free display racks, co-branded boards, painter KYC support, extended credit. Value-adds cost you less but feel bigger.",
    example: "'Instead of a discount, let me give you a branded display unit worth ₹8,000 and register 10 painters in your area this week. That's better than any discount.'",
    avoid: "Never accept 'just this once' discount requests — they repeat every order."
  }
];

const CHAT_PROMPTS = [
  "Who should I visit first today?",
  "Which dealer has highest reorder probability?",
  "How do I handle a price objection?",
  "Show me pending collections",
  "What schemes are active this week?",
  "How to upsell premium SKUs?",
  "Best way to pitch to a new dealer?",
  "Territory coverage tips",
];

const SMART_RESPONSES: Record<string, string> = {
  "visit": "📍 Priority Route for Today:\n1. Ravi Paint & Hardware (Malviya Nagar) — Collection ₹18,500 due\n2. Sharma Colour House (Tonk Road) — High reorder probability 92%\n3. Rajasthan Paint Depot (Sitapura) — KYC for 3 new painters\n\nStart with collection first — morning is best for payment conversations.",
  "reorder": "📊 Top Reorder Probability Dealers:\n• Sharma Colour House: 92% (28-day cycle reached)\n• Mehta General Store: 78% (low stock signal)\n• Vikram Builders: 65% (seasonal demand spike)\n\nSuggested: Visit Sharma first, lead with Royale Glitz bundle offer.",
  "collection": "💳 Pending Collections — Your Territory:\n• ABC Traders: ₹45,000 (49 days overdue) ⚠️\n• Vikram Building Materials: ₹18,500 (due today)\n• Mehta General Store: ₹8,200 (next week)\n\nTips: Visit ABC Traders between 10–12 AM when owner is available.",
  "scheme": "🎁 Active Schemes This Week:\n• Festival Emulsion Pack: Buy 10 get 1 free (ends Friday)\n• Painter Loyalty 2X Points: All SKUs, this week only\n• Gold Partner Upgrade: Place ₹1L order to qualify\n\nLead with the Festival Pack — dealers love bundle deals before Diwali.",
  "upsell": "⬆️ Premium Upsell Script:\nStep 1: Ask what project the contractor is working on\nStep 2: Match the project to a premium SKU\nStep 3: Say: 'For this kind of project, sir, Royale Luxury always gives the finishing that makes the customer call back for the next job too.'\n\nUpgrade rate improves by 34% when you reference the end-customer outcome.",
  "hello": "👋 Hello Rajesh! I'm your AI Sales Coach.\n\nToday's quick summary:\n• 5 dealer visits scheduled\n• ₹63,500 in pending collections\n• 2 high-probability reorders to capture\n• Festival season schemes now active\n\nWhat would you like to work on?",
  "objection": "🎯 Quick Objection Response Guide:\n• 'Price too high' → Shift to cost-per-sqft calculation\n• 'Competitor discount' → Pivot to painter loyalty system\n• 'Stock full' → Use seasonal scarcity trigger\n• 'Not now' → Create urgency with a real, time-bound event\n\nWhich specific objection are you facing right now?",
  "default": "🤖 I'm analyzing your territory data...\n\nI can help you with:\n• Route optimization and visit priorities\n• Pending collections and overdue accounts\n• Objection handling scripts\n• Active schemes and upsell opportunities\n• Negotiation tactics for specific dealers\n\nWhat challenge are you facing on the field today?"
};

const DAILY_SKILLS = [
  { title: "Opening Hook Mastery", desc: "Start every dealer visit with a 30-second insight about their market, not a product pitch. This establishes you as an advisor, not a salesman.", level: 3, xp: 420, maxXp: 500, badge: "🎯" },
  { title: "Objection Judo", desc: "Use the dealer's own objection as proof of why they need your product. 'Price too high' → 'Exactly why coverage ratio matters more than MRP.'", level: 2, xp: 280, maxXp: 400, badge: "🥋" },
  { title: "Collection Psychology", desc: "Collections go 3x faster when you arrive with a specific amount on paper. Never ask 'can you pay?' — say 'we're settling INV-1082 for ₹18,500 today.'", level: 4, xp: 380, maxXp: 500, badge: "💰" },
  { title: "Seasonal Timing Intelligence", desc: "Paint sales spike 2 months before festival season. Dealers who stock early get priority allocations. Share demand forecasts proactively.", level: 2, xp: 150, maxXp: 400, badge: "📅" },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  High: "text-rose-600 bg-rose-500/10 border-rose-500/20",
};

const STAGE_COLOR: Record<string, string> = {
  Early: "text-blue-600 bg-blue-500/10",
  Mid: "text-violet-600 bg-violet-500/10",
  Late: "text-amber-600 bg-amber-500/10",
  Crisis: "text-rose-600 bg-rose-500/10",
  Opportunity: "text-emerald-600 bg-emerald-500/10",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AIAssistantClient() {
  const [activeTab, setActiveTab] = useState<"coach" | "objections" | "negotiate" | "skills">("coach");
  const [selectedObjection, setSelectedObjection] = useState(OBJECTIONS[0]);
  const [objCategory, setObjCategory] = useState("All");
  const [expandedPlaybook, setExpandedPlaybook] = useState<number | null>(0);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Rajesh bhai, welcome back! Today you have 5 visits scheduled.\n\n🔴 Priority: ABC Traders collection (₹45,000 — 49 days overdue)\n🟡 Opportunity: Sharma Colour House reorder (92% probability)\n🟢 Tip: Festival season starts in 6 weeks — push emulsion bundle today.\n\nKya poochna chahte ho?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, "up" | "down">>({});
  const chatRef = useRef<HTMLDivElement>(null);

  const objCategories = ["All", ...Array.from(new Set(OBJECTIONS.map(o => o.category)))];
  const filteredObjections = objCategory === "All" ? OBJECTIONS : OBJECTIONS.filter(o => o.category === objCategory);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (e?: React.FormEvent, chipText?: string) => {
    e?.preventDefault();
    const query = (chipText ?? input).trim();
    if (!query) return;
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const key = Object.keys(SMART_RESPONSES).find(k => query.toLowerCase().includes(k));
      const reply = SMART_RESPONSES[key ?? "default"];
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-24">

      {/* ── Header Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/70 via-indigo-950/60 to-blue-950/70 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.2),_transparent_65%)]" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative p-5 lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-500/20 rounded-2xl border border-violet-500/30 shadow-lg flex-shrink-0">
                <Brain size={26} className="text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-[3px]">AI Sales Intelligence</span>
                  <span className="text-[9px] font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">● LIVE</span>
                </div>
                <h1 className="text-xl font-black text-white">B2B Sales Mastery Coach</h1>
                <p className="text-xs text-violet-200/70 mt-0.5">Objection handling · Negotiation · Deal strategy · Field intelligence</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Award size={13} className="text-amber-400" />
                <span className="font-black text-amber-300">Rank #2</span> in company
              </div>
              <div className="text-[10px] text-white/50">65% to Sales Master badge</div>
              <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
          </div>

          {/* Priority Briefing Strip */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: "🔴 Collection Priority", val: "₹45,000 overdue — ABC Traders", color: "border-rose-500/30 bg-rose-500/10" },
              { label: "🟡 High Reorder Signal", val: "Sharma Colour House (92% prob.)", color: "border-amber-500/30 bg-amber-500/10" },
              { label: "🟢 Festival Opportunity", val: "6 weeks to peak season — stock up", color: "border-emerald-500/30 bg-emerald-500/10" },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl border px-3 py-2 ${item.color}`}>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">{item.label}</p>
                <p className="text-[11px] font-black text-white mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Nav ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border border-border overflow-x-auto">
        {([
          { id: "coach", label: "AI Chat Coach", icon: MessageSquare },
          { id: "objections", label: "Objection Playbook", icon: Shield },
          { id: "negotiate", label: "Negotiation Tactics", icon: Handshake },
          { id: "skills", label: "Skills & XP", icon: BookOpen },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
              activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1 — AI CHAT COACH                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "coach" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl overflow-hidden shadow-2xs flex flex-col" style={{ height: "580px" }}>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
              <div className="p-2 bg-violet-500/20 rounded-xl">
                <Cpu size={16} className="text-violet-500" />
              </div>
              <div>
                <p className="text-xs font-black text-foreground">Swatch AI Sales Coach</p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Online — Field intelligence active
                </p>
              </div>
              <button onClick={() => setMessages([{ role: "assistant", content: "👋 Fresh session started! What's on your field agenda today?" }])} className="ml-auto p-1.5 rounded-lg hover:bg-muted cursor-pointer">
                <RefreshCw size={13} className="text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain size={13} className="text-violet-500" />
                    </div>
                  )}
                  <div className={`max-w-[78%] space-y-1`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/50 text-foreground border border-border/50"
                    }`}>
                      {m.content}
                    </div>
                    {m.role === "assistant" && idx > 0 && (
                      <div className="flex items-center gap-1.5 pl-1">
                        <button
                          onClick={() => setFeedbackGiven(f => ({ ...f, [idx]: "up" }))}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${feedbackGiven[idx] === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-emerald-500"}`}
                        ><ThumbsUp size={10} /></button>
                        <button
                          onClick={() => setFeedbackGiven(f => ({ ...f, [idx]: "down" }))}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${feedbackGiven[idx] === "down" ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500"}`}
                        ><ThumbsDown size={10} /></button>
                        <span className="text-[9px] text-muted-foreground">Helpful?</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <Brain size={13} className="text-violet-500" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="px-4 pb-2 pt-1 border-t border-border/40">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CHAT_PROMPTS.slice(0, 5).map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSend(undefined, chip)}
                    className="px-2.5 py-1 rounded-lg border border-border bg-card text-[9px] font-bold text-muted-foreground whitespace-nowrap flex-shrink-0 hover:border-primary hover:text-primary transition-all cursor-pointer"
                  >{chip}</button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-border/40">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your AI coach anything about sales, dealers, routes..."
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
              />
              <button type="submit" className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 cursor-pointer transition-opacity">
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Right: Context Cards */}
          <div className="space-y-4">
            {/* Today's Coach Tips */}
            <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" /> Today's Field Tips
              </h3>
              {[
                { tip: "Start with the collection visit — payment conversations work best before 12 PM.", icon: "🕙" },
                { tip: "Mention the Festival Pack to every dealer today — it expires Friday.", icon: "🎁" },
                { tip: "Sharma Colour House reorder signal is at 92% — they'll ask first if you don't.", icon: "📊" },
                { tip: "Carry printed coverage comparison charts for price objections.", icon: "📋" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-[11px] text-foreground leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/5 border border-violet-500/20 rounded-3xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} className="text-violet-500" /> Your Conversion Stats
              </h3>
              {[
                { label: "Objection Win Rate", val: "68%", color: "text-emerald-600", bar: 68 },
                { label: "Avg Deal Close Time", val: "2.3 visits", color: "text-blue-600", bar: 55 },
                { label: "Collection Success", val: "82%", color: "text-amber-600", bar: 82 },
                { label: "Upsell Rate", val: "34%", color: "text-violet-600", bar: 34 },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-foreground">{s.label}</span>
                    <span className={`text-[11px] font-black ${s.color}`}>{s.val}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${s.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2 — OBJECTION PLAYBOOK                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "objections" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Objection List */}
          <div className="space-y-3">
            {/* Category Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {objCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setObjCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                    objCategory === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >{cat}</button>
              ))}
            </div>

            {filteredObjections.map(obj => (
              <button
                key={obj.id}
                onClick={() => setSelectedObjection(obj)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedObjection.id === obj.id ? "border-primary/50 bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{obj.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-black text-foreground">{obj.label}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${DIFFICULTY_COLOR[obj.difficulty] ?? ""}`}>{obj.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STAGE_COLOR[obj.stage] ?? ""}`}>{obj.stage} Stage</span>
                      <span className="text-[9px] text-muted-foreground font-bold">Win rate: <span className="text-emerald-600">{obj.winRate}%</span></span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-[11px] font-black text-emerald-600">{obj.winRate}%</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Objection Detail Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xs">
              {/* Header */}
              <div className="flex items-start gap-3">
                <span className="text-3xl">{selectedObjection.icon}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-base font-black text-foreground">{selectedObjection.label}</h2>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[selectedObjection.difficulty] ?? ""}`}>{selectedObjection.difficulty}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STAGE_COLOR[selectedObjection.stage] ?? ""}`}>{selectedObjection.stage} Deal Stage</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Category: {selectedObjection.category} · Win Rate: <span className="text-emerald-600 font-black">{selectedObjection.winRate}%</span></p>
                </div>
              </div>

              {/* Hindi Response */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={11} className="text-primary" />
                  </div>
                  <span className="text-[11px] font-black text-foreground uppercase tracking-wider">Hindi Response Script</span>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Use on field</span>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20 rounded-2xl p-4">
                  <p className="text-xs text-foreground leading-relaxed font-medium">{selectedObjection.script}</p>
                </div>
              </div>

              {/* English Script */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={11} className="text-blue-500" />
                  </div>
                  <span className="text-[11px] font-black text-foreground uppercase tracking-wider">English Version</span>
                </div>
                <div className="bg-muted/40 border border-border rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedObjection.english}</p>
                </div>
              </div>

              {/* Coach Tip */}
              <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1">Coach Tip</p>
                  <p className="text-xs text-foreground leading-relaxed">{selectedObjection.tip}</p>
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <ArrowRight size={13} className="text-primary" /> Recommended Follow-up Questions
                </p>
                <div className="space-y-1.5">
                  {selectedObjection.followUp.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-xl">
                      <span className="text-[10px] font-black text-primary mt-0.5">{i + 1}.</span>
                      <p className="text-[11px] text-foreground">{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Win Rate Visual */}
              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <Trophy size={18} className="text-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-black text-foreground">Historical Win Rate with this Script</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${selectedObjection.winRate}%` }} />
                    </div>
                    <span className="text-xs font-black text-emerald-600">{selectedObjection.winRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3 — NEGOTIATION TACTICS                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "negotiate" && (
        <div className="space-y-4">
          {/* Intro Card */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Handshake size={20} className="text-emerald-500 flex-shrink-0" />
              <h2 className="text-sm font-black text-foreground">B2B Dealer Negotiation Mastery</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These are battle-tested negotiation frameworks used by top paint company field executives. Each tactic includes when to use it, how to execute, and what to avoid.
            </p>
          </div>

          {/* Playbook Cards */}
          <div className="space-y-3">
            {NEGOTIATION_PLAYBOOKS.map((pb, i) => (
              <div key={i} className={`border rounded-3xl overflow-hidden transition-all duration-300 bg-gradient-to-br ${pb.color}`}>
                <button
                  onClick={() => setExpandedPlaybook(expandedPlaybook === i ? null : i)}
                  className="w-full flex items-center gap-4 p-5 text-left cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-2xl ${pb.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
                    {pb.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground">{pb.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{pb.scenario}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedPlaybook === i ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {expandedPlaybook === i && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
                    {/* Scenario */}
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">📍 When to Use This</p>
                      <p className="text-xs text-foreground bg-card/60 rounded-xl p-3 border border-border/40">{pb.scenario}</p>
                    </div>
                    {/* Tactic */}
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">🎯 The Tactic</p>
                      <p className="text-xs text-foreground leading-relaxed bg-card/60 rounded-xl p-3 border border-border/40">{pb.tactic}</p>
                    </div>
                    {/* Example */}
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">💬 Example Dialogue</p>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <p className="text-xs text-foreground leading-relaxed italic">{pb.example}</p>
                      </div>
                    </div>
                    {/* Avoid */}
                    <div className="flex gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <X size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-rose-600 mb-0.5">⚠️ Avoid This</p>
                        <p className="text-[11px] text-foreground">{pb.avoid}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Negotiation Principles */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Star size={15} className="text-amber-500" /> Core Dealer Negotiation Principles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { no: "01", rule: "Never give a discount without getting something back", detail: "Every concession you make must be tied to a commitment from the dealer — bigger order, faster payment, or a referral." },
                { no: "02", rule: "Control the anchor — always price first", detail: "The first number mentioned in any negotiation becomes the reference point. Start higher than your target." },
                { no: "03", rule: "Silence is a negotiation weapon", detail: "After stating your offer, stop talking. Dealers who feel silence will fill it with a counter-offer, not a rejection." },
                { no: "04", rule: "Create urgency around events, not deadlines", detail: "'Order before Friday because the regional head visits' is more credible than 'this offer expires Friday.'" },
                { no: "05", rule: "Value-adds beat discounts every time", detail: "A display rack worth ₹8,000 feels more valuable than ₹8,000 off the invoice — and costs you much less to deliver." },
                { no: "06", rule: "Always give the dealer an out", detail: "Let the dealer feel they made the smart choice. 'You're getting our best dealer package' feels better than 'I gave you a special deal.'" },
              ].map((p, i) => (
                <div key={i} className="flex gap-3 p-3.5 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all">
                  <span className="text-[11px] font-black text-primary/60 w-6 flex-shrink-0">{p.no}</span>
                  <div>
                    <p className="text-[11px] font-black text-foreground mb-1">{p.rule}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4 — SKILLS & XP                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "skills" && (
        <div className="space-y-5">
          {/* XP Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/25 rounded-3xl p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                <Trophy size={24} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-black text-foreground">Rajesh Kumar — Sales Level 8</h2>
                  <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Field Expert</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">1,230 / 1,500 XP to Level 9 · "Territory Ace"</p>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000" style={{ width: "82%" }} />
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-2xl font-black text-amber-500">82%</span>
                <span className="text-[10px] text-muted-foreground">to next level</span>
              </div>
            </div>
          </div>

          {/* Skill Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DAILY_SKILLS.map((skill, i) => (
              <div key={i} className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{skill.badge}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-black text-foreground">{skill.title}</p>
                      <span className="text-[9px] font-black text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-full">Lv.{skill.level}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{skill.desc}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{skill.xp} / {skill.maxXp} XP</span>
                    <span className="text-[10px] font-bold text-primary">{Math.round((skill.xp / skill.maxXp) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Challenges */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" /> Today's Field Challenges
            </h3>
            <div className="space-y-2.5">
              {[
                { task: "Complete 5 dealer visits", reward: "+50 XP", done: false, progress: 2, total: 5 },
                { task: "Handle 1 price objection successfully", reward: "+80 XP", done: false, progress: 0, total: 1 },
                { task: "Collect ₹20,000+ today", reward: "+100 XP", done: false, progress: 68500 >= 20000, total: 1 },
                { task: "Register 2 new painters on app", reward: "+60 XP", done: false, progress: 0, total: 2 },
                { task: "Log visit notes for all completed visits", reward: "+40 XP", done: true, progress: 1, total: 1 },
              ].map((ch, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${ch.done ? "border-emerald-500 bg-emerald-500" : "border-border"}`}>
                    {ch.done && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[11px] font-bold ${ch.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ch.task}</p>
                  </div>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">{ch.reward}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Mini */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Award size={14} className="text-yellow-500" /> Sales Mastery Leaderboard
            </h3>
            <div className="space-y-2">
              {[
                { rank: 1, name: "Ankit Sharma", level: 11, xp: 4820, territory: "Jaipur West" },
                { rank: 2, name: "Rajesh Kumar", level: 8, xp: 1230, territory: "Jaipur East", isMe: true },
                { rank: 3, name: "Priya Verma", level: 7, xp: 980, territory: "Sikar" },
                { rank: 4, name: "Suresh Meena", level: 6, xp: 740, territory: "Alwar" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${s.isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"}`}>
                  <span className="text-base w-7 text-center">
                    {s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : `#${s.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black truncate ${s.isMe ? "text-primary" : "text-foreground"}`}>
                      {s.name} {s.isMe && <span className="text-[9px] opacity-60">(You)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.territory} · Level {s.level}</p>
                  </div>
                  <span className="text-[11px] font-black text-amber-600">{s.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
