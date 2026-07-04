"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Users, Search, CheckCircle2, XCircle, MapPin, Building2, UserCircle2, AlertTriangle, FileText, ChevronRight, Check, X, ExternalLink } from "lucide-react";
import { DealerOnboardingModal } from "./DealerOnboardingModal";
import { createClient } from "@supabase/supabase-js";

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
  pan_card_url: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  created_at: string;
}

interface SalesmanAdmin {
  id: string;
  name: string;
  phone: string;
  assignedRegion: string;
  status: "Pending" | "Approved" | "Inactive";
  dateOfJoining: string;
  emergencyContact: string;
  idProofStatus: "Uploaded" | "Missing";
  assignedDistricts: string[];
}

// --- MOCK DATA FOR SALESMEN (Keeping salesmen mocked as requested, pulling dealers from DB) ---
const MOCK_SALESMEN: SalesmanAdmin[] = [
  {
    id: "SM-101",
    name: "Rajesh Kumar",
    phone: "+91 9876543210",
    assignedRegion: "Maharashtra West",
    status: "Approved",
    dateOfJoining: "2026-02-15",
    emergencyContact: "+91 9123456780 (Wife)",
    idProofStatus: "Uploaded",
    assignedDistricts: ["Mumbai", "Thane", "Palghar"]
  },
  {
    id: "SM-102",
    name: "Vikram Singh",
    phone: "+91 9988776655",
    assignedRegion: "Gujarat South",
    status: "Approved",
    dateOfJoining: "2026-04-10",
    emergencyContact: "+91 9988776656 (Brother)",
    idProofStatus: "Uploaded",
    assignedDistricts: ["Surat", "Vapi"]
  },
  {
    id: "SM-103",
    name: "Amit Desai",
    phone: "+91 9001122334",
    assignedRegion: "Pune Division",
    status: "Pending",
    dateOfJoining: "Pending Approval",
    emergencyContact: "+91 9001122335 (Father)",
    idProofStatus: "Missing",
    assignedDistricts: []
  },
  {
    id: "SM-104",
    name: "Sanjay Patel",
    phone: "+91 9112233445",
    assignedRegion: "Nagpur Vidarbha",
    status: "Pending",
    dateOfJoining: "Pending Approval",
    emergencyContact: "+91 9112233446 (Mother)",
    idProofStatus: "Uploaded",
    assignedDistricts: []
  },
  {
    id: "SM-105",
    name: "Karan Johar",
    phone: "+91 9554433221",
    assignedRegion: "Nashik Division",
    status: "Inactive",
    dateOfJoining: "2025-01-20",
    emergencyContact: "+91 9554433222 (Spouse)",
    idProofStatus: "Uploaded",
    assignedDistricts: ["Nashik"]
  }
];

