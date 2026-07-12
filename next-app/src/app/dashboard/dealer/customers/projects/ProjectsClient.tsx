"use client";

import React, { useState, useTransition } from "react";
import { ClipboardList, Plus, Download, Search, Sparkles, X, Layers, Calendar, User, Info, Building } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createDealerProject } from "../../actions";

interface Project {
  id: number;
  customer_id: string;
  customer_name?: string;
  project_name: string;
  project_type: string;
  estimated_area: number;
  expected_completion: string | null;
  status: string;
  notes: string | null;
}

interface Props {
  initialData: Project[];
  customers: { id: string; name: string }[];
}

export function ProjectsClient({ initialData, customers }: Props) {
  const { t } = useLanguage();
  const [list, setList] = useState<Project[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    customer_id: customers[0]?.id || "",
    project_name: "",
    project_type: "Interior",
    estimated_area: "",
    status: "New Inquiry",
    expected_completion: "",
    notes: ""
  });

  const filtered = list.filter(p => {
    return !search || p.project_name.toLowerCase().includes(search.toLowerCase()) || p.customer_name?.toLowerCase().includes(search.toLowerCase()) || p.status.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.project_name) return;
    startTransition(async () => {
      const res = await createDealerProject(form);
      if (res.success) {
        const custName = customers.find(c => c.id === form.customer_id)?.name || "Retail Customer";
        setList(prev => [{
          id: Date.now(),
          customer_id: form.customer_id,
          customer_name: custName,
          project_name: form.project_name,
          project_type: form.project_type,
          estimated_area: Number(form.estimated_area || 0),
          expected_completion: form.expected_completion || null,
          status: form.status,
          notes: form.notes || null
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          customer_id: customers[0]?.id || "",
          project_name: "",
          project_type: "Interior",
          estimated_area: "",
          status: "New Inquiry",
          expected_completion: "",
          notes: ""
        });
      } else {
        alert(res.error || "Failed to create project");
      }
    });
  };

  const exportCSV = () => {
    const header = ["Project Name", "Customer", "Type", "Area (Sq.ft.)", "Completion Date", "Status", "Notes"];
    const rows = filtered.map(p => [p.project_name, p.customer_name || "—", p.project_type, p.estimated_area, p.expected_completion || "—", p.status, p.notes || "—"]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `projects_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Customers</span><span className="opacity-40">/</span><span className="text-foreground">Projects</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Project Management</h1>
              <p className="text-xs text-muted-foreground">Track paint jobs, estimated materials, timelines and site status</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={13} /> New Project
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
          <span className="font-bold text-foreground">AI Project Suggestion:</span> Project <span className="font-bold text-foreground">Alwar Villa Renovation</span> is nearing its expected completion date of 15th August. Consider scheduling final inspection.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Sites", value: list.filter(p => p.status === "Work Started" || p.status === "In Progress").length, desc: "In progress painting" },
          { label: "Pending Inquiries", value: list.filter(p => p.status === "New Inquiry" || p.status === "Site Visit Scheduled").length, desc: "Awaiting site visit" },
          { label: "Quotations Awaiting", value: list.filter(p => p.status === "Quotation Sent").length, desc: "Follow-up required" },
          { label: "Completed Sites", value: list.filter(p => p.status === "Completed").length, desc: "Total certified jobs" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{s.label}</span>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects by name, customer or status..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Area (Sq.ft.)</th>
                <th className="px-4 py-3 text-center">Expected Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No projects found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{p.project_name}</td>
                  <td className="px-4 py-3 font-semibold text-muted-foreground">{p.customer_name}</td>
                  <td className="px-4 py-3 text-foreground">{p.project_type}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{p.estimated_area.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground font-mono">{p.expected_completion ? new Date(p.expected_completion).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${
                      p.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      p.status === "Work Started" || p.status === "In Progress" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{p.notes || "—"}</td>
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Layers size={14} className="text-primary" /> Create Project Record</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Customer *</label>
                <select required value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project / Site Name *</label>
                <input required value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} placeholder="E.g. Ground Floor Paint Job" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Type</label>
                  <select value={form.project_type} onChange={e => setForm(f => ({ ...f, project_type: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["Interior", "Exterior", "Texture", "Waterproofing", "Renovation"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Estimated Area (Sq.ft.)</label>
                  <input type="number" value={form.estimated_area} onChange={e => setForm(f => ({ ...f, estimated_area: e.target.value }))} placeholder="E.g. 2500" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Expected Completion</label>
                  <input type="date" value={form.expected_completion} onChange={e => setForm(f => ({ ...f, expected_completion: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Initial Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["New Inquiry", "Site Visit Scheduled", "Quotation Sent", "Quotation Approved", "Work Started", "In Progress", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Site Description & Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Enter specific requirements..." rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Creating..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
