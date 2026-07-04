"use client";

import React, { useState } from "react";
import { 
  Search, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  Coins, 
  X, 
  ArrowUpRight, 
  DollarSign, 
  Layers,
  Sparkles,
  ClipboardList
} from "lucide-react";

interface Scan {
  qr_code: string;
  scanned_at: string;
  token_value: number;
  product_name: string;
  invoice_qty: number;
  dealer_name: string;
  dealer_phone: string;
  dealer_address: string;
  dealer_locality: string;
}

interface Painter {
  id: string;
  name: string;
  phone: string;
  swatch_id: string | null;
  address: string | null;
  aadhar_no: string | null;
  locality: string | null;
  total_tokens: number;
  total_redeemed: number;
  scans: Scan[];
}

export default function PaintersClient({ initialPainters }: { initialPainters: Painter[] }) {
  const [painters, setPainters] = useState<Painter[]>(initialPainters);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPainter, setSelectedPainter] = useState<Painter | null>(null);

  const filteredPainters = painters.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term) ||
      (p.swatch_id || "").toLowerCase().includes(term) ||
      (p.locality || "").toLowerCase().includes(term)
    );
  });

  // Calculate totals
  const totalPainters = painters.length;
  const totalTokensCollected = painters.reduce((acc, p) => acc + (p.total_tokens || 0) + (p.total_redeemed || 0), 0);
  const totalTokensRedeemed = painters.reduce((acc, p) => acc + (p.total_redeemed || 0), 0);
  const totalCashRedeemable = painters.reduce((acc, p) => acc + (p.total_tokens || 0), 0); // ₹1 per token

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="text-primary" /> Painters Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            View detailed stats, scan history, Aadhaar verification, and redeemable earnings for all registered painters.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Painters */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-all duration-300 group-hover:bg-primary/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <User size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Painters</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalPainters}</h3>
            </div>
          </div>
        </div>

        {/* Tokens Collected */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-all duration-300 group-hover:bg-amber-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Coins size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tokens Earned</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalTokensCollected}</h3>
            </div>
          </div>
        </div>

        {/* Tokens Redeemed */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full transition-all duration-300 group-hover:bg-rose-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens Redeemed</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalTokensRedeemed}</h3>
            </div>
          </div>
        </div>

        {/* Redeemable Cash */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all duration-300 group-hover:bg-emerald-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redeemable Cash</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">₹ {totalCashRedeemable}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search Header */}
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, Swatch ID, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            Showing {filteredPainters.length} of {totalPainters} Painters
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Painter Details</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Contact & Locality</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Aadhaar No</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Points Balance</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Redeemable Cash</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPainters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <User className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="font-semibold text-sm">No painters found</p>
                    <p className="text-xs mt-1 text-muted-foreground/75">Try checking your spelling or clear the search query.</p>
                  </td>
                </tr>
              ) : (
                filteredPainters.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base uppercase">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs font-mono text-primary font-semibold">
                            {p.swatch_id || "No Swatch ID"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        <Phone size={13} className="text-muted-foreground" />
                        {p.phone}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin size={13} className="text-muted-foreground" />
                        {p.locality || "No Locality"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-foreground text-xs font-semibold">
                        {p.aadhar_no || "Not Provided"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins size={14} className="text-amber-500" />
                        <span className="font-bold text-foreground">{p.total_tokens || 0}</span>
                        <span className="text-xs text-muted-foreground">/ {p.total_tokens + p.total_redeemed}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-emerald-600">₹ {p.total_tokens || 0}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedPainter(p)}
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Slide-out Drawer Panel */}
      {selectedPainter && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedPainter(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-2xl bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Painter Profile Deep-Dive</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Details &amp; activity history of the selected painter.</p>
              </div>
              <button
                onClick={() => setSelectedPainter(null)}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Profile Card Summary */}
              <div className="bg-muted/30 border border-border rounded-2xl p-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase">
                  {selectedPainter.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedPainter.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
                      Swatch ID: {selectedPainter.swatch_id || "N/A"}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Phone size={12} /> {selectedPainter.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-xs text-center">
                  <Coins className="mx-auto text-amber-500 mb-1.5" size={20} />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Tokens Scanned</p>
                  <p className="text-xl font-black text-foreground mt-1">
                    {selectedPainter.total_tokens + selectedPainter.total_redeemed}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-xs text-center">
                  <ArrowUpRight className="mx-auto text-rose-500 mb-1.5" size={20} />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Tokens Redeemed</p>
                  <p className="text-xl font-black text-foreground mt-1">
                    {selectedPainter.total_redeemed}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-xs text-center">
                  <DollarSign className="mx-auto text-emerald-500 mb-1.5" size={20} />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Redeemable Cash</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    ₹ {selectedPainter.total_tokens}
                  </p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                  <ClipboardList size={16} className="text-primary" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Aadhaar Card No</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block">{selectedPainter.aadhar_no || "Not Verified"}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Area Locality</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{selectedPainter.locality || "Not Configured"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Full Permanent Address</span>
                    <span className="font-medium text-foreground mt-0.5 block">{selectedPainter.address || "No address entered."}</span>
                  </div>
                </div>
              </div>

              {/* Scanned Products & Mapped Dealers */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                  <Layers size={16} className="text-primary" /> Product &amp; Dealer scan history
                </h4>
                
                {selectedPainter.scans.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No scanned bags or products registered under this account.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPainter.scans.map((sc, i) => (
                      <div key={i} className="flex flex-col gap-2.5 p-4 bg-muted/20 border border-border rounded-2xl hover:bg-muted/40 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-base text-foreground">{sc.product_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              QR Code: <span className="font-mono text-primary font-bold">{sc.qr_code}</span>
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                            +{sc.token_value} Pts
                          </span>
                        </div>

                        {/* Invoice & Dealer Locality details */}
                        <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
                          <div>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Dealer Store / Owner</span>
                            <span className="font-bold text-foreground mt-0.5 block">{sc.dealer_name}</span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5 flex items-center gap-1">
                              <MapPin size={10} /> {sc.dealer_locality}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Quantity &amp; Scanned Date</span>
                            <span className="font-bold text-foreground mt-0.5 block">Qty: {sc.invoice_qty} Unit(s)</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {new Date(sc.scanned_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Store Address</span>
                            <span className="text-[11px] font-medium text-foreground/80 mt-0.5 block">{sc.dealer_address}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
