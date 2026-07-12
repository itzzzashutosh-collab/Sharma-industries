"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import {
  Users, Search, CheckCircle2, XCircle, MapPin, Building2, AlertTriangle,
  FileText, Check, X, ExternalLink, Plus, Phone, CreditCard, Target,
  TrendingUp, Activity, DollarSign, Award, Calendar, ClipboardList,
  Briefcase, UserCheck, Mail, MessageCircle, Printer, Eye, ChevronDown,
  BadgeCheck, Banknote, BarChart3, Route, Clock, Shield
} from "lucide-react";
import { DealerOnboardingModal } from "./DealerOnboardingModal";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── TYPES ───
interface DBDealer {
  id: string; name: string; address: string; localities: string;
  designation: string; gst_number: string; assigned_salesman_id: string;
  pan_card_url: string; aadhaar_front_url: string; aadhaar_back_url: string;
  created_at: string;
}

interface SalesmanAdmin {
  id: string; name: string; phone: string; email: string;
  assignedRegion: string; status: "Pending" | "Approved" | "Inactive";
  dateOfJoining: string; emergencyContact: string;
  idProofStatus: "Uploaded" | "Missing";
  assignedDistricts: string[]; designation: string;
  aadhar: string; pan: string;
  bankName: string; accountNo: string; ifsc: string;
  salary: number; incentiveRate: number;
  targetMonthly: number; achievedMonthly: number;
  totalCollections: number; totalVisits: number;
}

// ─── RICH MOCK DATA ───
const MOCK_SALESMEN: SalesmanAdmin[] = [
  {
    id: "SS-1001", name: "Rajesh Kumar", phone: "+91 9876543210",
    email: "rajesh.kumar@sharmaindustries.in", assignedRegion: "Rajasthan East",
    status: "Approved", dateOfJoining: "2025-02-15", designation: "Senior Sales Executive",
    emergencyContact: "+91 9123456780 (Wife)", idProofStatus: "Uploaded",
    assignedDistricts: ["Jaipur", "Dausa", "Alwar"],
    aadhar: "2345 6789 0123", pan: "ABCPK1234R",
    bankName: "State Bank of India", accountNo: "40123456789", ifsc: "SBIN0001234",
    salary: 28000, incentiveRate: 2.5,
    targetMonthly: 800000, achievedMonthly: 920000,
    totalCollections: 2450000, totalVisits: 142
  },
  {
    id: "SS-1002", name: "Vikram Singh", phone: "+91 9988776655",
    email: "vikram.singh@sharmaindustries.in", assignedRegion: "Rajasthan West",
    status: "Approved", dateOfJoining: "2025-04-10", designation: "Sales Executive",
    emergencyContact: "+91 9988776656 (Brother)", idProofStatus: "Uploaded",
    assignedDistricts: ["Jodhpur", "Barmer", "Jaisalmer"],
    aadhar: "3456 7890 1234", pan: "BCDPK2345S",
    bankName: "Punjab National Bank", accountNo: "30987654321", ifsc: "PUNB0023400",
    salary: 22000, incentiveRate: 2.0,
    targetMonthly: 600000, achievedMonthly: 545000,
    totalCollections: 1780000, totalVisits: 98
  },
  {
    id: "SS-1003", name: "Amit Desai", phone: "+91 9001122334",
    email: "amit.desai@sharmaindustries.in", assignedRegion: "Rajasthan North",
    status: "Pending", dateOfJoining: "Pending Approval", designation: "Junior Sales Executive",
    emergencyContact: "+91 9001122335 (Father)", idProofStatus: "Missing",
    assignedDistricts: [],
    aadhar: "4567 8901 2345", pan: "CDEPK3456T",
    bankName: "HDFC Bank", accountNo: "", ifsc: "",
    salary: 18000, incentiveRate: 1.5,
    targetMonthly: 400000, achievedMonthly: 0,
    totalCollections: 0, totalVisits: 0
  },
  {
    id: "SS-1004", name: "Sanjay Patel", phone: "+91 9112233445",
    email: "sanjay.patel@sharmaindustries.in", assignedRegion: "Rajasthan South",
    status: "Pending", dateOfJoining: "Pending Approval", designation: "Sales Executive",
    emergencyContact: "+91 9112233446 (Mother)", idProofStatus: "Uploaded",
    assignedDistricts: [],
    aadhar: "5678 9012 3456", pan: "DEFPK4567U",
    bankName: "Canara Bank", accountNo: "3214567890", ifsc: "CNRB0001122",
    salary: 22000, incentiveRate: 2.0,
    targetMonthly: 550000, achievedMonthly: 0,
    totalCollections: 0, totalVisits: 0
  },
  {
    id: "SS-1005", name: "Karan Mehra", phone: "+91 9554433221",
    email: "karan.mehra@sharmaindustries.in", assignedRegion: "Rajasthan Central",
    status: "Inactive", dateOfJoining: "2024-01-20", designation: "Senior Sales Executive",
    emergencyContact: "+91 9554433222 (Spouse)", idProofStatus: "Uploaded",
    assignedDistricts: ["Ajmer", "Tonk"],
    aadhar: "6789 0123 4567", pan: "EFGPK5678V",
    bankName: "ICICI Bank", accountNo: "12345678901", ifsc: "ICIC0001234",
    salary: 26000, incentiveRate: 2.5,
    targetMonthly: 700000, achievedMonthly: 320000,
    totalCollections: 4200000, totalVisits: 215
  }
];

