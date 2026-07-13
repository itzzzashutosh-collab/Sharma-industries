"use client";

import React, { useState, useTransition } from "react";
import { Wallet, Search, Clock, Calendar, CheckCircle2, AlertCircle, FileText, Plus, Sparkles, Upload, X, ShieldAlert } from "lucide-react";

interface Dealer {
  id: string;
  name: string;
}

interface OutstandingInvoice {
  id: string;
  dealer_name: string;
  amount: number;
  due_days: number;
  priority: "Critical" | "High" | "Medium";
}

interface Props {
  initialData: {
    dealers: Dealer[];
    invoices: OutstandingInvoice[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function CollectionsClient({ initialData }: Props) {
  const [invoices, setInvoices] = useState<OutstandingInvoice[]>(initialData.invoices);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [txnRef, setTxnRef] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer || !collectAmount) {
      alert("Please fill all required fields.");
      return;
    }

    startTransition(async () => {
      // Simulate client-side collection logging
      const dealerObj = initialData.dealers.find(d => d.id === selectedDealer);
      alert(`Collection receipt of ${fmt(Number(collectAmount))} logged for ${dealerObj?.name || "Dealer"}. Reference ID: ${txnRef || "N/A"}. Awaiting accounts verification.`);
      setShowCollectModal(false);
      setCollectAmount("");
      setTxnRef("");
    });
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Collections</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Accounts Receivable</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 bg-card border border-border rounded-3xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Collection Target</span>
          <p className="text-lg font-black text-foreground font-mono">₹1,50,000</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Outstanding Pool</span>
          <p className="text-lg font-black text-rose-600 font-mono">
            {fmt(invoices.reduce((sum, i) => sum + i.amount, 0))}
          </p>
        </div>
      </div>

      {/* AI Assistant Coach */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Collection Coach</p>
          <p>• ABC Traders has crossed their 45-day credit terms. Prioritize a route visit to them first to clear aging invoices before taking new orders.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowCollectModal(true)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={14} /> Record Payment Collection
        </button>
      </div>

      {/* Outstanding list */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert size={14} className="text-primary" /> Aging Invoices</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-colors text-foreground" />
        </div>

        {filteredInvoices.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No pending outstanding invoices.</p>
        ) : filteredInvoices.map((inv) => (
          <div key={inv.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-foreground text-xs">{inv.id}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{inv.dealer_name}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                inv.priority === "Critical" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {inv.priority}
              </span>
            </div>

            <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span>Amount: {fmt(inv.amount)}</span>
              <span>Overdue: {inv.due_days} Days</span>
            </div>
          </div>
        ))}
      </div>

      {/* Record Collection Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Wallet size={14} className="text-primary" /> Log Dealer Payment</h3>
              <button onClick={() => setShowCollectModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleCollectSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Dealer</label>
                <select value={selectedDealer} onChange={e => setSelectedDealer(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  <option value="">-- Choose Dealer --</option>
                  {initialData.dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Collected Amount</label>
                  <input type="number" required value={collectAmount} onChange={e => setCollectAmount(e.target.value)} placeholder="₹" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground">
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Transaction Txn ID / Ref</label>
                <input type="text" value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="E.g. TXN-10842-XX" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground font-mono" />
              </div>

              <div className="space-y-1.5 border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/10 cursor-pointer">
                <Upload size={18} className="text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Upload Deposit Receipt Screenshot</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowCollectModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Logging..." : "Log Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
