"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  X, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  ClipboardList,
  Clock,
  Loader2
} from "lucide-react";
import Link from "next/link";
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

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Logistics Form state
  const [logisticsForm, setLogisticsForm] = useState({
    transporterName: "",
    vehicleNo: "",
    lrBiltyNo: "",
    ewayBillNo: ""
  });
  const [logisticsError, setLogisticsError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // --- FETCH ORDERS FROM SUPABASE ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setOrders(data as Order[]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Unique salesmen for filter dropdown
  const uniqueSalesmen = useMemo(() => {
    const list = new Set(orders.map(o => o.salesman_name));
    return ["All", ...Array.from(list)];
  }, [orders]);

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSalesman = salesmanFilter === "All" || order.salesman_name === salesmanFilter;
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      const matchesDate = !dateFilter || order.date === dateFilter;
      return matchesSearch && matchesSalesman && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, salesmanFilter, statusFilter, dateFilter]);

  // Handle Order Selection & initialize logistics form
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setLogisticsForm({
      transporterName: order.transporter_name || "",
      vehicleNo: order.vehicle_no || "",
      lrBiltyNo: order.lr_bilty_no || "",
      ewayBillNo: order.eway_bill_no || ""
    });
    setLogisticsError("");
  };

  // Live Status Mutation on Supabase
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"], extraFields = {}) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          ...extraFields
        })
        .eq('id', orderId)
        .select('*, order_items(*)');

      if (error) throw error;

      if (data && data[0]) {
        // Sync local state
        setOrders(prev => prev.map(o => o.id === orderId ? (data[0] as Order) : o));
        setSelectedOrder(data[0] as Order);
      }
    } catch (err: any) {
      alert("Error updating order status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (orderId: string) => {
    updateOrderStatus(orderId, "Approved/Processing");
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, "Rejected");
  };

  const handleDispatch = (orderId: string) => {
    if (!logisticsForm.transporterName || !logisticsForm.vehicleNo || !logisticsForm.lrBiltyNo || !logisticsForm.ewayBillNo) {
      setLogisticsError("All logistics and dispatch details are required before dispatching.");
      return;
    }
    setLogisticsError("");
    updateOrderStatus(orderId, "Dispatched", {
      transporter_name: logisticsForm.transporterName,
      vehicle_no: logisticsForm.vehicleNo,
      lr_bilty_no: logisticsForm.lrBiltyNo,
      eway_bill_no: logisticsForm.ewayBillNo
    });
  };

  const handleDeliver = (orderId: string) => {
    updateOrderStatus(orderId, "Delivered");
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Package className="text-primary w-8 h-8" />
            Master Order Management & Dispatch Center
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Order Desk</span>
            Review order book, update dispatch logistics, and track delivery pipelines.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Order ID or Dealer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Salesman Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <Filter className="text-slate-400 w-4 h-4 shrink-0" />
          <select 
            value={salesmanFilter} 
            onChange={(e) => setSalesmanFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1.5"
          >
            <option value="All">All Salesmen</option>
            {uniqueSalesmen.filter(s => s !== "All").map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <Clock className="text-slate-400 w-4 h-4 shrink-0" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1.5"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved/Processing">Approved/Processing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <Calendar className="text-slate-400 w-4 h-4 shrink-0" />
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1"
          />
        </div>

      </div>

      {/* Master Order Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Order ID</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Dealer Name</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Salesman</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Total Amount</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Terms</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Status</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={18} />
                      Loading live order book...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No orders found in the database.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => handleSelectOrder(order)}
                      className="border-b border-slate-100 transition-colors cursor-pointer hover:bg-slate-50 group"
                    >
                      <td className="py-4 px-6 font-black text-primary">{order.id}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{order.date}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{order.dealer_name}</td>
                      <td className="py-4 px-6 font-medium text-slate-600">{order.salesman_name}</td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Drawer */}
      {selectedOrder && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setSelectedOrder(null)}
          />
          {/* Sheet */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <ClipboardList className="text-primary w-6 h-6" /> Order Details: {selectedOrder.id}
                </h2>
                <p className="text-slate-500 text-xs font-semibold mt-1">
                  Placed on {selectedOrder.date} by {selectedOrder.salesman_name}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white pb-32">
              
              {/* Section A: Order Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dealer / Partner</p>
                    <p className="font-bold text-slate-800 mt-1">{selectedOrder.dealer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</p>
                    <p className="font-semibold text-slate-700 mt-1">{selectedOrder.payment_terms}</p>
                  </div>
                  <div className="col-span-2 flex justify-between items-center border-t border-slate-200 pt-3 mt-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Status</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border mt-1 ${
                        selectedOrder.status === "Pending Approval" ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        selectedOrder.status === "Approved/Processing" ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        selectedOrder.status === "Dispatched" ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        selectedOrder.status === "Delivered" ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</p>
                      <p className="font-mono text-lg font-black text-primary">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section B: Bill of Materials */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Bill of Materials</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Product Name & Size</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-right">Total Line</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items?.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 bg-white last:border-b-0">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{item.product_name} ({item.size})</span>
                              <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider ${
                                item.stock_status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {item.stock_status}
                              </span>
                            </div>
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

              {/* Section C: Dispatch & Logistics Update */}
              {selectedOrder.status === "Approved/Processing" && (
                <div className="space-y-3 p-4 border border-blue-200 bg-blue-50/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Truck className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Dispatch & Logistics Form</h3>
                  </div>
                  
                  {logisticsError && (
                    <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} /> {logisticsError}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transporter Name *</label>
                      <input 
                        type="text" 
                        value={logisticsForm.transporterName} 
                        onChange={e => setLogisticsForm({...logisticsForm, transporterName: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold" 
                        placeholder="e.g. SafeExpress"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Number *</label>
                      <input 
                        type="text" 
                        value={logisticsForm.vehicleNo} 
                        onChange={e => setLogisticsForm({...logisticsForm, vehicleNo: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold" 
                        placeholder="e.g. MH-12-PQ-4567"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LR / Bilty Number *</label>
                      <input 
                        type="text" 
                        value={logisticsForm.lrBiltyNo} 
                        onChange={e => setLogisticsForm({...logisticsForm, lrBiltyNo: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold" 
                        placeholder="e.g. LR-998821"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-Way Bill Number *</label>
                      <input 
                        type="text" 
                        value={logisticsForm.ewayBillNo} 
                        onChange={e => setLogisticsForm({...logisticsForm, ewayBillNo: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold" 
                        placeholder="e.g. 882719203810"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Show Logistics summary if already Dispatched or Delivered */}
              {(selectedOrder.status === "Dispatched" || selectedOrder.status === "Delivered") && (
                <div className="space-y-3 p-4 border border-slate-200 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Truck className="w-5 h-5 text-slate-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Logistics & Tracking Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transporter</span>
                      <p className="font-bold text-slate-700 mt-0.5">{selectedOrder.transporter_name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle No</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{selectedOrder.vehicle_no || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LR / Bilty No</span>
                      <p className="font-mono text-slate-700 mt-0.5">{selectedOrder.lr_bilty_no || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-Way Bill</span>
                      <p className="font-mono text-slate-700 mt-0.5">{selectedOrder.eway_bill_no || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Action Footer */}
            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 p-6 flex flex-col md:flex-row gap-3 justify-between items-center shadow-lg z-10">
              
              {/* Permanent Billing Integration Button */}
              <Link 
                href={`/dashboard/ceo/invoices?orderId=${selectedOrder.id}`}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Send to Invoicing <ExternalLink size={12} />
              </Link>

              {/* Conditional Workflows */}
              <div className="flex gap-2 w-full md:w-auto">
                {actionLoading ? (
                  <span className="text-slate-500 font-bold text-xs flex items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={16} /> Updating Database...
                  </span>
                ) : (
                  <>
                    {selectedOrder.status === "Pending Approval" && (
                      <>
                        <button 
                          onClick={() => handleReject(selectedOrder.id)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition-all"
                        >
                          Reject Order
                        </button>
                        <button 
                          onClick={() => handleApprove(selectedOrder.id)}
                          className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center"
                        >
                          <CheckCircle size={14} /> Approve Order
                        </button>
                      </>
                    )}

                    {selectedOrder.status === "Approved/Processing" && (
                      <button 
                        onClick={() => handleDispatch(selectedOrder.id)}
                        className="w-full md:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center"
                      >
                        <Truck size={14} /> Mark as Dispatched
                      </button>
                    )}

                    {selectedOrder.status === "Dispatched" && (
                      <button 
                        onClick={() => handleDeliver(selectedOrder.id)}
                        className="w-full md:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center"
                      >
                        <CheckCircle size={14} /> Mark as Delivered
                      </button>
                    )}

                    {selectedOrder.status === "Delivered" && (
                      <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <CheckCircle size={14} /> Completed & Delivered
                      </span>
                    )}
                    
                    {selectedOrder.status === "Rejected" && (
                      <span className="text-rose-600 font-bold text-xs flex items-center gap-1 py-2 px-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <X size={14} /> Order Rejected
                      </span>
                    )}
                  </>
                )}
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