const DUMMY_VISITS = [
  { id: "V-001", salesmanId: "SS-1001", salesmanName: "Rajesh Kumar", dealer: "Ravi Paint Store", location: "Jaipur", date: "2026-07-11", purpose: "Order Collection", outcome: "Order placed ₹45,000", status: "Completed" },
  { id: "V-002", salesmanId: "SS-1001", salesmanName: "Rajesh Kumar", dealer: "Sharma Hardware", location: "Dausa", date: "2026-07-10", purpose: "Payment Follow-up", outcome: "Collected ₹28,000", status: "Completed" },
  { id: "V-003", salesmanId: "SS-1002", salesmanName: "Vikram Singh", dealer: "Jodhpur Paint Hub", location: "Jodhpur", date: "2026-07-11", purpose: "Product Demo", outcome: "Demo done, quote sent", status: "Completed" },
  { id: "V-004", salesmanId: "SS-1001", salesmanName: "Rajesh Kumar", dealer: "Modern Decor Jaipur", location: "Jaipur", date: "2026-07-12", purpose: "New Product Launch", outcome: "Meeting scheduled", status: "Pending" },
];

const DUMMY_COLLECTIONS = [
  { id: "COL-001", salesmanId: "SS-1001", salesmanName: "Rajesh Kumar", dealer: "Ravi Paint Store", amount: 45000, date: "2026-07-11", mode: "NEFT", reference: "NEFT2026071100123", status: "Settled" },
  { id: "COL-002", salesmanId: "SS-1001", salesmanName: "Rajesh Kumar", dealer: "Sharma Hardware", amount: 28000, date: "2026-07-10", mode: "Cheque", reference: "CHQ-8823", status: "Settled" },
  { id: "COL-003", salesmanId: "SS-1002", salesmanName: "Vikram Singh", dealer: "Jodhpur Paint Hub", amount: 65000, date: "2026-07-09", mode: "Cash", reference: "CASH-2026", status: "Settled" },
  { id: "COL-004", salesmanId: "SS-1001", salesmanName: "Rajesh Kumar", dealer: "Modern Decor Jaipur", amount: 30000, date: "2026-07-08", mode: "UPI", reference: "UPI-789012", status: "Pending" },
];

const DUMMY_ACTIVITY = [
  { id: "ACT-001", salesmanId: "SS-1001", type: "Visit", desc: "Visited Ravi Paint Store, Jaipur", time: "2026-07-11 10:30 AM" },
  { id: "ACT-002", salesmanId: "SS-1001", type: "Collection", desc: "Collected ₹45,000 via NEFT from Ravi Paint Store", time: "2026-07-11 02:15 PM" },
  { id: "ACT-003", salesmanId: "SS-1002", type: "Visit", desc: "Product demo at Jodhpur Paint Hub", time: "2026-07-11 11:00 AM" },
  { id: "ACT-004", salesmanId: "SS-1001", type: "Order", desc: "New order ₹80,000 booked from Sharma Hardware", time: "2026-07-10 03:45 PM" },
  { id: "ACT-005", salesmanId: "SS-1001", type: "Call", desc: "Follow-up call to Modern Decor Jaipur — payment pending", time: "2026-07-12 09:00 AM" },
];

const DUMMY_INPUTS = [
  { id: "INP-001", salesmanId: "SS-1001", type: "Sample Kit", desc: "10x Weather Shield Exterior samples", quantity: 10, date: "2026-07-01", status: "Issued" },
  { id: "INP-002", salesmanId: "SS-1001", type: "Brochure", desc: "Sharma Paints Product Catalog 2026", quantity: 50, date: "2026-07-01", status: "Issued" },
  { id: "INP-003", salesmanId: "SS-1002", type: "Sample Kit", desc: "5x Rustic Royale Interior samples", quantity: 5, date: "2026-07-05", status: "Issued" },
  { id: "INP-004", salesmanId: "SS-1001", type: "Scheme Card", desc: "Monsoon Bonus Scheme Cards", quantity: 100, date: "2026-07-08", status: "Issued" },
];

type TabType = "executives" | "territories" | "targets" | "performance" | "visits" | "collections" | "activity" | "incentives" | "approvals" | "ids" | "inputs";

import { onboardSalesman, approveSalesman } from "./actions";

