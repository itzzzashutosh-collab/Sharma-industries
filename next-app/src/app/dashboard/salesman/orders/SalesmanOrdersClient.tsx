"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  ShoppingBag, Package, Search, Calendar, ChevronRight, X,
  Truck, CheckCircle2, AlertCircle, ClipboardList, Clock, Plus,
  Sparkles, Eye, Shield, IndianRupee, TrendingUp, Tag, Share2,
  Copy, FileText, Phone, Zap, ArrowRight, Info, CheckSquare,
  Building2, Users, Award, Percent, ChevronDown, Check, AlertTriangle, Printer
} from "lucide-react";
import { createSalesmanOrder } from "../actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  stock_status: string;
  category?: string;
}

interface Order {
  id: string;
  date: string;
  dealer_name: string;
  total_amount: number;
  payment_terms: string;
  status: "Pending Approval" | "Approved" | "In Production" | "Dispatched" | "Delivered" | "Cancelled";
  transporter_name?: string;
  vehicle_no?: string;
  lr_number?: string;
  expected_delivery?: string;
  scheme_applied?: string;
  order_items?: OrderItem[];
  notes?: string;
}

interface DBDealer {
  id: string;
  name: string;
  credit_limit?: number;
  credit_used?: number;
  tier?: string;
  phone?: string;
  locality?: string;
}

