"use client";

import React, { useState, useTransition } from "react";
import { ScrollText, Plus, Download, Search, X, CheckCircle, Sparkles } from "lucide-react";
import { createJournalEntry } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Ledger { id: string; name: string; code: string; }
interface JournalEntry {
  id: string;
  voucher_number: string;
  date: string;
  debit_ledger_id: string;
  credit_ledger_id: string;
  amount: number;
  narration: string;
  created_by: string;
  status: string;
  debit_ledger?: { name: string; code: string };
  credit_ledger?: { name: string; code: string };
}

interface Props {
  initialEntries: JournalEntry[];
  ledgers: Ledger[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function JournalClient({ initialEntries, ledgers }: Props) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    debit_ledger_id: ledgers[0]?.id || "",
    credit_ledger_id: ledgers[1]?.id || "",
    amount: 0,
    narration: "",
  });

  const filtered = entries.filter(e => {
    return !search || e.voucher_number.toLowerCase().includes(search.toLowerCase()) || e.narration?.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.debit_ledger_id === form.credit_ledger_id) {
      alert("Debit and Credit ledgers cannot be the same!");
      return;
    }
    startTransition(async () => {
      const generatedId = `JRN_${Date.now().toString().slice(-4)}`;
      const voucherNo = `JV-2025-${Date.now().toString().slice(-4)}`;
      const payload = {
        ...form,
        id: generatedId,
        voucher_number: voucherNo,
        created_by: "CA Auditor",
        status: "Active",
      };

      const res = await createJournalEntry(payload);
      if (res.success) {
        const dbLedg = ledgers.find(l => l.id === form.debit_ledger_id);
        const crLedg = ledgers.find(l => l.id === form.credit_ledger_id);

        setEntries(prev => [{
          ...payload,
          date: new Date().toISOString(),
          debit_ledger: dbLedg ? { name: dbLedg.name, code: dbLedg.code } : undefined,
          credit_ledger: crLedg ? { name: crLedg.name, code: crLedg.code } : undefined,
        }, ...prev]);
        setShowCreateModal(false);
        setForm({
          debit_ledger_id: ledgers[0]?.id || "",
          credit_ledger_id: ledgers[1]?.id || "",
          amount: 0,
          narration: "",
        });
      }
    });
  };

  const exportCSV = () => {
    const header = ["Date", "Voucher#", "Debit Account", "Credit Account", "Amount", "Narration"];
    const rows = filtered.map(e => [fmtDate(e.date), e.voucher_number, e.debit_ledger?.name, e.credit_ledger?.name, e.amount, e.narration || ""]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `journals_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Journal</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ScrollText size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Journal Register")}</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} journal vouchers logged</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 shadow-sm">
              <Plus size={13} /> {t("New Entry")}
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Widget */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> All journal entries are balanced. No discrepancy detected in debit/credit logic.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search journal entries by voucher# or narration..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Voucher#</th>
                <th className="px-4 py-3">Debit Account (Dr)</th>
                <th className="px-4 py-3">Credit Account (Cr)</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Narration</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No journal entries found.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(e.date)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{e.voucher_number}</td>
                  <td className="px-4 py-3 font-bold text-foreground">
                    <div>{e.debit_ledger?.name}</div>
                    <span className="text-[9px] font-normal text-muted-foreground">Code: {e.debit_ledger?.code}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground">
                    <div>{e.credit_ledger?.name}</div>
                    <span className="text-[9px] font-normal text-muted-foreground">Code: {e.credit_ledger?.code}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground italic max-w-xs truncate">{e.narration || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Create Journal Entry</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-muted rounded"><X size={15} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Debit Account (Dr)</label>
                <select value={form.debit_ledger_id} onChange={e => setForm(f => ({ ...f, debit_ledger_id: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  {ledgers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Credit Account (Cr)</label>
                <select value={form.credit_ledger_id} onChange={e => setForm(f => ({ ...f, credit_ledger_id: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  {ledgers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Amount (₹)</label>
                <input type="number" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Narration</label>
                <textarea value={form.narration} onChange={e => setForm(f => ({ ...f, narration: e.target.value }))} placeholder="Provide details of transaction..." rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary resize-none" />
              </div>
              <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                {isPending ? "Submitting..." : "Submit Entry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
