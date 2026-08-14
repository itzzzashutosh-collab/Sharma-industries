"use client";

import React, { useEffect, useState, useMemo, useTransition } from "react";
import { 
  Users, 
  Search, 
  Store, 
  Building2, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Award, 
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  Activity,
  UserCheck,
  Check,
  Percent,
  Tv,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getDealers, 
  getDealerOrders, 
  updateOrderStatus, 
  getDealerOutstanding, 
  recordOutstandingPayment,
  toggleDealerStatus,
  approveDealer
} from "./actions";

interface DBDealer {
  id: string;
  name: string;
  address: string;
  localities: string;
  designation: string;
  gst_number: string;
  assigned_salesman_id: string;
  pan_card_url: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  created_at: string;
}

// ─── DUMMY DATA FOR STABILITY FALLBACKS ───
const DUMMY_DEALERS: DBDealer[] = [
  {
    id: "DL-001",
    name: "Jaipur Paint House",
    address: "MI Road, Jaipur, Rajasthan",
    localities: "Rajasthan Depot (Jaipur)",
    designation: "Dealer",
    gst_number: "08AAAAA1111A1Z1",
    assigned_salesman_id: "Ajay Singh",
    pan_card_url: "https://example.com/pan.pdf",
    aadhaar_front_url: "https://example.com/aadhaar_front.pdf",
    aadhaar_back_url: "https://example.com/aadhaar_back.pdf",
    created_at: "2026-01-10T12:00:00Z"
  },
  {
    id: "DL-002",
    name: "Marwar Distributors",
    address: "Sardarpura, Jodhpur, Rajasthan",
    localities: "Rajasthan Depot (Jodhpur)",
    designation: "Distributor",
    gst_number: "08BBBBB2222B2Z2",
    assigned_salesman_id: "Ajay Singh",
    pan_card_url: "https://example.com/pan2.pdf",
    aadhaar_front_url: "https://example.com/aadhaar_front2.pdf",
    aadhaar_back_url: "https://example.com/aadhaar_back2.pdf",
    created_at: "2026-02-15T12:00:00Z"
  },
  {
    id: "DL-003",
    name: "Mohan Traders & Co",
    address: "Mansarovar, Jaipur, Rajasthan",
    localities: "Rajasthan Depot (Jaipur)",
    designation: "Dealer",
    gst_number: "",
    assigned_salesman_id: "Rahul Verma",
    pan_card_url: "",
    aadhaar_front_url: "",
    aadhaar_back_url: "",
    created_at: "2026-03-01T12:00:00Z"
  },
  {
    id: "DL-004",
    name: "Delhi Paint Depot",
    address: "Kirti Nagar, New Delhi",
    localities: "Delhi NCR Depot",
    designation: "Depot",
    gst_number: "07CCCCC3333C3Z3",
    assigned_salesman_id: "Sanjay Sharma",
    pan_card_url: "https://example.com/pan3.pdf",
    aadhaar_front_url: "https://example.com/aadhaar_front3.pdf",
    aadhaar_back_url: "",
    created_at: "2026-04-20T12:00:00Z"
  }
];

const DUMMY_ORDERS = [
  { id: "SO-2026-001", dealer_id: "DL-001", dealer_name: "Jaipur Paint House", product_summary: "Rustic Royale Superfine (20L) x 15", total_amount: 73500, status: "PENDING", created_at: "2026-07-10" },
  { id: "SO-2026-002", dealer_id: "DL-002", dealer_name: "Marwar Distributors", product_summary: "Weather Shield Matt (10L) x 40", total_amount: 112000, status: "APPROVED", created_at: "2026-07-09" },
  { id: "SO-2026-003", dealer_id: "DL-003", dealer_name: "Mohan Traders & Co", product_summary: "Acrylic Wall Primer (20L) x 10", total_amount: 32000, status: "PENDING", created_at: "2026-07-08" },
  { id: "SO-2026-004", dealer_id: "DL-004", dealer_name: "Delhi Paint Depot", product_summary: "Gloss Enamel White (4L) x 100", total_amount: 180000, status: "COMPLETED", created_at: "2026-07-05" }
];

