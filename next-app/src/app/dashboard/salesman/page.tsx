"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ShoppingBag, 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { DealerOnboardingModal } from "../admin/sales-team/DealerOnboardingModal";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface DBDealer {
  id: string;
  name: string;
  address: string;
  localities: string;
  designation: string;
  gst_number: string;
  assigned_salesman_id: string;
  created_at: string;
}

interface Order {
  id: string;
  date: string;
  dealer_name: string;
  total_amount: number;
  status: string;
  salesman_name: string;
  assigned_salesman_id?: string;
}

export default function SalesmanDashboard() {
  const salesmanId = "SM-101"; // Preconfigured sandbox ID for Rajesh Kumar
  const salesmanName = "Rajesh Kumar";

  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Fetch salesman-specific data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dealers mapped to this salesman
      const { data: dealerData, error: dealerErr } = await supabase
        .from('dealers')
        .select('*')
        .eq('assigned_salesman_id', salesmanId);

      if (dealerData && !dealerErr) {
        setDealers(dealerData);
      }

      // 2. Fetch orders placed by this salesman
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('salesman_name', salesmanName)
        .order('created_at', { ascending: false });

      if (orderData && !orderErr) {
        setOrders(orderData);
      }
    } catch (err) {
      console.error("Error fetching salesman data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live metrics
  const totalSalesThisMonth = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  }, [orders]);

  const pendingApprovalsCount = useMemo(() => {
    return orders.filter(o => o.status === "Pending Approval").length;
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
      
      {/* 1. Welcoming Header banner */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
          <ShoppingBag size={300} />
        </div>
        <div className="space-y-2 relative z-10">
          <span className="bg-white/20 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
            Sales Force Executive
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2">
            Welcome back, {salesmanName}!
          </h1>
          <p className="text-white/80 text-sm font-medium">
            Monitor your territory, place new invoices, and onboarding regional dealers today.
          </p>
        </div>

        <button 
          onClick={() => setIsOnboardingOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-primary hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all relative z-10 shrink-0 transform hover:-translate-y-0.5"
        >
          <PlusCircle size={18} /> Onboard New Dealer
        </button>
      </div>

      {/* 2. Live Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Month-To-Date Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Month-to-Date Revenue</p>
            <p className="text-3xl font-black text-slate-800">
              ₹{totalSalesThisMonth.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp size={12} /> Live tracking from Order Book
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Assigned Dealers Mapped */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">My Onboarded Partners</p>
            <p className="text-3xl font-black text-slate-800">
              {dealers.length} Active
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Mapped Dealers, Distributors & Depots
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <p className="text-3xl font-black text-slate-800">
              {pendingApprovalsCount} Orders
            </p>
            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
              <Clock size={12} /> Awaiting CEO clearance
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
        </div>

      </div>

      {/* 3. Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders placed by Salesman */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">Recent Dispatch & Order Pipeline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status of orders submitted to CEO dashboard</p>
            </div>
            <Link 
              href="/dashboard/salesman/orders" 
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Dealer</th>
                  <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                  <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                      Loading pipeline...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                      No recent orders placed.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-primary">{o.id}</td>
                      <td className="p-3 font-bold text-slate-800">{o.dealer_name}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        ₹{Number(o.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                          o.status === "Pending Approval" ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          o.status === "Approved/Processing" ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          o.status === "Dispatched" ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          o.status === "Delivered" ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Territory Route Map Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5" /> Territory Map
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Your assigned distribution routes</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Region</span>
              <p className="text-sm font-bold text-slate-800 mt-1">Maharashtra West Division</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Districts / Locations Covered</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Mumbai", "Thane", "Palghar"].map(loc => (
                  <span key={loc} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold">
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 my-4" />

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onboarded Partners</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <p className="text-xs text-slate-400">Loading directory...</p>
                ) : dealers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No dealers onboarded yet.</p>
                ) : (
                  dealers.map(d => (
                    <div key={d.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.localities}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        {d.designation}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Dealer Onboarding Modal */}
      {isOnboardingOpen && (
        <DealerOnboardingModal 
          salesmanId={salesmanId}
          salesmanName={salesmanName}
          onClose={() => setIsOnboardingOpen(false)}
          onSuccess={() => {
            setIsOnboardingOpen(false);
            fetchData(); // Refresh metrics and directory
          }}
        />
      )}

    </div>
  );
}
