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
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

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
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Quick Action filter tabs
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "invoicing" | "dispatch" | "delivered">("all");
  // QR Modal target order state
  const [qrOrder, setQrOrder] = useState<Order | null>(null);

  // Logistics Form state
  const [logisticsForm, setLogisticsForm] = useState({
    transporterName: "",
    vehicleNo: "",
    lrBiltyNo: "",
    ewayBillNo: ""
  });
  const [logisticsError, setLogisticsError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

// --- DUMMY ORDERS FALLBACK ---
const DUMMY_ORDERS: Order[] = [
  {
    id: "SO-2026-001",
    date: "2026-07-11",
    dealer_name: "Jaipur Builders Association",
    dealer_id: "dl-1",
    salesman_name: "Aman Gupta",
    total_amount: 345000,
    payment_terms: "Net 30",
    status: "Pending Approval",
    order_items: [
      { id: "item-1-1", order_id: "SO-2026-001", product_name: "Rustic Royale Superfine", size: "20L", quantity: 50, unit_price: 4500, stock_status: "In Stock" },
      { id: "item-1-2", order_id: "SO-2026-001", product_name: "Wall Putty (Premium)", size: "40Kg", quantity: 100, unit_price: 1200, stock_status: "In Stock" }
    ]
  },
  {
    id: "SO-2026-002",
    date: "2026-07-10",
    dealer_name: "Karan Johar Paints",
    dealer_id: "dl-2",
    salesman_name: "Rohan Mehra",
    total_amount: 185000,
    payment_terms: "Cash on Delivery",
    status: "Approved/Processing",
    order_items: [
      { id: "item-2-1", order_id: "SO-2026-002", product_name: "WeatherGuard Matte", size: "10L", quantity: 30, unit_price: 3500, stock_status: "In Stock" },
      { id: "item-2-2", order_id: "SO-2026-002", product_name: "Rustic Royale Superfine", size: "4L", quantity: 40, unit_price: 2000, stock_status: "Low Stock" }
    ]
  },
  {
    id: "SO-2026-003",
    date: "2026-07-09",
    dealer_name: "Rajesh Sharma",
    dealer_id: "dl-3",
    salesman_name: "Aman Gupta",
    total_amount: 45000,
    payment_terms: "Net 15",
    status: "Dispatched",
    transporter_name: "SafeExpress Logistics",
    vehicle_no: "RJ-14-GA-9876",
    lr_bilty_no: "LR-6655102",
    eway_bill_no: "889910223849",
    order_items: [
      { id: "item-3-1", order_id: "SO-2026-003", product_name: "Classic Acrylic Emulsion", size: "20L", quantity: 15, unit_price: 3000, stock_status: "In Stock" }
    ]
  },
  {
    id: "SO-2026-004",
    date: "2026-07-08",
    dealer_name: "Vijay Singh",
    dealer_id: "dl-4",
    salesman_name: "Priya Sharma",
    total_amount: 125000,
    payment_terms: "Net 45",
    status: "Delivered",
    transporter_name: "Gati Transport",
    vehicle_no: "DL-3C-AY-2134",
    lr_bilty_no: "LR-7711203",
    eway_bill_no: "992817263540",
    order_items: [
      { id: "item-4-1", order_id: "SO-2026-004", product_name: "Wall Putty (Premium)", size: "40Kg", quantity: 80, unit_price: 1200, stock_status: "In Stock" },
      { id: "item-4-2", order_id: "SO-2026-004", product_name: "WeatherGuard Matte", size: "20L", quantity: 5, unit_price: 5800, stock_status: "In Stock" }
    ]
  },
  {
    id: "SO-2026-005",
    date: "2026-07-07",
    dealer_name: "Jaipur Builders Association",
    dealer_id: "dl-1",
    salesman_name: "Rohan Mehra",
    total_amount: 98000,
    payment_terms: "Net 30",
    status: "Rejected",
    order_items: [
      { id: "item-5-1", order_id: "SO-2026-005", product_name: "Rustic Royale Superfine", size: "20L", quantity: 20, unit_price: 4900, stock_status: "Low Stock" }
    ]
  }
];

  // --- FETCH ORDERS FROM SUPABASE ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        setOrders(data as Order[]);
      } else {
        const local = localStorage.getItem("local_orders");
        if (local) {
          setOrders(JSON.parse(local));
        } else {
          setOrders(DUMMY_ORDERS);
          localStorage.setItem("local_orders", JSON.stringify(DUMMY_ORDERS));
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      const local = localStorage.getItem("local_orders");
      if (local) {
        setOrders(JSON.parse(local));
      } else {
        setOrders(DUMMY_ORDERS);
        localStorage.setItem("local_orders", JSON.stringify(DUMMY_ORDERS));
      }
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
      
      // Determine status match based on activeTab
      let matchesStatus = true;
      if (activeTab === "all") {
        matchesStatus = statusFilter === "All" || order.status === statusFilter;
      } else if (activeTab === "pending") {
        matchesStatus = order.status === "Pending Approval";
      } else if (activeTab === "invoicing") {
        matchesStatus = order.status === "Approved/Processing";
      } else if (activeTab === "dispatch") {
        matchesStatus = order.status === "Dispatched";
      } else if (activeTab === "delivered") {
        matchesStatus = order.status === "Delivered";
      }

      const matchesDate = !dateFilter || order.date === dateFilter;
      return matchesSearch && matchesSalesman && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, salesmanFilter, statusFilter, dateFilter, activeTab]);

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

      if (error) {
        console.warn("Supabase update error, falling back to client-side state update:", error);
      }

      if (data && data[0]) {
        // Sync database updated order
        const updatedOrder = data[0] as Order;
        setOrders(prev => {
          const next = prev.map(o => o.id === orderId ? updatedOrder : o);
          localStorage.setItem("local_orders", JSON.stringify(next));
          return next;
        });
        setSelectedOrder(updatedOrder);
      } else {
        // Fallback for dummy orders
        setOrders(prev => {
          const next = prev.map(o => {
            if (o.id === orderId) {
              const updated = { ...o, status: newStatus, ...extraFields };
              setTimeout(() => setSelectedOrder(updated), 0);
              return updated;
            }
            return o;
          });
          localStorage.setItem("local_orders", JSON.stringify(next));
          return next;
        });
      }
    } catch (err: any) {
      console.warn("Error updating order status, applying client-side fallback:", err);
      setOrders(prev => {
        const next = prev.map(o => {
          if (o.id === orderId) {
            const updated = { ...o, status: newStatus, ...extraFields };
            setTimeout(() => setSelectedOrder(updated), 0);
            return updated;
          }
          return o;
        });
        localStorage.setItem("local_orders", JSON.stringify(next));
        return next;
      });
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
      setLogisticsError(t("All logistics and dispatch details are required before dispatching."));
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
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Orders")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Package className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Orders")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Review master order book records, dispatch logistics pipeline, courier details, and QR barcode generation.")}</p>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <button 
            onClick={() => { setActiveTab("all"); setStatusFilter("All"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "all" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Order List")}
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "pending" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Pending Orders")}
          </button>
          <button 
            onClick={() => setActiveTab("invoicing")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "invoicing" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Invoicing")}
          </button>
          <button 
            onClick={() => setActiveTab("dispatch")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "dispatch" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Dispatch Status")}
          </button>
          <button 
            onClick={() => setActiveTab("delivered")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "delivered" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Transportation detail")}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder={t("Search Order ID or Dealer...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all font-semibold text-foreground"
          />
        </div>

        {/* Salesman Filter */}
        <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-xl px-3 py-1">
          <Filter className="text-muted-foreground w-4 h-4 shrink-0" />
          <select 
            value={salesmanFilter} 
            onChange={(e) => setSalesmanFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer py-1.5"
          >
            <option value="All">{t("All Salesmen")}</option>
            {uniqueSalesmen.filter(s => s !== "All").map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-xl px-3 py-1">
          <Clock className="text-muted-foreground w-4 h-4 shrink-0" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer py-1.5"
          >
            <option value="All">{t("All Statuses")}</option>
            <option value="Pending Approval">{t("Pending Approval")}</option>
            <option value="Approved/Processing">{t("Approved/Processing")}</option>
            <option value="Dispatched">{t("Dispatched")}</option>
            <option value="Delivered">{t("Delivered")}</option>
            <option value="Rejected">{t("Rejected")}</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-xl px-3 py-1">
          <Calendar className="text-muted-foreground w-4 h-4 shrink-0" />
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer py-1"
          />
        </div>
      </div>

      {/* Master Order Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Order ID")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Date")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Dealer Name")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Salesman")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Total Amount")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Terms")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs text-center">{t("Status")}</th>
                <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={18} />
                      {t("Loading live order book...")}
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium">
                    {t("No orders found in the database.")}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => handleSelectOrder(order)}
                      className="border-b border-border/30 transition-colors cursor-pointer hover:bg-muted/30 group"
                    >
                      <td className="py-4 px-6 font-black text-primary">{order.id}</td>
                      <td className="py-4 px-6 font-mono text-muted-foreground">{order.date}</td>
                      <td className="py-4 px-6 font-bold text-foreground">{order.dealer_name}</td>
                      <td className="py-4 px-6 font-medium text-muted-foreground">{order.salesman_name}</td>
                      <td className="py-4 px-6 font-mono font-bold text-foreground">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 font-medium text-muted-foreground">{order.payment_terms}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          order.status === "Pending Approval" ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          order.status === "Approved/Processing" ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          order.status === "Dispatched" ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          order.status === "Delivered" ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {t(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <ChevronRight 
                            onClick={() => handleSelectOrder(order)}
                            className="w-5 h-5 text-muted-foreground/35 group-hover:text-primary transition-colors cursor-pointer" 
                          />
                        </div>
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
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <ClipboardList className="text-primary w-5 h-5" /> {t("Order Details")}: {selectedOrder.id}
                  </h2>
                  <p className="text-muted-foreground text-xs font-semibold mt-1">
                    {t("Placed on")} {selectedOrder.date} {t("by")} {selectedOrder.salesman_name}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
                {/* Section A: Order Summary */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t("Order Summary")}</h3>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 border border-border/50 p-4 rounded-2xl text-xs">
                    <div>
                      <p className="text-muted-foreground">{t("Dealer / Partner")}</p>
                      <p className="font-bold text-foreground mt-1">{selectedOrder.dealer_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("Payment Terms")}</p>
                      <p className="font-semibold text-foreground mt-1">{selectedOrder.payment_terms}</p>
                    </div>
                    <div className="col-span-2 flex justify-between items-center border-t border-border/40 pt-3 mt-1">
                      <div>
                        <p className="text-muted-foreground">{t("Order Status")}</p>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border mt-1 ${
                          selectedOrder.status === "Pending Approval" ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          selectedOrder.status === "Approved/Processing" ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          selectedOrder.status === "Dispatched" ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          selectedOrder.status === "Delivered" ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {t(selectedOrder.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">{t("Total Value")}</p>
                        <p className="font-mono text-lg font-black text-primary">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Bill of Materials */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t("Bill of Materials")}</h3>
                  <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-muted/40 border-b border-border">
                        <tr>
                          <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider">{t("Product Name & Size")}</th>
                          <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider text-center">{t("Qty")}</th>
                          <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider text-right">{t("Unit Price")}</th>
                          <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider text-right">{t("Total Line")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items?.map(item => (
                          <tr key={item.id} className="border-b border-border/50 bg-card last:border-b-0">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{item.product_name} ({item.size})</span>
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider ${
                                  item.stock_status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                }`}>
                                  {t(item.stock_status)}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-center font-bold text-foreground">{item.quantity}</td>
                            <td className="p-3 font-mono text-right text-muted-foreground">₹{Number(item.unit_price).toLocaleString("en-IN")}</td>
                            <td className="p-3 font-mono text-right font-bold text-foreground">₹{(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section C: Dispatch & Logistics Update */}
                {selectedOrder.status === "Approved/Processing" && (
                  <div className="space-y-3 p-4 border border-primary/20 bg-primary/5 rounded-2xl text-xs">
                    <div className="flex items-center gap-2 text-primary">
                      <Truck className="w-5 h-5" />
                      <h3 className="text-xs font-black uppercase tracking-wider">{t("Dispatch & Logistics Form")}</h3>
                    </div>
                    
                    {logisticsError && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {logisticsError}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Transporter Name")} *</label>
                        <input 
                          type="text" 
                          value={logisticsForm.transporterName} 
                          onChange={e => setLogisticsForm({...logisticsForm, transporterName: e.target.value})}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs font-bold focus:outline-none focus:border-primary text-foreground" 
                          placeholder="e.g. SafeExpress"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Vehicle Number")} *</label>
                        <input 
                          type="text" 
                          value={logisticsForm.vehicleNo} 
                          onChange={e => setLogisticsForm({...logisticsForm, vehicleNo: e.target.value})}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs font-bold focus:outline-none focus:border-primary text-foreground" 
                          placeholder="e.g. MH-12-PQ-4567"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("LR / Bilty Number")} *</label>
                        <input 
                          type="text" 
                          value={logisticsForm.lrBiltyNo} 
                          onChange={e => setLogisticsForm({...logisticsForm, lrBiltyNo: e.target.value})}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs font-bold focus:outline-none focus:border-primary text-foreground" 
                          placeholder="e.g. LR-998821"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("E-Way Bill Number")} *</label>
                        <input 
                          type="text" 
                          value={logisticsForm.ewayBillNo} 
                          onChange={e => setLogisticsForm({...logisticsForm, ewayBillNo: e.target.value})}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs font-bold focus:outline-none focus:border-primary text-foreground" 
                          placeholder="e.g. 882719203810"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Logistics summary if already Dispatched or Delivered */}
                {(selectedOrder.status === "Dispatched" || selectedOrder.status === "Delivered") && (
                  <div className="space-y-3 p-4 border border-border bg-muted/20 rounded-2xl text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                      <Truck className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-xs font-black uppercase tracking-wider">{t("Logistics & Tracking Summary")}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Transporter")}</span>
                        <p className="font-bold text-foreground mt-0.5">{selectedOrder.transporter_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Vehicle No")}</span>
                        <p className="font-semibold text-foreground mt-0.5">{selectedOrder.vehicle_no || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("LR / Bilty No")}</span>
                        <p className="font-mono text-foreground mt-0.5">{selectedOrder.lr_bilty_no || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("E-Way Bill")}</span>
                        <p className="font-mono text-foreground mt-0.5">{selectedOrder.eway_bill_no || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Action Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3 justify-between items-center z-10">
                {/* Permanent Billing Integration Button */}
                <Link 
                  href={`/dashboard/ceo/invoices/new?orderId=${selectedOrder.id}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/80 border border-border text-foreground font-bold text-xs rounded-xl transition-all"
                >
                  {t("Send to Invoicing")} <ExternalLink size={12} />
                </Link>

                {/* Conditional Workflows */}
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {actionLoading ? (
                    <span className="text-muted-foreground font-bold text-xs flex items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={16} /> {t("Updating Database...")}
                    </span>
                  ) : (
                    <>
                      {selectedOrder.status === "Pending Approval" && (
                        <>
                          <button 
                            onClick={() => handleReject(selectedOrder.id)}
                            className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-550 font-bold text-xs rounded-xl transition-all"
                          >
                            {t("Reject Order")}
                          </button>
                          <button 
                            onClick={() => handleApprove(selectedOrder.id)}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center"
                          >
                            <CheckCircle size={14} /> {t("Approve Order")}
                          </button>
                        </>
                      )}

                      {selectedOrder.status === "Approved/Processing" && (
                        <button 
                          onClick={() => handleDispatch(selectedOrder.id)}
                          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center"
                        >
                          <Truck size={14} /> {t("Mark as Dispatched")}
                        </button>
                      )}

                      {selectedOrder.status === "Dispatched" && (
                        <button 
                          onClick={() => handleDeliver(selectedOrder.id)}
                          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 justify-center"
                        >
                          <CheckCircle size={14} /> {t("Mark as Delivered")}
                        </button>
                      )}

                      {selectedOrder.status === "Delivered" && (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <CheckCircle size={14} /> {t("Completed & Delivered")}
                        </span>
                      )}
                      
                      {selectedOrder.status === "Rejected" && (
                        <span className="text-rose-500 font-bold text-xs flex items-center gap-1 py-2 px-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                          <X size={14} /> {t("Order Rejected")}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Generation Modal */}
      <AnimatePresence>
        {qrOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setQrOrder(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-full flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-black text-foreground uppercase tracking-widest">{t("Warehouse QR Pass")}</span>
                <button
                  onClick={() => setQrOrder(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* QR Image Frame */}
              <div className="p-4 bg-white rounded-2xl border border-border shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    JSON.stringify({
                      orderId: qrOrder.id,
                      dealer: qrOrder.dealer_name,
                      total: qrOrder.total_amount,
                      status: qrOrder.status
                    })
                  )}`}
                  alt="Order QR Code"
                  className="w-[180px] h-[180px]"
                />
              </div>

              {/* Info Detail */}
              <div className="space-y-1 text-xs">
                <p className="font-black text-foreground text-sm">{qrOrder.id}</p>
                <p className="font-semibold text-muted-foreground">{qrOrder.dealer_name}</p>
                <p className="font-mono text-primary font-bold">₹{Number(qrOrder.total_amount).toLocaleString("en-IN")}</p>
              </div>

              {/* Control Buttons */}
              <div className="w-full pt-3 flex gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.print();
                    }
                  }}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {t("Print Pass")}
                </button>
                <button
                  onClick={() => setQrOrder(null)}
                  className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
