"use client";

import React, { useState, useTransition } from "react";
import { Package, Search, Calendar, ChevronRight, X, Truck, CheckCircle2, AlertCircle, ClipboardList, Clock, Plus, Sparkles, ShoppingBag, Eye } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  stock_status: string;
}

interface Order {
  id: string;
  date: string;
  dealer_name: string;
  total_amount: number;
  payment_terms: string;
  status: string;
  transporter_name?: string | null;
  vehicle_no?: string | null;
  order_items?: OrderItem[];
}

interface DBDealer {
  id: string;
  name: string;
}

interface Props {
  initialData: {
    dealers: DBDealer[];
    orders: Order[];
  };
}

const PRODUCT_CATALOG = [
  { name: "Swatch Rustic Royale", size: "20L", price: 6500, stockStatus: "In Stock" },
  { name: "Swatch Shine Emulsion", size: "10L", price: 2375, stockStatus: "In Stock" },
  { name: "Premium Primer", size: "20L", price: 4200, stockStatus: "In Stock" },
  { name: "Swatch Weatherguard", size: "20L", price: 7800, stockStatus: "Low Stock" }
];

export default function SalesmanOrdersClient({ initialData }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialData.orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 Days Credit");
  const [orderLines, setOrderLines] = useState<{ productIdx: number; quantity: number }[]>([
    { productIdx: 0, quantity: 5 }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddProduct = () => {
    setOrderLines([...orderLines, { productIdx: 0, quantity: 5 }]);
  };

  const handleRemoveProduct = (idx: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== idx));
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) {
      alert("Please select a dealer.");
      return;
    }

    startTransition(async () => {
      // Simulate client-side order pipeline creation
      const dealerObj = initialData.dealers.find(d => d.id === selectedDealer);
      let total = 0;
      const orderItems = orderLines.map(ol => {
        const prod = PRODUCT_CATALOG[ol.productIdx];
        total += prod.price * ol.quantity;
        return {
          id: `ITEM_${Date.now()}_${Math.random()}`,
          product_name: prod.name,
          size: prod.size,
          quantity: ol.quantity,
          unit_price: prod.price,
          stock_status: prod.stockStatus
        };
      });

      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().slice(0, 10),
        dealer_name: dealerObj?.name || "Dealer",
        total_amount: total,
        payment_terms: paymentTerms,
        status: "Pending Approval",
        order_items: orderItems
      };

      setOrders(prev => [newOrder, ...prev]);
      setShowOrderModal(false);
      setOrderLines([{ productIdx: 0, quantity: 5 }]);
      alert(`Order ${newOrder.id} placed successfully! Awaiting CEO/Admin approval.`);
    });
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.dealer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Orders</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Sales Order Ledger</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 bg-card border border-border rounded-3xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Today's Orders</span>
          <p className="text-lg font-black text-foreground font-mono">{orders.length} Placed</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Value generated</span>
          <p className="text-lg font-black text-emerald-600 font-mono">
            ₹{orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* AI Coach Sales suggestions */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Sales Advisor</p>
          <p>• Recommend adding Swatch Waterproofing primer to orders containing Rustic Royale to unlock early-payment volume discount schemes.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowOrderModal(true)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={14} /> Place New Order
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><ClipboardList size={14} className="text-primary" /> Active Orders Pipeline</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input type="text" placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-colors text-foreground" />
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No orders matching search criteria.</p>
        ) : filteredOrders.map((o) => (
          <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-sm cursor-pointer hover:bg-muted/10 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-foreground text-xs">{o.id}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{o.dealer_name}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono border ${
                o.status === "Pending Approval" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              }`}>
                {o.status}
              </span>
            </div>

            <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span>Value: ₹{o.total_amount.toLocaleString("en-IN")}</span>
              <span>Terms: {o.payment_terms}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Place Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><ShoppingBag size={14} className="text-primary" /> Create Stock Order</h3>
              <button onClick={() => setShowOrderModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleOrderSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Dealer</label>
                <select value={selectedDealer} onChange={e => setSelectedDealer(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  <option value="">-- Choose Dealer --</option>
                  {initialData.dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Order Items</span>
                  <button type="button" onClick={handleAddProduct} className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold">
                    + Add Product
                  </button>
                </div>
                {orderLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select value={line.productIdx} onChange={e => {
                      const updated = [...orderLines];
                      updated[idx].productIdx = Number(e.target.value);
                      setOrderLines(updated);
                    }} className="flex-1 bg-background border border-border rounded-xl px-2 py-1.5 outline-none text-foreground">
                      {PRODUCT_CATALOG.map((p, pIdx) => (
                        <option key={pIdx} value={pIdx}>{p.name} ({p.size})</option>
                      ))}
                    </select>
                    <input type="number" min="1" value={line.quantity} onChange={e => {
                      const updated = [...orderLines];
                      updated[idx].quantity = Number(e.target.value);
                      setOrderLines(updated);
                    }} className="w-14 bg-background border border-border rounded-xl px-2 py-1.5 outline-none text-center font-mono" />
                    {orderLines.length > 1 && (
                      <button type="button" onClick={() => handleRemoveProduct(idx)} className="p-1 rounded text-red-500 hover:bg-red-50"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowOrderModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Submitting..." : "Submit Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Order Detail: {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-foreground">Dealer: {selectedOrder.dealer_name}</p>
                <p className="text-[10px] text-muted-foreground">Order Date: {selectedOrder.date}</p>
              </div>

              <div className="border-t border-border/40 pt-3 space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Ordered Products</p>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {selectedOrder.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-[10px] border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-foreground">{item.product_name} ({item.size})</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{item.quantity} units x ₹{item.unit_price}</p>
                      </div>
                      <span className="font-bold font-mono text-foreground">₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-bold text-emerald-600 font-mono text-xs">₹{selectedOrder.total_amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
