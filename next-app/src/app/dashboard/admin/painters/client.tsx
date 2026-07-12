"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  Search, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  Coins, 
  X, 
  ArrowUpRight, 
  DollarSign, 
  Layers,
  Sparkles,
  ClipboardList,
  Plus,
  Tv,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  TrendingUp,
  Award,
  Calendar,
  Image as ImageIcon,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { redeemPainterPoints, processPainterPayout, approvePainter, addRewardItem, addScheme, addCompetition } from "./actions";

interface Scan {
  qr_code: string;
  scanned_at: string;
  token_value: number;
  product_name: string;
  invoice_qty: number;
  dealer_name: string;
  dealer_phone: string;
  dealer_address: string;
  dealer_locality: string;
}

interface Painter {
  id: string;
  name: string;
  phone: string;
  swatch_id: string | null;
  address: string | null;
  aadhar_no: string | null;
  locality: string | null;
  total_tokens: number;
  total_redeemed: number;
  status?: string | null;
  referral_code?: string | null;
  referred_by?: string | null;
  scans: Scan[];
}

// ─── DUMMY DATA FOR TABS ───
const DUMMY_PROJECTS = [
  { id: "PRJ-01", name: "Sharma Villa Residence", client: "Ramesh Sharma", phone: "9876543210", painterId: "b83ad898-0c6a-4c2c-8ab5-3343a4114401", painterName: "Rajesh Kumar", scope: "Exterior Painting", progress: 85, status: "In Progress" },
  { id: "PRJ-02", name: "Royal Heights Depot", client: "Sanjay Singhal", phone: "9988776655", painterId: "b83ad898-0c6a-4c2c-8ab5-3343a4114402", painterName: "Amit Sharma", scope: "Emulsion Coatings", progress: 100, status: "Completed" },
  { id: "PRJ-03", name: "Kirti Nagar Warehouse", client: "Harish Gupta", phone: "9812345678", painterId: "b83ad898-0c6a-4c2c-8ab5-3343a4114403", painterName: "Vikram Singh", scope: "Industrial Weatherproofing", progress: 40, status: "In Progress" }
];

const DUMMY_MEETS = [
  { id: "MEET-01", name: "Monsoon Coating Techniques Meet", date: "2026-07-20", venue: "Hotel Taj Palace, Jaipur", attendees: ["b83ad898-0c6a-4c2c-8ab5-3343a4114401", "b83ad898-0c6a-4c2c-8ab5-3343a4114402"] },
  { id: "MEET-02", name: "Jodhpur Painters Annual Gala", date: "2026-08-05", venue: "Rajasthan Depot Jodhpur", attendees: ["b83ad898-0c6a-4c2c-8ab5-3343a4114402", "b83ad898-0c6a-4c2c-8ab5-3343a4114403"] }
];

