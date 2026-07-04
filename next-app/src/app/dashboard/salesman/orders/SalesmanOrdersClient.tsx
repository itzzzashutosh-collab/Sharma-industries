"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Package, 
  Search, 
  Calendar, 
  ChevronRight, 
  X, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  ClipboardList, 
  Clock, 
  PlusCircle, 
  Trash2,
  Loader2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  stock_status: "In Stock" | "Low Stock";
}

interface Order {
  id: string;
  date: string;
  dealer_name: string;
  dealer_id: string | null;
  salesman_name: string;
  total_amount: number;
  payment_terms: string;
  status: "Pending Approval" | "Approved/Processing" | "Dispatched" | "Delivered" | "Rejected";
  transporter_name?: string | null;
  vehicle_no?: string | null;
  lr_bilty_no?: string | null;
  eway_bill_no?: string | null;
  order_items?: OrderItem[];
}

interface DBDealer {
  id: string;
  name: string;
  designation: string;
}

// Preset products for order placement
const PRODUCT_CATALOG = [
  { name: "Rustic Royale", size: "20L", price: 6500, stockStatus: "In Stock" },
  { name: "Tractor Emulsion", size: "10L", price: 2375, stockStatus: "In Stock" },
  { name: "Premium Primer", size: "20L", price: 4200, stockStatus: "In Stock" },
  { name: "Apex Weatherproof", size: "20L", price: 7800, stockStatus: "Low Stock" }
];