interface Props {
  initialData: {
    dealers: DBDealer[];
    orders: any[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Catalog
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_CATALOG = [
  { id: "P1", name: "Swatch Shine Emulsion", size: "20L", price: 4200, category: "Emulsion", stockStatus: "In Stock", tag: "Best Seller" },
  { id: "P2", name: "Swatch Shine Emulsion", size: "10L", price: 2375, category: "Emulsion", stockStatus: "In Stock", tag: "Popular" },
  { id: "P3", name: "Swatch Rustic Royale", size: "20L", price: 6500, category: "Luxury Finish", stockStatus: "In Stock", tag: "High Margin" },
  { id: "P4", name: "Swatch Weatherguard Exterior", size: "20L", price: 7800, category: "Exterior", stockStatus: "In Stock", tag: "Weather Protection" },
  { id: "P5", name: "Swatch Acrylic Wall Primer", size: "20L", price: 3400, category: "Primer", stockStatus: "In Stock", tag: "Essential" },
  { id: "P6", name: "Swatch Damp Shield Waterproofing", size: "20L", price: 8900, category: "Waterproofing", stockStatus: "Low Stock", tag: "High Scheme Bonus" },
  { id: "P7", name: "Swatch Smart Wall Putty", size: "40kg", price: 950, category: "Putty", stockStatus: "In Stock", tag: "Fast Moving" },
];

const ACTIVE_SCHEMES = [
  {
    id: "SCH_01",
    title: "Festival Dhamaka Scheme",
    minOrderValue: 75000,
    reward: "5L Free Primer + ₹2,500 Cash Rebate",
    badge: "🔥 HOT",
    code: "FESTIVE50"
  },
  {
    id: "SCH_02",
    title: "Painter Cashback Boost",
    minOrderValue: 50000,
    reward: "Double Painter Wallet Points on all 20L buckets",
    badge: "🎨 PAINTER FAV",
    code: "PAINTER2X"
  },
  {
    id: "SCH_03",
    title: "Gold Partner Bulk Upgrade",
    minOrderValue: 125000,
    reward: "Extra 3% Margin Discount + Free Glow Sign Display",
    badge: "👑 GOLD TIER",
    code: "GOLD125"
  }
];

const OBJECTION_PLAYBOOK = [
  {
    id: "OBJ_1",
    category: "Price & Discount",
    title: "Competitor giving 12% cash discount on 50L bulk order",
    objectionText: "Asian Paints / Berger dealer rep offered 12% instant discount on bulk order. Why should I order Swatch?",
    strategy: "Focus on Painter Pull & Higher Net Retention per Bucket",
    counterHindi: "Sir, Competitor 12% discount deta hai par Swatch mein Painter ko ₹150 direct cashback app par milta hai. Painter Swatch maangega, dealer ki rotation 2x fast hogi aur net profit jyada bachega.",
    financialPitch: "Base Price: ₹4,200 | Net Dealer Margin: 18% + Painter Cash Pull = Faster 15-day inventory turnover vs 45-day competitor stock block.",
    whatsappTemplate: "Namaste Ji! Swatch Shine Emulsion order par special Festival Scheme + Direct Painter App Cash Rewards offer hai. Competitor se faster rotation aur better net margin! Order details confirm karne ke liye abhi call karein. 🎨"
  },
  {
    id: "OBJ_2",
    category: "Credit Period",
    title: "Demanding 60-day credit period instead of 30 days",
    objectionText: "Market mein sab 60-day credit de rahe hain, aap bhi 60 days credit do tabhi order dunga.",
    strategy: "Offer 30-Day Early Cash Discount Trade-off or Gold Partner Status",
    counterHindi: "Sir, 60 days credit mein cost badhti hai. Agar aap 30-day payment clear karte hain toh aapko Gold Partner Tier mein extra 3% scheme discount aur Priority Allocation milega.",
    financialPitch: "30-Day Payment = 3% Cash Rebate (Saves ₹3,750 on ₹1.25L order) vs 60 days standard terms.",
    whatsappTemplate: "Sirji, Gold Partner Upgrade offer under 30-day credit terms: Get extra 3% cash rebate + priority truck dispatch on your order today! Let me book the slot now. 🚀"
  },
  {
    id: "OBJ_3",
    category: "Warehouse Storage",
    title: "Godown full, no storage space for new buckets",
    objectionText: "Mere godown mein Jagah nahi hai, Purana stock niklega tab naya order dunga.",
    strategy: "Offer Split Dispatch (50% Now, 50% in 15 Days) at Locked Scheme Rate",
    counterHindi: "Sir, abhi booking kar lijiye festival rate lock karke. 50% stock kal deliver kar denge aur remaining 50% 15 din baad jab space ban jaye.",
    financialPitch: "Rate Locked Today + Zero Extra Transport Cost + Scheduled Staggered Delivery.",
    whatsappTemplate: "Sir, rate lock facility active hai! Book your order today with 50% instant delivery & 50% staggered delivery next fortnight. Zero storage hassle! 📦"
  },
  {
    id: "OBJ_4",
    category: "Demand / Brand Pull",
    title: "Painters in my area don't ask for Swatch brand",
    objectionText: "Mere area ke contractors sirf Asian / Nerolac maangte hain, Swatch ka demand nahi hai.",
    strategy: "Offer Free Local Contractor Meet + On-Site Token Guarantee",
    counterHindi: "Sir, next week aapki shop pe Painter Meet organise karenge. 15 top contractors ko Swatch Token App and Sample Bucket demo denge. Demand 100% hum generate karke denge.",
    financialPitch: "Company-sponsored Painter Loyalty Drive in your shop + Free Sample Kit for Top 10 Contractors.",
    whatsappTemplate: "Sir, we are organizing a Special Contractor Loyalty Meet at your shop next Tuesday! Free gifts & direct token rewards for your local painters. Let's place the event stock order today! 🛠️"
  },
  {
    id: "OBJ_5",
    category: "Branding & Display",
    title: "Demanding Free Glow Sign Board or Display Rack first",
    objectionText: "Pehle shop pe bada Swatch Glow Sign board lagwao, phir 1 Lakh ka order dunga.",
    strategy: "Tie Glow Sign Installation to Order Commitment Milestone",
    counterHindi: "Sir, bilkul! ₹1 Lakh order place hote hi Branding Team 48 hours mein aapke shop ka Glow Sign Board survey & installation complete kar degi.",
    financialPitch: "Order Approval trigger = Auto-dispatch of LED Glow Signage + Acrylic Display Stand.",
    whatsappTemplate: "Good news Sir! ₹1 Lakh order booking unlocks FREE Premium Swatch LED Glow Sign Board for your store front. Approved within 48h! Booking now? 🏬"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SalesmanOrdersClient({ initialData }: Props) {
  // Normalize orders initial state
  const mockOrders: Order[] = (initialData.orders && initialData.orders.length > 0)
    ? initialData.orders.map((o: any, idx: number) => ({
        id: o.id || `ORD-${9480 + idx}`,
        date: o.date || new Date().toISOString().slice(0, 10),
        dealer_name: o.dealer_name || "Shree Ram Paints",
        total_amount: Number(o.total_amount) || 45000,
        payment_terms: o.payment_terms || "30 Days Credit",
        status: (o.status as any) || "Pending Approval",
        transporter_name: o.transporter_name || "Rajasthan Transport Corp",
        vehicle_no: o.vehicle_no || "RJ-14-GC-8842",
        lr_number: o.lr_number || "LR-88219",
        expected_delivery: o.expected_delivery || "Tomorrow 4:00 PM",
        scheme_applied: o.scheme_applied || "Festival Dhamaka",
        notes: o.notes || "Urgent store delivery requested",
        order_items: o.order_items || [
          { id: "1", product_name: "Swatch Rustic Royale", size: "20L", quantity: 5, unit_price: 6500, stock_status: "In Stock" },
          { id: "2", product_name: "Swatch Shine Emulsion", size: "10L", quantity: 5, unit_price: 2375, stock_status: "In Stock" }
        ]
      }))
    : [
        {
          id: "ORD-9481",
          date: new Date().toISOString().slice(0, 10),
          dealer_name: "Shree Ram Paints",
          total_amount: 44375,
          payment_terms: "30 Days Credit",
          status: "Pending Approval",
          transporter_name: "Rajasthan Transport Corp",
          vehicle_no: "RJ-14-GC-8842",
          lr_number: "LR-88219",
          expected_delivery: "Tomorrow 4:00 PM",
          scheme_applied: "Festival Dhamaka",
          notes: "Store requested delivery before 5 PM",
          order_items: [
            { id: "1", product_name: "Swatch Rustic Royale", size: "20L", quantity: 5, unit_price: 6500, stock_status: "In Stock" },
            { id: "2", product_name: "Swatch Shine Emulsion", size: "10L", quantity: 5, unit_price: 2375, stock_status: "In Stock" }
          ]
        },
        {
          id: "ORD-9478",
          date: "2026-07-26",
          dealer_name: "Ravi Paint & Hardware",
          total_amount: 88400,
          payment_terms: "15 Days Credit",
          status: "Approved",
          transporter_name: "Jaipur Logistics Express",
          vehicle_no: "RJ-14-EA-3310",
          lr_number: "LR-90112",
          expected_delivery: "Today 6:00 PM",
          scheme_applied: "Gold Partner Bulk Upgrade",
          notes: "Full truck load, priority dispatch",
          order_items: [
            { id: "1", product_name: "Swatch Weatherguard Exterior", size: "20L", quantity: 8, unit_price: 7800, stock_status: "In Stock" },
            { id: "2", product_name: "Swatch Damp Shield Waterproofing", size: "20L", quantity: 3, unit_price: 8900, stock_status: "Low Stock" }
          ]
        },
        {
          id: "ORD-9462",
          date: "2026-07-24",
          dealer_name: "Sharma Colour House",
          total_amount: 38200,
          payment_terms: "Cash on Delivery",
          status: "Delivered",
          transporter_name: "Local Tempo Delivery",
          vehicle_no: "RJ-14-LD-1102",
          lr_number: "LR-77401",
          expected_delivery: "Delivered",
          scheme_applied: "Painter Cashback Boost",
          notes: "Payment collected via UPI at delivery time",
          order_items: [
            { id: "1", product_name: "Swatch Acrylic Wall Primer", size: "20L", quantity: 8, unit_price: 3400, stock_status: "In Stock" },
            { id: "2", product_name: "Swatch Smart Wall Putty", size: "40kg", quantity: 10, unit_price: 950, stock_status: "In Stock" }
          ]
        }
      ];

  const dealersList: DBDealer[] = initialData.dealers?.length
    ? initialData.dealers.map((d: any, idx: number) => ({
        id: d.id || `D-${idx}`,
        name: d.name || `Dealer ${idx + 1}`,
        credit_limit: d.credit_limit || 200000,
        credit_used: d.credit_used || (idx % 2 === 0 ? 125000 : 45000),
        tier: idx === 0 ? "Gold Partner" : "Silver Partner",
        phone: d.phone || "9876543210",
        locality: d.locality || "Jaipur"
      }))
    : [
        { id: "D1", name: "Shree Ram Paints", credit_limit: 200000, credit_used: 125000, tier: "Gold Partner", phone: "9829012345", locality: "Malviya Nagar" },
        { id: "D2", name: "Ravi Paint & Hardware", credit_limit: 150000, credit_used: 35000, tier: "Silver Partner", phone: "9829054321", locality: "Tonk Road" },
        { id: "D3", name: "Sharma Colour House", credit_limit: 300000, credit_used: 210000, tier: "Gold Partner", phone: "9829099887", locality: "Sanganer" },
        { id: "D4", name: "Rajasthan Paint Depot", credit_limit: 100000, credit_used: 15000, tier: "Standard", phone: "9829011223", locality: "Vaishali Nagar" },
      ];

  // ── States ──────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<"pipeline" | "create" | "playbook" | "schemes" | "dispatch">("pipeline");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<Order | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Fast Order Form State ───────────────────────────────────────────────────
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState<string>("30 Days Credit");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [appliedSchemeCode, setAppliedSchemeCode] = useState<string>("");
  const [orderLines, setOrderLines] = useState<{ productId: string; quantity: number }[]>([
    { productId: "P1", quantity: 5 },
    { productId: "P5", quantity: 4 }
  ]);

  // Selected dealer computing
  const selectedDealerObj = useMemo(() => {
    return dealersList.find(d => d.id === selectedDealerId);
  }, [selectedDealerId, dealersList]);

  // Order totals calculation
  const orderCalculations = useMemo(() => {
    let subtotal = 0;
    const itemsDetailed = orderLines.map(line => {
      const prod = PRODUCT_CATALOG.find(p => p.id === line.productId) || PRODUCT_CATALOG[0];
      const lineTotal = prod.price * line.quantity;
      subtotal += lineTotal;
      return {
        ...prod,
        quantity: line.quantity,
        lineTotal
      };
    });

    let discountAmount = 0;
    if (appliedSchemeCode === "FESTIVE50" && subtotal >= 75000) discountAmount = 2500;
    if (appliedSchemeCode === "GOLD125" && subtotal >= 125000) discountAmount = subtotal * 0.03;

    const netSubtotal = Math.max(0, subtotal - discountAmount);
    const gst = netSubtotal * 0.18;
    const grandTotal = netSubtotal + gst;
    const estimatedCommission = netSubtotal * 0.025; // 2.5% salesman incentive

    return {
      itemsDetailed,
      subtotal,
      discountAmount,
      netSubtotal,
      gst,
      grandTotal,
      estimatedCommission
    };
  }, [orderLines, appliedSchemeCode]);

  // Filtered orders pipeline
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.dealer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || o.status.toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Pipeline metrics
  const metrics = useMemo(() => {
    const totalVal = orders.reduce((s, o) => s + o.total_amount, 0);
    const pendingCount = orders.filter(o => o.status === "Pending Approval").length;
    const approvedCount = orders.filter(o => o.status === "Approved" || o.status === "In Production" || o.status === "Dispatched" || o.status === "Delivered").length;
    const avgVal = orders.length > 0 ? Math.round(totalVal / orders.length) : 0;
    return { totalVal, pendingCount, approvedCount, avgVal, count: orders.length };
  }, [orders]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddLine = () => {
    setOrderLines(prev => [...prev, { productId: "P1", quantity: 2 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setOrderLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, field: "productId" | "quantity", value: any) => {
    setOrderLines(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealerId) {
      alert("Please select a dealer before submitting the order.");
      return;
    }

    if (orderLines.length === 0 || orderCalculations.grandTotal <= 0) {
      alert("Please add at least 1 product item.");
      return;
    }

    const dealerObj = dealersList.find(d => d.id === selectedDealerId);
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrderItems: OrderItem[] = orderCalculations.itemsDetailed.map((item, idx) => ({
      id: `ITEM_${Date.now()}_${idx}`,
      product_name: item.name,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.price,
      stock_status: item.stockStatus,
      category: item.category
    }));

    const newOrder: Order = {
      id: newOrderId,
      date: new Date().toISOString().slice(0, 10),
      dealer_name: dealerObj?.name || "Dealer",
      total_amount: Math.round(orderCalculations.grandTotal),
      payment_terms: paymentTerms,
      status: "Pending Approval",
      transporter_name: "Jaipur Logistics Express",
      vehicle_no: "RJ-14-GC-5021",
      lr_number: `LR-${Math.floor(10000 + Math.random() * 90000)}`,
      expected_delivery: "In 24-48 Hours",
      scheme_applied: appliedSchemeCode ? ACTIVE_SCHEMES.find(s => s.code === appliedSchemeCode)?.title : "Standard B2B Terms",
      notes: orderNotes,
      order_items: newOrderItems
    };

    startTransition(async () => {
      await createSalesmanOrder({
        id: newOrder.id,
        dealer_name: newOrder.dealer_name,
        total_amount: newOrder.total_amount,
        payment_terms: newOrder.payment_terms,
        status: newOrder.status
      });

      setOrders(prev => [newOrder, ...prev]);
      setActiveTab("pipeline");
      setSelectedDealerId("");
      setOrderNotes("");
      setAppliedSchemeCode("");
      setOrderLines([{ productId: "P1", quantity: 5 }, { productId: "P5", quantity: 4 }]);
      alert(`Order ${newOrder.id} successfully created and submitted for Admin approval!`);
    });
  };

  const copyWhatsAppScript = (objId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(objId);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-xs font-sans text-foreground">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                Salesman Order Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● LIVE PIPELINE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag size={22} className="text-indigo-400" /> B2B Order Command Center
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Book dealer orders, check credit limits, apply schemes, and handle dealer pricing objections with instant WhatsApp counters.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("create")}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer border border-indigo-400/30"
          >
            <Plus size={16} /> Fast B2B Order Booking
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Total Pipeline</span>
            <p className="text-lg font-black text-white font-mono">₹{metrics.totalVal.toLocaleString("en-IN")}</p>
            <span className="text-[9px] text-slate-400">{metrics.count} total orders</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-400 block mb-0.5">Pending Approval</span>
            <p className="text-lg font-black text-amber-300 font-mono">{metrics.pendingCount} Orders</p>
            <span className="text-[9px] text-slate-400">Awaiting CEO/Admin review</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Approved & Dispatched</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{metrics.approvedCount} Orders</p>
            <span className="text-[9px] text-slate-400">Fulfillment in progress</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Avg Order Ticket</span>
            <p className="text-lg font-black text-indigo-200 font-mono">₹{metrics.avgVal.toLocaleString("en-IN")}</p>
            <span className="text-[9px] text-slate-400">Per dealer order</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "pipeline", label: "Active Orders", icon: Package, badge: metrics.count },
          { id: "create", label: "Create New Order", icon: Plus, highlight: true },
          { id: "playbook", label: "Objection & Negotiation Master", icon: Shield, badge: "5 Playbooks" },
          { id: "schemes", label: "Bulk Schemes", icon: Tag, badge: "Active" },
          { id: "dispatch", label: "Dispatch Tracking", icon: Truck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : tab.highlight
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: ACTIVE ORDERS PIPELINE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Order ID or Dealer name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:border-primary transition-colors text-foreground shadow-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Pending Approval", "Approved", "Dispatched", "Delivered"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-3xl p-6">
              <Package size={32} className="mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-bold text-foreground">No orders matching your filters</p>
              <p className="text-muted-foreground text-[11px] mt-1">Try resetting search criteria or create a new order.</p>
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                className="mt-4 px-4 py-2 bg-muted rounded-xl font-bold text-[11px] hover:bg-muted/80 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map(o => {
                const isPending = o.status === "Pending Approval";
                const isApproved = o.status === "Approved";
                const isDelivered = o.status === "Delivered";

                return (
                  <div
                    key={o.id}
                    className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4 hover:border-primary/40 transition-all shadow-xs cursor-pointer group"
                    onClick={() => setSelectedOrder(o)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground font-mono group-hover:text-primary transition-colors">
                            {o.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{o.date}</span>
                        </div>
                        <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex items-center gap-1.5">
                          <Building2 size={13} className="text-indigo-500" /> {o.dealer_name}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider flex-shrink-0 ${
                          isPending
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : isApproved
                            ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                            : isDelivered
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    {/* Product Summary Chips */}
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        Order Items ({o.order_items?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {o.order_items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="text-foreground font-medium truncate max-w-[200px]">
                              • {item.product_name} ({item.size}) x{item.quantity}
                            </span>
                            <span className="font-mono text-muted-foreground">
                              ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                        {(o.order_items?.length || 0) > 2 && (
                          <p className="text-[9px] text-indigo-500 font-bold">
                            +{(o.order_items?.length || 0) - 2} more items...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div>
                        <span className="text-[9px] text-muted-foreground block">Order Value</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{o.total_amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-muted-foreground block">Terms</span>
                        <span className="text-[11px] font-bold text-foreground">{o.payment_terms}</span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); setShowShareModal(o); }}
                        className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Share Invoice Quote on WhatsApp"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: FAST B2B ORDER BOOKING FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "create" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Plus size={18} className="text-primary" /> Create B2B Stock Order
              </h2>
              <p className="text-muted-foreground text-[11px]">
                Book new order, check dealer credit status, apply schemes & estimate salesman commission.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("pipeline")}
              className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold text-[10px]"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateOrderSubmit} className="space-y-6">
            {/* Dealer Selection & Credit Status */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                1. Select Target Dealer *
              </label>
              <select
                value={selectedDealerId}
                onChange={e => setSelectedDealerId(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">-- Choose Dealer from Territory --</option>
                {dealersList.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.locality}) — {d.tier}
                  </option>
                ))}
              </select>

              {/* Credit Status Card */}
              {selectedDealerObj && (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 space-y-2.5 border border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Credit Profile</span>
                      <h4 className="font-extrabold text-xs text-white">{selectedDealerObj.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[9px] font-black border border-indigo-400/30">
                      {selectedDealerObj.tier}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-300">Used: ₹{(selectedDealerObj.credit_used || 0).toLocaleString("en-IN")}</span>
                      <span className="text-slate-300">Limit: ₹{(selectedDealerObj.credit_limit || 200000).toLocaleString("en-IN")}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ((selectedDealerObj.credit_used || 0) / (selectedDealerObj.credit_limit || 200000)) > 0.8
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.round(((selectedDealerObj.credit_used || 0) / (selectedDealerObj.credit_limit || 200000)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection Items */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  2. Select Products & Quantities
                </label>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] hover:bg-primary/20 cursor-pointer"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              <div className="space-y-2.5">
                {orderLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted/20 border border-border rounded-2xl p-3">
                    <div className="flex-1">
                      <select
                        value={line.productId}
                        onChange={e => handleUpdateLine(idx, "productId", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
                      >
                        {PRODUCT_CATALOG.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.size}) — ₹{p.price} [{p.stockStatus}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => handleUpdateLine(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-background border border-border rounded-xl px-2.5 py-2 text-xs text-center font-mono font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    {orderLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scheme Code Applicability */}
            <div className="space-y-2 border-t border-border pt-4">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                3. Apply Active B2B Scheme (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ACTIVE_SCHEMES.map(sch => (
                  <div
                    key={sch.id}
                    onClick={() => setAppliedSchemeCode(appliedSchemeCode === sch.code ? "" : sch.code)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      appliedSchemeCode === sch.code
                        ? "bg-primary/10 border-primary text-foreground shadow-xs"
                        : "bg-muted/20 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                        {sch.badge}
                      </span>
                      {appliedSchemeCode === sch.code && <CheckCircle2 size={13} className="text-primary" />}
                    </div>
                    <h5 className="font-bold text-[11px] text-foreground">{sch.title}</h5>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{sch.reward}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Terms & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Payment Credit Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="Advance Cash / UPI">Advance Cash / UPI (Instant 2% Disc)</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="15 Days Credit">15 Days Credit</option>
                  <option value="30 Days Credit">30 Days Credit (Standard)</option>
                  <option value="45 Days Credit">45 Days Credit (Gold Partner)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Order Dispatch Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deliver before 4 PM, call store owner"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Live Financial Summary */}
            <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Product Subtotal:</span>
                <span className="font-bold font-mono text-foreground">₹{orderCalculations.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {orderCalculations.discountAmount > 0 && (
                <div className="flex justify-between items-center text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span>Scheme Discount Applied ({appliedSchemeCode}):</span>
                  <span className="font-bold font-mono">-₹{orderCalculations.discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">GST (18%):</span>
                <span className="font-bold font-mono text-foreground">₹{orderCalculations.gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/60 pt-2 text-xs">
                <span className="font-black text-foreground">Grand Total:</span>
                <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{Math.round(orderCalculations.grandTotal).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-300 font-bold mt-2">
                <span>💡 Estimated Salesman Incentive:</span>
                <span className="font-mono text-xs">₹{Math.round(orderCalculations.estimatedCommission).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Submit Order for Admin Approval
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: OBJECTION & NEGOTIATION MASTER PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-violet-400" />
              <h2 className="text-base font-black text-white">B2B Dealer Order Objection Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Battle-tested responses to win bulk orders, defend margins, and convert hesitant dealers. Tap to copy ready-made WhatsApp pitch messages directly to your dealer!
            </p>
          </div>

          <div className="space-y-4">
            {OBJECTION_PLAYBOOK.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      {obj.category}
                    </span>
                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1.5">
                      {idx + 1}. {obj.title}
                    </h3>
                  </div>
                </div>

                {/* Dealer Objection Query */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Dealer Objection:</strong>
                  "{obj.objectionText}"
                </div>

                {/* Salesman Counter (Hindi Script) */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Counter Strategy Script (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.counterHindi}</p>
                </div>

                {/* Financial Pitch Workaround */}
                <div className="bg-muted/40 border border-border rounded-2xl p-3 text-[10px] text-muted-foreground space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-foreground">
                    📊 Financial & Margin Calculation:
                  </strong>
                  <p>{obj.financialPitch}</p>
                </div>

                {/* WhatsApp Action */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Dealer Pitch</span>
                  <button
                    onClick={() => copyWhatsAppScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={12} /> Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy WhatsApp Pitch
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: BULK SCHEMES & MARGIN BOOSTERS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "schemes" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Tag size={16} className="text-primary" /> Active B2B Dealer Schemes
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Pitch these schemes to your dealers to increase order basket size and unlock bonus commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTIVE_SCHEMES.map(sch => (
              <div key={sch.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black text-[9px]">
                      {sch.badge}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground font-bold">{sch.code}</span>
                  </div>
                  <h3 className="font-extrabold text-foreground text-xs">{sch.title}</h3>
                  <p className="text-muted-foreground text-[11px]">{sch.reward}</p>
                </div>

                <div className="pt-3 border-t border-border space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Min Order:</span>
                    <span className="font-bold font-mono text-foreground">₹{sch.minOrderValue.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    onClick={() => { setAppliedSchemeCode(sch.code); setActiveTab("create"); }}
                    className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-black text-[10px] hover:bg-primary/20 cursor-pointer"
                  >
                    Apply to New Order →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: DISPATCH & DELIVERY TRACKER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "dispatch" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Truck size={16} className="text-indigo-500" /> Dispatch & Transporter Tracker
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Monitor active order shipments, LR numbers, and delivery statuses for your dealers.
            </p>
          </div>

          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs font-mono text-foreground">{o.id}</span>
                    <h4 className="font-bold text-xs text-foreground mt-0.5">{o.dealer_name}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                    {o.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/30 border border-border/50 rounded-2xl p-3 text-[10px]">
                  <div>
                    <span className="text-muted-foreground block">Transporter:</span>
                    <span className="font-bold text-foreground">{o.transporter_name || "Jaipur Express"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Vehicle No:</span>
                    <span className="font-mono font-bold text-foreground">{o.vehicle_no || "RJ-14-GC-8842"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">LR Number:</span>
                    <span className="font-mono font-bold text-foreground">{o.lr_number || "LR-88219"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Expected ETA:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{o.expected_delivery || "Tomorrow"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ORDER DETAILS MODAL / DRAWER
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Order Summary</span>
                <h3 className="text-sm font-black text-foreground font-mono">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Dealer Info */}
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <p className="font-extrabold text-foreground">{selectedOrder.dealer_name}</p>
                <p className="text-[10px] text-muted-foreground">Date: {selectedOrder.date} | Terms: {selectedOrder.payment_terms}</p>
                {selectedOrder.scheme_applied && (
                  <p className="text-[10px] text-indigo-500 font-bold mt-1">🎁 Scheme: {selectedOrder.scheme_applied}</p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Ordered Products</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] p-2 bg-muted/20 border border-border/40 rounded-xl">
                      <div>
                        <p className="font-bold text-foreground">{item.product_name} ({item.size})</p>
                        <p className="text-[9px] text-muted-foreground">{item.quantity} units x ₹{item.unit_price}</p>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Payment Status:</span>
                  <span className="font-bold text-foreground">{selectedOrder.status}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-foreground pt-1 border-t border-border/40">
                  <span>Grand Total Value:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { const o = selectedOrder; setSelectedOrder(null); setShowShareModal(o); }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 size={13} /> WhatsApp Invoice Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          WHATSAPP SHARE QUOTE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-emerald-500/10 flex items-center justify-between">
              <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Share2 size={14} /> WhatsApp Invoice Summary
              </h3>
              <button onClick={() => setShowShareModal(null)} className="p-1 rounded-lg hover:bg-muted">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-[10px] text-muted-foreground">
                Copy text below to send directly to <strong>{showShareModal.dealer_name}</strong> on WhatsApp:
              </p>

              <div className="bg-muted/50 border border-border rounded-2xl p-3 font-mono text-[10px] text-foreground leading-relaxed whitespace-pre-line">
                {`*SHARMA INDUSTRIES - B2B ORDER CONFIRMATION* 🎨
Order ID: ${showShareModal.id}
Dealer: ${showShareModal.dealer_name}
Date: ${showShareModal.date}

*Order Items:*
${showShareModal.order_items?.map(i => `• ${i.product_name} (${i.size}) x${i.quantity} = ₹${(i.quantity * i.unit_price).toLocaleString("en-IN")}`).join("\n")}

*Total Order Amount:* ₹${showShareModal.total_amount.toLocaleString("en-IN")}
*Payment Terms:* ${showShareModal.payment_terms}
*Status:* ${showShareModal.status}

Thank you for your business! For any queries, contact your Sales Executive.`}
              </div>

              <button
                onClick={() => {
                  const txt = `*SHARMA INDUSTRIES - B2B ORDER CONFIRMATION* 🎨\nOrder ID: ${showShareModal.id}\nDealer: ${showShareModal.dealer_name}\nDate: ${showShareModal.date}\n\n*Total Order Amount:* ₹${showShareModal.total_amount.toLocaleString("en-IN")}\n*Payment Terms:* ${showShareModal.payment_terms}`;
                  navigator.clipboard.writeText(txt);
                  alert("WhatsApp Order Quote copied to clipboard!");
                  setShowShareModal(null);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-black text-[11px] rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy size={13} /> Copy WhatsApp Quote Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