export default function SalesTeamAdminClient({ initialData }: { initialData: any }) {
  const { t } = useLanguage();
  const [salesmen, setSalesmen] = useState<SalesmanAdmin[]>(initialData.executives.length > 0 ? initialData.executives : MOCK_SALESMEN);
  const [visits, setVisits] = useState<any[]>(initialData.visits.length > 0 ? initialData.visits : DUMMY_VISITS);
  const [collections, setCollections] = useState<any[]>(initialData.collections.length > 0 ? initialData.collections : DUMMY_COLLECTIONS);
  const [activities, setActivities] = useState<any[]>(initialData.activities.length > 0 ? initialData.activities : DUMMY_ACTIVITY);
  const [inputs, setInputs] = useState<any[]>(initialData.inputs.length > 0 ? initialData.inputs : DUMMY_INPUTS);
  
  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("executives");
  const [selectedSalesman, setSelectedSalesman] = useState<SalesmanAdmin | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isAddSalesmanOpen, setIsAddSalesmanOpen] = useState(false);
  const [isEnrollmentLetterOpen, setIsEnrollmentLetterOpen] = useState<SalesmanAdmin | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // New Salesman Form
  const [newSalesman, setNewSalesman] = useState({
    name: "", phone: "", email: "", designation: "Sales Executive",
    assignedRegion: "", aadhar: "", pan: "",
    bankName: "", accountNo: "", ifsc: "",
    salary: "", incentiveRate: "", emergencyContact: ""
  });

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDealers = async () => {
    const { data, error } = await supabase.from("dealers").select("*").order("created_at", { ascending: false });
    if (data && !error) setDealers(data);
  };

  useEffect(() => { fetchDealers(); }, []);

  const filteredSalesmen = useMemo(() => {
    return salesmen.filter(sm => sm.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [salesmen, searchTerm]);

  const approvedSalesmen = salesmen.filter(s => s.status === "Approved");
  const pendingSalesmen = salesmen.filter(s => s.status === "Pending");

  const getAssignedDealers = (salesmanId: string) => dealers.filter(d => d.assigned_salesman_id === salesmanId);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveSalesman(id);
      if (res.success) {
        setSalesmen(prev => prev.map(sm => sm.id === id
          ? { ...sm, status: "Approved", dateOfJoining: new Date().toISOString().split("T")[0], idProofStatus: "Uploaded" }
          : sm
        ));
        showToast("success", "Salesman approved successfully!");
      } else {
        showToast("error", "Failed to approve salesman.");
      }
    });
  };

  const handleReject = (id: string) => {
    setSalesmen(prev => prev.map(sm => sm.id === id ? { ...sm, status: "Inactive" } : sm));
    showToast("error", "Application rejected.");
  };

  const handleAddSalesman = () => {
    if (!newSalesman.name || !newSalesman.phone || !newSalesman.assignedRegion) {
      showToast("error", "Name, phone and region are required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: newSalesman.name,
        phone: newSalesman.phone,
        email: newSalesman.email,
        designation: newSalesman.designation,
        assignedRegion: newSalesman.assignedRegion,
        aadhar: newSalesman.aadhar,
        pan: newSalesman.pan,
        bankName: newSalesman.bankName,
        accountNo: newSalesman.accountNo,
        ifsc: newSalesman.ifsc,
        salary: Number(newSalesman.salary) || 0,
        incentive_rate: Number(newSalesman.incentiveRate) || 1.5,
        emergencyContact: newSalesman.emergencyContact
      };

      const res = await onboardSalesman(payload);
      if (res.success) {
        const created: SalesmanAdmin = {
          id: `SS-${Date.now().toString().slice(-4)}`,
          name: payload.name, phone: payload.phone, email: payload.email,
          assignedRegion: payload.assignedRegion, designation: payload.designation,
          status: "Pending", dateOfJoining: "Pending Approval",
          emergencyContact: payload.emergencyContact, idProofStatus: "Missing",
          assignedDistricts: [],
          aadhar: payload.aadhar, pan: payload.pan,
          bankName: payload.bankName, accountNo: payload.accountNo, ifsc: payload.ifsc,
          salary: payload.salary,
          incentiveRate: payload.incentive_rate,
          targetMonthly: 400000, achievedMonthly: 0,
          totalCollections: 0, totalVisits: 0
        };

        setSalesmen(prev => [created, ...prev]);
        setNewSalesman({ name: "", phone: "", email: "", designation: "Sales Executive", assignedRegion: "", aadhar: "", pan: "", bankName: "", accountNo: "", ifsc: "", salary: "", incentiveRate: "", emergencyContact: "" });
        setIsAddSalesmanOpen(false);
        showToast("success", `${created.name} added as ${created.designation}!`);
      } else {
        showToast("error", "Failed to onboard salesman.");
      }
    });
  };

  const NAV_TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "executives", label: "Sales Executives", icon: <Users size={13} /> },
    { key: "territories", label: "Territories", icon: <MapPin size={13} /> },
    { key: "targets", label: "Targets", icon: <Target size={13} /> },
    { key: "performance", label: "Performance", icon: <TrendingUp size={13} /> },
    { key: "visits", label: "Visits", icon: <Route size={13} /> },
    { key: "collections", label: "Collections", icon: <Banknote size={13} /> },
    { key: "activity", label: "Activity", icon: <Activity size={13} /> },
    { key: "incentives", label: "Incentives", icon: <Award size={13} /> },
    { key: "approvals", label: "Approvals", icon: <Shield size={13} />, },
    { key: "ids", label: "IDs & Bank Accounts", icon: <CreditCard size={13} /> },
    { key: "inputs", label: "Input Records", icon: <ClipboardList size={13} /> },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-sans">

      {/* Toast */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted/50 rounded-lg transition-colors ml-2"><X size={14} /></button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>{t("Home")}</span><span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Sales Team")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Users className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Sales Team Management</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Manage executives, territories, targets, visits, collections, and incentives.</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddSalesmanOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Add New Salesman
          </button>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Executives", value: salesmen.length, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active / Approved", value: approvedSalesmen.length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Pending Approvals", value: pendingSalesmen.length, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Total Territories", value: new Set(salesmen.flatMap(s => s.assignedDistricts)).size, color: "text-violet-500", bg: "bg-violet-500/10" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border border-border/50 rounded-2xl p-4 flex items-center gap-3`}>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-muted-foreground leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Nav Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {NAV_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-muted text-foreground border-border/80"
                  : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
              }`}
            >
              {tab.icon}{tab.label}
              {tab.key === "approvals" && pendingSalesmen.length > 0 && (
                <span className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-pulse">{pendingSalesmen.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB: SALES EXECUTIVES ─── */}
      {activeTab === "executives" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name…"
                className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Salesman", "Designation", "Phone / Email", "Region", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="py-4 px-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredSalesmen.map(sm => (
                    <tr key={sm.id} onClick={() => sm.status === "Approved" && setSelectedSalesman(sm)}
                      className={`hover:bg-muted/20 transition-colors ${sm.status === "Approved" ? "cursor-pointer" : ""}`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{sm.name[0]}</div>
                          <div>
                            <p className="font-black text-sm text-foreground">{sm.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{sm.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs font-semibold text-muted-foreground">{sm.designation}</td>
                      <td className="py-4 px-5">
                        <p className="font-mono text-xs text-foreground">{sm.phone}</p>
                        <p className="text-[10px] text-muted-foreground">{sm.email}</p>
                      </td>
                      <td className="py-4 px-5 text-xs font-semibold text-foreground">{sm.assignedRegion}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${
                          sm.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          sm.status === "Pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>{sm.status}</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground font-semibold">{sm.dateOfJoining}</td>
                      <td className="py-4 px-5" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {sm.status === "Approved" && (
                            <button onClick={() => setIsEnrollmentLetterOpen(sm)}
                              className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer">
                              <FileText size={11} /> Letter
                            </button>
                          )}
                          {sm.status === "Pending" && (
                            <>
                              <button onClick={() => handleReject(sm.id)} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-all cursor-pointer"><X size={14} /></button>
                              <button onClick={() => handleApprove(sm.id)} className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"><Check size={13} /> Approve</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: TERRITORIES ─── */}
      {activeTab === "territories" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Territory Mapping</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Districts and regions assigned to each sales executive.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {approvedSalesmen.map(sm => (
              <div key={sm.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{sm.name[0]}</div>
                  <div>
                    <p className="font-black text-sm text-foreground">{sm.name}</p>
                    <p className="text-xs text-muted-foreground">{sm.assignedRegion} · {sm.id}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Assigned Districts ({sm.assignedDistricts.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {sm.assignedDistricts.length === 0
                      ? <p className="text-xs text-muted-foreground italic">No districts assigned</p>
                      : sm.assignedDistricts.map(d => (
                        <span key={d} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold">{d}</span>
                      ))}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3 text-xs">
                  <span className="text-muted-foreground">Mapped Dealers: <span className="font-bold text-foreground">{getAssignedDealers(sm.id).length}</span></span>
                  <button onClick={() => setSelectedSalesman(sm)} className="text-primary font-bold hover:underline cursor-pointer">View Details →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: TARGETS ─── */}
      {activeTab === "targets" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Monthly Sales Targets</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Track individual targets vs achieved for the current month.</p>
          </div>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Salesman", "Region", "Monthly Target", "Achieved", "Achievement %", "Progress"].map(h => (
                      <th key={h} className="py-4 px-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {approvedSalesmen.map(sm => {
                    const pct = Math.min(100, Math.round((sm.achievedMonthly / sm.targetMonthly) * 100));
                    return (
                      <tr key={sm.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 px-5">
                          <p className="font-black text-sm text-foreground">{sm.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{sm.id}</p>
                        </td>
                        <td className="py-4 px-5 text-xs text-muted-foreground font-semibold">{sm.assignedRegion}</td>
                        <td className="py-4 px-5 font-mono font-bold text-foreground">₹{sm.targetMonthly.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-5 font-mono font-bold text-foreground">₹{sm.achievedMonthly.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-5">
                          <span className={`font-black text-sm ${pct >= 100 ? "text-emerald-500" : pct >= 75 ? "text-amber-500" : "text-rose-500"}`}>{pct}%</span>
                        </td>
                        <td className="py-4 px-5 w-48">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
                          </div>
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

      {/* ─── TAB: PERFORMANCE ─── */}
      {activeTab === "performance" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Performance Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Lifetime performance metrics including visits, collections, and targets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approvedSalesmen.map(sm => {
              const pct = Math.min(100, Math.round((sm.achievedMonthly / sm.targetMonthly) * 100));
              return (
                <div key={sm.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{sm.name[0]}</div>
                    <div>
                      <p className="font-black text-sm text-foreground">{sm.name}</p>
                      <p className="text-[10px] text-muted-foreground">{sm.designation}</p>
                    </div>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black border ${pct >= 100 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : pct >= 75 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>{pct}% Target</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xl font-black text-foreground">{sm.totalVisits}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Total Visits</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xl font-black text-foreground">₹{(sm.totalCollections / 100000).toFixed(1)}L</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Lifetime Collections</p>
                    </div>
                  </div>
                  <div className="bg-muted/40 border border-border/40 rounded-xl p-3 flex justify-between text-xs">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Monthly Target</p>
                      <p className="font-black text-foreground">₹{(sm.targetMonthly / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Achieved</p>
                      <p className="font-black text-foreground">₹{(sm.achievedMonthly / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB: VISITS ─── */}
      {activeTab === "visits" && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Visit Records</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Track all dealer/client visit logs by sales executive.</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Visit ID", "Salesman", "Dealer / Client", "Location", "Date", "Purpose", "Outcome", "Status"].map(h => (
                      <th key={h} className="py-3.5 px-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {DUMMY_VISITS.map(v => (
                    <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-primary font-bold">{v.id}</td>
                      <td className="py-3.5 px-5 font-semibold text-foreground text-xs">{v.salesmanName}</td>
                      <td className="py-3.5 px-5 font-semibold text-foreground text-xs">{v.dealer}</td>
                      <td className="py-3.5 px-5 text-xs text-muted-foreground">{v.location}</td>
                      <td className="py-3.5 px-5 text-xs text-muted-foreground">{v.date}</td>
                      <td className="py-3.5 px-5 text-xs text-foreground font-semibold">{v.purpose}</td>
                      <td className="py-3.5 px-5 text-xs text-muted-foreground">{v.outcome}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${v.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: COLLECTIONS ─── */}
      {activeTab === "collections" && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Collections Register</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All cash/cheque/online collections submitted by sales executives.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-foreground">₹{DUMMY_COLLECTIONS.reduce((a, c) => a + c.amount, 0).toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Total Collected</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Collection ID", "Salesman", "Dealer", "Amount", "Date", "Mode", "Reference", "Status"].map(h => (
                      <th key={h} className="py-3.5 px-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {DUMMY_COLLECTIONS.map(c => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-primary font-bold">{c.id}</td>
                      <td className="py-3.5 px-5 font-semibold text-foreground text-xs">{c.salesmanName}</td>
                      <td className="py-3.5 px-5 font-semibold text-foreground text-xs">{c.dealer}</td>
                      <td className="py-3.5 px-5 font-mono font-black text-foreground">₹{c.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-5 text-xs text-muted-foreground">{c.date}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-muted text-foreground border border-border">{c.mode}</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[10px] text-muted-foreground">{c.reference}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${c.status === "Settled" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: ACTIVITY ─── */}
      {activeTab === "activity" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Activity Feed</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time activity log of all salesman actions.</p>
          </div>
          <div className="space-y-3">
            {DUMMY_ACTIVITY.map(act => (
              <div key={act.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 hover:border-primary/20 transition-all">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  act.type === "Visit" ? "bg-blue-500/10 text-blue-500" :
                  act.type === "Collection" ? "bg-emerald-500/10 text-emerald-500" :
                  act.type === "Order" ? "bg-violet-500/10 text-violet-500" :
                  "bg-amber-500/10 text-amber-500"
                }`}>
                  {act.type === "Visit" ? <Route size={15} /> : act.type === "Collection" ? <Banknote size={15} /> : act.type === "Order" ? <ClipboardList size={15} /> : <Phone size={15} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{act.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border shrink-0 ${
                  act.type === "Visit" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  act.type === "Collection" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  act.type === "Order" ? "bg-violet-500/10 text-violet-500 border-violet-500/20" :
                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}>{act.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: INCENTIVES ─── */}
      {activeTab === "incentives" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Incentive Structure & Payouts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Incentive rates applied on achieved sales and payout calculations per executive.</p>
          </div>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Salesman", "Base Salary", "Incentive Rate", "Monthly Achieved", "Incentive Earned", "Total Payout", "Action"].map(h => (
                      <th key={h} className="py-4 px-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {approvedSalesmen.map(sm => {
                    const incentive = Math.round((sm.achievedMonthly * sm.incentiveRate) / 100);
                    const total = sm.salary + incentive;
                    return (
                      <tr key={sm.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 px-5">
                          <p className="font-black text-sm text-foreground">{sm.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{sm.id}</p>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-foreground">₹{sm.salary.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-5">
                          <span className="font-black text-amber-500 font-mono">{sm.incentiveRate}%</span>
                          <span className="text-[10px] text-muted-foreground ml-1">on achieved</span>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-foreground">₹{sm.achievedMonthly.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-5 font-mono font-black text-emerald-500">₹{incentive.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-5 font-mono font-black text-foreground text-base">₹{total.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-5">
                          <button className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer">
                            Process Payout
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

      {/* ─── TAB: APPROVALS ─── */}
      {activeTab === "approvals" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Approval Queue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Review and approve or reject pending salesman applications.</p>
          </div>
          {pendingSalesmen.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500/30 mb-3" />
              <p className="text-sm font-bold text-muted-foreground">All caught up! No pending approvals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingSalesmen.map(sm => (
                <div key={sm.id} className="bg-card border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-lg">{sm.name[0]}</div>
                    <div>
                      <p className="font-black text-base text-foreground">{sm.name}</p>
                      <p className="text-xs text-muted-foreground">{sm.designation} · {sm.id}</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black rounded-full">PENDING</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Phone", val: sm.phone },
                      { label: "Region", val: sm.assignedRegion },
                      { label: "Aadhar", val: sm.aadhar || "—" },
                      { label: "PAN", val: sm.pan || "—" },
                      { label: "ID Proof", val: sm.idProofStatus },
                      { label: "Emergency", val: sm.emergencyContact },
                    ].map(row => (
                      <div key={row.label} className="bg-muted/30 border border-border/40 rounded-xl p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">{row.label}</p>
                        <p className="font-semibold text-foreground truncate">{row.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-border">
                    <button onClick={() => handleReject(sm.id)} className="flex-1 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black rounded-xl hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                      <X size={14} /> Reject Application
                    </button>
                    <button onClick={() => handleApprove(sm.id)} className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                      <Check size={14} /> Approve & Activate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: IDs & BANK ACCOUNTS ─── */}
      {activeTab === "ids" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">ID Cards & Bank Account Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Salesman KYC, Aadhar, PAN, and bank account details for payroll and verification.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {approvedSalesmen.map(sm => (
              <div key={sm.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 hover:shadow-md transition-all">
                {/* ID Card Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-2xl border border-primary/30">{sm.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-black text-base text-foreground">{sm.name}</p>
                    <p className="text-xs text-muted-foreground">{sm.designation}</p>
                    <p className="text-xs font-mono text-primary font-bold mt-1">{sm.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Joined</p>
                    <p className="text-xs font-bold text-foreground">{sm.dateOfJoining}</p>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full font-black">ACTIVE</span>
                  </div>
                </div>

                {/* KYC Details */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">KYC Documents</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Aadhar Number</p>
                      <p className="font-mono font-black text-foreground mt-1">{sm.aadhar || "—"}</p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">PAN Number</p>
                      <p className="font-mono font-black text-foreground mt-1">{sm.pan || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Bank Account</p>
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Bank Name</span>
                      <span className="font-bold text-foreground">{sm.bankName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Account No.</span>
                      <span className="font-mono font-black text-foreground">{sm.accountNo || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">IFSC Code</span>
                      <span className="font-mono font-bold text-foreground">{sm.ifsc || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Region */}
                <div className="flex justify-between text-xs border-t border-border/40 pt-3">
                  <span className="text-muted-foreground">{sm.phone}</span>
                  <span className="font-semibold text-foreground">{sm.assignedRegion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: INPUT RECORDS ─── */}
      {activeTab === "inputs" && (
        <div className="space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Input Records</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sample kits, brochures, scheme cards and other inputs issued to salesmen.</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Input ID", "Salesman", "Type", "Description", "Quantity", "Date Issued", "Status"].map(h => (
                      <th key={h} className="py-3.5 px-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {DUMMY_INPUTS.map(inp => {
                    const sm = salesmen.find(s => s.id === inp.salesmanId);
                    return (
                      <tr key={inp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-xs text-primary font-bold">{inp.id}</td>
                        <td className="py-3.5 px-5 font-semibold text-foreground text-xs">{sm?.name ?? inp.salesmanId}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            inp.type === "Sample Kit" ? "bg-violet-500/10 text-violet-500 border-violet-500/20" :
                            inp.type === "Brochure" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>{inp.type}</span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-muted-foreground">{inp.desc}</td>
                        <td className="py-3.5 px-5 font-bold text-foreground text-center">{inp.quantity}</td>
                        <td className="py-3.5 px-5 text-xs text-muted-foreground">{inp.date}</td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{inp.status}</span>
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

      {/* ══════════════════════════════════════════
          SLIDE-OUT DRAWER: SALESMAN DETAIL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSalesman && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedSalesman(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">{selectedSalesman.name[0]}</div>
                  <div>
                    <h2 className="text-base font-black text-foreground">{selectedSalesman.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{selectedSalesman.id} · {selectedSalesman.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSalesman(null)} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"><X size={18} /></button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
                {/* KYC */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2"><FileText size={14} /> Personal & KYC</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Date of Joining", val: selectedSalesman.dateOfJoining },
                      { label: "Designation", val: selectedSalesman.designation },
                      { label: "Aadhar", val: selectedSalesman.aadhar || "—" },
                      { label: "PAN", val: selectedSalesman.pan || "—" },
                      { label: "Emergency Contact", val: selectedSalesman.emergencyContact },
                      { label: "Email", val: selectedSalesman.email },
                    ].map(row => (
                      <div key={row.label} className="bg-muted/30 border border-border/50 p-3 rounded-xl">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{row.label}</p>
                        <p className="font-semibold text-foreground mt-0.5 text-xs">{row.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border/40" />

                {/* Bank */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Banknote size={14} /> Bank Account</h3>
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-2 text-xs">
                    {[["Bank", selectedSalesman.bankName], ["Account No.", selectedSalesman.accountNo], ["IFSC", selectedSalesman.ifsc]].map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono font-bold text-foreground">{v || "—"}</span></div>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border/40" />

                {/* Territory */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2"><MapPin size={14} /> Territory Mapping</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSalesman.assignedDistricts.length === 0
                      ? <p className="text-xs text-muted-foreground italic">No districts assigned.</p>
                      : selectedSalesman.assignedDistricts.map(d => <span key={d} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold">{d}</span>)
                    }
                  </div>
                </div>
                <div className="h-px bg-border/40" />

                {/* Dealers */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Building2 size={14} /> Mapped Dealers ({getAssignedDealers(selectedSalesman.id).length})</h3>
                    <button onClick={() => setIsOnboardingModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer">+ Onboard Partner</button>
                  </div>
                  {getAssignedDealers(selectedSalesman.id).length === 0
                    ? <p className="text-xs text-muted-foreground italic">No dealers mapped yet.</p>
                    : getAssignedDealers(selectedSalesman.id).map(d => (
                      <div key={d.id} className="bg-muted/20 border border-border/50 rounded-xl p-3 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-foreground">{d.name}</p>
                          <p className="text-muted-foreground text-[10px]">{d.address}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-muted border border-border rounded font-black text-muted-foreground">{d.designation}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-border bg-muted/20 flex gap-3 shrink-0">
                <button onClick={() => setIsEnrollmentLetterOpen(selectedSalesman)} className="flex-1 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <FileText size={14} /> Generate Letter
                </button>
                <button onClick={() => setSelectedSalesman(null)} className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MODAL: ADD NEW SALESMAN
      ══════════════════════════════════════════ */}
      {isAddSalesmanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add New Salesman</h2>
              <button onClick={() => setIsAddSalesmanOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name *", key: "name", placeholder: "Ramesh Sharma", type: "text" },
                { label: "Phone *", key: "phone", placeholder: "+91 9876543210", type: "text" },
                { label: "Email", key: "email", placeholder: "name@sharmaindustries.in", type: "email" },
                { label: "Emergency Contact", key: "emergencyContact", placeholder: "+91 9xxx (Relation)", type: "text" },
                { label: "Assigned Region *", key: "assignedRegion", placeholder: "e.g. Rajasthan North", type: "text" },
                { label: "Aadhar Number", key: "aadhar", placeholder: "XXXX XXXX XXXX", type: "text" },
                { label: "PAN Number", key: "pan", placeholder: "ABCDE1234F", type: "text" },
                { label: "Bank Name", key: "bankName", placeholder: "State Bank of India", type: "text" },
                { label: "Account Number", key: "accountNo", placeholder: "1234567890", type: "text" },
                { label: "IFSC Code", key: "ifsc", placeholder: "SBIN0001234", type: "text" },
                { label: "Base Salary (₹)", key: "salary", placeholder: "22000", type: "number" },
                { label: "Incentive Rate (%)", key: "incentiveRate", placeholder: "2.0", type: "number" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={(newSalesman as any)[field.key]}
                    onChange={e => setNewSalesman(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Designation</label>
                <select value={newSalesman.designation} onChange={e => setNewSalesman(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                  {["Junior Sales Executive", "Sales Executive", "Senior Sales Executive", "Area Sales Manager"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setIsAddSalesmanOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddSalesman} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Add Salesman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ENROLLMENT LETTER
      ══════════════════════════════════════════ */}
      {isEnrollmentLetterOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
            {/* Actions Bar */}
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h2 className="text-sm font-black text-foreground">Enrollment / Appointment Letter</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const phoneRaw = isEnrollmentLetterOpen.phone.replace(/\D/g, "");
                    const msg = encodeURIComponent(`Dear ${isEnrollmentLetterOpen.name}, your enrollment letter from Sharma Industries has been issued. ID: ${isEnrollmentLetterOpen.id}. Welcome aboard! — Sharma Industries Management`);
                    window.open(`https://wa.me/${phoneRaw}?text=${msg}`, "_blank");
                  }}
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} /> WhatsApp
                </button>
                <button
                  onClick={() => {
                    const mail = `mailto:${isEnrollmentLetterOpen.email}?subject=Enrollment Letter — Sharma Industries&body=Dear ${isEnrollmentLetterOpen.name},%0A%0AWelcome to Sharma Industries as ${isEnrollmentLetterOpen.designation}.%0A%0AYour Employee ID: ${isEnrollmentLetterOpen.id}%0ARegion: ${isEnrollmentLetterOpen.assignedRegion}%0ADate of Joining: ${isEnrollmentLetterOpen.dateOfJoining}%0A%0ARegards,%0AManagement%0ASharma Industries`;
                    window.open(mail, "_blank");
                  }}
                  className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail size={13} /> Email
                </button>
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-muted border border-border text-foreground hover:bg-muted/70 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Printer size={13} /> Print
                </button>
                <button onClick={() => setIsEnrollmentLetterOpen(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
              </div>
            </div>

            {/* Letter Content */}
            <div className="p-8 space-y-6 font-serif text-sm text-foreground">
              {/* Letterhead */}
              <div className="text-center border-b border-border pb-5">
                <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Sharma Industries</h1>
                <p className="text-xs text-muted-foreground mt-1">Paint Manufacturing & Distribution · Rajasthan, India</p>
                <p className="text-xs text-muted-foreground">contact@sharmaindustries.in | +91 XXXXX XXXXX</p>
              </div>

              {/* Letter Metadata */}
              <div className="flex justify-between text-xs">
                <div><span className="font-bold">Ref No:</span> SI/SALES/{isEnrollmentLetterOpen.id}/{new Date().getFullYear()}</div>
                <div><span className="font-bold">Date:</span> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-base font-black uppercase tracking-wider underline underline-offset-4">Appointment / Enrollment Letter</h2>
              </div>

              {/* Addressee */}
              <div className="space-y-1 text-sm">
                <p className="font-bold">To,</p>
                <p>{isEnrollmentLetterOpen.name}</p>
                <p className="text-muted-foreground">{isEnrollmentLetterOpen.phone} · {isEnrollmentLetterOpen.email}</p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                <p>Dear <strong>{isEnrollmentLetterOpen.name}</strong>,</p>
                <p>
                  We are pleased to inform you that you have been appointed as <strong>{isEnrollmentLetterOpen.designation}</strong> at <strong>Sharma Industries</strong>, effective from <strong>{isEnrollmentLetterOpen.dateOfJoining}</strong>.
                </p>
                <p>
                  You have been assigned to the <strong>{isEnrollmentLetterOpen.assignedRegion}</strong> territory. Your Employee ID is <strong className="font-mono">{isEnrollmentLetterOpen.id}</strong>.
                </p>

                <div className="border border-border rounded-xl p-4 space-y-2 text-xs bg-muted/20">
                  <p className="font-black uppercase tracking-wider text-muted-foreground mb-2">Terms & Conditions</p>
                  {[
                    `Your base salary will be ₹${isEnrollmentLetterOpen.salary.toLocaleString("en-IN")} per month.`,
                    `An incentive of ${isEnrollmentLetterOpen.incentiveRate}% will be applicable on achieved monthly sales.`,
                    "You are required to submit daily visit reports and collection receipts to your area manager.",
                    "Company-issued sample kits, brochures, and scheme materials must be used for official purposes only.",
                    "You are expected to meet your assigned monthly targets consistently.",
                    "This appointment is subject to successful completion of the probation period of 3 months.",
                    "Any misconduct or breach of policy will result in immediate termination as per company policy.",
                  ].map((term, i) => (
                    <p key={i} className="flex gap-2"><span className="font-black text-muted-foreground">{i + 1}.</span>{term}</p>
                  ))}
                </div>

                <p>
                  We look forward to your valuable contribution and wish you a successful career at Sharma Industries.
                </p>
              </div>

              {/* Signature Block */}
              <div className="flex justify-between pt-8 border-t border-border text-xs">
                <div className="space-y-1">
                  <div className="w-32 border-b border-foreground/40 pb-1 mb-2" />
                  <p className="font-bold">Authorised Signatory</p>
                  <p className="text-muted-foreground">Sharma Industries</p>
                </div>
                <div className="space-y-1 text-right">
                  <div className="w-32 border-b border-foreground/40 pb-1 mb-2 ml-auto" />
                  <p className="font-bold">{isEnrollmentLetterOpen.name}</p>
                  <p className="text-muted-foreground">Employee Acknowledgement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dealer Onboarding Modal */}
      {isOnboardingModalOpen && selectedSalesman && (
        <DealerOnboardingModal
          salesmanId={selectedSalesman.id}
          salesmanName={selectedSalesman.name}
          onClose={() => setIsOnboardingModalOpen(false)}
          onSuccess={() => { setIsOnboardingModalOpen(false); fetchDealers(); }}
        />
      )}
    </div>
  );
}
