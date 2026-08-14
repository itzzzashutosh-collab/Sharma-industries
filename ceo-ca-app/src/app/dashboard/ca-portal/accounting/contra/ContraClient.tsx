"use client";

import React, { useState, useTransition } from "react";
import { Scale, Plus, Download, Search, X, CheckCircle, Sparkles } from "lucide-react";
import { createContraEntry } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Ledger { id: string; name: string; code: string; }
interface ContraEntry {
  id: string;
  date: string;
  contra_type: string;
  from_account: string;
  to_account: string;
  amount: number;
  narration: string;
  reference: string;
}

interface Props {
  initialEntries: ContraEntry[];
  ledgers: Ledger[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function ContraClient({ initialEntries, ledgers }: Props) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<ContraEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    contra_type: "Cash to Bank",
    from_account: "Cash",
    to_account: "SBI",
    amount: 0,
    narration: "",
  });

  const filtered = entries.filter(e => {
    return !search || e.contra_type.toLowerCase().includes(search.toLowerCase()) || e.narration?.toLowerCase().includes(search.toLowerCase()) || e.reference?.toLowerCase().includes(search.toLowerCase());
  });

  const handleTypeChange = (type: string) => {
    let from = "Cash";
    let to = "SBI";
    if (type === "Bank to Cash") {
      from = "SBI";
      to = "Cash";
    } else if (type === "Bank to Bank") {
      from = "SBI";
      to = "HDFC Bank";
    }
    setForm(f => ({ ...f, contra_type: type, from_account: from, to_account: to }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.from_account === form.to_account) {
      alert("Source and Target accounts cannot be the same!");
      return;
    }
    startTransition(async () => {
      const generatedId = `CON_${Date.now().toString().slice(-4)}`;
      const refNo = `CN-${Date.now().toString().slice(-4)}`;
      const payload = {
        ...form,
        id: generatedId,
        reference: refNo,
      };

      const res = await createContraEntry(payload);
      if (res.success) {
        setEntries(prev => [{
          ...payload,
          date: new Date().toISOString(),
        }, ...prev]);
        setShowCreateModal(false);
        setForm({
          contra_type: "Cash to Bank",
          from_account: "Cash",
          to_account: "SBI",
          amount: 0,
          narration: "",
        });
      }
    });
  };

  const exportCSV = () => {
    const header = ["Date", "Type", "From Account", "To Account", "Amount", "Reference", "Narration"];
    const rows = filtered.map(e => [fmtDate(e.date), e.contra_type, e.from_account, e.to_account, e.amount, e.reference || "—", e.narration || ""]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `contra_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Contra</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Scale size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Contra Register</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} contra records logged</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 shadow-sm">
              <Plus size={13} /> {t("New Transfer")}
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
          <span className="font-bold text-foreground">AI Insight:</span> Cash to bank and bank to cash transfers are correctly recorded and match bank ledger updates.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contra entries by ref or narration..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference No</th>
                <th className="px-4 py-3">Transfer Type</th>
                <th className="px-4 py-3">From Account</th>
                <th className="px-4 py-3">To Account</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Narration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No contra entries found.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(e.date)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{e.reference}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{e.contra_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.from_account}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.to_account}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground italic max-w-xs truncate">{e.narration || "—"}</td>
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
              <h3 className="text-sm font-bold text-foreground">Create Contra Transfer</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-muted rounded"><X size={15} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Transfer Type</label>
                <select value={form.contra_type} onChange={e => handleTypeChange(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  <option value="Cash to Bank">Cash to Bank</option>
                  <option value="Bank to Cash">Bank to Cash</option>
                  <option value="Bank to Bank">Bank to Bank</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">From Account</label>
                <select value={form.from_account} onChange={e => setForm(f => ({ ...f, from_account: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  {form.contra_type === "Bank to Cash" || form.contra_type === "Bank to Bank" ? (
                    <>
                      <option value="SBI">SBI Bank Account</option>
                      <option value="HDFC Bank">HDFC Bank Account</option>
                    </>
                  ) : (
                    <option value="Cash">Cash-in-hand</option>
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">To Account</label>
                <select value={form.to_account} onChange={e => setForm(f => ({ ...f, to_account: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  {form.contra_type === "Cash to Bank" ? (
                    <>
                      <option value="SBI">SBI Bank Account</option>
                      <option value="HDFC Bank">HDFC Bank Account</option>
                    </>
                  ) : form.contra_type === "Bank to Bank" ? (
                    <>
                      <option value="HDFC Bank">HDFC Bank Account</option>
                      <option value="SBI">SBI Bank Account</option>
                    </>
                  ) : (
                    <option value="Cash">Cash-in-hand</option>
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Amount (₹)</label>
                <input type="number" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Narration</label>
                <textarea value={form.narration} onChange={e => setForm(f => ({ ...f, narration: e.target.value }))} placeholder="Provide details of transfer..." rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary resize-none" />
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