const DUMMY_OUTSTANDING = [
  { id: "INV-2026-101", dealer_id: "DL-001", dealer_name: "Jaipur Paint House", grand_total: 73500, outstanding: 43500, due_date: "2026-07-25", days_pending: 10, invoice_no: "INV-101" },
  { id: "INV-2026-102", dealer_id: "DL-002", dealer_name: "Marwar Distributors", grand_total: 112000, outstanding: 112000, due_date: "2026-07-05", days_pending: 30, invoice_no: "INV-102" },
  { id: "INV-2026-103", dealer_id: "DL-003", dealer_name: "Mohan Traders & Co", grand_total: 32000, outstanding: 12000, due_date: "2026-07-20", days_pending: 5, invoice_no: "INV-103" },
  { id: "INV-2026-104", dealer_id: "DL-004", dealer_name: "Delhi Paint Depot", grand_total: 180000, outstanding: 0, due_date: "2026-07-01", days_pending: 0, invoice_no: "INV-104" }
];

const DUMMY_TARGETS = [
  { dealer_id: "DL-001", dealer_name: "Jaipur Paint House", monthly_target: 150000, current_sales: 98000, percentage: 65, category: "Dealer", status: "On Track" },
  { dealer_id: "DL-002", dealer_name: "Marwar Distributors", monthly_target: 300000, current_sales: 310000, percentage: 103, category: "Distributor", status: "Target Met" },
  { dealer_id: "DL-003", dealer_name: "Mohan Traders & Co", monthly_target: 100000, current_sales: 32000, percentage: 32, category: "Dealer", status: "Behind" },
  { dealer_id: "DL-004", dealer_name: "Delhi Paint Depot", monthly_target: 500000, current_sales: 180000, percentage: 36, category: "Depot", status: "Behind" }
];

const DUMMY_REWARDS_CATALOG = [
  { id: "RW-01", name: "Premium Commercial Paint Sprayer", points_required: 1500, value: "₹25,000 equivalent", category: "Equipment" },
  { id: "RW-02", name: "Gold Coin (10 Grams, 24K)", points_required: 5000, value: "₹72,000 equivalent", category: "Gifts" },
  { id: "RW-03", name: "Redmi Smart TV 43\"", points_required: 2000, value: "₹30,000 equivalent", category: "Electronics" },
  { id: "RW-04", name: "Goa 3 Days Holiday Package", points_required: 4000, value: "₹60,000 equivalent", category: "Travel" }
];

const DUMMY_LOCATIONS = [
  { locality: "Rajasthan Depot (Jaipur)", outlet_count: 12, sales_volume: 450000, supervisor: "Ajay Singh", health: "Healthy" },
  { locality: "Rajasthan Depot (Jodhpur)", outlet_count: 5, sales_volume: 380000, supervisor: "Ajay Singh", health: "Healthy" },
  { locality: "Delhi NCR Depot", outlet_count: 8, sales_volume: 520000, supervisor: "Sanjay Sharma", health: "Critical" },
  { locality: "West Delhi Area", outlet_count: 3, sales_volume: 90000, supervisor: "Rahul Verma", health: "Warning" }
];

