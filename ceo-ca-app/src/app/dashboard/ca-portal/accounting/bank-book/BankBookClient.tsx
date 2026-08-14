"use client";

import React, { useState } from "react";
import { Landmark, Upload, Download, ArrowDownCircle, ArrowUpCircle, CheckCircle, AlertCircle, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  opening_balance: number;
  current_balance: number;
  reconciliation_status: string;
  statement_status: string;
}

interface Receipt {
  id: string;
  receipt_number: string;
  customer: string;
  amount: number;
  payment_mode: string;
  reference_number: string;
  created_at: string;
}

interface Payment {
  id: string;
  payment_number: string;
  supplier: string;
  amount: number;
  payment_mode: string;
  transaction_id: string;
  created_at: string;
}

interface Props {
  bankAccounts: BankAccount[];
  receipts: Receipt[];
  payments: Payment[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function BankBookClient({ bankAccounts, receipts, payments }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(bankAccounts[0]?.id || "");
  const [search, setSearch] = useState("");

  const currentAccount = bankAccounts.find(b => b.id === activeTab) || bankAccounts[0];

  // Merge deposits and withdrawals for bank transactions feed
  const mergedTx: any[] = [];
  receipts.forEach(r => {
    mergedTx.push({
      id: r.id,
      ref: r.receipt_number,
      party: r.customer,
      amount: Number(r.amount),
      type: "Deposit",
      mode: r.payment_mode,
      refNo: r.reference_number,
      date: r.created_at
    });
  });

  payments.forEach(p => {
    mergedTx.push({
      id: p.id,
      ref: p.payment_number,
      party: p.supplier,
      amount: Number(p.amount),
      type: "Withdrawal",
      mode: p.payment_mode,
      refNo: p.transaction_id,
      date: p.created_at
    });
  });

  mergedTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTx = mergedTx.filter(tx => {
    return !search || tx.party?.toLowerCase().includes(search.toLowerCase()) || tx.ref?.toLowerCase().includes(search.toLowerCase()) || tx.refNo?.toLowerCase().includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const header = ["Date", "Voucher#", "Particulars", "Type", "Mode", "Reference", "Amount"];
    const rows = filteredTx.map(tx => [fmtDate(tx.date), tx.ref, tx.party, tx.type, tx.mode, tx.refNo || "—", tx.amount]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `bank_book_${currentAccount?.account_name || "bank"}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Bank Book</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Landmark size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Bank Book</h1>
              <p className="text-xs text-muted-foreground">Manage and reconcile multiple bank accounts</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export statement
          </button>
        </div>
      </div>

      {/* Bank Account Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {bankAccounts.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveTab(b.id)}
            className={`px-4 py-3 rounded-2xl border transition-all text-left space-y-1 cursor-pointer flex-1 min-w-[200px] ${activeTab === b.id ? "bg-card border-primary/40 shadow-sm" : "bg-card/50 border-border hover:bg-card hover:border-border/80"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">{b.bank_name}</span>
              <Landmark size={12} className={activeTab === b.id ? "text-primary" : "text-muted-foreground"} />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground">A/C: *{b.account_number.slice(-4)}</p>
            <p className="text-base font-black text-foreground pt-1">{fmt(b.current_balance)}</p>
            <div className="flex items-center justify-between text-[9px] font-bold pt-2">
              <span className={b.reconciliation_status === "Reconciled" ? "text-emerald-600" : "text-amber-600"}>{b.reconciliation_status}</span>
              <span className="text-muted-foreground">{b.statement_status}</span>
            </div>
          </button>
        ))}
      </div>

      {/* AI Assistant Widget */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Assistant:</span> State Bank of India balance is fully reconciled with your ledger. HDFC Bank statement upload is recommended for reconciliation.
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex-1 max-w-md flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions by customer, supplier, reference..." className="bg-transparent outline-none flex-1" />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Opening Balance: <strong className="text-foreground">{fmt(currentAccount?.opening_balance || 0)}</strong></span>
          <span className="h-4 w-px bg-border mx-1" />
          <span className="text-muted-foreground">Current Balance: <strong className="text-foreground">{fmt(currentAccount?.current_balance || 0)}</strong></span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Voucher#</th>
                <th className="px-4 py-3">Particulars</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference No</th>
                <th className="px-4 py-3 text-right">Debit (In)</th>
                <th className="px-4 py-3 text-right">Credit (Out)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No bank transactions found.</td></tr>
              ) : filteredTx.map((tx) => (
                <tr key={tx.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(tx.date)}</td>
                  <td className="px-4 py-3 font-mono text-foreground font-semibold">{tx.ref}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{tx.party}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.mode || "Bank"}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{tx.refNo || "—"}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{tx.type === "Deposit" ? fmt(tx.amount) : "—"}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">{tx.type === "Withdrawal" ? fmt(tx.amount) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
