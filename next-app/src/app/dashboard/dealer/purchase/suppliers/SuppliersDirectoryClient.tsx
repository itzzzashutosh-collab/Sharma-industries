"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Building2, Plus, Search, MapPin, Phone, Mail, Landmark, Tag, ArrowRight, X,
  Eye, CheckCircle2, FolderPlus, FileText, Sparkles
} from "lucide-react";
import { createDealerSupplier, getDealerSupplierDetailData } from "../../actions";

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  gstin?: string | null;
  address?: string | null;
  email?: string | null;
  categories?: string[] | null;
  bank_name?: string | null;
  bank_account_no?: string | null;
  bank_ifsc?: string | null;
  bank_branch?: string | null;
}

interface Props {
  initialData: Supplier[];
}

export function SuppliersDirectoryClient({ initialData = [] }: Props) {
  const [list, setList] = useState<Supplier[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Selected Vendor Detail (CEO Mode Parity)
  const [selectedVendor, setSelectedVendor] = useState<Supplier | null>(null);
  const [vendorDetails, setVendorDetails] = useState<{ bills: any[]; suppliedItems: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New Vendor Form State
  const [vendorForm, setVendorForm] = useState({
    name: "",
    address: "",
    gstin: "",
    phone: "",
    email: "",
    bank_name: "",
    bank_account_no: "",
    bank_ifsc: "",
    bank_branch: "",
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Asian Paints",
    "Swatch",
    "Berger",
    "Nerolac",
    "Dulux",
    "Sharma Industries",
    "Raw Materials",
    "Packaging Buckets",
  ]);
  const [newCatInput, setNewCatInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Asian Paints"]);

  // Filtered List
  const filteredVendors = useMemo(() => {
    return list.filter((sup) => {
      const nameMatch = sup.name?.toLowerCase().includes(search.toLowerCase());
      const catMatch = (sup.categories || []).some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const gstinMatch = sup.gstin?.toLowerCase().includes(search.toLowerCase());
      return nameMatch || catMatch || gstinMatch;
    });
  }, [list, search]);

  // Click Vendor Card (CEO Mode Detail Fetcher)
  const handleVendorClick = async (vendor: Supplier) => {
    setSelectedVendor(vendor);
    setLoadingDetails(true);
    setVendorDetails(null);

    const res = await getDealerSupplierDetailData(vendor.name);
    if (res.success && res.data) {
      setVendorDetails(res.data);
    }
    setLoadingDetails(false);
  };

  // Add Vendor Handler
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) return;

    startTransition(async () => {
      const payload = {
        name: vendorForm.name,
        address: vendorForm.address,
        gstin: vendorForm.gstin,
        phone: vendorForm.phone,
        email: vendorForm.email,
        categories: selectedCategories,
        bank_name: vendorForm.bank_name,
        bank_account_no: vendorForm.bank_account_no,
        bank_ifsc: vendorForm.bank_ifsc,
        bank_branch: vendorForm.bank_branch,
      };

      const res = await createDealerSupplier(payload);
      if (res.success) {
        const newSup: Supplier = {
          id: `SUP_${Date.now()}`,
          name: vendorForm.name,
          phone: vendorForm.phone,
          gstin: vendorForm.gstin,
          address: vendorForm.address,
          email: vendorForm.email,
          categories: selectedCategories,
          bank_name: vendorForm.bank_name,
          bank_account_no: vendorForm.bank_account_no,
          bank_ifsc: vendorForm.bank_ifsc,
          bank_branch: vendorForm.bank_branch,
        };
        setList((prev) => [newSup, ...prev]);
        setShowAddModal(false);
        setVendorForm({
          name: "",
          address: "",
          gstin: "",
          phone: "",
          email: "",
          bank_name: "",
          bank_account_no: "",
          bank_ifsc: "",
          bank_branch: "",
        });
        setSelectedCategories(["Asian Paints"]);
      } else {
        alert(res.error || "Failed to register vendor");
      }
    });
  };

  const handleAddCategory = () => {
    if (newCatInput.trim() && !availableCategories.includes(newCatInput.trim())) {
      setAvailableCategories([...availableCategories, newCatInput.trim()]);
      setSelectedCategories([...selectedCategories, newCatInput.trim()]);
      setNewCatInput("");
    }
  };

  const toggleCategorySelection = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Suppliers & Vendors Directory</h1>
            <p className="text-xs text-muted-foreground">
              Manage supplier & vendor company profiles, brand catalog categories, banking profiles & bill histories
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus size={14} /> + Add New Supplier / Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vendor by name, brand category, or GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            onClick={() => handleVendorClick(vendor)}
            className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {vendor.name}
                  </h3>
                  {vendor.gstin && (
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5 uppercase">GSTIN: {vendor.gstin}</p>
                  )}
                </div>
                <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>

              {/* Brand / Categories Badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(vendor.categories || ["Finished Products"]).map((cat, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    {cat}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5 text-xs text-muted-foreground">
                {vendor.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin size={13} className="shrink-0 mt-0.5 text-primary/60" />
                    <span className="line-clamp-2">{vendor.address}</span>
                  </p>
                )}
                {vendor.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary/60" />
                    <span>{vendor.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Banking Preview */}
            {vendor.bank_name && (
              <div className="bg-muted/40 border border-border/40 rounded-xl p-2.5 flex items-center gap-2.5 text-xs">
                <Landmark size={16} className="text-emerald-500 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-foreground truncate">{vendor.bank_name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">A/C: ****{vendor.bank_account_no?.slice(-4) || "—"}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredVendors.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl">
            <Building2 size={36} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-bold text-foreground">No Suppliers Found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "+ Add New Supplier" to register vendor details.</p>
          </div>
        )}
      </div>

      {/* Vendor Details & Brand History Drawer / Modal (CEO Mode Parity) */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-black text-foreground">{selectedVendor.name}</h2>
                {selectedVendor.gstin && (
                  <p className="text-xs font-mono text-muted-foreground/80 mt-1 uppercase">GSTIN: {selectedVendor.gstin}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedVendor(null);
                  setVendorDetails(null);
                }}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="md:col-span-1 space-y-5">
                <div className="bg-background border border-border/50 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Info</h3>
                  {selectedVendor.address && (
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <MapPin size={15} className="shrink-0 mt-0.5 text-primary" />
                      <span>{selectedVendor.address}</span>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <Phone size={15} className="text-primary" />
                      <span>{selectedVendor.phone}</span>
                    </div>
                  )}
                  {selectedVendor.email && (
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <Mail size={15} className="text-primary" />
                      <span>{selectedVendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Bank Details */}
                <div className="bg-background border border-border/50 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Landmark size={15} className="text-emerald-500" /> Banking Profile
                  </h3>
                  {selectedVendor.bank_name ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Bank Name</span>
                        <span className="font-bold text-foreground">{selectedVendor.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Account Number</span>
                        <span className="font-mono font-bold text-foreground">{selectedVendor.bank_account_no}</span>
                      </div>
                      {selectedVendor.bank_ifsc && (
                        <div>
                          <span className="text-[10px] text-muted-foreground block">IFSC Code</span>
                          <span className="font-mono font-bold text-foreground uppercase">{selectedVendor.bank_ifsc}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No banking profile stored.</p>
                  )}
                </div>
              </div>

              {/* Supplied Materials & History */}
              <div className="md:col-span-2 space-y-6">
                {loadingDetails ? (
                  <div className="text-center py-12 font-bold text-muted-foreground text-xs">Loading vendor history logs...</div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <Tag size={16} className="text-primary" /> Supplied Materials & Brand Rates
                      </h3>
                      {vendorDetails?.suppliedItems.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic bg-background border border-border/40 rounded-2xl p-4">
                          No supply history records found for this vendor.
                        </p>
                      ) : (
                        <div className="bg-background border border-border/40 rounded-2xl overflow-hidden text-xs">
                          <table className="w-full text-left">
                            <thead className="border-b border-border bg-muted/40 text-muted-foreground text-[10px] font-black uppercase">
                              <tr>
                                <th className="p-3 pl-4">Item Name</th>
                                <th className="p-3">Brand</th>
                                <th className="p-3 text-right pr-4">Recent Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 font-medium">
                              {vendorDetails?.suppliedItems.map((item, idx) => (
                                <tr key={idx} className="hover:bg-muted/10">
                                  <td className="p-3 pl-4 font-bold text-foreground">{item.name}</td>
                                  <td className="p-3">
                                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                      {item.brand}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right pr-4 font-black text-primary">
                                    ₹{Number(item.rate || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })} / {item.unit}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <FileText size={16} className="text-primary" /> Purchase Invoices History
                      </h3>
                      {vendorDetails?.bills.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic bg-background border border-border/40 rounded-2xl p-4">
                          No bill records found.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {vendorDetails?.bills.map((bill) => {
                            const dateStr = new Date(bill.date).toLocaleDateString("en-IN");
                            const amount = Number(bill.grand_total || bill.total_amount || 0);
                            const isPaid = bill.payment_status === "PAID" || bill.payment_status === "paid";
                            return (
                              <div
                                key={bill.id}
                                className="bg-background border border-border/40 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-bold text-foreground font-mono">Invoice #{bill.invoice_no}</p>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>{dateStr}</span>
                                    <span>•</span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                        isPaid
                                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                      }`}
                                    >
                                      {bill.payment_status || "UNPAID"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-black text-foreground text-sm">₹{amount.toLocaleString("en-IN")}</p>
                                  {bill.bill_file_path && (
                                    <a
                                      href={`https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/purchase_bills/${bill.bill_file_path}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl"
                                    >
                                      <Eye size={14} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                <Building2 size={20} className="text-primary" /> Register New Supplier / Vendor
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Vendor / Company Name *</label>
                  <input
                    required
                    type="text"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    placeholder="e.g. Asian Paints Regional Depot"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={vendorForm.gstin}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="08AAPCS4939B1Z8"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono uppercase outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    placeholder="info@vendor.com"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Registered Address</label>
                <input
                  type="text"
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  placeholder="Full office or warehouse address"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                />
              </div>

              {/* Brand Categories Selection */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-muted-foreground uppercase block">Supplied Brands & Categories</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      placeholder="Add Category"
                      className="bg-background border border-border rounded-lg px-2.5 py-1 text-[11px] outline-none text-foreground"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="bg-primary text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <FolderPlus size={12} /> Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => {
                    const isSel = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategorySelection(cat)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                          isSel ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground hover:border-primary"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Banking Fields */}
              <div className="space-y-3 pt-2 border-t border-border">
                <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <Landmark size={15} className="text-emerald-500" /> Banking Profile
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={vendorForm.bank_name}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_name: e.target.value })}
                      placeholder="HDFC Bank"
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={vendorForm.bank_account_no}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_account_no: e.target.value })}
                      placeholder="50200105374819"
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={vendorForm.bank_ifsc}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_ifsc: e.target.value.toUpperCase() })}
                      placeholder="HDFC0008546"
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-mono uppercase outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Branch</label>
                    <input
                      type="text"
                      value={vendorForm.bank_branch}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_branch: e.target.value })}
                      placeholder="Atish Market Branch"
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 size={16} /> Save & Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