export default function CEODealersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"list" | "orders" | "outstanding" | "targets" | "rewards" | "locations">("list");
  const [isPending, startTransition] = useTransition();

  // Database and State variables
  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [outstandings, setOutstandings] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [pointsRegistry, setPointsRegistry] = useState<Record<string, number>>({});
  const [locations, setLocations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDealer, setSelectedDealer] = useState<DBDealer | null>(null);

  // Modal Control States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [newTargetVal, setNewTargetVal] = useState("");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ─── LOAD DATA FROM BACKEND & LOCAL STORAGE ───
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Get Dealers
      const dealerRes = await getDealers();
      let activeDealersList = DUMMY_DEALERS;
      if (dealerRes.success && dealerRes.data && dealerRes.data.length > 0) {
        activeDealersList = dealerRes.data as DBDealer[];
      }
      setDealers(activeDealersList);

      // 2. Get Orders
      const ordersRes = await getDealerOrders();
      let activeOrders = DUMMY_ORDERS;
      if (ordersRes.success && ordersRes.data && ordersRes.data.length > 0) {
        activeOrders = ordersRes.data.map((o: any) => ({
          id: o.id,
          dealer_id: o.dealer_id || "DL-001",
          dealer_name: o.dealer_name || "Partner",
          product_summary: o.product_summary || (o.order_items && o.order_items.map((i: any) => `${i.product_name} (${i.size}) x ${i.quantity}`).join(", ")) || "Products Mix",
          total_amount: Number(o.total_amount || 0),
          status: o.status || "PENDING",
          created_at: o.created_at ? o.created_at.split("T")[0] : "2026-07-10"
        }));
      }
      setOrders(activeOrders);

      // 3. Outstanding Invoices
      const outRes = await getDealerOutstanding();
      let activeOut = DUMMY_OUTSTANDING;
      if (outRes.success && outRes.data && outRes.data.length > 0) {
        activeOut = outRes.data.map((i: any) => ({
          id: i.id,
          dealer_id: i.customer_id || "DL-001",
          dealer_name: i.customer_name || "Partner Name",
          grand_total: Number(i.grand_total || 0),
          outstanding: Number(i.grand_total || 0), // Defaulting outstanding equivalent to total if pending
          due_date: i.date || "2026-07-25",
          days_pending: 10,
          invoice_no: i.invoice_no
        }));
      }
      setOutstandings(activeOut);

      // Initialize points register from local storage or calculate from orders (1 point per ₹100)
      const savedPoints = localStorage.getItem("dealer_rewards_points");
      if (savedPoints) {
        setPointsRegistry(JSON.parse(savedPoints));
      } else {
        const calculated: Record<string, number> = {};
        activeDealersList.forEach(d => {
          // Sum up completed orders to get loyalty points
          const completedTotal = activeOrders
            .filter(o => o.dealer_id === d.id && o.status === "COMPLETED")
            .reduce((sum, o) => sum + o.total_amount, 0);
          calculated[d.id] = Math.floor(completedTotal / 100) + 1200; // Base 1200 points + sales volume ratio
        });
        setPointsRegistry(calculated);
        localStorage.setItem("dealer_rewards_points", JSON.stringify(calculated));
      }

      // Initialize targets from local storage
      const savedTargets = localStorage.getItem("dealer_sales_targets");
      if (savedTargets) {
        setTargets(JSON.parse(savedTargets));
      } else {
        setTargets(DUMMY_TARGETS);
        localStorage.setItem("dealer_sales_targets", JSON.stringify(DUMMY_TARGETS));
      }

      // Initialize locations summary
      setLocations(DUMMY_LOCATIONS);

    } catch (error) {
      console.error("Error loading dealers ecosystem data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── ACTION HANDLERS ───
  
  // Update Order Status (Approve/Reject)
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast("success", `Order ${orderId} status updated to ${newStatus} successfully.`);
        // Update local state instantly
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        showToast("error", `Failed to update order: ${res.error}`);
      }
    });
  };

  // Open record outstanding payment modal
  const handleOpenPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.outstanding.toString());
    setPaymentRef(`REF-${Date.now().toString().slice(-6)}`);
    setPaymentMode("Bank Transfer");
    setIsPaymentModalOpen(true);
  };

  // Record outstanding payment submit
  const handleRecordPaymentSubmit = () => {
    const amt = Number(paymentAmount);
    if (!selectedInvoice || amt <= 0) {
      showToast("error", "Please specify a valid payment amount.");
      return;
    }
    startTransition(async () => {
      const res = await recordOutstandingPayment(selectedInvoice.id, amt, paymentRef, paymentMode);
      if (res.success) {
        showToast("success", `Payment of ₹${amt.toLocaleString("en-IN")} recorded successfully.`);
        setIsPaymentModalOpen(false);
        // Update outstandings locally
        setOutstandings(prev => prev.map(item => {
          if (item.id === selectedInvoice.id) {
            const nextOutstanding = Math.max(0, item.outstanding - amt);
            return { ...item, outstanding: nextOutstanding };
          }
          return item;
        }).filter(item => item.outstanding > 0)); // Filter out fully paid
      } else {
        showToast("error", `Payment registration failed: ${res.error}`);
      }
    });
  };

  // Open targets setting modal
  const handleOpenTargetModal = (tgt: any) => {
    setSelectedTarget(tgt);
    setNewTargetVal(tgt.monthly_target.toString());
    setIsTargetModalOpen(true);
  };

  // Save new target
  const handleSaveTargetVal = () => {
    const val = Number(newTargetVal);
    if (!selectedTarget || val <= 0) {
      showToast("error", "Please enter a valid target amount.");
      return;
    }
    const updated = targets.map(t => {
      if (t.dealer_id === selectedTarget.dealer_id) {
        const pct = Math.floor((t.current_sales / val) * 100);
        return {
          ...t,
          monthly_target: val,
          percentage: pct,
          status: pct >= 100 ? "Target Met" : pct >= 60 ? "On Track" : "Behind"
        };
      }
      return t;
    });
    setTargets(updated);
    localStorage.setItem("dealer_sales_targets", JSON.stringify(updated));
    setIsTargetModalOpen(false);
    showToast("success", `Monthly sales target updated for ${selectedTarget.dealer_name}.`);
  };

  // Redeem Reward Item
  const handleRedeemReward = (dealerId: string, item: any) => {
    const currentPoints = pointsRegistry[dealerId] || 0;
    if (currentPoints < item.points_required) {
      showToast("error", "Insufficient loyalty reward points to redeem this item.");
      return;
    }
    const nextPoints = currentPoints - item.points_required;
    const updatedPoints = {
      ...pointsRegistry,
      [dealerId]: nextPoints
    };
    setPointsRegistry(updatedPoints);
    localStorage.setItem("dealer_rewards_points", JSON.stringify(updatedPoints));
    showToast("success", `Successfully claimed reward: ${item.name}! deducted ${item.points_required} pts.`);
  };

  // Filtering dealers/orders list based on active tab and search query
  const filteredDealers = useMemo(() => {
    return dealers.filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.localities.toLowerCase().includes(search.toLowerCase()) ||
      (d.assigned_salesman_id || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [dealers, search]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.dealer_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  const filteredOutstandings = useMemo(() => {
    return outstandings.filter(o => 
      o.dealer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.invoice_no.toLowerCase().includes(search.toLowerCase())
    );
  }, [outstandings, search]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted/50 rounded-lg transition-colors ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Dealers Ecosystem")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Store className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Dealers Ecosystem")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage dealer networks, pending procurement orders, outstanding invoices, monthly targets, and loyalty program rewards.")}</p>
          </div>
        </div>

        {/* Navigation Quick Action Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <button 
            onClick={() => { setActiveTab("list"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "list" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Dealer List")}
          </button>
          <button 
            onClick={() => { setActiveTab("orders"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "orders" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Orders")}
            {orders.filter(o => o.status === "PENDING").length > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                {orders.filter(o => o.status === "PENDING").length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab("outstanding"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "outstanding" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Outstanding")}
            {outstandings.filter(o => o.outstanding > 0).length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                {outstandings.filter(o => o.outstanding > 0).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab("targets"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "targets" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Targets")}
          </button>
          <button 
            onClick={() => { setActiveTab("rewards"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "rewards" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Rewards")}
          </button>
          <button 
            onClick={() => { setActiveTab("locations"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "locations" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Locations")}
          </button>
          
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder={t("Search ecosystem...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* ─── TAB 1: DEALER LIST VIEW ─── */}
      {activeTab === "list" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users size={24} /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Total Partners")}</p>
                <p className="text-2xl font-black text-foreground">{dealers.length}</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Store size={24} /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Dealers")}</p>
                <p className="text-2xl font-black text-foreground">{dealers.filter(d => d.designation === "Dealer").length}</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500"><Building2 size={24} /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Distributors")}</p>
                <p className="text-2xl font-black text-foreground">{dealers.filter(d => d.designation === "Distributor").length}</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Depots")}</p>
                <p className="text-2xl font-black text-foreground">{dealers.filter(d => d.designation === "Depot").length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Business Partner")}</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Designation")}</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Territory / Localities")}</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("GST Number")}</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">{t("Assigned Salesman")}</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">{t("KYC Documents")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                        <div className="flex justify-center items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          {t("Loading partners from KYC Database...")}
                        </div>
                      </td>
                    </tr>
                  ) : filteredDealers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-bold text-foreground">{t("No KYC partners found.")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDealers.map((dealer) => (
                      <tr key={dealer.id} onClick={() => setSelectedDealer(dealer)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-black border border-border">
                              {(dealer.name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">{dealer.name}</p>
                              <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate max-w-[200px]">{dealer.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${
                            dealer.designation === 'Distributor' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' :
                            dealer.designation === 'Depot' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {dealer.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-foreground">{dealer.localities}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm font-bold text-foreground">
                            {dealer.gst_number || <span className="text-muted-foreground font-medium italic text-xs">UNREGISTERED</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                              {(dealer.assigned_salesman_id || "S")[0]}
                            </div>
                            <p className="text-sm font-bold text-foreground">{dealer.assigned_salesman_id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {dealer.pan_card_url ? (
                              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">PAN</span>
                            ) : null}
                            {dealer.aadhaar_front_url ? (
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">AADHAAR</span>
                            ) : null}
                            {!dealer.pan_card_url && !dealer.aadhaar_front_url && (
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted border border-border px-2 py-1 rounded-lg">No Docs</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DEALER ORDERS VIEW ─── */}
      {activeTab === "orders" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-black tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Dealer / Buyer</th>
                  <th className="px-6 py-4">Product Summary</th>
                  <th className="px-6 py-4 text-right">Order Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Approvals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{order.created_at}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{order.dealer_name}</td>
                    <td className="px-6 py-4 text-xs text-foreground font-medium max-w-sm truncate">{order.product_summary}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-foreground">₹{order.total_amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        order.status === "APPROVED" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                        "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === "PENDING" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "APPROVED")}
                            disabled={isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                            disabled={isPending}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: OUTSTANDING INVOICES ─── */}
      {activeTab === "outstanding" && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-500">
            <AlertTriangle className="flex-shrink-0" size={20} />
            <div className="text-xs font-semibold">
              <p className="font-bold">Ecosystem Aging Warning Limit</p>
              <p className="font-normal mt-0.5 text-muted-foreground">Distributors with outstanding invoices pending over 30 days are flagged. Future orders for these accounts will require manual CEO ledger override approval.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-black tracking-wider">
                    <th className="px-6 py-4">Invoice No</th>
                    <th className="px-6 py-4">Dealer / Buyer</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-center">Days Overdue</th>
                    <th className="px-6 py-4 text-right">Invoice Total</th>
                    <th className="px-6 py-4 text-right">Balance Outstanding</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredOutstandings.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-muted-foreground">{invoice.invoice_no || invoice.id}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{invoice.dealer_name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{invoice.due_date}</td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          invoice.days_pending >= 30 ? "bg-rose-500/10 text-rose-500" :
                          invoice.days_pending > 0 ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {invoice.days_pending} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-foreground">₹{invoice.grand_total.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-rose-500">₹{invoice.outstanding.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right">
                        {invoice.outstanding > 0 ? (
                          <button
                            onClick={() => handleOpenPaymentModal(invoice)}
                            className="bg-primary hover:bg-primary-hover text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold flex items-center justify-end gap-1"><CheckCircle2 size={12} /> Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: MONTHLY TARGETS ─── */}
      {activeTab === "targets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targets.map((tgt, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-black text-foreground">{tgt.dealer_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tgt.category} Partner Target profile</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                  tgt.status === "Target Met" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  tgt.status === "On Track" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  "bg-rose-500/10 text-rose-500 border-rose-500/20"
                }`}>
                  {tgt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Target Volume</span>
                  <span className="text-foreground text-sm font-black font-mono">₹{tgt.monthly_target.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Current Sales (Litre EQ)</span>
                  <span className="text-primary text-sm font-black font-mono">₹{tgt.current_sales.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Progress Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Monthly Progress</span>
                  <span className="text-foreground font-mono">{tgt.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      tgt.percentage >= 100 ? "bg-emerald-500" :
                      tgt.percentage >= 60 ? "bg-primary" :
                      "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, tgt.percentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex justify-end">
                <button
                  onClick={() => handleOpenTargetModal(tgt)}
                  className="bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold px-3 py-2 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Percent size={13} className="text-primary" /> Adjust Target
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 5: REWARDS & LOYALTY ─── */}
      {activeTab === "rewards" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Dealer Loyalty Reward Ledger</h2>
              <p className="text-xs text-muted-foreground">Every ₹100 of paint volume purchased awards 1 loyal partner point. Points can be redeemed for marketing collateral or hardware assets below.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dealers.map(d => {
                const pts = pointsRegistry[d.id] || 0;
                const tier = pts >= 4000 ? "Platinum" : pts >= 2000 ? "Gold" : "Silver";

                return (
                  <div key={d.id} className="bg-muted/40 border border-border/40 p-4 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-foreground text-sm">{d.name}</p>
                      <p className="text-muted-foreground font-semibold mt-0.5">Tier: <span className="text-primary font-black uppercase text-[10px]">{tier}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Loyalty Points</p>
                      <p className="text-lg font-black text-foreground font-mono">{pts} pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DUMMY_REWARDS_CATALOG.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm flex justify-between items-center hover:border-primary/20 transition-all">
                <div className="space-y-1.5">
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-base font-black text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">Asset Value: {item.value}</p>
                  <p className="text-xs font-mono font-bold text-primary">{item.points_required} Points Required</p>
                </div>
                <div className="text-right flex-shrink-0 pl-4">
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2">Claim on behalf of:</label>
                  <select
                    onChange={(e) => {
                      const dId = e.target.value;
                      if (!dId) return;
                      handleRedeemReward(dId, item);
                      e.target.value = ""; // Reset selector
                    }}
                    className="bg-muted border border-border text-foreground text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Claim Reward --</option>
                    {dealers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({pointsRegistry[d.id] || 0} pts)</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 6: LOCATIONS VIEW ─── */}
      {activeTab === "locations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((loc, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div className="flex gap-2.5 items-center">
                  <div className="p-2 bg-muted rounded-xl"><MapPin className="text-primary" size={18} /></div>
                  <div>
                    <h3 className="text-base font-black text-foreground">{loc.locality}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Depot Representative: {loc.supervisor}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                  loc.health === "Healthy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  loc.health === "Warning" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  "bg-rose-500/10 text-rose-500 border-rose-500/20"
                }`}>
                  {loc.health}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Onboarded Outlets</span>
                  <span className="text-foreground text-sm font-black font-mono">{loc.outlet_count} outlets</span>
                </div>
                <div>
                  <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Total Sales In Region</span>
                  <span className="text-primary text-sm font-black font-mono">₹{loc.sales_volume.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="bg-muted/30 border border-border/40 p-3 rounded-2xl text-[11px] text-muted-foreground font-semibold">
                Territory encompasses nearby dealer stores. Weekly visits are scheduled on Thursdays.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL: RECORD OUTSTANDING PAYMENT ─── */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-1.5">
                <DollarSign size={18} className="text-primary" /> Record Invoice Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-muted-foreground font-semibold">Invoice Number</p>
                <p className="text-sm font-bold text-foreground font-mono mt-0.5">{selectedInvoice.invoice_no || selectedInvoice.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Dealer / Partner Name</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{selectedInvoice.dealer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground font-semibold">Total Bill</p>
                  <p className="text-sm font-black text-foreground font-mono mt-0.5">₹{selectedInvoice.grand_total.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold text-rose-500">Balance Outstanding</p>
                  <p className="text-sm font-black text-rose-500 font-mono mt-0.5">₹{selectedInvoice.outstanding.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Amount Received (₹)</label>
                <input
                  type="number"
                  max={selectedInvoice.outstanding}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono font-bold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Reference Transaction ID / Chq No</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TXN-18239023"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Bank Transfer">NEFT / Bank Transfer</option>
                  <option value="UPI">UPI / GPay</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash Deposit</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button onClick={() => setIsPaymentModalOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={handleRecordPaymentSubmit}
                disabled={isPending}
                className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                {isPending ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: UPDATE MONTHLY SALES TARGET ─── */}
      {isTargetModalOpen && selectedTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-1.5">
                Adjust Monthly Partner Target
              </h3>
              <button onClick={() => setIsTargetModalOpen(false)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <p className="text-muted-foreground uppercase text-[9px]">Dealer / Buyer</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{selectedTarget.dealer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground uppercase text-[9px]">Current Sales Done</p>
                  <p className="text-sm font-black text-primary font-mono mt-0.5">₹{selectedTarget.current_sales.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[9px]">Active Target</p>
                  <p className="text-sm font-black text-foreground font-mono mt-0.5">₹{selectedTarget.monthly_target.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block text-xs">New Target Amount (₹)</label>
                <input
                  type="number"
                  value={newTargetVal}
                  onChange={(e) => setNewTargetVal(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono font-bold text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button onClick={() => setIsTargetModalOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={handleSaveTargetVal}
                className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dealer Detail Sliding Drawer */}
      <AnimatePresence>
        {selectedDealer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedDealer(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground font-black border border-border text-lg">
                    {(selectedDealer.name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">{selectedDealer.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      selectedDealer.designation === 'Distributor' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' :
                      selectedDealer.designation === 'Depot' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>{selectedDealer.designation}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedDealer(null)} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">General Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Territory</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedDealer.localities || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">GST Number</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5">{selectedDealer.gst_number || "Unregistered"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Assigned Salesman</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedDealer.assigned_salesman_id || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Onboarded On</p>
                      <p className="font-semibold text-foreground mt-0.5">{new Date(selectedDealer.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">KYC Documents</h4>
                  <div className="flex gap-3 flex-wrap">
                    {selectedDealer.pan_card_url ? (
                      <a href={selectedDealer.pan_card_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold rounded-xl text-xs transition-colors hover:bg-blue-500/20">
                        PAN Card <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 px-3 py-2 bg-muted border border-border text-muted-foreground font-bold rounded-xl text-xs">PAN Card — Missing</span>
                    )}
                    {selectedDealer.aadhaar_front_url ? (
                      <a href={selectedDealer.aadhaar_front_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold rounded-xl text-xs transition-colors hover:bg-emerald-500/20">
                        Aadhaar Front <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 px-3 py-2 bg-muted border border-border text-muted-foreground font-bold rounded-xl text-xs">Aadhaar Front — Missing</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedDealer(null);
                    setActiveTab("outstanding");
                  }}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl text-center shadow-md transition-all cursor-pointer"
                >
                  {t("View Ledger")}
                </button>
                <button onClick={() => setSelectedDealer(null)} className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer">
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
