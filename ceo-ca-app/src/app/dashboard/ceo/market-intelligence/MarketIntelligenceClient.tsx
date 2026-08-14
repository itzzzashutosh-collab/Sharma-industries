"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Radar, Crosshair, MapPin, TrendingUp, AlertTriangle, Truck, Route,
  Layers, Package, ClipboardCheck, BarChart3, PieChart, ShieldAlert,
  Plus, X, Search, CheckCircle2, User, ChevronRight, HelpCircle,
  FileText, IndianRupee, BellRing, Eye, Edit2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DealerPerformance {
  id: string;
  name: string;
  phone: string;
  totalRevenue: number;
  outstanding: number;
  mockPincode: string;
  mockTopProduct: string;
}

interface CompetitorSku {
  id: string;
  name: string;
  purchase_price: string | number;
  selling_price: number;
  owner_id: string;
  dealerName: string;
  margin: number;
  marginPercent: number;
  sentiment?: string;
  totalQtySold?: number;
}

interface HeatmapRegion {
  location: string;
  sales: string;
  intensity: string;
  width: string;
}

interface Props {
  dealerPerformance: DealerPerformance[];
  competitorSpyData: CompetitorSku[];
  heatmapData: HeatmapRegion[];
  initialVehicles?: Vehicle[];
  initialDispatches?: Dispatch[];
  initialRoutes?: DeliveryRoute[];
}

// ─── TYPES & INTERFACES ───
interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  type: string;
  status: "In Transit" | "Loading" | "Idle" | "Maintenance";
  capacity: string;
  currentRoute: string;
}

interface Dispatch {
  id: string;
  dealerName: string;
  location: string;
  items: string;
  value: number;
  vehiclePlate: string;
  status: "Pending" | "Loading" | "Dispatched" | "Out for Delivery" | "Delivered";
  date: string;
}

interface DeliveryRoute {
  id: string;
  name: string;
  stopsCount: number;
  mappedDealers: string[];
  assignedVehicle: string;
  progress: number; // percentage
}

// ─── DUMMY DATA FOR NEW TABS ───
const INITIAL_VEHICLES: Vehicle[] = [
  { id: "VEH-01", plateNumber: "RJ-14-GA-8923", driverName: "Mahesh Yadav", driverPhone: "9829012345", type: "10-Ton Truck", status: "In Transit", capacity: "95%", currentRoute: "Jaipur - Sikar Highway" },
  { id: "VEH-02", plateNumber: "RJ-14-GB-1244", driverName: "Rakesh Sharma", driverPhone: "9982345678", type: "Eicher Pro 3-Ton", status: "Loading", capacity: "40%", currentRoute: "Jaipur Local Loop" },
  { id: "VEH-03", plateNumber: "RJ-19-GA-7711", driverName: "Surendra Singh", driverPhone: "9414098765", type: "Tata Ace (Chota Hathi)", status: "Idle", capacity: "0%", currentRoute: "Unassigned" },
  { id: "VEH-04", plateNumber: "RJ-14-GC-5531", driverName: "Baldev Raj", driverPhone: "9166011223", type: "12-Ton Tipper", status: "Maintenance", capacity: "0%", currentRoute: "None" }
];

const INITIAL_DISPATCHES: Dispatch[] = [
  { id: "DISP-101", dealerName: "Ravi Paint Store", location: "Jaipur West", items: "Weather Shield Ext (20L) x 15, Wall Putty x 40 Bags", value: 125000, vehiclePlate: "RJ-14-GA-8923", status: "Out for Delivery", date: "2026-07-12" },
  { id: "DISP-102", dealerName: "Jaipur Paint Hub", location: "Jaipur Central", items: "Rustic Royale Int (10L) x 8, Gloss Enamel x 12 Pails", value: 65000, vehiclePlate: "RJ-14-GB-1244", status: "Loading", date: "2026-07-12" },
  { id: "DISP-103", dealerName: "Sharma Hardware & Paints", location: "Dausa Rural", items: "Acrylic Primer (20L) x 25, Brush kits x 100", value: 145000, vehiclePlate: "RJ-14-GA-8923", status: "Dispatched", date: "2026-07-11" },
  { id: "DISP-104", dealerName: "Hadoti Distributors", location: "Kota Hub", items: "Weather Shield (20L) x 50, Undercoat Primer x 30", value: 385000, vehiclePlate: "RJ-14-GA-8923", status: "Pending", date: "2026-07-12" }
];

