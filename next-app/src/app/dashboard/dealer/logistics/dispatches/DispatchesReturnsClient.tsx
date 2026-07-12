"use client";

import React, { useState, useTransition } from "react";
import { ClipboardList, Plus, Search, Sparkles, X, PlusCircle, Navigation } from "lucide-react";
import { createDealerDispatch } from "../../actions";

interface Dispatch {
  id: number;
  dispatch_no: string;
  vehicle_no: string;
  driver_name: string;
  carrier_name: string;
  lr_no: string;
  status: string;
  estimated_arrival: string | null;
  remarks: string | null;
}

interface Props {
  initialData: Dispatch[];
}

export function DispatchesReturnsClient({ initialData }: Props) {
  const [list, setList] = useState<Dispatch[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    vehicle_no: "",
    driver_name: "",
    carrier_name: "",
    lr_no: "",
    estimated_arrival: "",
    remarks: ""
  });

  const filtered = list.filter(d => {
    return !search || d.vehicle_no.toLowerCase().includes(search.toLowerCase()) || d.driver_name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle_no || !form.driver_name) return;

    startTransition(async () => {
      const dispNo = `DISP-${Date.now()}`;
      const res = await createDealerDispatch({
        dispatch_no: dispNo,
        vehicle_no: form.vehicle_no,
        driver_name: form.driver_name,
        carrier_name: form.carrier_name,
        lr_no: form.lr_no,
        status: "In Transit",
        estimated_arrival: form.estimated_arrival,
        remarks: form.remarks
      });

      if (res.success) {
        setList(prev => [{
          id: Date.now(),
          dispatch_no: dispNo,
          vehicle_no: form.vehicle_no,
          driver_name: form.driver_name,
          carrier_name: form.carrier_name,
          lr_no: form.lr_no,
          status: "In Transit",
          estimated_arrival: form.estimated_arrival || null,
          remarks: form.remarks || null
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          vehicle_no: "",
          driver_name: "",
          carrier_name: "",
          lr_no: "",
          estimated_arrival: "",
          remarks: ""
        });
      } else {
        alert(res.error || "Failed to create dispatch");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Logistics</span><span className="opacity-40">/</span><span className="text-foreground">Dispatches</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Navigation size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Dispatches & Returns</h1>
              <p className="text-xs text-muted-foreground">Manage transport dispatch manifests, driver allocations, and logistical returns</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} /> Create Dispatch
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Dispatch Log:</span> Tracking {list.filter(d => d.status === "In Transit").length} shipments in active transit routes.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter dispatches by driver or vehicle..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Dispatch No</th>
                <th className="px-4 py-3">Vehicle / Driver</th>
                <th className="px-4 py-3">Carrier / LR No</th>
                <th className="px-4 py-3">Est. Arrival</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No dispatches registered.</td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{d.dispatch_no}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{d.vehicle_no}</p>
                    <p className="text-[10px] text-muted-foreground">{d.driver_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{d.carrier_name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">LR: {d.lr_no}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{d.estimated_arrival || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      d.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}>
                      {d.status}
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><PlusCircle size={14} className="text-primary" /> Create Dispatch Manifest</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Vehicle Number *</label>
                  <input required value={form.vehicle_no} onChange={e => setForm(f => ({ ...f, vehicle_no: e.target.value }))} placeholder="E.g. RJ-14-GD-2030" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Driver Name *</label>
                  <input required value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} placeholder="E.g. Ramesh" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Carrier Company</label>
                  <input value={form.carrier_name} onChange={e => setForm(f => ({ ...f, carrier_name: e.target.value }))} placeholder="E.g. Jaipur Logistics" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Lorry Receipt (LR) No</label>
                  <input value={form.lr_no} onChange={e => setForm(f => ({ ...f, lr_no: e.target.value }))} placeholder="E.g. LR-9028" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Estimated Arrival Date</label>
                <input type="date" value={form.estimated_arrival} onChange={e => setForm(f => ({ ...f, estimated_arrival: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Remarks / Notes</label>
                <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Enter routes details or cargo items summary..." rows={2} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Creating..." : "Save Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
