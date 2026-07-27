"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Wallet, Search, Clock, Calendar, CheckCircle2, AlertCircle,
  FileText, Plus, Sparkles, Upload, X, ShieldAlert, IndianRupee,
  TrendingUp, Tag, Share2, Copy, Phone, ArrowRight, Shield,
  Check, AlertTriangle, Building2, ChevronRight, Filter, RefreshCw,
  Download, Printer, DollarSign, Send, MessageSquare
} from "lucide-react";
import { logCollectionPayment } from "../actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Dealer {
  id: string;
  name: string;
  locality?: string;
  phone?: string;
  credit_limit?: number;
  credit_used?: number;
  payment_score?: number; // 0-100 score
}

interface OutstandingInvoice {
  id: string;
  dealer_id: string;
  dealer_name: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  due_days: number;
  priority: "Critical (>45d)" | "High (30-45d)" | "Medium (15-30d)" | "Healthy (<15d)";
  status: "Overdue" | "Partially Paid" | "Pending";
  locality?: string;
  items_summary?: string;
}

interface CollectionRecord {
  id: string;
  date: string;
  dealer_name: string;
  amount: number;
  payment_mode: string;
  reference_no: string;
  status: "Verified & Cleared" | "Pending Bank Clearance" | "Cheque in Transit";
  invoice_ref?: string;
  notes?: string;
}