const INITIAL_ROUTES: DeliveryRoute[] = [
  { id: "R-01", name: "Jaipur - Sikar Route", stopsCount: 5, mappedDealers: ["Ravi Paint Store", "Chomu Paints", "Sikar Retailers"], assignedVehicle: "RJ-14-GA-8923", progress: 65 },
  { id: "R-02", name: "Jaipur Local Loop (C-Scheme, Mansarovar)", stopsCount: 8, mappedDealers: ["Jaipur Paint Hub", "Modern Decorators", "Unique Paints"], assignedVehicle: "RJ-14-GB-1244", progress: 10 },
  { id: "R-03", name: "Dausa - Alwar Expressway", stopsCount: 4, mappedDealers: ["Sharma Hardware & Paints", "Bandikui Colors", "Alwar Depot"], assignedVehicle: "RJ-14-GA-8923", progress: 100 }
];

// Product Overall Demand Data
const OVERALL_DEMANDS = [
  { name: "Acrylic Wall Putty Superfine", salesCount: 840, revenue: 320000, share: "35%" },
  { name: "Weather Shield Ultima Smooth", salesCount: 520, revenue: 980000, share: "28%" },
  { name: "Rustic Royale Luxe Emulsion", salesCount: 310, revenue: 760000, share: "22%" },
  { name: "Gloss Enamel White Premium", salesCount: 190, revenue: 280000, share: "15%" }
];

type ActiveTab = "dealers" | "fleet" | "dispatches" | "routes" | "infiltration" | "outstanding" | "demands" | "competitors";

import { addFleetVehicle, addDeliveryDispatch, addDeliveryRoute } from "./actions";

