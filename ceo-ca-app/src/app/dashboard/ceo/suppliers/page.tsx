"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  X, 
  Eye, 
  Landmark, 
  FolderPlus,
  ArrowRight,
  TrendingUp,
  Tag,
  Calculator
} from "lucide-react";
import { getSuppliers, addSupplier, getSupplierDetailData } from "@/actions/purchaseActions";

export default function SuppliersPage() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Selected supplier details state
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [supplierDetails, setSupplierDetails] = useState<{ bills: any[]; suppliedItems: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    "Chemicals & Raw Materials",
    "Buckets",
    "Bottles",
    "Stickers & Labels",
    "Finished Products"
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gstin: "",
    phone: "",
    email: "",
    bank_name: "",
    bank_account_no: "",
    bank_ifsc: "",
    bank_branch: ""
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    const res = await getSuppliers();
    if (res.success && res.data) {
      setSuppliers(res.data);
    }
    setLoading(false);
  };

  const handleSupplierClick = async (supplier: any) => {
    setSelectedSupplier(supplier);
    setLoadingDetails(true);
    setSupplierDetails(null);
    
    const res = await getSupplierDetailData(supplier.name);
    if (res.success && res.data) {
      setSupplierDetails(res.data);
    }
    setLoadingDetails(false);
  };

  const handleAddCategory = () => {
    if (newCategoryInput.trim() && !categories.includes(newCategoryInput.trim())) {
      setCategories([...categories, newCategoryInput.trim()]);
      setNewCategoryInput("");
    }
  };

  const toggleCategorySelection = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    startTransition(async () => {
      const payload = {
        name: formData.name,
        address: formData.address,
        gstin: formData.gstin,
        phone: formData.phone,
        email: formData.email,
        categories: selectedCategories,
        bank_name: formData.bank_name,
        bank_account_no: formData.bank_account_no,
        bank_ifsc: formData.bank_ifsc,
        bank_branch: formData.bank_branch
      };

      const res = await addSupplier(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          address: "",
          gstin: "",
          phone: "",
          email: "",
          bank_name: "",
          bank_account_no: "",
          bank_ifsc: "",
          bank_branch: ""
        });
        setSelectedCategories([]);
        fetchSuppliers();
      } else {
        alert("Error saving supplier: " + res.error);
      }
    });
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const nameMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = (s.categories || []).some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return nameMatch || catMatch;
    });
  }, [suppliers, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">{t("Suppliers Registry")}</h1>
          <p className="text-muted-foreground text-sm font-medium">{t("Manage supplier logs, categories, prices, and bank details")}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:shadow-md"
        >
          <Plus size={20} /> {t("Add New Supplier")}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
          <Search size={18} />
        </span>
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t("Search by supplier name or category...")}
          className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold placeholder:text-muted-foreground/60 shadow-sm"
        />
      </div>

      {/* Suppliers Grid Layout */}
      {loading ? (
        <div className="text-center py-12 font-bold text-muted-foreground text-lg">{t("Loading suppliers...")}</div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground font-bold">
          {t("No suppliers found. Click Add New Supplier to get started.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div 
              key={supplier.id} 
              onClick={() => handleSupplierClick(supplier)}
              className="bg-card border border-border rounded-3xl p-6 relative hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors flex justify-between items-center">
                  <span>{supplier.name}</span>
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-primary translate-x-[-10px] group-hover:translate-x-0" />
                </h3>
                {supplier.gstin && (
                  <p className="text-xs font-mono text-muted-foreground/80 mt-1 uppercase">GSTIN: {supplier.gstin}</p>
                )}

                {/* Categories badges */}
                {supplier.categories && supplier.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {supplier.categories.map((cat: string, idx: number) => (
                      <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border/40 space-y-2 text-sm text-muted-foreground">
                  {supplier.address && (
                    <p className="flex items-start gap-2">
                      <MapPin size={14} className="shrink-0 mt-0.5 text-primary/60" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </p>
                  )}
                  {supplier.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-primary/60" />
                      <span>{supplier.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Banking Preview */}
              {supplier.bank_name && (
                <div className="mt-4 bg-background border border-border/30 rounded-xl p-3 flex items-center gap-3">
                  <Landmark size={20} className="text-emerald-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-foreground truncate">{supplier.bank_name}</p>
                    <p className="text-xs font-mono text-muted-foreground truncate">A/C: ****{supplier.bank_account_no?.slice(-4) || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-foreground">{t("Add New Supplier")}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-6">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Supplier Name")} *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter supplier registered company name"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("GSTIN Number")}</label>
                  <input 
                    type="text" 
                    value={formData.gstin}
                    onChange={e => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                    placeholder="e.g. 08AAPCS4939B1Z8"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Contact Phone")}</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Contact Email")}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. info@supplier.com"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Supplier Address")}</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter full physical registered address"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              {/* Dynamic Categories Selection & Custom Categories */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Supplies Categories")}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCategoryInput}
                      onChange={e => setNewCategoryInput(e.target.value)}
                      placeholder="Add Category"
                      className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory}
                      className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <FolderPlus size={14} /> {t("Add")}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSel = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategorySelection(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSel 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Banking Fields */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Landmark size={18} className="text-emerald-500" /> {t("Banking Details")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">{t("Bank Name")}</label>
                    <input 
                      type="text" 
                      value={formData.bank_name}
                      onChange={e => setFormData({...formData, bank_name: e.target.value})}
                      placeholder="e.g. HDFC Bank"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">{t("Account Number")}</label>
                    <input 
                      type="text" 
                      value={formData.bank_account_no}
                      onChange={e => setFormData({...formData, bank_account_no: e.target.value})}
                      placeholder="e.g. 50200105374819"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">{t("IFSC Code")}</label>
                    <input 
                      type="text" 
                      value={formData.bank_ifsc}
                      onChange={e => setFormData({...formData, bank_ifsc: e.target.value.toUpperCase()})}
                      placeholder="e.g. HDFC0008546"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">{t("Branch Name")}</label>
                    <input 
                      type="text" 
                      value={formData.bank_branch}
                      onChange={e => setFormData({...formData, bank_branch: e.target.value})}
                      placeholder="e.g. New Atish Market, Jaipur"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all"
                >
                  {t("Cancel")}
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  {isPending ? t("Saving...") : t("Save Supplier")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL WINDOW */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-black text-foreground">{selectedSupplier.name}</h2>
                {selectedSupplier.gstin && (
                  <p className="text-sm font-mono text-muted-foreground/80 mt-1 uppercase">GSTIN: {selectedSupplier.gstin}</p>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedSupplier(null);
                  setSupplierDetails(null);
                }} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Supplier Contact & Bank Details */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Contact Card */}
                <div className="bg-background border border-border/40 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("Contact Details")}</h3>
                  {selectedSupplier.address && (
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-primary" />
                      <span>{selectedSupplier.address}</span>
                    </div>
                  )}
                  {selectedSupplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Phone size={16} className="text-primary" />
                      <span>{selectedSupplier.phone}</span>
                    </div>
                  )}
                  {selectedSupplier.email && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Mail size={16} className="text-primary" />
                      <span>{selectedSupplier.email}</span>
                    </div>
                  )}
                </div>

                {/* Bank Card */}
                <div className="bg-background border border-border/40 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Landmark size={16} className="text-emerald-500" /> {t("Banking Profile")}
                  </h3>
                  {selectedSupplier.bank_name ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">{t("Bank Name")}</span>
                        <span className="font-bold text-foreground">{selectedSupplier.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">{t("Account Number")}</span>
                        <span className="font-mono font-bold text-foreground">{selectedSupplier.bank_account_no}</span>
                      </div>
                      {selectedSupplier.bank_ifsc && (
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("IFSC Code")}</span>
                          <span className="font-mono font-bold text-foreground uppercase">{selectedSupplier.bank_ifsc}</span>
                        </div>
                      )}
                      {selectedSupplier.bank_branch && (
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("Branch")}</span>
                          <span className="font-medium text-foreground">{selectedSupplier.bank_branch}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground font-semibold italic">{t("No banking profile found.")}</p>
                  )}
                </div>

              </div>

              {/* Right Column: Dynamic logs tabs */}
              <div className="md:col-span-2 space-y-6">
                
                {loadingDetails ? (
                  <div className="text-center py-12 font-bold text-muted-foreground">{t("Loading history logs...")}</div>
                ) : (
                  <>
                    {/* Materials & Products Supplied with Recent Pricing */}
                    <div className="space-y-3">
                      <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                        <Tag size={18} className="text-primary" /> {t("Supplied Materials & Products")}
                      </h3>
                      {supplierDetails?.suppliedItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground/75 italic bg-background border border-border/30 rounded-2xl p-4">{t("No supply records found.")}</p>
                      ) : (
                        <div className="bg-background border border-border/40 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-black uppercase tracking-wider">
                                <th className="p-3 pl-4">{t("Item Name")}</th>
                                <th className="p-3 text-right pr-4">{t("Recent Purchase Price")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {supplierDetails?.suppliedItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-border/25 hover:bg-muted/10">
                                  <td className="p-3 pl-4 font-bold text-foreground text-sm">{item.name}</td>
                                  <td className="p-3 text-right pr-4 text-sm font-black text-primary">
                                    ₹{item.rate.toLocaleString('en-IN', { maximumFractionDigits: 2 })} / {item.unit}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Bills / Purchase History */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                        <FileText size={18} className="text-primary" /> {t("Purchase Invoices History")}
                      </h3>
                      {supplierDetails?.bills.length === 0 ? (
                        <p className="text-sm text-muted-foreground/75 italic bg-background border border-border/30 rounded-2xl p-4">{t("No billing records found.")}</p>
                      ) : (
                        <div className="space-y-3">
                          {supplierDetails?.bills.map((bill) => {
                            const dateStr = new Date(bill.date).toLocaleDateString('en-IN');
                            const amount = Number(bill.grand_total || bill.total_amount || 0);
                            const isPaid = bill.payment_status === "PAID";
                            return (
                              <div key={bill.id} className="bg-background border border-border/40 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-sm transition-all">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-foreground">Invoice #{bill.invoice_no}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-semibold">
                                    <span>{dateStr}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-0.5 rounded border ${
                                      isPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>
                                      {bill.payment_status || "UNPAID"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between sm:justify-end">
                                  <p className="text-base font-black text-foreground">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                  {bill.bill_file_path && (
                                    <a 
                                      href={`https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/purchase_bills/${bill.bill_file_path}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-primary/15 hover:bg-primary/20 text-primary p-2 rounded-xl border border-primary/20 transition-all"
                                      title={t("View Original Bill")}
                                    >
                                      <Eye size={16} />
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

    </div>
  );
}