interface Props {
  initialData: {
    dealers: Dealer[];
    invoices: any[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Collection Objection & Delay Excuses Playbook
// ─────────────────────────────────────────────────────────────────────────────
const COLLECTION_OBJECTIONS = [
  {
    id: "COL_OBJ_1",
    excuse: "Customer didn't pay me for project wall painting",
    excuseText: "Bhaiya, contractor ne mera wall painting ka ₹2 Lakh payment hold kiya hai. Jab uska clear hoga tabhi tumhara dunga.",
    strategy: "Offer Partial Knock-off + PDC Cheque Guarantee for Order Unblocking",
    counterHindi: "Sir, contractor ka payment aane mein 1-2 hafte lag sakte hain, par Swatch account auto-block hone se aapki shop ka supply band ho jayega. Aap abhi 30% partial payment UPI se kijiye aur baaki ka PDC cheque de dijiye taaki billing na ruke.",
    complianceNotice: "Important: Accounts policy automatically freezes fresh invoice dispatches after 45 days overdue.",
    whatsappTemplate: "Namaste Ji! Overdue invoice account auto-lock rule se bachne ke liye kindly today 30% partial payment process karein. Balance amount PDC cheque option available hai. Store supply smooth rakhne ke liye help karein! 🙏"
  },
  {
    id: "COL_OBJ_2",
    excuse: "Demand 5% extra discount to clear full payment today",
    excuseText: "Agar tum mujhe 5% extra cash discount do toh main abhi full ₹1.5 Lakh cheque sign karke deta hoon.",
    strategy: "Redirect to Official Early Payment Cash Rebate Scheme (Max 2%)",
    counterHindi: "Sir, 5% margin par company ko loss hoga. Par agar aap aaj hi full clear karte hain toh main Regional Sales Manager se special 2% Early Settlement Rebate (₹3,000) approve karwa ke credit note generate kar dunga.",
    complianceNotice: "Salesman cannot grant ad-hoc >2% cash discount without Zonal Head sign-off.",
    whatsappTemplate: "Sir, Special 2% Early Settlement Rebate approved! Clear full payment today and save ₹3,000 instantly via official Credit Note rebate. Let me know once done! 💰"
  },
  {
    id: "COL_OBJ_3",
    excuse: "Damage / Leakage buckets returned, adjust credit note first",
    excuseText: "Last month 3 buckets leakage thi, uska credit note adjust karo pehle, phir baaki ka payment dunga.",
    strategy: "Issue Immediate Replacement Receipt & Deduct Credit Amount On Spot",
    counterHindi: "Sir, 3 buckets ka ₹12,600 ka credit note application already file kar diya hai. Aap invoice amount mein se ₹12,600 deduct karke remaining balance amount abhi clear kar dijiye.",
    complianceNotice: "Deduct verified damage credit note value on-the-spot and collect net balance immediately.",
    whatsappTemplate: "Sir, 3 leakage buckets amount (₹12,600) deduct karke net balance calculate kar diya hai. Kindly pay remaining ₹32,400 via UPI/Cheque today. Credit note reference attached! 📄"
  },
  {
    id: "COL_OBJ_4",
    excuse: "Cheque is written but owner is out of town",
    excuseText: "Owner ji Jaipur se bahar gaye hain, Saturday ko aayenge tabhi cheque milega.",
    strategy: "Request Digital UPI / NetBanking Transfer via Store Counter Manager",
    counterHindi: "Sir, Owner ji ko call karke bolie woh store UPI / Company QR code pe Direct Bank Transfer kar dein. Digital receipt 1 minute mein unke WhatsApp pe chali jayegi.",
    complianceNotice: "Company QR Code enabled for instant Remote Payment Link via SMS/WhatsApp.",
    whatsappTemplate: "Namaste Sir! Shop account payment clear karne ke liye Direct Company QR Code & UPI link bhej raha hoon. Instant 1-minute payment confirmation receipt WhatsApp pe mil jayegi. 📱"
  },
  {
    id: "COL_OBJ_5",
    excuse: "Slow sales month, take small partial payment now",
    excuseText: "Is mahine sale mand-mand (slow) hai, abhi ₹20,000 le lo, baaki ka ₹40,000 agle fortnight mein dunga.",
    strategy: "Accept Partial Payment + Set Fixed Commitment Date in Portal",
    counterHindi: "Sir, ₹20,000 partial payment abhi UPI se le leta hoon. Baaki ₹40,000 ke liye hum system mein 10th August ki commitment date set kar dete hain taaki credit rating affect na ho.",
    complianceNotice: "Partial payments reset credit hold clock for 7 calendar days.",
    whatsappTemplate: "Thank you for ₹20,000 partial payment today! Balance ₹40,000 commitment logged for 10th Aug. Supply remains ACTIVE! Have a great business week. 👍"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function CollectionsClient({ initialData }: Props) {
  // Normalize Dealers
  const dealersList: Dealer[] = initialData.dealers?.length
    ? initialData.dealers.map((d: any, idx: number) => ({
        id: d.id || `D-${idx}`,
        name: d.name || `Dealer ${idx + 1}`,
        locality: d.locality || "Jaipur",
        phone: d.phone || "9829012345",
        credit_limit: d.credit_limit || 200000,
        credit_used: d.credit_used || 125000,
        payment_score: d.payment_score || (idx % 2 === 0 ? 88 : 62)
      }))
    : [
        { id: "D1", name: "Shree Ram Paints", locality: "Malviya Nagar", phone: "9829012345", credit_limit: 250000, credit_used: 185000, payment_score: 82 },
        { id: "D2", name: "Ravi Paint & Hardware", locality: "Tonk Road", phone: "9829054321", credit_limit: 150000, credit_used: 110000, payment_score: 91 },
        { id: "D3", name: "Sharma Colour House", locality: "Sanganer", phone: "9829099887", credit_limit: 300000, credit_used: 245000, payment_score: 58 },
        { id: "D4", name: "Rajasthan Paint Depot", locality: "Vaishali Nagar", phone: "9829011223", credit_limit: 100000, credit_used: 45000, payment_score: 95 }
      ];

  // Mock Invoices
  const mockInvoices: OutstandingInvoice[] = (initialData.invoices?.length > 0)
    ? initialData.invoices.map((inv: any, idx: number) => ({
        id: inv.id || `INV-108${24 + idx}`,
        dealer_id: inv.dealer_id || dealersList[idx % dealersList.length].id,
        dealer_name: inv.dealer_name || dealersList[idx % dealersList.length].name,
        invoice_date: inv.invoice_date || "2026-06-12",
        due_date: inv.due_date || "2026-07-12",
        amount: Number(inv.amount) || 45000,
        paid_amount: Number(inv.paid_amount) || 0,
        due_days: Number(inv.due_days) || (idx === 0 ? 49 : 18),
        priority: (inv.due_days > 45 ? "Critical (>45d)" : inv.due_days > 30 ? "High (30-45d)" : inv.due_days > 15 ? "Medium (15-30d)" : "Healthy (<15d)") as any,
        status: inv.paid_amount > 0 ? "Partially Paid" : "Overdue",
        locality: inv.locality || "Jaipur",
        items_summary: inv.items_summary || "Shine Emulsion 20L x5, Wall Putty 40kg x10"
      }))
    : [
        { id: "INV-10824", dealer_id: "D1", dealer_name: "Shree Ram Paints", invoice_date: "2026-06-05", due_date: "2026-07-05", amount: 65000, paid_amount: 20000, due_days: 52, priority: "Critical (>45d)", status: "Partially Paid", locality: "Malviya Nagar", items_summary: "Rustic Royale 20L x5, Damp Shield 20L x2" },
        { id: "INV-10941", dealer_id: "D3", dealer_name: "Sharma Colour House", invoice_date: "2026-06-18", due_date: "2026-07-18", amount: 88400, paid_amount: 0, due_days: 39, priority: "High (30-45d)", status: "Overdue", locality: "Sanganer", items_summary: "Weatherguard 20L x8, Acrylic Primer 20L x5" },
        { id: "INV-11012", dealer_id: "D2", dealer_name: "Ravi Paint & Hardware", invoice_date: "2026-07-02", due_date: "2026-07-17", amount: 34500, paid_amount: 0, due_days: 25, priority: "Medium (15-30d)", status: "Overdue", locality: "Tonk Road", items_summary: "Shine Emulsion 10L x10, Wall Putty 40kg x15" },
        { id: "INV-11105", dealer_id: "D4", dealer_name: "Rajasthan Paint Depot", invoice_date: "2026-07-15", due_date: "2026-07-30", amount: 28000, paid_amount: 0, due_days: 12, priority: "Healthy (<15d)", status: "Pending", locality: "Vaishali Nagar", items_summary: "Smart Wall Putty 40kg x25" }
      ];

  // Initial State
  const [invoices, setInvoices] = useState<OutstandingInvoice[]>(mockInvoices);
  const [collectionsHistory, setCollectionsHistory] = useState<CollectionRecord[]>([
    { id: "COL-8801", date: "Today 11:30 AM", dealer_name: "Ravi Paint & Hardware", amount: 25000, payment_mode: "UPI", reference_no: "UPI/9812401928", status: "Verified & Cleared", invoice_ref: "INV-11012", notes: "Collected during morning visit" },
    { id: "COL-8794", date: "Yesterday 4:15 PM", dealer_name: "Shree Ram Paints", amount: 20000, payment_mode: "Cheque", reference_no: "CHQ-001921 (HDFC)", status: "Pending Bank Clearance", invoice_ref: "INV-10824", notes: "PDC Cheque deposited" }
  ]);

  const [activeTab, setActiveTab] = useState<"ledger" | "collect" | "playbook" | "history" | "analytics">("ledger");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<OutstandingInvoice | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [showShareReceipt, setShowShareReceipt] = useState<CollectionRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  // Log Form State
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [txnRef, setTxnRef] = useState<string>("");
  const [collectionNotes, setCollectionNotes] = useState<string>("");

  // Selected dealer object
  const selectedDealerObj = useMemo(() => dealersList.find(d => d.id === selectedDealerId), [selectedDealerId, dealersList]);
  
  // Pending invoices for selected dealer
  const dealerPendingInvoices = useMemo(() => {
    if (!selectedDealerId) return [];
    return invoices.filter(inv => inv.dealer_id === selectedDealerId && (inv.amount - inv.paid_amount) > 0);
  }, [selectedDealerId, invoices]);

  // Overall Collection Pool Metrics
  const poolMetrics = useMemo(() => {
    const totalOutstanding = invoices.reduce((s, i) => s + (i.amount - i.paid_amount), 0);
    const criticalAmount = invoices.filter(i => i.priority === "Critical (>45d)").reduce((s, i) => s + (i.amount - i.paid_amount), 0);
    const highAmount = invoices.filter(i => i.priority === "High (30-45d)").reduce((s, i) => s + (i.amount - i.paid_amount), 0);
    const monthlyCollected = collectionsHistory.reduce((s, c) => s + c.amount, 0);
    const collectionTarget = 350000;
    const targetPct = Math.min(100, Math.round((monthlyCollected / collectionTarget) * 100));
    return { totalOutstanding, criticalAmount, highAmount, monthlyCollected, collectionTarget, targetPct };
  }, [invoices, collectionsHistory]);

  // Filtered Aging Ledger
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (inv.locality && inv.locality.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPriority = priorityFilter === "ALL" || inv.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [invoices, searchTerm, priorityFilter]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealerId || !collectAmount || Number(collectAmount) <= 0) {
      alert("Please select a dealer and enter a valid collection amount.");
      return;
    }

    const dealerObj = dealersList.find(d => d.id === selectedDealerId);
    const amtNumber = Number(collectAmount);
    const refNo = txnRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRecord: CollectionRecord = {
      id: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Just Now",
      dealer_name: dealerObj?.name || "Dealer",
      amount: amtNumber,
      payment_mode: paymentMode,
      reference_no: refNo,
      status: paymentMode === "Cheque" ? "Pending Bank Clearance" : "Verified & Cleared",
      invoice_ref: selectedInvoiceId || "General Account Knockoff",
      notes: collectionNotes || "Logged via Salesman Collection Center"
    };

    startTransition(async () => {
      await logCollectionPayment({
        dealerId: selectedDealerId,
        amount: amtNumber,
        paymentMode: paymentMode,
        referenceId: refNo
      });

      // Update local invoice state if specific invoice selected
      if (selectedInvoiceId) {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === selectedInvoiceId) {
            const newPaid = inv.paid_amount + amtNumber;
            const isFull = newPaid >= inv.amount;
            return {
              ...inv,
              paid_amount: newPaid,
              status: isFull ? "Pending" : "Partially Paid"
            };
          }
          return inv;
        }));
      }

      setCollectionsHistory(prev => [newRecord, ...prev]);
      setActiveTab("history");
      setShowShareReceipt(newRecord);
      setSelectedDealerId("");
      setSelectedInvoiceId("");
      setCollectAmount("");
      setTxnRef("");
      setCollectionNotes("");
    });
  };

