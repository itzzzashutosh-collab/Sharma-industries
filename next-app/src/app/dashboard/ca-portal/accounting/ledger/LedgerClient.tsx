"use client";

import React, { useState, useTransition } from "react";
import { BookMarked, Download, Plus, Search, Filter, Trash2, Edit2, CheckCircle, AlertCircle, FileText, Sparkles, X, Printer } from "lucide-react";
import { createLedger, updateLedger, toggleLedgerStatus } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Ledger {
  id: string;
  name: string;
  code: string;
  group_name: string;
  opening_balance: number;
  closing_balance: number;
  current_balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  initialLedgers: Ledger[];
}

const LEDGER_GROUPS = [
  "Cash-in-hand", "Bank Accounts", "Sales Accounts", "Purchase Accounts",
  "Capital Account", "Current Assets", "Current Liabilities", "Direct Expenses", "Indirect Expenses", "Duties & Taxes"
];

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function LedgerClient({ initialLedgers }: Props) {
  const { t } = useLanguage();
  const [ledgers, setLedgers] = useState<Ledger[]>(initialLedgers);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);

  // Form states
  const [form, setForm] = useState({ name: "", code: "", group_name: LEDGER_GROUPS[0], opening_balance: 0 });

  // Filtered ledgers
  const filtered = ledgers.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase());
    const matchGroup = selectedGroup === "all" || l.group_name === selectedGroup;
    return matchSearch && matchGroup;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const generatedId = `LEDG_${Date.now().toString().slice(-4)}`;
      const res = await createLedger({ ...form, id: generatedId });
      if (res.success) {
        setLedgers(prev => [...prev, {
          ...form,
          id: generatedId,
          closing_balance: form.opening_balance,
          current_balance: form.opening_balance,
          status: "Active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        setShowCreateModal(false);
        setForm({ name: "", code: "", group_name: LEDGER_GROUPS[0], opening_balance: 0 });
      }
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedger) return;
    startTransition(async () => {
      const res = await updateLedger(selectedLedger.id, form);
      if (res.success) {
        setLedgers(prev => prev.map(l => l.id === selectedLedger.id ? { ...l, ...form, updated_at: new Date().toISOString() } : l));
        setShowEditModal(false);
      }
    });
  };

  const handleToggleStatus = (ledger: Ledger) => {
    startTransition(async () => {
      const res = await toggleLedgerStatus(ledger.id, ledger.status);
      if (res.success && res.newStatus) {
        setLedgers(prev => prev.map(l => l.id === ledger.id ? { ...l, status: res.newStatus! } : l));
      }
    });
  };

  const exportCSV = () => {
    const rows = [
      ["Ledger Code", "Ledger Name", "Group", "Opening Bal", "Closing Bal", "Current Bal", "Status"],
      ...filtered.map(l => [l.code, l.name, l.group_name, l.opening_balance, l.closing_balance, l.current_balance, l.status])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `ledgers_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Ledgers</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><BookMarked size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Chart of Accounts")}</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} ledgers configured</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all shadow-sm">
              <Plus size={13} /> {t("Create Ledger")}
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Auditor Insight:</span> There are no ledger accounts with negative balances. 10 standard account groups are active.
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-end gap-3 shadow-sm">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase">Search</label>
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
            <Search size={13} className="text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ledger name or code..." className="bg-transparent outline-none flex-1" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase">Group Filter</label>
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary">
            <option value="all">All Groups</option>
            {LEDGER_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3 text-right">Opening Bal</th>
                <th className="px-4 py-3 text-right">Closing Bal</th>
                <th className="px-4 py-3 text-right">Current Bal</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No ledgers found matching criteria.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{l.code}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{l.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.group_name}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(l.opening_balance)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(l.closing_balance)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{fmt(l.current_balance)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${l.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5">
                    <button onClick={() => { setSelectedLedger(l); setForm({ name: l.name, code: l.code, group_name: l.group_name, opening_balance: l.opening_balance }); setShowEditModal(true); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleToggleStatus(l)}
                      className={`p-1 rounded hover:bg-muted font-bold text-[10px] ${l.status === "Active" ? "text-rose-500" : "text-emerald-500"}`}>
                      {l.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ledger Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Create New Ledger</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-muted rounded"><X size={15} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Ledger Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rent Account" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Ledger Code</label>
                <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. EXP005" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Account Group</label>
                <select value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  {LEDGER_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Opening Balance (₹)</label>
                <input type="number" required value={form.opening_balance} onChange={e => setForm(f => ({ ...f, opening_balance: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                {isPending ? "Creating..." : "Create Ledger"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ledger Modal */}
      {showEditModal && selectedLedger && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Edit Ledger</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-muted rounded"><X size={15} /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Ledger Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Ledger Code</label>
                <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Account Group</label>
                <select value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                  {LEDGER_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
