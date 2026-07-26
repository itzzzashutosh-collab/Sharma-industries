"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  ShoppingCart, Plus, Search, Sparkles, X, Milestone, Truck, Check,
  Package, ChevronRight, Calendar, Building2, Eye, FileText, CheckCircle2,
  Clock, AlertCircle, ArrowUpCircle, Filter, Trash2
} from "lucide-react";
import { createDealerFactoryOrder } from "../../actions";

interface OrderItem {
  name: string;
  hsn_code?: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

interface StockOrder {
  id: string;
  date: string;
  supplier_name?: string;
  dealer_name?: string;
  items?: OrderItem[];
  total_amount: number;
  status: string;
  expected_delivery?: string;
  delivery_address?: string;
  created_at?: string;
}

interface Props {
  initialData: StockOrder[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const INITIAL_MOCK_PRODUCTS = [
  { name: "Swatch Paints Premium Interior Emulsion 20L", unit: "Pails", hsn: "3209", rate: 3450 },
  { name: "Swatch Paints Exterior Weather Proof 20L", unit: "Pails", hsn: "3209", rate: 4120 },
  { name: "Swatch Waterproof Acrylic Wall Primer 10L", unit: "Liters", hsn: "3209", rate: 1280 },
  { name: "Swatch Damp-Proof Waterproofing Coat 20L", unit: "Pails", hsn: "3209", rate: 4890 },
  { name: "Asian Paints Royale Luxury Emulsion 20L", unit: "Pails", hsn: "3209", rate: 5800 },
  { name: "Berger WeatherCoat Smooth 20L", unit: "Pails", hsn: "3209", rate: 4650 },
  { name: "Universal Synthetic Paint Thinner 5L", unit: "Liters", hsn: "3814", rate: 480 },
];

export function FactoryOrdersLogClient({ initialData }: Props) {
  const [list, setList] = useState<StockOrder[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<StockOrder | null>(null);
  const [isPending, startTransition] = useTransition();

  // Order Form State
  const [supplierName, setSupplierName] = useState("Swatch Paints Factory");
  const [deliveryAddress, setDeliveryAddress] = useState("Shop 12, Main Paint Market, Bundi Road, Rajasthan");
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { name: "Swatch Paints Premium Interior Emulsion 20L", hsn_code: "3209", qty: 10, unit: "Pails", rate: 3450, amount: 34500 },
    { name: "Swatch Waterproof Acrylic Wall Primer 10L", hsn_code: "3209", qty: 15, unit: "Liters", rate: 1280, amount: 19200 },
  ]);

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  // Add Item Row
  const handleAddItemRow = () => {
    setOrderItems(prev => [
      ...prev,
      { name: "Swatch Paints Exterior Weather Proof 20L", hsn_code: "3209", qty: 5, unit: "Pails", rate: 4120, amount: 20600 }
    ]);
  };

  // Remove Item Row
  const handleRemoveItemRow = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update Item Row
  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setOrderItems(prev => {
      const next = [...prev];
      const current = { ...next[index], [field]: value };
      if (field === "name") {
        const found = INITIAL_MOCK_PRODUCTS.find(p => p.name === value);
        if (found) {
          current.unit = found.unit;
          current.hsn_code = found.hsn;
          current.rate = found.rate;
        }
      }
      const qty = Number(current.qty || 0);
      const rate = Number(current.rate || 0);
      current.amount = qty * rate;
      next[index] = current;
      return next;
    });
  };

