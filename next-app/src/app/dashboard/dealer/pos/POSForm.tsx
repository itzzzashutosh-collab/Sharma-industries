"use client";

import { useState, useMemo, useTransition } from "react";
import { createInvoice } from "./actions";
import { Plus, Trash2, ShieldAlert } from "lucide-react";

type Product = { id: string; name: string; selling_price: number; sku: string; tags?: any };
type Painter = { id: string; name: string; phone: string };

interface POSFormProps {
  products: Product[];
  painters: Painter[];
}

export function POSForm({ products, painters }: POSFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  
  // Line Items State
  const [items, setItems] = useState([
    { id: "initial-line-item", productId: "", quantity: 1, rate: 0, total: 0 }
  ]);

  // Handle Product Selection
  const updateItem = (id: string, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          if (field === "productId") {
            const product = products.find(p => p.id === value);
            if (product) {
              updated.rate = product.selling_price;
              updated.total = updated.quantity * updated.rate;
            }
          }
          
          if (field === "quantity" || field === "rate") {
            updated.total = Number(updated.quantity) * Number(updated.rate);
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: "", quantity: 1, rate: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Real-time Calculations
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
  const gst = useMemo(() => subtotal * 0.18, [subtotal]);
  const grandTotal = useMemo(() => subtotal + gst, [subtotal, gst]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Attach the dynamically calculated items as a JSON string
    formData.append("items", JSON.stringify(items.filter(i => i.productId)));
    
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result.success) {
        setMessage(result.message || "Success!");
        // Reset form
        e.currentTarget.reset();
        setItems([{ id: Date.now().toString(), productId: "", quantity: 1, rate: 0, total: 0 }]);
      } else {
        setMessage(result.error || "Failed to create invoice.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Form Details */}
      <div className="lg:col-span-2 space-y-6">
        
        {message && (
          <div className={`p-4 rounded-xl border ${message.includes("Success") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
            {message}
          </div>
        )}

        {/* Customer Details */}
        <div className="bg-slate-900/50  border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider mb-1 block">Name</label>
              <input required name="customer_name" type="text" placeholder="John Doe" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
              <input required name="customer_phone" type="tel" placeholder="9876543210" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 outline-none transition-colors" />
            </div>
          </div>
        </div>

        {/* Product Lines */}
        <div className="bg-slate-900/50  border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Items</h2>
            <button type="button" onClick={addItem} className="text-sm font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
              <Plus size={14} /> Add Line
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-end gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="w-full sm:w-2/5">
                  <label className="text-sm text-slate-500 uppercase tracking-wider block mb-1">Product</label>
                  <select 
                    required 
                    value={item.productId}
                    onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  >
                    <option value="" disabled>Select Product...</option>
                    {products.map(p => {
                      let parsedTags: string[] = [];
                      if (Array.isArray(p.tags)) {
                        parsedTags = p.tags;
                      } else if (typeof p.tags === "string") {
                        try {
                          parsedTags = JSON.parse(p.tags);
                        } catch {
                          parsedTags = p.tags ? p.tags.split(",").map((t: any) => t.trim()) : [];
                        }
                      }
                      const tagsStr = parsedTags.length > 0 ? ` [${parsedTags.join(", ")}]` : "";
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name}{tagsStr} (₹{p.selling_price})
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="w-1/3 sm:w-1/6">
                  <label className="text-sm text-slate-500 uppercase tracking-wider block mb-1">Qty</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none text-center" />
                </div>

                <div className="w-1/3 sm:w-1/6">
                  <label className="text-sm text-slate-500 uppercase tracking-wider block mb-1">Rate</label>
                  <input type="number" value={item.rate} readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-sm outline-none text-center opacity-70 cursor-not-allowed" />
                </div>

                <div className="w-1/3 sm:w-1/5">
                  <label className="text-sm text-slate-500 uppercase tracking-wider block mb-1">Total</label>
                  <div className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-emerald-400 font-medium text-sm text-right">
                    ₹{item.total.toLocaleString()}
                  </div>
                </div>

                <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Painter Commission */}
        <div className="bg-slate-900/50  border border-rose-900/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={20} className="text-rose-400" />
            <h2 className="text-lg font-semibold text-rose-100">Painter Details (Internal)</h2>
          </div>
          
          <p className="text-sm text-rose-300/60 mb-5 font-medium uppercase tracking-wider">
            ⚠️ This commission will NOT be printed on the final customer PDF.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider mb-1 block">Select Painter</label>
              <select name="painter_id" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-rose-500 outline-none transition-colors">
                <option value="">None</option>
                {painters.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider mb-1 block">Hidden Commission (₹)</label>
              <input name="hidden_commission" type="number" min="0" placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-rose-500 outline-none transition-colors" />
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Invoice Summary Sticky */}
      <div className="lg:col-span-1">
        <div className="bg-slate-900/50  border border-slate-800 rounded-2xl p-6 sticky top-8">
          <h2 className="text-lg font-semibold text-white mb-6">Invoice Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium text-white">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 pb-4 border-b border-slate-800">
              <span className="text-sm">GST (18%)</span>
              <span className="font-medium text-white">₹{gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-medium text-slate-300">Grand Total</span>
              <span className="text-2xl font-bold text-emerald-400">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button type="submit" disabled={isPending || items.every(i => !i.productId)} className="w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Generating Invoice..." : "Generate Invoice"}
          </button>
        </div>
      </div>
      
    </form>
  );
}