export function MarketIntelligenceClient({
  dealerPerformance,
  competitorSpyData,
  heatmapData,
  initialVehicles = [],
  initialDispatches = [],
  initialRoutes = [],
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dealers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Local State representing database lists for addition simulation
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles.length > 0 ? initialVehicles : INITIAL_VEHICLES);
  const [dispatches, setDispatches] = useState<Dispatch[]>(initialDispatches.length > 0 ? initialDispatches : INITIAL_DISPATCHES);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(initialRoutes.length > 0 ? initialRoutes : INITIAL_ROUTES);
  const [competitors, setCompetitors] = useState<CompetitorSku[]>(competitorSpyData);

  // Modal Open controllers
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDispatchOpen, setIsAddDispatchOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddCompetitorOpen, setIsAddCompetitorOpen] = useState(false);

  // Form states
  const [newVehicle, setNewVehicle] = useState({ plateNumber: "", driverName: "", driverPhone: "", type: "", status: "Idle", capacity: "0%", currentRoute: "Unassigned" });
  const [newDispatch, setNewDispatch] = useState({ dealerName: "", location: "", items: "", value: "", vehiclePlate: "", status: "Pending" });
  const [newRoute, setNewRoute] = useState({ name: "", stopsCount: "", mappedDealers: "", assignedVehicle: "", progress: "0" });
  const [newCompetitor, setNewCompetitor] = useState({ brand: "", productName: "", mrp: "", dealerName: "", totalQtySold: "", sentiment: "Medium Threat" });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Vehicle handler
  const handleAddVehicle = () => {
    if (!newVehicle.plateNumber || !newVehicle.driverName) {
      showToast("error", "Plate number and driver name are required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        plateNumber: newVehicle.plateNumber,
        driverName: newVehicle.driverName,
        driverPhone: newVehicle.driverPhone || "N/A",
        vehicleType: newVehicle.type || "Tempo Traveler",
        capacity: newVehicle.capacity
      };

      const res = await addFleetVehicle(payload);
      if (res.success) {
        const created: Vehicle = {
          id: `VEH-${Date.now().toString().slice(-4)}`,
          plateNumber: payload.plateNumber,
          driverName: payload.driverName,
          driverPhone: payload.driverPhone,
          type: payload.vehicleType,
          status: "Idle",
          capacity: payload.capacity,
          currentRoute: "Unassigned"
        };
        setVehicles(prev => [created, ...prev]);
        setIsAddVehicleOpen(false);
        setNewVehicle({ plateNumber: "", driverName: "", driverPhone: "", type: "", status: "Idle", capacity: "0%", currentRoute: "Unassigned" });
        showToast("success", "Vehicle added to fleet register.");
      } else {
        showToast("error", "Failed to add fleet vehicle.");
      }
    });
  };

  // Add Dispatch handler
  const handleAddDispatch = () => {
    if (!newDispatch.dealerName || !newDispatch.items || !newDispatch.value) {
      showToast("error", "Dealer, items and dispatch invoice value are required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        dealerName: newDispatch.dealerName,
        location: newDispatch.location || "Jaipur West",
        items: newDispatch.items,
        value: Number(newDispatch.value) || 0,
        vehiclePlate: newDispatch.vehiclePlate || "Unassigned"
      };

      const res = await addDeliveryDispatch(payload);
      if (res.success) {
        const created: Dispatch = {
          id: `DISP-${Date.now().toString().slice(-4)}`,
          dealerName: payload.dealerName,
          location: payload.location,
          items: payload.items,
          value: payload.value,
          vehiclePlate: payload.vehiclePlate,
          status: "Pending",
          date: new Date().toISOString().split('T')[0]
        };
        setDispatches(prev => [created, ...prev]);
        setIsAddDispatchOpen(false);
        setNewDispatch({ dealerName: "", location: "", items: "", value: "", vehiclePlate: "", status: "Pending" });
        showToast("success", "Dispatch transit log registered!");
      } else {
        showToast("error", "Failed to register dispatch log.");
      }
    });
  };

  // Add Route handler
  const handleAddRoute = () => {
    if (!newRoute.name || !newRoute.stopsCount) {
      showToast("error", "Route name and stop count are required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        routeName: newRoute.name,
        stopsCount: Number(newRoute.stopsCount) || 1,
        mappedDealers: newRoute.mappedDealers ? newRoute.mappedDealers.split(",") : [],
        assignedVehicle: newRoute.assignedVehicle || "Unassigned"
      };

      const res = await addDeliveryRoute(payload);
      if (res.success) {
        const created: DeliveryRoute = {
          id: `R-${Date.now().toString().slice(-4)}`,
          name: payload.routeName,
          stopsCount: payload.stopsCount,
          mappedDealers: payload.mappedDealers,
          assignedVehicle: payload.assignedVehicle,
          progress: 0
        };
        setRoutes(prev => [created, ...prev]);
        setIsAddRouteOpen(false);
        setNewRoute({ name: "", stopsCount: "", mappedDealers: "", assignedVehicle: "", progress: "0" });
        showToast("success", "Distribution route mapped successfully.");
      } else {
        showToast("error", "Failed to map route.");
      }
    });
  };

  // Add Competitor product handler
  const handleAddCompetitor = () => {
    if (!newCompetitor.brand || !newCompetitor.productName || !newCompetitor.mrp) {
      showToast("error", "Brand name, Product SKU and Retail MRP are required.");
      return;
    }
    const mrpNum = Number(newCompetitor.mrp) || 0;
    const estMfg = mrpNum * 0.7;
    const margin = mrpNum - estMfg;
    const created: CompetitorSku = {
      id: `COMP-${Date.now().toString().slice(-4)}`,
      name: `[${newCompetitor.brand}] ${newCompetitor.productName}`,
      purchase_price: estMfg.toFixed(2),
      selling_price: mrpNum,
      owner_id: "",
      dealerName: newCompetitor.dealerName || "Local Retailers",
      margin: margin,
      marginPercent: estMfg > 0 ? (margin / estMfg) * 100 : 0,
      sentiment: newCompetitor.sentiment,
      totalQtySold: Number(newCompetitor.totalQtySold) || 0
    };
    setCompetitors(prev => [created, ...prev]);
    setIsAddCompetitorOpen(false);
    setNewCompetitor({ brand: "", productName: "", mrp: "", dealerName: "", totalQtySold: "", sentiment: "Medium Threat" });
    showToast("success", "Competitor product added to spy ledger.");
  };

  // Filter lists based on search
  const filteredDealers = useMemo(() => {
    return dealerPerformance.filter(dp => dp.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [dealerPerformance, searchTerm]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-7xl mx-auto p-6 font-sans pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted/50 rounded-lg ml-2"><X size={14} /></button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Distribution & Intel")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Radar className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Distribution")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Live tracking of dealer performance, regional dispatches, fleet utilization, and competitor infiltration.")}</p>
          </div>
        </div>

        {/* Global Action Add Buttons depending on active tab */}
        <div>
          {activeTab === "fleet" && (
            <button onClick={() => setIsAddVehicleOpen(true)} className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
              <Plus size={14} /> Add Fleet Vehicle
            </button>
          )}
          {activeTab === "dispatches" && (
            <button onClick={() => setIsAddDispatchOpen(true)} className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
              <Plus size={14} /> New Dispatch Log
            </button>
          )}
          {activeTab === "routes" && (
            <button onClick={() => setIsAddRouteOpen(true)} className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
              <Plus size={14} /> Map New Route
            </button>
          )}
          {activeTab === "competitors" && (
            <button onClick={() => setIsAddCompetitorOpen(true)} className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
              <Plus size={14} /> Add Competitor SKU
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions Navigation Row */}
      <div className="flex flex-wrap gap-2 pt-2">
        {[
          { key: "dealers", label: "Dealer Performance", icon: <TrendingUp size={13} /> },
          { key: "fleet", label: "Fleet Status", icon: <Truck size={13} /> },
          { key: "dispatches", label: "Pending Dispatches", icon: <ClipboardCheck size={13} /> },
          { key: "routes", label: "Routes Map", icon: <Route size={13} /> },
          { key: "infiltration", label: "Infiltration Analytics", icon: <ShieldAlert size={13} /> },
          { key: "outstanding", label: "Outstanding Matrix", icon: <IndianRupee size={13} /> },
          { key: "demands", label: "Market Demands", icon: <Package size={13} /> },
          { key: "competitors", label: "Competitor Analysis", icon: <Crosshair size={13} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as any); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {tab.icon}{t(tab.label)}
          </button>
        ))}
      </div>

      {/* ─── TAB: DEALER PERFORMANCE ─── */}
      {activeTab === "dealers" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search dealers by name…"
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:border-primary font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-background/50">
                    <th className="p-4 font-bold">{t("Dealer Store / Contact")}</th>
                    <th className="p-4 font-bold">{t("Location Pincode")}</th>
                    <th className="p-4 font-bold text-right">{t("YTD Revenue")}</th>
                    <th className="p-4 font-bold text-right">{t("Outstanding Dues")}</th>
                    <th className="p-4 font-bold pl-6">{t("Best Selling Paint")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredDealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-foreground">{dealer.name}</p>
                        <p className="text-[10px] text-muted-foreground">{dealer.phone}</p>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                        <MapPin size={13} className="text-primary" /> {dealer.mockPincode}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-primary">
                        ₹{dealer.totalRevenue.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-mono text-rose-500 font-semibold">
                        {dealer.outstanding > 0 ? `₹${dealer.outstanding.toLocaleString()}` : t("Cleared")}
                      </td>
                      <td className="p-4 pl-6 text-muted-foreground">
                        <span className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-bold">
                          {dealer.mockTopProduct}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredDealers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                        {t("No active dealers match search criteria.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: FLEET STATUS ─── */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:border-primary/20 transition-all relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">{v.plateNumber}</span>
                    <p className="text-xs text-muted-foreground mt-2">{v.type}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                    v.status === "In Transit" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    v.status === "Loading" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    v.status === "Idle" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}>{v.status}</span>
                </div>

                <div className="bg-muted/40 border border-border/30 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Driver:</span><span className="font-bold text-foreground">{v.driverName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Contact:</span><span className="font-mono text-foreground">{v.driverPhone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Load Level:</span><span className="font-black text-primary">{v.capacity}</span></div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-semibold">
                  <Route size={12} className="text-muted-foreground" /> Route: <span className="text-foreground">{v.currentRoute}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: PENDING DISPATCHES ─── */}
      {activeTab === "dispatches" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Dispatch ID</th>
                    <th className="p-4">Dealer Store</th>
                    <th className="p-4">Items / Paint Volume</th>
                    <th className="p-4 text-right">Invoice Value</th>
                    <th className="p-4">Vehicle Mapped</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {dispatches.map(d => (
                    <tr key={d.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{d.id}</td>
                      <td className="p-4 font-bold text-foreground">
                        <p>{d.dealerName}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5 mt-0.5"><MapPin size={10}/> {d.location}</p>
                      </td>
                      <td className="p-4 text-muted-foreground max-w-[200px] truncate" title={d.items}>{d.items}</td>
                      <td className="p-4 text-right font-mono font-bold text-foreground">₹{d.value.toLocaleString()}</td>
                      <td className="p-4 font-mono text-[11px] text-foreground font-semibold">{d.vehiclePlate}</td>
                      <td className="p-4 text-muted-foreground font-semibold">{d.date}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black border ${
                          d.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          d.status === "Out for Delivery" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          d.status === "Dispatched" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" :
                          "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>{d.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: ROUTES MAP ─── */}
      {activeTab === "routes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routes.map(r => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-foreground">{r.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{r.id}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-muted border border-border rounded text-[10px] font-bold text-muted-foreground">{r.stopsCount} Stops</span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mapped Retailers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.mappedDealers.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-background border border-border/80 text-muted-foreground rounded text-[10px] font-semibold">{d}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/40 border border-border/40 rounded-xl p-3 text-xs flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Transit Vehicle</p>
                    <p className="font-mono font-bold text-foreground mt-0.5">{r.assignedVehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Progress</p>
                    <p className="font-black text-primary mt-0.5">{r.progress}%</p>
                  </div>
                </div>

                <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${r.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: INFILTRATION ANALYTICS ─── */}
      {activeTab === "infiltration" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              {t("Regional Sales Heatmap")}
            </h3>
            <div className="space-y-5">
              {heatmapData.map((region, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-foreground font-semibold">{region.location}</span>
                    <span className="font-mono text-muted-foreground">{region.sales}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary rounded-full shadow-md opacity-85"
                      style={{ width: region.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infiltration Quick summary */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-500" />
              Competitor Counter Infiltration
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We monitor shelf space share, promotional push, and pricing schemes run by competitor paint brands at our authorized partner counters.
            </p>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold text-rose-500">Threat Indicators:</p>
              <div className="flex justify-between text-muted-foreground"><span>Asian Paints Apcolite:</span><span className="font-bold text-foreground">High Push</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Berger Weathercoat:</span><span className="font-bold text-foreground">Medium Push</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Nerolac Excel:</span><span className="font-bold text-foreground">Low Push</span></div>
            </div>
            <div className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl border border-amber-500/20 font-semibold">
              ⚠️ Recommendation: Target 10% higher dealer profit schemes to clear competitor stock.
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: OUTSTANDING MATRIX ─── */}
      {activeTab === "outstanding" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Outstanding Ledger Matrix</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage risk levels and collections from dealers with outstanding credits.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-rose-500">₹{dealerPerformance.reduce((a, b) => a + b.outstanding, 0).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Total Credit Exposure</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Dealer Name</th>
                    <th className="p-4">Region</th>
                    <th className="p-4 text-right">Outstanding Credit</th>
                    <th className="p-4 text-center">Credit Age</th>
                    <th className="p-4 text-center">Risk Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {dealerPerformance.filter(d => d.outstanding > 0).map(d => {
                    const isHigh = d.outstanding > 150000;
                    return (
                      <tr key={d.id} className="hover:bg-background/40 transition-colors">
                        <td className="p-4 font-bold text-foreground">{d.name}</td>
                        <td className="p-4 text-muted-foreground">{d.mockPincode}</td>
                        <td className="p-4 text-right font-mono font-black text-rose-500">₹{d.outstanding.toLocaleString()}</td>
                        <td className="p-4 text-center font-bold text-foreground">45 Days</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isHigh ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-amber-500/10 text-amber-550 border border-amber-500/20"
                          }`}>{isHigh ? "CRITICAL RISK" : "NORMAL CREDIT"}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => showToast("success", `Payment reminder notification dispatched to ${d.name}`)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: MARKET DEMANDS ─── */}
      {activeTab === "demands" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Market Demand Charts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Most selling products overall and retail demand patterns.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Sales Share */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-black text-foreground">Top Performing Products (Overall)</h4>
              <div className="space-y-4 pt-2">
                {OVERALL_DEMANDS.map(prod => (
                  <div key={prod.name}>
                    <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                      <span className="text-foreground">{prod.name}</span>
                      <span className="font-mono text-muted-foreground">{prod.salesCount} units ({prod.share})</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/30">
                      <div className="h-full bg-primary rounded-full" style={{ width: prod.share }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dealer Specifc Demands */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-black text-foreground">Dealer-Specific Demanded Paint Categories</h4>
              <div className="space-y-3">
                {dealerPerformance.slice(0, 4).map(dp => (
                  <div key={dp.id} className="flex justify-between items-center bg-muted/30 border border-border/40 p-3 rounded-xl text-xs font-semibold">
                    <div>
                      <p className="text-foreground">{dp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{dp.mockPincode}</p>
                    </div>
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded text-[10px] font-black">{dp.mockTopProduct || "Wall Putty"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Competitor Analysis ─── */}
      {activeTab === "competitors" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Competitor Products Spotted in Markets</p>
              <div className="space-y-4">
                {competitors.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-background border border-border rounded-xl relative group hover:border-rose-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-foreground">{prod.name}</p>
                      <span className="text-[9px] font-black tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase">
                        {prod.sentiment || "High Threat"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Spotted selling at: <span className="text-foreground font-medium">{prod.dealerName}</span>
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[9px] uppercase font-bold">Retail MRP</span>
                        <span className="text-foreground font-semibold">₹{prod.selling_price}</span>
                      </div>
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[9px] uppercase font-bold">Est. Dealer Margin</span>
                        <span className="text-rose-500 font-bold">{Number(prod.marginPercent).toFixed(1)}%</span>
                      </div>
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[9px] uppercase font-bold">Volume Spotted</span>
                        <span className="text-primary font-bold">{prod.totalQtySold || 0} pails</span>
                      </div>
                    </div>
                  </div>
                ))}
                {competitors.length === 0 && (
                  <p className="text-xs text-center py-6 text-muted-foreground">No competitor products cataloged.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-black text-foreground flex items-center gap-1.5"><Crosshair size={16} className="text-rose-500 animate-pulse" /> Infiltration Strategy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sharma Industries tracks external product penetration. Sales team is authorized to extend secondary cash discount coupons to retail points carrying over 30% competitor inventory.
              </p>
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs space-y-1 text-muted-foreground font-semibold">
                <p className="font-bold text-foreground mb-1">Standard Counter Actions:</p>
                <p>1. Target 2.5% points multipliers for premium items</p>
                <p>2. Set localized visual board placements</p>
                <p>3. Offer immediate credit settlement schemes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ADD VEHICLE
      ══════════════════════════════════════════ */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add Fleet Vehicle</h2>
              <button onClick={() => setIsAddVehicleOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Plate Number *</label>
                <input
                  type="text" value={newVehicle.plateNumber}
                  onChange={e => setNewVehicle(v => ({ ...v, plateNumber: e.target.value }))}
                  placeholder="e.g. RJ-14-GA-8923"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Driver Name *</label>
                  <input
                    type="text" value={newVehicle.driverName}
                    onChange={e => setNewVehicle(v => ({ ...v, driverName: e.target.value }))}
                    placeholder="e.g. Mahesh Yadav"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Driver Phone</label>
                  <input
                    type="text" value={newVehicle.driverPhone}
                    onChange={e => setNewVehicle(v => ({ ...v, driverPhone: e.target.value }))}
                    placeholder="98290XXXXX"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Vehicle Type</label>
                  <input
                    type="text" value={newVehicle.type}
                    onChange={e => setNewVehicle(v => ({ ...v, type: e.target.value }))}
                    placeholder="e.g. 10-Ton Truck"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Load level</label>
                  <input
                    type="text" value={newVehicle.capacity}
                    onChange={e => setNewVehicle(v => ({ ...v, capacity: e.target.value }))}
                    placeholder="e.g. 90%"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Status</label>
                  <select value={newVehicle.status} onChange={e => setNewVehicle(v => ({ ...v, status: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                    {["Idle", "In Transit", "Loading", "Maintenance"].map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Active Route</label>
                  <input
                    type="text" value={newVehicle.currentRoute}
                    onChange={e => setNewVehicle(v => ({ ...v, currentRoute: e.target.value }))}
                    placeholder="e.g. Sikar Highway"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddVehicleOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddVehicle} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ADD DISPATCH
      ══════════════════════════════════════════ */}
      {isAddDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">New Dispatch Log</h2>
              <button onClick={() => setIsAddDispatchOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Dealer Store Name *</label>
                <input
                  type="text" value={newDispatch.dealerName}
                  onChange={e => setNewDispatch(d => ({ ...d, dealerName: e.target.value }))}
                  placeholder="e.g. Ravi Paint Store"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Location *</label>
                  <input
                    type="text" value={newDispatch.location}
                    onChange={e => setNewDispatch(d => ({ ...d, location: e.target.value }))}
                    placeholder="e.g. Jaipur West"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Invoice Value (₹) *</label>
                  <input
                    type="number" value={newDispatch.value}
                    onChange={e => setNewDispatch(d => ({ ...d, value: e.target.value }))}
                    placeholder="125000"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Items / Paint Volume *</label>
                <textarea
                  value={newDispatch.items}
                  onChange={e => setNewDispatch(d => ({ ...d, items: e.target.value }))}
                  rows={2} placeholder="Weather Shield (20L) x 15, Wall Putty x 40 Bags"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Assign Truck (Plate)</label>
                  <select value={newDispatch.vehiclePlate} onChange={e => setNewDispatch(d => ({ ...d, vehiclePlate: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.plateNumber}>{v.plateNumber} ({v.driverName})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Status</label>
                  <select value={newDispatch.status} onChange={e => setNewDispatch(d => ({ ...d, status: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                    {["Pending", "Dispatched", "Out for Delivery", "Delivered"].map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddDispatchOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddDispatch} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Log Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ADD ROUTE
      ══════════════════════════════════════════ */}
      {isAddRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Map New Distribution Route</h2>
              <button onClick={() => setIsAddRouteOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Route Name *</label>
                <input
                  type="text" value={newRoute.name}
                  onChange={e => setNewRoute(r => ({ ...r, name: e.target.value }))}
                  placeholder="e.g. Sikar Highway Loop"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Stop Count *</label>
                  <input
                    type="number" value={newRoute.stopsCount}
                    onChange={e => setNewRoute(r => ({ ...r, stopsCount: e.target.value }))}
                    placeholder="5"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Initial Progress (%)</label>
                  <input
                    type="number" value={newRoute.progress}
                    onChange={e => setNewRoute(r => ({ ...r, progress: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Mapped Retailers (comma separated)</label>
                <textarea
                  value={newRoute.mappedDealers}
                  onChange={e => setNewRoute(r => ({ ...r, mappedDealers: e.target.value }))}
                  rows={2} placeholder="Ravi Paint, Hadoti Store, Jodhpur Hub"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Assign Truck</label>
                <select value={newRoute.assignedVehicle} onChange={e => setNewRoute(r => ({ ...r, assignedVehicle: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.plateNumber}>{v.plateNumber}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddRouteOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddRoute} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Map Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ADD Competitor Sku
      ══════════════════════════════════════════ */}
      {isAddCompetitorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add Competitor Product</h2>
              <button onClick={() => setIsAddCompetitorOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Competitor Brand *</label>
                <input
                  type="text" value={newCompetitor.brand}
                  onChange={e => setNewCompetitor(c => ({ ...c, brand: e.target.value }))}
                  placeholder="e.g. Asian Paints"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Product SKU Name *</label>
                <input
                  type="text" value={newCompetitor.productName}
                  onChange={e => setNewCompetitor(c => ({ ...c, productName: e.target.value }))}
                  placeholder="e.g. Apcolite Premium Gloss"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Retail MRP *</label>
                  <input
                    type="number" value={newCompetitor.mrp}
                    onChange={e => setNewCompetitor(c => ({ ...c, mrp: e.target.value }))}
                    placeholder="8500"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Volume Spotted (Pails)</label>
                  <input
                    type="number" value={newCompetitor.totalQtySold}
                    onChange={e => setNewCompetitor(c => ({ ...c, totalQtySold: e.target.value }))}
                    placeholder="25"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Spotted at (Dealer Store)</label>
                  <input
                    type="text" value={newCompetitor.dealerName}
                    onChange={e => setNewCompetitor(c => ({ ...c, dealerName: e.target.value }))}
                    placeholder="e.g. Ravi Paint Store"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Threat Sentiment</label>
                  <select value={newCompetitor.sentiment} onChange={e => setNewCompetitor(c => ({ ...c, sentiment: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                    {["Low Threat", "Medium Threat", "High Threat", "Critical Threat"].map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddCompetitorOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddCompetitor} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Register SKU
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