  const copyWhatsAppScript = (objId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(objId);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-xs font-sans text-foreground">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-950 via-emerald-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                Accounts Receivable Command
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-black">
                ● LIVE RECOVERY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Wallet size={22} className="text-emerald-400" /> Payment & Collection Center
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Track aging dealer invoices, log cash/UPI/cheque collections, apply credit note adjustments, and use B2B delay counters.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("collect")}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer border border-emerald-400/30"
          >
            <Plus size={16} /> Record Payment Collection
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Total Outstanding</span>
            <p className="text-lg font-black text-white font-mono">{fmt(poolMetrics.totalOutstanding)}</p>
            <span className="text-[9px] text-slate-400">{invoices.length} active invoices</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-rose-400 block mb-0.5">Critical Overdue (&gt;45d)</span>
            <p className="text-lg font-black text-rose-300 font-mono">{fmt(poolMetrics.criticalAmount)}</p>
            <span className="text-[9px] text-slate-400">High priority recovery</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">MTD Collections</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{fmt(poolMetrics.monthlyCollected)}</p>
            <span className="text-[9px] text-slate-400">{poolMetrics.targetPct}% of ₹3.5L target</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Recovery Target</span>
            <p className="text-lg font-black text-indigo-200 font-mono">{poolMetrics.targetPct}% Done</p>