  // Filter List
  const filtered = list.filter(ord => {
    const s = search.toLowerCase();
    const ordId = ord.id || "";
    const sup = ord.supplier_name || "Factory";
    const matchesSearch = !search || ordId.toLowerCase().includes(s) || sup.toLowerCase().includes(s) || (ord.status || "").toLowerCase().includes(s);
    const matchesStatus = statusFilter === "all" || ord.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Submit Stock Order
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0 || grandTotal <= 0) return;

    startTransition(async () => {
      const payload = {
        dealer_name: "Shree Ram Paints",
        supplier_name: supplierName,
        total_amount: grandTotal,
        items: orderItems,
        expected_delivery: expectedDate,
        delivery_address: deliveryAddress,
        status: "pending",
      };

      const res = await createDealerFactoryOrder(payload);

      const newOrder: StockOrder = {
        id: `ORD_${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        supplier_name: supplierName,
        dealer_name: "Shree Ram Paints",
        items: orderItems,
        total_amount: grandTotal,
        expected_delivery: expectedDate,
        delivery_address: deliveryAddress,
        status: "pending"
      };

      setList(prev => [newOrder, ...prev]);
      setShowAddModal(false);
      alert("Stock purchase order placed successfully with " + supplierName + "!");
    });
  };

  // Mark Stock Received
  const handleMarkReceived = (orderId: string) => {
    setList(prev => prev.map(ord => ord.id === orderId ? { ...ord, status: "delivered" } : ord));
    alert("Stock shipment marked as Received & Delivered! Inventory log updated.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Purchases</span><span className="opacity-40">/</span><span className="text-foreground">Stock Orders</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <ArrowUpCircle size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Stock Purchase Orders
              </h1>
              <p className="text-xs text-muted-foreground">
                Place paint stock refill orders with Swatch Paints Factory & brand suppliers, track transit status & receive inventory
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> + Place Stock Order
        </button>
      </div>

      {/* ── AI Inventory Stock Refill Advisor ───────────────────────────── */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-primary shrink-0 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">AI Stock Reorder Recommendation:</span>
            <p className="text-muted-foreground text-[11px]">
              Swatch Interior Emulsion 20L & Waterproof Primer 10L are trending high this week. We recommend placing a factory refill order of 25 Pails before weekend peak.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold rounded-xl text-xs shrink-0 transition-colors"
        >
          1-Click Auto Refill
        </button>
      </div>

      {/* ── Filter Controls Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order code, supplier name, status..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "⏳ Pending" },
            { id: "in transit", label: "🚚 In Transit" },
            { id: "delivered", label: "✅ Delivered / Received" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stock Orders Table ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Order Ref #</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5">Supplier / Factory</th>
                <th className="px-4 py-3.5">Line Items</th>
                <th className="px-4 py-3.5 text-right">Grand Total</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filtered.map((ord) => {
                const itemCount = Array.isArray(ord.items) && ord.items.length > 0 ? ord.items.length : 1;
                const isDelivered = ord.status === "delivered" || ord.status === "approved";
                const isInTransit = ord.status === "in transit";

                return (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-primary flex items-center gap-1.5">
                      <FileText size={14} className="text-primary/70" /> {ord.id}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono">
                      {ord.date ? new Date(ord.date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-muted-foreground" />
                        {ord.supplier_name || "Swatch Paints Factory"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded-md text-[11px] font-bold text-foreground border border-border">
                        {itemCount} Products
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-foreground text-sm">
                      {fmt(ord.total_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider ${
                        isDelivered
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : isInTransit
                          ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {isDelivered ? "Delivered" : isInTransit ? "In Transit" : "Pending Dispatch"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>

                        {!isDelivered && (
                          <button
                            onClick={() => handleMarkReceived(ord.id)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Mark Received
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                    No stock purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Place Stock Purchase Order Modal ────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart size={16} className="text-primary" /> Create Stock Purchase Order
                </h3>
                <p className="text-[11px] text-muted-foreground">Order paint inventory directly from Swatch Paints Factory or authorized suppliers</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Header Details */}
              <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Supplier / Factory *</label>
                  <select
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="Swatch Paints Factory">Swatch Paints Factory (Direct)</option>
                    <option value="Asian Paints Ltd">Asian Paints Ltd</option>
                    <option value="Berger Paints India">Berger Paints India</option>
                    <option value="Nerolac Coatings">Nerolac Coatings</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Delivery Shop Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Product Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={14} className="text-primary" /> Stock Order Items ({orderItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} /> Add Product Row
                  </button>
                </div>

                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border uppercase font-black text-[10px] text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 w-20 text-center">HSN</th>
                        <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                        <th className="py-2.5 px-3 w-24 text-center">Unit</th>
                        <th className="py-2.5 px-3 w-24 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-medium">
                      {orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              list={`product-suggestions-${idx}`}
                              value={item.name}
                              onChange={e => handleItemChange(idx, "name", e.target.value)}
                              placeholder="Type or select product..."
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                            />
                            <datalist id={`product-suggestions-${idx}`}>
                              {INITIAL_MOCK_PRODUCTS.map((p, pIdx) => (
                                <option key={pIdx} value={p.name} />
                              ))}
                            </datalist>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.hsn_code || "3209"}
                              onChange={e => handleItemChange(idx, "hsn_code", e.target.value)}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-mono text-center outline-none focus:border-primary text-foreground"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={e => handleItemChange(idx, "qty", parseInt(e.target.value) || 1)}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold text-center outline-none focus:border-primary text-foreground"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.unit}
                              onChange={e => handleItemChange(idx, "unit", e.target.value)}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold text-center outline-none focus:border-primary text-foreground"
                            >
                              <option value="Pails">Pails (20L)</option>
                              <option value="Liters">Liters (1L/4L/10L)</option>
                              <option value="Kgs">Kgs</option>
                              <option value="Bags">Bags</option>
                              <option value="Pcs">Pcs</option>
                              <option value="Boxes">Boxes</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={e => handleItemChange(idx, "rate", parseFloat(e.target.value) || 0)}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-mono text-right outline-none focus:border-primary text-foreground font-bold"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                            ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              disabled={orderItems.length === 1}
                              className="p-1 text-rose-500 hover:text-rose-600 disabled:opacity-30"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals Summary */}
              <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-bold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated GST (18%):</span>
                  <span className="font-mono font-bold text-foreground">₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-foreground pt-2 border-t border-border">
                  <span>Grand Total Order Amount:</span>
                  <span className="font-mono text-primary text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || grandTotal <= 0}
                  className="px-5 py-2.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                >
                  {isPending ? "Submitting Order..." : "Place Stock Order →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Order Details Drawer / Modal ──────────────────────────── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <h3 className="font-black text-sm text-foreground">Stock Order #{selectedOrderDetails.id}</h3>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3.5 rounded-2xl border border-border">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase">Supplier</span>
                  <p className="font-bold text-foreground text-sm">{selectedOrderDetails.supplier_name || "Swatch Paints Factory"}</p>
                  <p className="text-[11px] text-muted-foreground">Order Date: {selectedOrderDetails.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">Status</span>
                  <p className="font-black uppercase text-emerald-600">{selectedOrderDetails.status}</p>
                  {selectedOrderDetails.expected_delivery && (
                    <p className="text-[11px] text-muted-foreground">Expected: {selectedOrderDetails.expected_delivery}</p>
                  )}
                </div>
              </div>

              {Array.isArray(selectedOrderDetails.items) && selectedOrderDetails.items.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border font-black uppercase text-[10px] text-muted-foreground">
                      <tr>
                        <th className="p-2.5 pl-3">Item Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right pr-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-medium">
                      {selectedOrderDetails.items.map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="p-2.5 pl-3 font-bold text-foreground">{it.name}</td>
                          <td className="p-2.5 text-center font-bold">{it.qty} {it.unit}</td>
                          <td className="p-2.5 text-right pr-3 font-mono font-bold text-foreground">₹{Number(it.amount || (it.qty * it.rate) || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-bold text-muted-foreground">Grand Total:</span>
                <span className="font-mono font-black text-primary text-base">{fmt(selectedOrderDetails.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