export default function SalesmanOrdersClient() {
  const salesmanName = "Rajesh Kumar";
  const salesmanId = "SM-101";

  const [orders, setOrders] = useState<Order[]>([]);
  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search / Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Place Order Modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderDealerId, setOrderDealerId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 Days Credit");
  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number }[]>([
    { productId: 0, quantity: 1 }
  ]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const fetchOrdersAndDealers = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('salesman_name', salesmanName)
        .order('created_at', { ascending: false });

      if (orderData && !orderErr) {
        setOrders(orderData as Order[]);
      }

      // 2. Fetch Dealers assigned to Salesman
      const { data: dealerData, error: dealerErr } = await supabase
        .from('dealers')
        .select('id, name, designation')
        .eq('assigned_salesman_id', salesmanId);

      if (dealerData && !dealerErr) {
        setDealers(dealerData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndDealers();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.dealer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Order submission
  const handleAddProductRow = () => {
    setOrderItems([...orderItems, { productId: 0, quantity: 1 }]);
  };

  const handleRemoveProductRow = (index: number) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const handleProductChange = (index: number, val: number) => {
    const updated = [...orderItems];
    updated[index].productId = val;
    setOrderItems(updated);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...orderItems];
    updated[index].quantity = qty;
    setOrderItems(updated);
  };

  // Submit order to database
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderDealerId) {
      setOrderError("Please select a partner/dealer.");
      return;
    }
    if (orderItems.length === 0) {
      setOrderError("Please add at least one product.");
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError("");

    try {
      const selectedDealer = dealers.find(d => d.id === orderDealerId);
      if (!selectedDealer) throw new Error("Invalid dealer selected.");

      // Calculate total amount
      let total = 0;
      const itemsPayload = orderItems.map(item => {
        const product = PRODUCT_CATALOG[item.productId];
        const lineVal = product.price * item.quantity;
        total += lineVal;
        return {
          product_name: product.name,
          size: product.size,
          quantity: item.quantity,
          unit_price: product.price,
          stock_status: product.stockStatus as "In Stock" | "Low Stock"
        };
      });

      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Insert Order
      const { error: orderInsertError } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          dealer_name: selectedDealer.name,
          dealer_id: selectedDealer.id,
          salesman_name: salesmanName,
          total_amount: total,
          payment_terms: paymentTerms,
          status: "Pending Approval"
        }]);

      if (orderInsertError) throw orderInsertError;

      // 2. Insert Order Items
      const itemsWithOrderId = itemsPayload.map(item => ({
        ...item,
        order_id: orderId
      }));

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

      if (itemsInsertError) throw itemsInsertError;

      // Reset & Reload
      setIsOrderModalOpen(false);
      setOrderDealerId("");
      setOrderItems([{ productId: 0, quantity: 1 }]);
      fetchOrdersAndDealers();
    } catch (err: any) {
      setOrderError(err.message || "Failed to place order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Package className="text-primary w-8 h-8" />
            My Order Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            View orders placed, track dispatch progress, and submit new stock orders.
          </p>
        </div>
        <button 
          onClick={() => setIsOrderModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          <PlusCircle size={16} /> Place New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Order ID or Dealer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["All", "Pending Approval", "Approved/Processing", "Dispatched", "Delivered"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status === "All" ? "All" : status.split("/")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Order ID</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Dealer Name</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Total Amount</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Terms</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Status</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={18} />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No orders placed.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="border-b border-slate-100 transition-colors cursor-pointer hover:bg-slate-50 group"
                  >
                    <td className="py-4 px-6 font-black text-primary">{order.id}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">{order.date}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{order.dealer_name}</td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-500">{order.payment_terms}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        order.status === "Pending Approval" ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        order.status === "Approved/Processing" ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        order.status === "Dispatched" ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        order.status === "Delivered" ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ClipboardList className="text-primary w-5 h-5" /> Order Summary: {selectedOrder.id}
                </h2>
                <p className="text-slate-500 text-xs font-semibold mt-1">Placed: {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Partner</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedOrder.dealer_name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedOrder.payment_terms}</p>
                </div>
                <div className="col-span-2 border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Status</span>
                    <p className="font-black text-primary text-xs uppercase tracking-wider mt-0.5">{selectedOrder.status}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Value</span>
                    <p className="font-mono text-base font-black text-slate-800">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Product Inventory Breakdown</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-bold text-slate-500">Product Name & Size</th>
                        <th className="p-3 font-bold text-slate-500 text-center">Qty</th>
                        <th className="p-3 font-bold text-slate-500 text-right">Price</th>
                        <th className="p-3 font-bold text-slate-500 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items?.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 bg-white last:border-0">
                          <td className="p-3 font-bold text-slate-850">
                            {item.product_name} ({item.size})
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-slate-500 font-bold uppercase">{item.stock_status}</span>
                          </td>
                          <td className="p-3 font-mono text-center font-bold text-slate-700">{item.quantity}</td>
                          <td className="p-3 font-mono text-right text-slate-600">₹{Number(item.unit_price).toLocaleString("en-IN")}</td>
                          <td className="p-3 font-mono text-right font-bold text-slate-800">₹{(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {(selectedOrder.transporter_name || selectedOrder.vehicle_no) && (
                <div className="p-4 border border-slate-200 bg-slate-50 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-black text-slate-700 flex items-center gap-1.5"><Truck size={14} /> Dispatch & Tracking Summary</h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Transporter</span>
                      <p className="font-bold text-slate-850">{selectedOrder.transporter_name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Vehicle No</span>
                      <p className="font-bold text-slate-850">{selectedOrder.vehicle_no || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Place Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">Place Stock Order</h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">Rajesh Kumar • West Region Route</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {orderError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-bold text-rose-700">
                <AlertCircle size={16} className="shrink-0" /> {orderError}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Partner / Dealer *</label>
                  <select required value={orderDealerId} onChange={e => setOrderDealerId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    <option value="">-- Mapped Dealers --</option>
                    {dealers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Terms *</label>
                  <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    <option value="30 Days Credit">30 Days Credit</option>
                    <option value="10% Advance">10% Advance</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Products List</h3>
                  <button type="button" onClick={handleAddProductRow} className="text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1.5 rounded-lg transition-colors">
                    + Add Product
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select 
                        value={item.productId} 
                        onChange={e => handleProductChange(idx, Number(e.target.value))}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        {PRODUCT_CATALOG.map((p, pIdx) => (
                          <option key={pIdx} value={pIdx}>{p.name} ({p.size}) - ₹{p.price}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={e => handleQtyChange(idx, Number(e.target.value))}
                        className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 text-center" 
                      />
                      {orderItems.length > 1 && (
                        <button type="button" onClick={() => handleRemoveProductRow(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-150">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOrderModalOpen(false)} disabled={isSubmittingOrder} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingOrder} className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-xs">
                  {isSubmittingOrder ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Stock Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