const DUMMY_PORTFOLIO = [
  { id: "PORT-01", title: "Luxury Duplex Exterior", location: "Malviya Nagar, Jaipur", painterName: "Rajesh Kumar", imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", description: "Premium Weather Shield coating with dual tone texture." },
  { id: "PORT-02", title: "Modern Living Room Interiors", location: "C-Scheme, Jaipur", painterName: "Amit Sharma", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80", description: "Rustic Royale superfine emulsion interior finishes." }
];

const REWARDS_CATALOG = [
  { id: "RC-01", name: "Professional Painter Tool Kit", points: 200, category: "Tools" },
  { id: "RC-02", name: "Sharma Industries Branded Overalls", points: 100, category: "Apparel" },
  { id: "RC-03", name: "Commercial Airless Paint Sprayer", points: 1200, category: "Equipment" },
  { id: "RC-04", name: "Digital Cashback Transfer (1 Point = ₹1)", points: 50, category: "Cashback" }
];

interface RewardItem {
  id: string;
  name: string;
  points: number;
  category: string;
}

interface SchemeItem {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  points_multiplier: number;
}

interface CompetitionItem {
  id: string;
  title: string;
  description: string | null;
  rules: string | null;
  criteria: string | null;
  start_date: string | null;
  end_date: string | null;
}

export default function PaintersClient({ 
  initialPainters,
  initialRewards,
  initialSchemes,
  initialCompetitions
}: { 
  initialPainters: Painter[];
  initialRewards: RewardItem[];
  initialSchemes: SchemeItem[];
  initialCompetitions: CompetitionItem[];
}) {
  const { t } = useLanguage();
  const [painters, setPainters] = useState<Painter[]>(initialPainters);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPainter, setSelectedPainter] = useState<Painter | null>(null);
  
  // Database state lists
  const [rewardsList, setRewardsList] = useState<RewardItem[]>(initialRewards);
  const [schemesList, setSchemesList] = useState<SchemeItem[]>(initialSchemes);
  const [competitionsList, setCompetitionsList] = useState<CompetitionItem[]>(initialCompetitions);
  
  // Referral selection state
  const [selectedReferralPainterId, setSelectedReferralPainterId] = useState<string>("");

  // Portfolio Group selection
  const [selectedPortfolioPainter, setSelectedPortfolioPainter] = useState<string>("All");

  // Dashboard Sub-navigation Tabs
  const [activeTab, setActiveTab] = useState<"list" | "pending" | "rewards" | "coupons" | "schemes" | "competitions" | "referrals" | "performance" | "income" | "activity" | "meets" | "portfolio">("list");
  const [isPending, startTransition] = useTransition();

  // Dynamic Custom States for Forms/Modals
  const [meetsList, setMeetsList] = useState<any[]>([]);
  const [portfolioList, setPortfolioList] = useState<any[]>([]);
  const [couponScans, setCouponScans] = useState<any[]>([]);
  
  // Modals controllers
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [newReward, setNewReward] = useState({ name: "", points: "", category: "Tools" });

  const [isAddSchemeOpen, setIsAddSchemeOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({ title: "", description: "", start_date: "", end_date: "", points_multiplier: 1.0 });

  const [isAddCompetitionOpen, setIsAddCompetitionOpen] = useState(false);
  const [newCompetition, setNewCompetition] = useState({ title: "", description: "", rules: "", criteria: "", start_date: "", end_date: "" });

  const [isCreateMeetOpen, setIsCreateMeetOpen] = useState(false);
  const [newMeet, setNewMeet] = useState({ name: "", date: "", venue: "" });

  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ title: "", location: "", painterName: "", imageUrl: "", description: "" });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync / Load Initial states
  useEffect(() => {

    // Meets local storage
    const meets = localStorage.getItem("sharma_painters_meets");
    if (meets) setMeetsList(JSON.parse(meets));
    else {
      setMeetsList(DUMMY_MEETS);
      localStorage.setItem("sharma_painters_meets", JSON.stringify(DUMMY_MEETS));
    }

    // Portfolio local storage
    const ports = localStorage.getItem("sharma_painters_portfolio");
    if (ports) setPortfolioList(JSON.parse(ports));
    else {
      setPortfolioList(DUMMY_PORTFOLIO);
      localStorage.setItem("sharma_painters_portfolio", JSON.stringify(DUMMY_PORTFOLIO));
    }

    // Coupons mapping from initial painters scans
    const scansList: any[] = [];
    painters.forEach(p => {
      p.scans.forEach(s => {
        scansList.push({
          ...s,
          painterName: p.name,
          painterPhone: p.phone,
          status: "Processed"
        });
      });
    });
    setCouponScans(scansList.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()));

  }, [painters]);

  // ─── ACTION HANDLERS ───

  // Redeem Catalog Item
  const handleRedeemCatalogItem = (painterId: string, item: any) => {
    const painter = painters.find(p => p.id === painterId);
    if (!painter) return;
    if (painter.total_tokens < item.points) {
      showToast("error", "Insufficient tokens to redeem this reward.");
      return;
    }

    startTransition(async () => {
      const res = await redeemPainterPoints(painterId, item.points);
      if (res.success) {
        showToast("success", `Successfully redeemed ${item.name} for ${painter.name}!`);
        // Update local state
        setPainters(prev => prev.map(p => {
          if (p.id === painterId) {
            return {
              ...p,
              total_tokens: p.total_tokens - item.points,
              total_redeemed: p.total_redeemed + item.points
            };
          }
          return p;
        }));
      } else {
        showToast("error", `Redemption failed: ${res.error}`);
      }
    });
  };

  // Process Cashback Payout
  const handleProcessCashback = (painterId: string) => {
    const painter = painters.find(p => p.id === painterId);
    if (!painter) return;
    const amount = painter.total_tokens;
    if (amount <= 0) {
      showToast("error", "No pending redeemable balance to pay out.");
      return;
    }

    startTransition(async () => {
      const res = await processPainterPayout(painterId, amount);
      if (res.success) {
        showToast("success", `Cashback payout of ₹${amount} successfully processed for ${painter.name}.`);
        setPainters(prev => prev.map(p => {
          if (p.id === painterId) {
            return {
              ...p,
              total_tokens: 0,
              total_redeemed: p.total_redeemed + amount
            };
          }
          return p;
        }));
      } else {
        showToast("error", `Payout processing failed: ${res.error}`);
      }
    });
  };

  // QR Scan Simulation
  const handleSimulateScan = () => {
    if (painters.length === 0) return;
    const randomPainter = painters[Math.floor(Math.random() * painters.length)];
    const mockQR = `QR-${Math.floor(100000 + Math.random() * 900000)}`;
    const mockVal = [50, 100, 150, 200][Math.floor(Math.random() * 4)];
    const productsList = ["Rustic Royale Interior", "Weather Shield Ultima", "Acrylic Wall Putty", "Gloss Enamel White"];
    const randomProduct = productsList[Math.floor(Math.random() * productsList.length)];

    const newScan: Scan = {
      qr_code: mockQR,
      scanned_at: new Date().toISOString(),
      token_value: mockVal,
      product_name: randomProduct,
      invoice_qty: 1,
      dealer_name: "Direct Scan / Simulated",
      dealer_phone: "N/A",
      dealer_address: "Simulated Depot Link",
      dealer_locality: "Jaipur Depot"
    };

    // Update locally
    setPainters(prev => prev.map(p => {
      if (p.id === randomPainter.id) {
        return {
          ...p,
          total_tokens: p.total_tokens + mockVal,
          scans: [newScan, ...p.scans]
        };
      }
      return p;
    }));

    showToast("success", `QR scan simulated! Mapped +${mockVal} tokens to painter: ${randomPainter.name}.`);
  };

  // Add Reward Submit
  const handleCreateRewardSubmit = () => {
    if (!newReward.name || !newReward.points) {
      showToast("error", "Reward name and points are required.");
      return;
    }

    startTransition(async () => {
      const res = await addRewardItem({ name: newReward.name, points: Number(newReward.points), category: newReward.category });
      if (res.success && res.item) {
        setRewardsList(prev => [...prev, res.item!]);
        setIsAddRewardOpen(false);
        setNewReward({ name: "", points: "", category: "Tools" });
        showToast("success", "Reward item added to catalog successfully.");
      } else {
        showToast("error", `Failed to add reward: ${res.error}`);
      }
    });
  };

  // Add Scheme Submit
  const handleCreateSchemeSubmit = () => {
    if (!newScheme.title || !newScheme.points_multiplier) {
      showToast("error", "Scheme title and multiplier are required.");
      return;
    }

    startTransition(async () => {
      const res = await addScheme({
        title: newScheme.title,
        description: newScheme.description || null,
        start_date: newScheme.start_date || null,
        end_date: newScheme.end_date || null,
        points_multiplier: Number(newScheme.points_multiplier)
      });
      if (res.success && res.scheme) {
        setSchemesList(prev => [res.scheme!, ...prev]);
        setIsAddSchemeOpen(false);
        setNewScheme({ title: "", description: "", start_date: "", end_date: "", points_multiplier: 1.0 });
        showToast("success", "Product scheme launched successfully.");
      } else {
        showToast("error", `Failed to create scheme: ${res.error}`);
      }
    });
  };

  // Add Competition Submit
  const handleCreateCompetitionSubmit = () => {
    if (!newCompetition.title || !newCompetition.rules || !newCompetition.criteria) {
      showToast("error", "Competition title, rules, and criteria are required.");
      return;
    }

    startTransition(async () => {
      const res = await addCompetition({
        title: newCompetition.title,
        description: newCompetition.description || null,
        rules: newCompetition.rules,
        criteria: newCompetition.criteria,
        start_date: newCompetition.start_date || null,
        end_date: newCompetition.end_date || null,
      });
      if (res.success && res.competition) {
        setCompetitionsList(prev => [res.competition!, ...prev]);
        setIsAddCompetitionOpen(false);
        setNewCompetition({ title: "", description: "", rules: "", criteria: "", start_date: "", end_date: "" });
        showToast("success", "New painter competition launched successfully.");
      } else {
        showToast("error", `Failed to create competition: ${res.error}`);
      }
    });
  };

  // Add Painters Meet Submit
  const handleCreateMeetSubmit = () => {
    if (!newMeet.name || !newMeet.date) {
      showToast("error", "Meet topic/name and date are required.");
      return;
    }
    const item = {
      id: `MEET-${Date.now().toString().slice(-4)}`,
      name: newMeet.name,
      date: newMeet.date,
      venue: newMeet.venue || "Hotel Landmark",
      attendees: []
    };
    const updated = [item, ...meetsList];
    setMeetsList(updated);
    localStorage.setItem("sharma_painters_meets", JSON.stringify(updated));
    setIsCreateMeetOpen(false);
    setNewMeet({ name: "", date: "", venue: "" });
    showToast("success", `Painters Meet scheduled for ${item.date}.`);
  };

  // Toggle Meet Attendance (Attended / Not Attended)
  const handleToggleAttendance = (meetId: string, painterId: string) => {
    const updated = meetsList.map(m => {
      if (m.id === meetId) {
        const isPresent = m.attendees.includes(painterId);
        let nextAttendees = [];
        if (isPresent) {
          nextAttendees = m.attendees.filter((id: string) => id !== painterId);
        } else {
          nextAttendees = [...m.attendees, painterId];
        }
        return {
          ...m,
          attendees: nextAttendees
        };
      }
      return m;
    });
    setMeetsList(updated);
    localStorage.setItem("sharma_painters_meets", JSON.stringify(updated));
    showToast("success", "Painter attendance updated.");
  };

  // Add Portfolio Image Submit
  const handleAddPortfolioSubmit = () => {
    if (!newPortfolio.title || !newPortfolio.imageUrl) {
      showToast("error", "Portfolio title and image URL are required.");
      return;
    }
    const item = {
      id: `PORT-${Date.now().toString().slice(-4)}`,
      title: newPortfolio.title,
      location: newPortfolio.location || "Jaipur",
      painterName: newPortfolio.painterName || "Ramesh Kumar",
      imageUrl: newPortfolio.imageUrl,
      description: newPortfolio.description || "Finished coating works."
    };
    const updated = [item, ...portfolioList];
    setPortfolioList(updated);
    localStorage.setItem("sharma_painters_portfolio", JSON.stringify(updated));
    setIsAddPortfolioOpen(false);
    setNewPortfolio({ title: "", location: "", painterName: "", imageUrl: "", description: "" });
    showToast("success", "Project portfolio image added successfully.");
  };

  const handleApprovePainter = (painterId: string) => {
    const painter = painters.find(p => p.id === painterId);
    if (!painter) return;

    startTransition(async () => {
      const res = await approvePainter(painterId);
      if (res.success) {
        showToast("success", `Painter profile for ${painter.name} approved successfully!`);
        setPainters(prev => prev.map(p => {
          if (p.id === painterId) {
            return {
              ...p,
              status: "approved"
            };
          }
          return p;
        }));
      } else {
        showToast("error", `Approval failed: ${res.error}`);
      }
    });
  };

  const handleDeletePortfolio = (id: string) => {
    const updated = portfolioList.filter(p => p.id !== id);
    setPortfolioList(updated);
    localStorage.setItem("sharma_painters_portfolio", JSON.stringify(updated));
    showToast("success", "Portfolio image removed from showroom.");
  };

  // Calculations
  const approvedPainters = useMemo(() => painters.filter(p => p.status === 'approved' || !p.status), [painters]);
  const pendingPainters = useMemo(() => painters.filter(p => p.status === 'pending'), [painters]);

  const filteredPainters = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return approvedPainters.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term) ||
      (p.swatch_id || "").toLowerCase().includes(term) ||
      (p.locality || "").toLowerCase().includes(term)
    );
  }, [approvedPainters, searchTerm]);

  const totalPainters = approvedPainters.length;
  const totalTokensCollected = approvedPainters.reduce((acc, p) => acc + (p.total_tokens || 0) + (p.total_redeemed || 0), 0);
  const totalTokensRedeemed = approvedPainters.reduce((acc, p) => acc + (p.total_redeemed || 0), 0);
  const totalCashRedeemable = approvedPainters.reduce((acc, p) => acc + (p.total_tokens || 0), 0);

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
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Painter Ecosystem")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <User className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Painter Ecosystem</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Track painter registrations, scanned product coupons, meet attendance, projects assignments, and payouts processed.</p>
          </div>
        </div>

        {/* Quick Actions Navigation Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <button 
            onClick={() => { setActiveTab("list"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "list" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Painter List
          </button>
          <button 
            onClick={() => { setActiveTab("pending"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer relative ${
              activeTab === "pending" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            <span>Approval Requests</span>
            {pendingPainters.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-pulse">
                {pendingPainters.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab("rewards"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "rewards" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Rewards Catalog
          </button>
          <button 
            onClick={() => { setActiveTab("coupons"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "coupons" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Coupons Scanned
          </button>
          <button 
            onClick={() => { setActiveTab("schemes"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "schemes" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Product Schemes
          </button>
          <button 
            onClick={() => { setActiveTab("competitions"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "competitions" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Competitions
          </button>
          <button 
            onClick={() => { setActiveTab("referrals"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "referrals" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Referral Program
          </button>
          <button 
            onClick={() => { setActiveTab("meets"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "meets" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Painters Meets
          </button>
          <button 
            onClick={() => { setActiveTab("portfolio"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "portfolio" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Portfolio Gallery
          </button>
          <button 
            onClick={() => { setActiveTab("performance"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "performance" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Performance
          </button>
          <button 
            onClick={() => { setActiveTab("income"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "income" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Income Ledger
          </button>
          <button 
            onClick={() => { setActiveTab("activity"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "activity" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            Activity Logs
          </button>
          
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search painters program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* ─── TODAY'S KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><User size={24} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Painters</p>
            <p className="text-2xl font-black text-foreground">{totalPainters}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Coins size={24} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Tokens Earned</p>
            <p className="text-2xl font-black text-foreground">{totalTokensCollected}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><ArrowUpRight size={24} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Redeemed</p>
            <p className="text-2xl font-black text-foreground">{totalTokensRedeemed}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Redeemable Cash</p>
            <p className="text-2xl font-black text-emerald-600">₹{totalCashRedeemable.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: PAINTER LIST VIEW ─── */}
      {activeTab === "list" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-black tracking-wider">
                  <th className="px-6 py-4">Painter Details</th>
                  <th className="px-6 py-4">Contact & Locality</th>
                  <th className="px-6 py-4 font-mono">Aadhaar Card</th>
                  <th className="px-6 py-4 text-right">Points Balance</th>
                  <th className="px-6 py-4 text-right">Redeemable Value</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredPainters.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base uppercase">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs font-mono text-primary font-semibold">{p.swatch_id || "No SP ID"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{p.phone}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={12} /> {p.locality || "No Locality"}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-xs text-foreground">{p.aadhar_no || "Not Verified"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Coins size={13} className="text-amber-500" />
                        <span className="font-bold text-foreground">{p.total_tokens || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">₹{p.total_tokens || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedPainter(p)}
                        className="bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 1.5: PENDING APPROVALS VIEW ─── */}
      {activeTab === "pending" && (
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Pending Painter Registrations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Review and approve self-registered painter profiles to activate their loyalty token permissions.</p>
            </div>
          </div>
          {pendingPainters.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-semibold">
              No pending painter registration requests at this time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-black tracking-wider">
                    <th className="px-6 py-4">Painter Name</th>
                    <th className="px-6 py-4">Contact Phone</th>
                    <th className="px-6 py-4">Proposed SP ID</th>
                    <th className="px-6 py-4">Locality / Area</th>
                    <th className="px-6 py-4">Aadhaar Card</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {pendingPainters.map(p => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{p.name}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{p.phone}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-muted-foreground">{p.swatch_id || "Pending Assignment"}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{p.locality || "N/A"}</td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground">{p.aadhar_no || "Not Uploaded"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black rounded-lg uppercase tracking-wider">
                          Pending Verification
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleApprovePainter(p.id)}
                          disabled={isPending}
                          className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          Approve Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: REWARDS CATALOG VIEW ─── */}
      {activeTab === "rewards" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Rewards Catalog</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage rewards available for painters to claim using their accumulated tokens.</p>
            </div>
            <button
              onClick={() => setIsAddRewardOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} /> Add New Reward
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {rewardsList.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm flex justify-between items-center hover:border-primary/20 transition-all">
                <div className="space-y-1">
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-base font-black text-foreground">{item.name}</h3>
                  <p className="text-xs font-mono font-bold text-amber-500">{item.points} Points Required</p>
                </div>
                <div className="text-right flex-shrink-0 pl-4">
                  <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-2">Claim on behalf of:</label>
                  <select
                    onChange={(e) => {
                      const pId = e.target.value;
                      if (!pId) return;
                      handleRedeemCatalogItem(pId, item);
                      e.target.value = ""; // Reset selector
                    }}
                    className="bg-muted border border-border text-foreground text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Painter --</option>
                    {approvedPainters.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.total_tokens} pts)</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: COUPONS VIEW ─── */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">QR Coupon Simulation Logs</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Audit verified QR scans. Simulate coupon scans to test balance additions.</p>
            </div>
            <button
              onClick={handleSimulateScan}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles size={14} /> Simulate QR Scan
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-black tracking-wider">
                    <th className="px-6 py-4">Coupon Code</th>
                    <th className="px-6 py-4">Scanned By</th>
                    <th className="px-6 py-4">Product details</th>
                    <th className="px-6 py-4">Date Scanned</th>
                    <th className="px-6 py-4 text-right">Points value</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {couponScans.map((sc, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-primary">{sc.qr_code}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{sc.painterName}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-foreground">{sc.product_name}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-semibold">{new Date(sc.scanned_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-amber-500">+{sc.token_value} pts</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">PROCESSED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: SCHEMES VIEW ─── */}
      {activeTab === "schemes" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Product & QR Scan Schemes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configure active promotional multipliers and token bonus rules for scanning products.</p>
            </div>
            <button
              onClick={() => setIsAddSchemeOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} /> Launch New Scheme
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemesList.map((sc) => {
              const isExpired = sc.end_date && new Date(sc.end_date) < new Date();
              return (
                <div key={sc.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-black text-foreground">{sc.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sc.description || "No description provided."}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${
                        isExpired 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {isExpired ? "EXPIRED" : "ACTIVE"}
                      </span>
                    </div>

                    <div className="bg-muted/40 border border-border/40 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Validity Period</p>
                        <p className="text-foreground">
                          {sc.start_date ? new Date(sc.start_date).toLocaleDateString() : "Open Start"}
                          {" — "}
                          {sc.end_date ? new Date(sc.end_date).toLocaleDateString() : "Open End"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Multiplier</p>
                        <p className="text-2xl font-black text-amber-500 font-mono">{sc.points_multiplier}x</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB: COMPETITIONS VIEW ─── */}
      {activeTab === "competitions" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Painter Competitions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Create competitions to motivate painters, define rules, criteria, and track winners across your network.</p>
            </div>
            <button
              onClick={() => setIsAddCompetitionOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} /> Add New Competition
            </button>
          </div>

          {/* Competitions list */}
          {competitionsList.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center">
              <Award size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-bold text-muted-foreground">No competitions yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Click &quot;Add New Competition&quot; to create the first one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {competitionsList.map((comp) => {
                const now = new Date();
                const end = comp.end_date ? new Date(comp.end_date) : null;
                const isExpired = end ? end < now : false;
                return (
                  <div key={comp.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-black text-foreground">{comp.title}</h4>
                        {comp.description && <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>}
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black border ${
                        isExpired
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>{isExpired ? "ENDED" : "LIVE"}</span>
                    </div>

                    {comp.rules && (
                      <div className="bg-muted/40 border border-border/40 p-3 rounded-xl">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1.5">Rules & Regulations</p>
                        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{comp.rules}</p>
                      </div>
                    )}

                    {comp.criteria && (
                      <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-amber-500 mb-1.5">Winning Criteria</p>
                        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{comp.criteria}</p>
                      </div>
                    )}

                    <div className="bg-muted/40 border border-border/40 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Duration</p>
                        <p className="text-foreground">
                          {comp.start_date ? new Date(comp.start_date).toLocaleDateString() : "Open Start"}
                          {" — "}
                          {comp.end_date ? new Date(comp.end_date).toLocaleDateString() : "Open End"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Status</p>
                        <p className={`font-black text-sm ${isExpired ? "text-rose-500" : "text-emerald-500"}`}>{isExpired ? "Competition Over" : "Ongoing"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: REFERRAL PROGRAM VIEW ─── */}
      {activeTab === "referrals" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Referral Program Management</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Track painter referrals, manage codes, and view which painters were brought in by existing members.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Referred Painters Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Referral Network — Painters List</p>
                <div className="space-y-2">
                  {/* Filter by referrer */}
                  <div className="flex gap-2 mb-3">
                    <select
                      value={selectedReferralPainterId}
                      onChange={(e) => setSelectedReferralPainterId(e.target.value)}
                      className="flex-1 bg-muted/40 border border-border rounded-xl text-xs px-3 py-2 text-foreground focus:outline-none"
                    >
                      <option value="">All Referrers</option>
                      {painters.filter(p => p.referral_code).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Code: {p.referral_code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60">
                        <tr>
                          <th className="px-3 py-2.5 text-left font-bold text-muted-foreground">SP ID</th>
                          <th className="px-3 py-2.5 text-left font-bold text-muted-foreground">Painter Name</th>
                          <th className="px-3 py-2.5 text-left font-bold text-muted-foreground">Phone</th>
                          <th className="px-3 py-2.5 text-left font-bold text-muted-foreground">Referred By</th>
                          <th className="px-3 py-2.5 text-left font-bold text-muted-foreground">Referral Code Used</th>
                          <th className="px-3 py-2.5 text-left font-bold text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {painters
                          .filter(p => {
                            if (!p.referred_by) return false;
                            if (selectedReferralPainterId) {
                              // find the referrer painter
                              const referrer = painters.find(r => r.id === selectedReferralPainterId);
                              return referrer && p.referred_by === referrer.referral_code;
                            }
                            return true;
                          })
                          .map(p => {
                            const referrer = painters.find(r => r.referral_code === p.referred_by);
                            return (
                              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-3 py-2.5 font-mono text-primary font-bold">SP-{p.swatch_id ?? p.id.slice(-4).toUpperCase()}</td>
                                <td className="px-3 py-2.5 font-semibold text-foreground">{p.name}</td>
                                <td className="px-3 py-2.5 text-muted-foreground">{p.phone}</td>
                                <td className="px-3 py-2.5 text-foreground">{referrer?.name ?? "—"}</td>
                                <td className="px-3 py-2.5 font-mono text-amber-500">{p.referred_by}</td>
                                <td className="px-3 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    p.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                  }`}>{p.status?.toUpperCase() ?? "UNKNOWN"}</span>
                                </td>
                              </tr>
                            );
                          })}
                        {painters.filter(p => p.referred_by).length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No referred painters found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Referral code quick-view per painter */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">All Referral Codes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {painters.filter(p => p.referral_code && p.status === "active").map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-xs font-bold text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.phone}</p>
                      </div>
                      <span className="font-mono text-sm font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">{p.referral_code}</span>
                    </div>
                  ))}
                  {painters.filter(p => p.referral_code && p.status === "active").length === 0 && (
                    <p className="text-xs text-muted-foreground col-span-2 py-4 text-center">No active painters with referral codes yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Rules & Regulations Panel */}
            <div className="space-y-4">
              <div className="bg-card border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Award size={16} className="text-amber-500" />
                  <p className="text-sm font-black text-foreground">Referral Program Rules</p>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">Single-side referral only.</span> Each new painter can be referred by only one existing painter.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">6-Month new painter window.</span> Referral bonus applies only when the referred painter joins within 6 months of the referrer&apos;s account creation.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">Referrer must be active.</span> If the referring painter becomes inactive in any of the 6 months after referring, the referral benefit is automatically cancelled.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">Active status definition.</span> A painter is considered active if they scan at least 1 coupon in any given calendar month.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">Referred painter must also be active.</span> The referred painter must scan at least 1 coupon within 30 days of joining to activate the referral chain.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">6</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">No self-referral.</span> A painter cannot use their own referral code to create a new account or earn bonus points.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">7</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">Referral bonus is one-time.</span> The referrer receives points only once per successfully activated referral. No recurring bonus.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">8</span>
                    <p className="text-muted-foreground"><span className="font-bold text-foreground">Management reserves the right</span> to reject or revoke any referral in case of fraud, duplicate accounts, or violation of these rules.</p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  ⚠️ Referral program terms are subject to change. All decisions by Sharma Industries management are final.
                </div>
              </div>

              {/* Summary stats */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Quick Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-primary">{painters.filter(p => p.referred_by).length}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Referred Painters</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-emerald-500">{painters.filter(p => p.referral_code && p.status === "active").length}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Active Referrers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: PAINTER MEETS VIEW ─── */}
      {activeTab === "meets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Painters Meets attendance Ledger</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Plan marketing meets, track attendance, and log which painters participated in training events.</p>
            </div>
            <button
              onClick={() => setIsCreateMeetOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} /> Create Painters Meet
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {meetsList.map((meet) => (
              <div key={meet.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <h4 className="text-base font-black text-foreground">{meet.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar size={12} /> Date: {meet.date} &nbsp;·&nbsp; Venue: {meet.venue}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase">
                    {meet.attendees.length} REGISTERED ATTENDEES
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mark Attendance Status:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {approvedPainters.map(p => {
                      const isAttended = meet.attendees.includes(p.id);

                      return (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl">
                          <div>
                            <p className="font-bold text-foreground text-sm">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.phone}</p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isAttended}
                              onChange={() => handleToggleAttendance(meet.id, p.id)}
                              className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            />
                            <span className={`text-[10px] font-extrabold uppercase ${isAttended ? "text-emerald-500" : "text-muted-foreground"}`}>
                              {isAttended ? "Attended" : "Not Attended"}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 6: PORTFOLIO GALLERY VIEW ─── */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card border border-border p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Project Portfolios Showroom</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Exhibit finished painting site photos. Associate layouts with executing contractors.</p>
            </div>
            <button
              onClick={() => setIsAddPortfolioOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ImageIcon size={14} /> Add Project Photo
            </button>
          </div>

          {/* Horizontal Painter Pills Selector */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2">Filter Portfolio:</span>
            <button
              onClick={() => setSelectedPortfolioPainter("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                selectedPortfolioPainter === "All"
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
              }`}
            >
              All Painters
            </button>
            {approvedPainters.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPortfolioPainter(p.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  selectedPortfolioPainter === p.name
                    ? "bg-primary text-white border-primary"
                    : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {portfolioList.filter(port => selectedPortfolioPainter === "All" || port.painterName === selectedPortfolioPainter).length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center text-xs text-muted-foreground font-semibold">
              No project portfolio photos uploaded for {selectedPortfolioPainter === "All" ? "any painter" : selectedPortfolioPainter} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {portfolioList
                .filter(port => selectedPortfolioPainter === "All" || port.painterName === selectedPortfolioPainter)
                .map((port) => (
                  <div key={port.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all group relative">
                    
                    {/* Delete overlay button */}
                    <button
                      onClick={() => handleDeletePortfolio(port.id)}
                      className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-rose-600 text-white p-2 rounded-full transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <X size={12} />
                    </button>

                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img 
                        src={port.imageUrl} 
                        alt={port.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-foreground leading-tight">{port.title}</h4>
                        <p className="text-muted-foreground font-semibold flex items-center gap-1"><MapPin size={11} /> {port.location}</p>
                        <p className="text-muted-foreground/80 leading-relaxed mt-1 text-[11px]">{port.description}</p>
                      </div>
                      <div className="pt-3.5 border-t border-border/60 flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground">Executed By:</span>
                        <span className="text-primary font-black uppercase text-[10px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">{port.painterName}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 7: PERFORMANCE VIEW ─── */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Award className="text-amber-500" size={16} /> Regional Top Scanners
            </h3>
            <p className="text-xs text-muted-foreground">Painters with highest QR coupon scan rates in current billing cycle.</p>
            <div className="space-y-3 pt-2 text-xs">
              {painters.slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex justify-between items-center border-b border-border/40 pb-2">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-muted-foreground">#{i+1}</span>
                    <span className="font-bold text-foreground">{p.name}</span>
                  </div>
                  <span className="font-mono font-black text-primary bg-primary/15 px-2 py-0.5 rounded">{p.total_tokens + p.total_redeemed} Pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="text-emerald-500" size={16} /> QR Scan Depletion Rates
            </h3>
            <p className="text-xs text-muted-foreground">Estimated scan intervals for Wall Putty versus Luxury Emulsions.</p>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Acrylic Wall Putty (Premium)</span>
                <span className="font-mono">82% Scan Ratio</span>
              </div>
              <div className="flex justify-between">
                <span>Rustic Royale Interiors</span>
                <span className="font-mono">60% Scan Ratio</span>
              </div>
              <div className="flex justify-between">
                <span>Weather Shield Ext. Smooth</span>
                <span className="font-mono">45% Scan Ratio</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="text-blue-500" size={16} /> Engagement Ratios
            </h3>
            <p className="text-xs text-muted-foreground">Painters actively scanning coupons within the last 14 days.</p>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-2xl font-black text-foreground">84.5%</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-0.5">Active Engagement</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded">EXCELLENT</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 8: INCOME VIEW ─── */}
      {activeTab === "income" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-black tracking-wider">
                  <th className="px-6 py-4">Painter Name</th>
                  <th className="px-6 py-4">Contact SP ID</th>
                  <th className="px-6 py-4 text-right">Lifetime Earnings</th>
                  <th className="px-6 py-4 text-right">Redeemed Earnings</th>
                  <th className="px-6 py-4 text-right text-rose-500">Unredeemed Pending Balance</th>
                  <th className="px-6 py-4 text-right">Payout Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {painters.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{p.name}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{p.phone}</p>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">ID: {p.swatch_id || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-foreground">₹{(p.total_tokens + p.total_redeemed).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-muted-foreground">₹{p.total_redeemed.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-rose-500">₹{p.total_tokens.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleProcessCashback(p.id)}
                        disabled={p.total_tokens <= 0 || isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Process Payout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 9: ACTIVITY VIEW ─── */}
      {activeTab === "activity" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Painter Ecosystem Live Event Log</p>
          <div className="space-y-4">
            <div className="flex gap-3 text-xs border-b border-border/40 pb-3">
              <span className="text-[10px] text-muted-foreground font-mono w-20 flex-shrink-0">04:30 PM</span>
              <div>
                <p className="font-bold text-foreground">New Coupon Registered</p>
                <p className="text-muted-foreground mt-0.5">Painter Rajesh Kumar scanned coupon code QR-948 for ₹150.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs border-b border-border/40 pb-3">
              <span className="text-[10px] text-muted-foreground font-mono w-20 flex-shrink-0">02:15 PM</span>
              <div>
                <p className="font-bold text-foreground">Cashback Payout approved</p>
                <p className="text-muted-foreground mt-0.5">Loyalty cashback transfer approved to Amit Sharma for ₹1,200.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-[10px] text-muted-foreground font-mono w-20 flex-shrink-0">Yesterday</span>
              <div>
                <p className="font-bold text-foreground">New Project Associated</p>
                <p className="text-muted-foreground mt-0.5">Vikram Singh associated with Kirti Nagar Warehouse exterior coating contract.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD REWARD ITEM ─── */}
      {isAddRewardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Add Catalog Reward Item</h3>
              <button onClick={() => setIsAddRewardOpen(false)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold text-foreground">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Reward Name</label>
                <input 
                  type="text" 
                  value={newReward.name} 
                  onChange={e => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Professional Painter Swatch Set"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Required Points</label>
                  <input 
                    type="number" 
                    value={newReward.points} 
                    onChange={e => setNewReward(prev => ({ ...prev, points: e.target.value }))}
                    placeholder="e.g. 150"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Reward Category</label>
                  <select
                    value={newReward.category}
                    onChange={e => setNewReward(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground font-bold"
                  >
                    <option value="Tools">Tools</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Cashback">Cashback</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button onClick={() => setIsAddRewardOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleCreateRewardSubmit} className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer" disabled={isPending}>Save Reward</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: LAUNCH SCHEME ─── */}
      {isAddSchemeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Launch Promotional Scheme</h3>
              <button onClick={() => setIsAddSchemeOpen(false)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold text-foreground">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Scheme Title</label>
                <input 
                  type="text" 
                  value={newScheme.title} 
                  onChange={e => setNewScheme(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Diwali Super Multiplier Offer"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Scheme Description</label>
                <textarea 
                  rows={2}
                  value={newScheme.description} 
                  onChange={e => setNewScheme(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Details about eligible product lines or conditions..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Points Multiplier</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newScheme.points_multiplier} 
                    onChange={e => setNewScheme(prev => ({ ...prev, points_multiplier: Number(e.target.value) }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Start Date</label>
                  <input 
                    type="date" 
                    value={newScheme.start_date} 
                    onChange={e => setNewScheme(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">End Date</label>
                  <input 
                    type="date" 
                    value={newScheme.end_date} 
                    onChange={e => setNewScheme(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button onClick={() => setIsAddSchemeOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleCreateSchemeSubmit} className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer" disabled={isPending}>Activate Scheme</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE MEET ─── */}
      {isCreateMeetOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Schedule Painters Meet</h3>
              <button onClick={() => setIsCreateMeetOpen(false)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold text-foreground">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Meet Topic / Name</label>
                <input 
                  type="text" 
                  value={newMeet.name} 
                  onChange={e => setNewMeet(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Monsoon Coating & Swatches Seminar"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Meet Date</label>
                  <input 
                    type="date" 
                    value={newMeet.date} 
                    onChange={e => setNewMeet(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Venue</label>
                  <input 
                    type="text" 
                    value={newMeet.venue} 
                    onChange={e => setNewMeet(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="e.g. Rajasthan Depot Jaipur"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button onClick={() => setIsCreateMeetOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleCreateMeetSubmit} className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Schedule Meet</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD PORTFOLIO PHOTO ─── */}
      {isAddPortfolioOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Add Project to Portfolio</h3>
              <button onClick={() => setIsAddPortfolioOpen(false)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold text-foreground">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Project Title</label>
                <input 
                  type="text" 
                  value={newPortfolio.title} 
                  onChange={e => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Premium Exterior Texture"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Location / City</label>
                  <input 
                    type="text" 
                    value={newPortfolio.location} 
                    onChange={e => setNewPortfolio(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. C-Scheme, Jaipur"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground uppercase text-[9px] block">Executing Painter Name</label>
                  <select
                    value={newPortfolio.painterName}
                    onChange={e => setNewPortfolio(prev => ({ ...prev, painterName: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground font-bold"
                  >
                    <option value="">-- Select Painter --</option>
                    {painters.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Project Image URL</label>
                <input 
                  type="text" 
                  value={newPortfolio.imageUrl} 
                  onChange={e => setNewPortfolio(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground uppercase text-[9px] block">Short Work Description</label>
                <textarea 
                  rows={2}
                  value={newPortfolio.description} 
                  onChange={e => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe coating textures or finished color swatches..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button onClick={() => setIsAddPortfolioOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleAddPortfolioSubmit} className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Add Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Drawer Panel */}
      <AnimatePresence>
        {selectedPainter && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPainter(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-card border-l border-border h-full flex flex-col shadow-2xl"
            >
              
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t("Painter Profile Deep-Dive")}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("Details & activity history of the selected painter.")}</p>
                </div>
                <button
                  onClick={() => setSelectedPainter(null)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                <div className="bg-muted/30 border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase">
                    {selectedPainter.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedPainter.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
                        {t("SP ID")}: {selectedPainter.swatch_id || "N/A"}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Phone size={12} /> {selectedPainter.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-bold">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-xs text-center">
                    <Coins className="mx-auto text-amber-500 mb-1.5" size={20} />
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t("Tokens Scanned")}</p>
                    <p className="text-xl font-black text-foreground mt-1 font-mono">
                      {selectedPainter.total_tokens + selectedPainter.total_redeemed}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 shadow-xs text-center">
                    <ArrowUpRight className="mx-auto text-rose-500 mb-1.5" size={20} />
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t("Tokens Redeemed")}</p>
                    <p className="text-xl font-black text-foreground mt-1 font-mono">
                      {selectedPainter.total_redeemed}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 shadow-xs text-center">
                    <DollarSign className="mx-auto text-emerald-500 mb-1.5" size={20} />
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t("Redeemable Cash")}</p>
                    <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
                      ₹ {selectedPainter.total_tokens}
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4 text-xs">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <ClipboardList size={16} className="text-primary" /> {t("Personal Information")}
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">{t("Aadhaar Card No")}</span>
                      <span className="font-mono font-bold text-foreground mt-0.5 block">{selectedPainter.aadhar_no || "Not Verified"}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">{t("Area Locality")}</span>
                      <span className="font-semibold text-foreground mt-0.5 block">{selectedPainter.locality || "Not Configured"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">{t("Full Permanent Address")}</span>
                      <span className="font-medium text-foreground mt-0.5 block">{selectedPainter.address || "No address entered."}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2 text-xs">
                    <Layers size={16} className="text-primary" /> {t("Product & Dealer scan history")}
                  </h4>
                  
                  {selectedPainter.scans.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">{t("No scanned bags or products registered under this account.")}</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedPainter.scans.map((sc, i) => (
                        <div key={i} className="flex flex-col gap-2.5 p-4 bg-muted/20 border border-border rounded-2xl hover:bg-muted/40 transition-colors text-xs">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-base text-foreground">{sc.product_name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t("QR Code")}: <span className="font-mono text-primary font-bold">{sc.qr_code}</span>
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-650 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                              +{sc.token_value} Pts
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">{t("Dealer Store / Owner")}</span>
                              <span className="font-bold text-foreground mt-0.5 block">{sc.dealer_name}</span>
                              <span className="text-[11px] text-muted-foreground block mt-0.5 flex items-center gap-1">
                                <MapPin size={10} /> {sc.dealer_locality}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">{t("Quantity & Scanned Date")}</span>
                              <span className="font-bold text-foreground mt-0.5 block">Qty: {sc.invoice_qty} Unit(s)</span>
                              <span className="text-[10px] text-muted-foreground block mt-0.5">
                                {new Date(sc.scanned_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">{t("Store Address")}</span>
                              <span className="text-[11px] font-medium text-foreground/80 mt-0.5 block">{sc.dealer_address}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD REWARD ITEM
      ══════════════════════════════════════════════════════════════ */}
      {isAddRewardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add Reward Item</h2>
              <button onClick={() => setIsAddRewardOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Reward Name *</label>
                <input
                  type="text" value={newReward.name}
                  onChange={e => setNewReward(r => ({ ...r, name: e.target.value }))}
                  placeholder="e.g. Professional Painter Tool Kit"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Points Required *</label>
                  <input
                    type="number" value={newReward.points}
                    onChange={e => setNewReward(r => ({ ...r, points: e.target.value }))}
                    placeholder="200"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Category</label>
                  <select
                    value={newReward.category}
                    onChange={e => setNewReward(r => ({ ...r, category: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  >
                    {["Tools", "Apparel", "Equipment", "Cashback", "Voucher", "Other"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddRewardOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button
                disabled={isPending || !newReward.name || !newReward.points}
                onClick={() => {
                  startTransition(async () => {
                    const res = await addRewardItem({ name: newReward.name, points: parseInt(newReward.points), category: newReward.category });
                    if (res.success && res.item) {
                      setRewardsList(prev => [res.item!, ...prev]);
                      setNewReward({ name: "", points: "", category: "Tools" });
                      setIsAddRewardOpen(false);
                      showToast("success", "Reward item added!");
                    } else {
                      showToast("error", `Failed: ${res.error}`);
                    }
                  });
                }}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {isPending ? "Saving…" : "Add Reward"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD PRODUCT SCHEME
      ══════════════════════════════════════════════════════════════ */}
      {isAddSchemeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add Product Scheme</h2>
              <button onClick={() => setIsAddSchemeOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Scheme Title *</label>
                <input
                  type="text" value={newScheme.title}
                  onChange={e => setNewScheme(s => ({ ...s, title: e.target.value }))}
                  placeholder="e.g. Monsoon Bonus Points 2x"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={newScheme.description}
                  onChange={e => setNewScheme(s => ({ ...s, description: e.target.value }))}
                  rows={2} placeholder="Brief description of this scheme…"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Start Date</label>
                  <input
                    type="date" value={newScheme.start_date}
                    onChange={e => setNewScheme(s => ({ ...s, start_date: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">End Date</label>
                  <input
                    type="date" value={newScheme.end_date}
                    onChange={e => setNewScheme(s => ({ ...s, end_date: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Points Multiplier</label>
                <input
                  type="number" step="0.1" min="1" value={newScheme.points_multiplier}
                  onChange={e => setNewScheme(s => ({ ...s, points_multiplier: parseFloat(e.target.value) }))}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddSchemeOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button
                disabled={isPending || !newScheme.title}
                onClick={() => {
                  startTransition(async () => {
                    const res = await addScheme({
                      title: newScheme.title,
                      description: newScheme.description || null,
                      start_date: newScheme.start_date || null,
                      end_date: newScheme.end_date || null,
                      points_multiplier: newScheme.points_multiplier
                    });
                    if (res.success && res.scheme) {
                      setSchemesList(prev => [res.scheme!, ...prev]);
                      setNewScheme({ title: "", description: "", start_date: "", end_date: "", points_multiplier: 1.0 });
                      setIsAddSchemeOpen(false);
                      showToast("success", "Scheme added successfully!");
                    } else {
                      showToast("error", `Failed to create scheme: ${res.error}`);
                    }
                  });
                }}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {isPending ? "Saving…" : "Create Scheme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD COMPETITION
      ══════════════════════════════════════════════════════════════ */}
      {isAddCompetitionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add New Competition</h2>
              <button onClick={() => setIsAddCompetitionOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Competition Title *</label>
                <input
                  type="text" value={newCompetition.title}
                  onChange={e => setNewCompetition(c => ({ ...c, title: e.target.value }))}
                  placeholder="e.g. Best Exterior Finish Challenge 2026"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={newCompetition.description}
                  onChange={e => setNewCompetition(c => ({ ...c, description: e.target.value }))}
                  rows={2} placeholder="Brief overview of this competition…"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Rules & Regulations *</label>
                <textarea
                  value={newCompetition.rules}
                  onChange={e => setNewCompetition(c => ({ ...c, rules: e.target.value }))}
                  rows={4} placeholder="1. Painter must be active for 3+ months&#10;2. Only use Sharma Industries products&#10;3. Submit before the deadline…"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Winning Criteria *</label>
                <textarea
                  value={newCompetition.criteria}
                  onChange={e => setNewCompetition(c => ({ ...c, criteria: e.target.value }))}
                  rows={3} placeholder="Top 3 painters by coupon scan count win.&#10;Judges will evaluate on quality, creativity and volume."
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Start Date</label>
                  <input
                    type="date" value={newCompetition.start_date}
                    onChange={e => setNewCompetition(c => ({ ...c, start_date: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">End Date</label>
                  <input
                    type="date" value={newCompetition.end_date}
                    onChange={e => setNewCompetition(c => ({ ...c, end_date: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddCompetitionOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button
                disabled={isPending || !newCompetition.title || !newCompetition.rules || !newCompetition.criteria}
                onClick={() => {
                  startTransition(async () => {
                    const res = await addCompetition({
                      title: newCompetition.title,
                      description: newCompetition.description || null,
                      rules: newCompetition.rules,
                      criteria: newCompetition.criteria,
                      start_date: newCompetition.start_date || null,
                      end_date: newCompetition.end_date || null,
                    });
                    if (res.success && res.competition) {
                      setCompetitionsList(prev => [res.competition!, ...prev]);
                      setNewCompetition({ title: "", description: "", rules: "", criteria: "", start_date: "", end_date: "" });
                      setIsAddCompetitionOpen(false);
                      showToast("success", "Competition created!");
                    } else {
                      showToast("error", `Failed: ${res.error}`);
                    }
                  });
                }}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {isPending ? "Saving…" : "Create Competition"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: CREATE PAINTERS MEET
      ══════════════════════════════════════════════════════════════ */}
      {isCreateMeetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Create Painters Meet</h2>
              <button onClick={() => setIsCreateMeetOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Meet Name *</label>
                <input
                  type="text" value={newMeet.name}
                  onChange={e => setNewMeet(m => ({ ...m, name: e.target.value }))}
                  placeholder="e.g. Monsoon Coating Techniques Meet"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Date *</label>
                <input
                  type="date" value={newMeet.date}
                  onChange={e => setNewMeet(m => ({ ...m, date: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Venue *</label>
                <input
                  type="text" value={newMeet.venue}
                  onChange={e => setNewMeet(m => ({ ...m, venue: e.target.value }))}
                  placeholder="e.g. Hotel Taj Palace, Jaipur"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsCreateMeetOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button
                disabled={!newMeet.name || !newMeet.date || !newMeet.venue}
                onClick={() => {
                  const created = { id: `MEET-${Date.now()}`, name: newMeet.name, date: newMeet.date, venue: newMeet.venue, attendees: [] };
                  const updated = [created, ...meetsList];
                  setMeetsList(updated);
                  localStorage.setItem("sharma_painters_meets", JSON.stringify(updated));
                  setNewMeet({ name: "", date: "", venue: "" });
                  setIsCreateMeetOpen(false);
                  showToast("success", "Painters meet created!");
                }}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Create Meet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD PORTFOLIO ITEM
      ══════════════════════════════════════════════════════════════ */}
      {isAddPortfolioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Add Portfolio Entry</h2>
              <button onClick={() => setIsAddPortfolioOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Project Title *</label>
                <input
                  type="text" value={newPortfolio.title}
                  onChange={e => setNewPortfolio(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Luxury Villa Exterior"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Painter Name *</label>
                  <input
                    type="text" value={newPortfolio.painterName}
                    onChange={e => setNewPortfolio(p => ({ ...p, painterName: e.target.value }))}
                    placeholder="Rajesh Kumar"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Location</label>
                  <input
                    type="text" value={newPortfolio.location}
                    onChange={e => setNewPortfolio(p => ({ ...p, location: e.target.value }))}
                    placeholder="Malviya Nagar, Jaipur"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Image URL *</label>
                <input
                  type="text" value={newPortfolio.imageUrl}
                  onChange={e => setNewPortfolio(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={newPortfolio.description}
                  onChange={e => setNewPortfolio(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Short description of the project…"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddPortfolioOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button
                disabled={!newPortfolio.title || !newPortfolio.painterName || !newPortfolio.imageUrl}
                onClick={() => {
                  const created = { id: `PORT-${Date.now()}`, ...newPortfolio };
                  const updated = [created, ...portfolioList];
                  setPortfolioList(updated);
                  localStorage.setItem("sharma_painters_portfolio", JSON.stringify(updated));
                  setNewPortfolio({ title: "", location: "", painterName: "", imageUrl: "", description: "" });
                  setIsAddPortfolioOpen(false);
                  showToast("success", "Portfolio entry added!");
                }}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
