"use client";

import React, { useState, useTransition } from "react";
import { ClipboardList, Plus, Search, Sparkles, X, PlusCircle, AlertCircle } from "lucide-react";
import { createDealerComplaint } from "../../actions";

interface Complaint {
  id: number;
  complaint_no: string;
  customer_name: string;
  project_name: string;
  issue_type: string;
  priority: string;
  status: string;
  remarks: string | null;
}

interface Props {
  initialData: Complaint[];
}

export function ComplaintsClaimsClient({ initialData }: Props) {
  const [list, setList] = useState<Complaint[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    customer_name: "",
    project_name: "",
    issue_type: "Quality Issue",
    priority: "Medium",
    remarks: ""
  });

  const filtered = list.filter(c => {
    return !search || c.customer_name.toLowerCase().includes(search.toLowerCase()) || c.issue_type.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.project_name) return;

    startTransition(async () => {
      const compNo = `COMP-${Date.now()}`;
      const res = await createDealerComplaint({
        complaint_no: compNo,
        customer_name: form.customer_name,
        project_name: form.project_name,
        issue_type: form.issue_type,
        priority: form.priority,
        remarks: form.remarks
      });

      if (res.success) {
        setList(prev => [{
          id: Date.now(),
          complaint_no: compNo,
          customer_name: form.customer_name,
          project_name: form.project_name,
          issue_type: form.issue_type,
          priority: form.priority,
          status: "Open",
          remarks: form.remarks || null
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          customer_name: "",
          project_name: "",
          issue_type: "Quality Issue",
          priority: "Medium",
          remarks: ""
        });
      } else {
        alert(res.error || "Failed to create complaint log");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Logistics</span><span className="opacity-40">/</span><span className="text-foreground">Complaints</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><AlertCircle size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Complaint Center & After Sales</h1>
              <p className="text-xs text-muted-foreground">Register customer feedback, quality complaints, transport leakages, or warranty claims</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} /> Log Complaint
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI After-Sales Advisor:</span> Tracked {list.filter(c => c.status === "Open").length} open issues needing inspection checks.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter complaints by customer or issue..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Ticket No</th>
                <th className="px-4 py-3">Customer / Project</th>
                <th className="px-4 py-3">Issue Category</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No tickets registered.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{c.complaint_no}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{c.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.project_name}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.issue_type}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      c.priority === "Critical" || c.priority === "High" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      c.status === "Resolved" || c.status === "Closed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><PlusCircle size={14} className="text-primary" /> Log After-Sales Ticket</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Customer Name *</label>
                  <input required value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="E.g. Rahul Verma" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Name *</label>
                  <input required value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} placeholder="E.g. Civil Lines Villa" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Issue Type</label>
                  <select value={form.issue_type} onChange={e => setForm(f => ({ ...f, issue_type: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["Quality Issue", "Coverage Issue", "Transport Damage", "Leakage", "Wrong Product", "Other"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["Low", "Medium", "High", "Critical"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Remarks / Issue Details</label>
                <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Provide details like batch number, product name, or damage pictures description..." rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Logging..." : "Log Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