export default function SalesTeamAdminClient() {
  const [salesmen, setSalesmen] = useState<SalesmanAdmin[]>(MOCK_SALESMEN);
  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Inactive">("All");
  const [selectedSalesman, setSelectedSalesman] = useState<SalesmanAdmin | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // --- FETCH DEALERS FROM SUPABASE ---
  const fetchDealers = async () => {
    const { data, error } = await supabase.from('dealers').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      setDealers(data);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // --- FILTER LOGIC ---
  const filteredSalesmen = useMemo(() => {
    return salesmen.filter(sm => {
      const matchesSearch = sm.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || sm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salesmen, searchTerm, statusFilter]);

  // Get dealers assigned to a specific salesman
  const getAssignedDealers = (salesmanId: string) => {
    return dealers.filter(d => d.assigned_salesman_id === salesmanId);
  };

  // --- ACTIONS ---
  const handleApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSalesmen(prev => prev.map(sm => {
      if (sm.id === id) {
        return { 
          ...sm, 
          status: "Approved", 
          dateOfJoining: new Date().toISOString().split('T')[0],
          idProofStatus: "Uploaded"
        };
      }
      return sm;
    }));
    alert(`Credentials generated and sent to salesman ${id}!`);
  };

  const handleReject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSalesmen(prev => prev.map(sm => sm.id === id ? { ...sm, status: "Inactive" } : sm));
  };

  const handleRowClick = (sm: SalesmanAdmin) => {
    if (sm.status === "Approved") {
      setSelectedSalesman(sm);
    }
  };

  const handleOnboardingSuccess = () => {
    setIsOnboardingModalOpen(false);
    fetchDealers(); // Refresh dealer list
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Salesmen Management & Distribution
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Admin Mode</span>
            Manage KYC, route distribution, and strictly oversee field approvals.
          </p>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Salesmen by Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["All", "Pending", "Approved", "Inactive"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Master Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Name</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Phone Number</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Assigned Region</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Dealers</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Account Status</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesmen.map(sm => {
                const isPending = sm.status === "Pending";
                const isApproved = sm.status === "Approved";
                const assignedDealersCount = getAssignedDealers(sm.id).length;
                
                return (
                  <tr 
                    key={sm.id} 
                    onClick={() => handleRowClick(sm)}
                    className={`border-b border-slate-100 transition-colors group ${
                      isApproved ? 'cursor-pointer hover:bg-slate-50' : 'opacity-80 bg-slate-50/30'
                    }`}
                  >
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        isApproved ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {sm.name.charAt(0)}
                      </div>
                      {sm.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">{sm.phone}</td>
                    <td className="py-4 px-6 font-medium text-slate-600 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" /> {sm.assignedRegion}
                    </td>
                    <td className="py-4 px-6 font-mono text-center font-bold text-slate-800">
                      {assignedDealersCount}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                        isPending ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {sm.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => handleReject(e, sm.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={(e) => handleApprove(e, sm.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                          >
                            <Check size={14} /> Approve
                          </button>
                        </div>
                      ) : (
                        isApproved && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors ml-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Deep-Dive Distribution Profile (Side Drawer) */}
      {selectedSalesman && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setSelectedSalesman(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            
            {/* Drawer Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <UserCircle2 className="text-primary w-7 h-7" /> {selectedSalesman.name}
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Approved Salesman • {selectedSalesman.phone}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSalesman(null)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
              
              {/* Section A: Personal & KYC Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Personal & KYC Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Joining</p>
                    <p className="font-bold text-slate-800 mt-1">{selectedSalesman.dateOfJoining}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</p>
                    <p className="font-mono text-slate-800 font-semibold mt-1">{selectedSalesman.emergencyContact}</p>
                  </div>
                  <div className={`col-span-2 border p-4 rounded-2xl flex justify-between items-center ${
                    selectedSalesman.idProofStatus === "Uploaded" ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">ID Proof Status (Aadhar/PAN)</p>
                      <p className={`font-black mt-1 ${selectedSalesman.idProofStatus === "Uploaded" ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {selectedSalesman.idProofStatus}
                      </p>
                    </div>
                    {selectedSalesman.idProofStatus === "Uploaded" ? <CheckCircle2 className="text-emerald-500 w-8 h-8" /> : <AlertTriangle className="text-rose-500 w-8 h-8" />}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Section B: Distribution Mapping */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} /> Territory Mapping
                </h3>
                
                {/* Districts */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Assigned Districts</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSalesman.assignedDistricts.length === 0 ? (
                      <span className="text-sm text-slate-400 italic">No districts assigned.</span>
                    ) : (
                      selectedSalesman.assignedDistricts.map(dist => (
                        <span key={dist} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold">
                          {dist}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Dealers from Database */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-700">Mapped Partners & Dealers ({getAssignedDealers(selectedSalesman.id).length})</p>
                    <button 
                      onClick={() => setIsOnboardingModalOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                      + Onboard New Partner
                    </button>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {getAssignedDealers(selectedSalesman.id).length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 flex flex-col items-center">
                        <Building2 className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-600">No partners mapped yet.</p>
                        <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs">Use the onboarding form to add dealers, distributors, or depots to this territory.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Business Name</th>
                              <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Type</th>
                              <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">GST & Locality</th>
                              <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">KYC Docs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getAssignedDealers(selectedSalesman.id).map(d => (
                              <tr key={d.id} className="border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50 group">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-800">{d.name}</p>
                                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{d.address}</p>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    d.designation === 'Distributor' ? 'bg-violet-50 text-violet-600 border border-violet-200' :
                                    d.designation === 'Depot' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                    'bg-blue-50 text-blue-600 border border-blue-200'
                                  }`}>
                                    {d.designation}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <p className="font-mono text-xs text-slate-700 font-semibold">{d.gst_number || "UNREGISTERED"}</p>
                                  <p className="text-xs text-slate-500">{d.localities}</p>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {d.pan_card_url && (
                                      <a href={d.pan_card_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                        PAN <ExternalLink size={10} />
                                      </a>
                                    )}
                                    {d.aadhaar_front_url && (
                                      <a href={d.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                        AADHAAR <ExternalLink size={10} />
                                      </a>
                                    )}
                                    {(!d.pan_card_url && !d.aadhaar_front_url) && (
                                      <span className="text-xs font-medium text-slate-400 italic">No Docs</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. Dealer Onboarding Modal (Rendered outside the drawer logic to float above) */}
      {isOnboardingModalOpen && selectedSalesman && (
        <DealerOnboardingModal 
          salesmanId={selectedSalesman.id}
          salesmanName={selectedSalesman.name}
          onClose={() => setIsOnboardingModalOpen(false)}
          onSuccess={handleOnboardingSuccess}
        />
      )}

    </div>
  );
}
