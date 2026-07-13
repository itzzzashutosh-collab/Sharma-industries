"use client";

import React, { useState, useTransition } from "react";
import { Store, Users, PlusCircle, Search, Sparkles, Phone, MessageSquare, ClipboardList, Target, AlertCircle } from "lucide-react";
import { createSalesVisit } from "../actions";

interface DBDealer {
  id: string;
  name: string;
  address: string;
  localities: string;
  designation: string;
  gst_number: string;
  pan_card_url?: string;
  aadhaar_front_url?: string;
}

interface Props {
  initialData: {
    dealers: DBDealer[];
  };
}

export default function SalesmanCustomersClient({ initialData }: Props) {
  const [dealers] = useState<DBDealer[]>(initialData.dealers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Dealers"); // Dealers, Leads, Follow-ups
  const [isPending, startTransition] = useTransition();

  const [leads, setLeads] = useState([
    { id: "1", name: "Jaipur Paint Depot", owner: "Rakesh Verma", phone: "9876543210", stage: "Negotiation", potential: "₹2,50,000/mo" },
    { id: "2", name: "Marwar Hardware & Color", owner: "Gopal Joshi", phone: "9988776655", stage: "Interested", potential: "₹1,20,000/mo" }
  ]);

  const [followups, setFollowups] = useState([
    { id: "f1", target: "Jaipur Paint Depot", date: "2026-07-14", purpose: "Share texture sample catalogue", status: "Pending" },
    { id: "f2", target: "Gopal Traders", date: "2026-07-15", purpose: "Collect outstanding payment balance", status: "Pending" }
  ]);

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.gst_number && d.gst_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Network</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Relationship Center</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {["Dealers", "Leads", "Follow-ups"].map((tab) => (
          <button key={tab} onClick={() => setSelectedTab(tab)} className={`flex-1 py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
            selectedTab === tab 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* AI Assistant Coach */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Sales Insights</p>
          {selectedTab === "Dealers" && <p>• 2 dealers have outstanding payments overdue. Recommended action: schedule a Collection visit today.</p>}
          {selectedTab === "Leads" && <p>• Jaipur Paint Depot has a 85% probability score. Share sample cards to close.</p>}
          {selectedTab === "Follow-ups" && <p>• You have 2 follow-ups scheduled for tomorrow. Call them early in the morning.</p>}
        </div>
      </div>

      {/* Active Tab Contents */}
      {selectedTab === "Dealers" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search dealers by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-colors text-foreground" />
          </div>

          <div className="space-y-3">
            {filteredDealers.map(d => (
              <div key={d.id} className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground text-xs">{d.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{d.localities || "Rajasthan Territory"}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 uppercase font-mono">Healthy</span>
                </div>
                <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px]">
                  <span className="font-mono text-muted-foreground">GST: {d.gst_number || "UNREGISTERED"}</span>
                  <div className="flex gap-2">
                    <a href={`tel:${d.id}`} className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary"><Phone size={12} /></a>
                    <a href={`https://wa.me/919999999999`} target="_blank" className="p-1.5 rounded-lg border border-border hover:bg-muted text-emerald-600"><MessageSquare size={12} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "Leads" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {leads.map(l => (
              <div key={l.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground text-xs">{l.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Owner: {l.owner} | {l.phone}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase font-mono">{l.stage}</span>
                </div>
                <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-bold">Est: {l.potential}</span>
                  <div className="flex gap-2">
                    <button onClick={() => alert("Converting lead to registered dealer...")} className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Convert</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "Follow-ups" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {followups.map(f => (
              <div key={f.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground text-xs">{f.target}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.purpose}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-primary">{f.date}</span>
                </div>
                <div className="border-t border-border/40 pt-3 flex justify-end gap-2">
                  <button onClick={() => alert("Follow-up marked completed.")} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Done</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