            {/* Target Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${poolMetrics.targetPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "ledger", label: "Aging Invoice Ledger", icon: ShieldAlert, badge: invoices.length },
          { id: "collect", label: "Log Payment", icon: Plus, highlight: true },
          { id: "playbook", label: "Delay & Objection Master", icon: Shield, badge: "5 Strategies" },
          { id: "history", label: "Collection Receipts", icon: FileText, badge: collectionsHistory.length },
          { id: "analytics", label: "Recovery Health", icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : tab.highlight
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: AGING INVOICE LEDGER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Search & Filter controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Dealer, Invoice ID, or Locality..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:border-primary transition-colors text-foreground shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Critical (>45d)", "High (30-45d)", "Medium (15-30d)", "Healthy (<15d)"].map(pr => (
                <button
                  key={pr}
                  onClick={() => setPriorityFilter(pr)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    priorityFilter === pr
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Cards */}
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-3xl p-6">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-foreground">No invoices matching aging criteria</p>
              <p className="text-muted-foreground text-[11px] mt-1">All dealer accounts are within clean credit limits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInvoices.map(inv => {
                const pendingAmt = inv.amount - inv.paid_amount;
                const isCritical = inv.priority === "Critical (>45d)";
                const isHigh = inv.priority === "High (30-45d)";

                return (
                  <div
                    key={inv.id}
                    className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4 hover:border-primary/40 transition-all shadow-xs group"
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-foreground font-mono">{inv.id}</span>
                          <span className="text-[10px] text-muted-foreground">Due: {inv.due_date}</span>
                        </div>
                        <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex items-center gap-1.5">
                          <Building2 size={13} className="text-indigo-500" /> {inv.dealer_name}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider flex-shrink-0 ${
                          isCritical
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : isHigh
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}
                      >
                        {inv.priority}
                      </span>
                    </div>

                    {/* Summary Info */}
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Invoice:</span>
                        <span className="font-mono font-bold text-foreground">{fmt(inv.amount)}</span>
                      </div>
                      {inv.paid_amount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Already Received:</span>
                          <span className="font-mono font-bold">-{fmt(inv.paid_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border/50 pt-1.5 font-bold">
                        <span className="text-foreground">Net Due Amount:</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                          {fmt(pendingAmt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <Clock size={12} className={isCritical ? "text-rose-500" : "text-amber-500"} />
                        <span>Overdue: <strong className="text-foreground font-mono">{inv.due_days} Days</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const text = `Namaste ${inv.dealer_name}! Invoice ${inv.id} (${fmt(pendingAmt)}) is overdue by ${inv.due_days} days. Kindly clear via UPI/Cheque to maintain active credit status. Thank you!`;
                            navigator.clipboard.writeText(text);
                            alert(`Payment Reminder WhatsApp text copied for ${inv.dealer_name}!`);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-black text-[10px] hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> Send Reminder
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDealerId(inv.dealer_id);
                            setSelectedInvoiceId(inv.id);
                            setCollectAmount(String(pendingAmt));
                            setActiveTab("collect");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-black text-[10px] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                          Collect →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: LOG PAYMENT COLLECTION FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "collect" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Plus size={18} className="text-emerald-500" /> Log Dealer Payment Collection
              </h2>
              <p className="text-muted-foreground text-[11px]">
                Record payment collected via UPI, Cash, Cheque, or Direct Bank Transfer to clear aging invoices.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("ledger")}
              className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold text-[10px]"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRecordPaymentSubmit} className="space-y-6">
            {/* Dealer Picker */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                1. Select Paying Dealer *
              </label>
              <select
                value={selectedDealerId}
                onChange={e => {
                  setSelectedDealerId(e.target.value);
                  setSelectedInvoiceId("");
                }}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">-- Select Dealer --</option>
                {dealersList.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.locality}) — Rating: {d.payment_score}/100
                  </option>
                ))}
              </select>

              {/* Dealer Outstanding Profile */}
              {selectedDealerObj && (
                <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Credit Utilization:</span>
                    <span className="font-bold font-mono text-foreground">
                      {fmt(selectedDealerObj.credit_used || 0)} / {fmt(selectedDealerObj.credit_limit || 200000)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Pending Overdue Invoices:</span>
                    <span className="font-bold text-rose-500">{dealerPendingInvoices.length} Invoices</span>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Knock-off (Optional) */}
            {selectedDealerId && dealerPendingInvoices.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  2. Knock-off Specific Invoice (Optional)
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setCollectAmount(String(inv.amount - inv.paid_amount));
                  }}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="">-- Apply to General Account Balance --</option>
                  {dealerPendingInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} — Due: {fmt(inv.amount - inv.paid_amount)} ({inv.due_days}d overdue)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Collected Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 45000"
                  value={collectAmount}
                  onChange={e => setCollectAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="UPI">UPI / PhonePe / GPay</option>
                  <option value="Cash">Direct Cash</option>
                  <option value="Cheque">Cheque (PDC / Current)</option>
                  <option value="NEFT/RTGS">NEFT / RTGS Bank Transfer</option>
                  <option value="Credit Note Adjustment">Credit Note Settlement</option>
                </select>
              </div>
            </div>

            {/* Reference Number & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Transaction Txn / Cheque No / Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/9812401928 or CHQ-001921"
                  value={txnRef}
                  onChange={e => setTxnRef(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Collection Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Collected during morning store visit"
                  value={collectionNotes}
                  onChange={e => setCollectionNotes(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Screenshot Attachment Simulator */}
            <div className="border border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center bg-muted/10 space-y-1 cursor-pointer">
              <Upload size={20} className="text-emerald-500" />
              <span className="text-xs font-bold text-foreground">Attach Payment Receipt / Cheque Photo</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG, PDF up to 5MB</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Save Collection & Generate Receipt
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: B2B DELAY & OBJECTION MASTER KIT
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-emerald-400" />
              <h2 className="text-base font-black text-white">B2B Dealer Delay & Objection Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Handle payment excuses professionally, enforce credit policy compliance, and send instant WhatsApp recovery messages.
            </p>
          </div>

          <div className="space-y-4">
            {COLLECTION_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm">
                    {idx + 1}. {obj.excuse}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Dealer Excuse:</strong>
                  "{obj.excuseText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Recovery Strategy Script (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.counterHindi}</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-[10px] text-amber-700 dark:text-amber-300 space-y-0.5">
                  <strong className="block text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">
                    ⚠️ Accounts Compliance Warning:
                  </strong>
                  <p>{obj.complianceNotice}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Recovery Pitch</span>
                  <button
                    onClick={() => copyWhatsAppScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy WhatsApp Text
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: COLLECTION RECEIPTS & HISTORY LOG
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" /> Logged Collections History
            </h2>
            <p className="text-[11px] text-muted-foreground">
              View past collection logs, verification statuses, and generate official payment receipts.
            </p>
          </div>

          <div className="space-y-3">
            {collectionsHistory.map(rec => (
              <div key={rec.id} className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-xs font-mono text-foreground">{rec.id}</span>
                    <h4 className="font-bold text-xs text-foreground mt-0.5">{rec.dealer_name}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {rec.status}
                  </span>
                </div>

                <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-muted-foreground block">Amount Collected:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs">{fmt(rec.amount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Payment Mode:</span>
                    <span className="font-bold text-foreground">{rec.payment_mode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Ref / Txn ID:</span>
                    <span className="font-mono text-foreground">{rec.reference_no}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground">{rec.date}</span>
                  <button
                    onClick={() => setShowShareReceipt(rec)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-foreground cursor-pointer flex items-center gap-1"
                  >
                    <Share2 size={12} /> Share Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: RECOVERY HEALTH ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Territory Recovery Performance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Days Sales Outstanding (DSO)</span>
                <p className="text-base font-black text-foreground font-mono">34.2 Days</p>
                <span className="text-[9px] text-emerald-500 font-bold">↓ 4.1 days improvement</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">On-Time Payment Score</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">78.5 / 100</p>
                <span className="text-[9px] text-muted-foreground">High dealer reliability</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Critical Aging Pool</span>
                <p className="text-base font-black text-rose-500 font-mono">{fmt(poolMetrics.criticalAmount)}</p>
                <span className="text-[9px] text-rose-400 font-bold">Needs immediate visit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SHARE RECEIPT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showShareReceipt && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareReceipt(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-emerald-500/10 flex items-center justify-between">
              <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Official Payment Receipt
              </h3>
              <button onClick={() => setShowShareReceipt(null)} className="p-1 rounded-lg hover:bg-muted">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-muted/50 border border-border rounded-2xl p-4 font-mono text-[10px] text-foreground leading-relaxed whitespace-pre-line">
                {`*SHARMA INDUSTRIES - PAYMENT RECEIPT* 🧾
Receipt ID: ${showShareReceipt.id}
Dealer: ${showShareReceipt.dealer_name}
Date: ${showShareReceipt.date}

*Amount Collected:* ${fmt(showShareReceipt.amount)}
*Payment Mode:* ${showShareReceipt.payment_mode}
*Txn / Ref No:* ${showShareReceipt.reference_no}
*Status:* ${showShareReceipt.status}

Thank you for your timely payment! Your credit account balance has been updated.`}
              </div>

              <button
                onClick={() => {
                  const txt = `*SHARMA INDUSTRIES - PAYMENT RECEIPT* 🧾\nReceipt ID: ${showShareReceipt.id}\nDealer: ${showShareReceipt.dealer_name}\nAmount: ${fmt(showShareReceipt.amount)}\nPayment Mode: ${showShareReceipt.payment_mode}\nTxn Ref: ${showShareReceipt.reference_no}\nStatus: ${showShareReceipt.status}`;
                  navigator.clipboard.writeText(txt);
                  alert("WhatsApp Payment Receipt text copied!");
                  setShowShareReceipt(null);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-black text-[11px] rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy size={13} /> Copy WhatsApp Receipt Text
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
