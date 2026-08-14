import React, { useState, useEffect } from "react";
import { X, MapPin, Map as MapIcon, Phone, Box, CheckCircle2, PackageSearch, PenLine, Save, IndianRupee } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { updateDealerProfile, getDealerInvoices } from "./actions";

interface DealerDetailsModalProps {
  dealer: any;
  onClose: () => void;
  onUpdate: (updatedDealer: any) => void;
}

export function DealerDetailsModal({ dealer, onClose, onUpdate }: DealerDetailsModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"purchases" | "products">("purchases");
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(dealer.address || "");
  const [territory, setTerritory] = useState(dealer.territory || "");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [dealer.id]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getDealerInvoices(dealer.id);
      setInvoices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateDealerProfile(dealer.id, { address, territory });
      if (res.success) {
        setIsEditing(false);
        onUpdate({ ...dealer, address, territory });
      } else {
        alert("Failed to save profile");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Compute metrics
  const totalOrders = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

  // Compute product history
  const productHistoryMap = new Map<string, { name: string; qty: number; total: number }>();
  invoices.forEach((inv) => {
    if (inv.items && Array.isArray(inv.items)) {
      inv.items.forEach((item: any) => {
        const id = item.id || item.description;
        const existing = productHistoryMap.get(id);
        if (existing) {
          existing.qty += Number(item.qty || 0);
          existing.total += Number(item.total || 0);
        } else {
          productHistoryMap.set(id, {
            name: item.description || "Unknown Product",
            qty: Number(item.qty || 0),
            total: Number(item.total || 0),
          });
        }
      });
    }
  });
  const productHistory = Array.from(productHistoryMap.values()).sort((a, b) => b.qty - a.qty);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-10 px-4 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
              {(dealer.name || "D")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{dealer.name}</h2>
              <div className="flex items-center gap-2 text-xs font-semibold mt-1">
                {dealer.is_active ? (
                  <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Active Dealer</span>
                ) : (
                  <span className="text-destructive flex items-center gap-1"><X size={12}/> Inactive</span>
                )}
                <span className="text-muted-foreground ml-2">ID: {dealer.id}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors border border-border">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Top Row: Profile & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profile Info */}
            <div className="md:col-span-2 bg-muted/20 border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">{t("Dealer Profile")}</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                    <PenLine size={14} /> Edit Info
                  </button>
                ) : (
                  <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">
                    <Save size={14} /> {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Phone size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">{t("Phone Number")}</p>
                    <p className="font-medium text-foreground">{dealer.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="w-full">
                    <p className="text-muted-foreground text-xs mb-1">{t("Address")}</p>
                    {isEditing ? (
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address"
                        className="w-full p-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary resize-none h-16"
                      />
                    ) : (
                      <p className="font-medium text-foreground">{dealer.address || "—"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <MapIcon size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="w-full">
                    <p className="text-muted-foreground text-xs mb-1">{t("Territory / Region")}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={territory}
                        onChange={(e) => setTerritory(e.target.value)}
                        placeholder="e.g. North Mumbai"
                        className="w-full p-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="font-medium text-foreground">{dealer.territory || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl text-primary shrink-0">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">{t("Total Revenue")}</p>
                  <p className="text-2xl font-black text-foreground">
                    ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/20 border border-border rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-card border border-border rounded-xl text-foreground shrink-0 shadow-sm">
                  <Box size={24} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("Total Orders")}</p>
                  <p className="text-2xl font-black text-foreground">{totalOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab("purchases")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
                activeTab === "purchases"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <PackageSearch size={16} /> {t("Recent Purchases")}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
                activeTab === "products"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Box size={16} /> {t("Product History")}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Loading history...</p>
              </div>
            ) : activeTab === "purchases" ? (
              invoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                  <PackageSearch size={32} className="mx-auto mb-3 opacity-20" />
                  <p>No purchases found for this dealer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Invoice No</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium">{inv.invoice_no}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(inv.date || inv.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {inv.items?.length || 0} items
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                              inv.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {inv.payment_status || 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">
                            ₹{(inv.grand_total || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              productHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                  <Box size={32} className="mx-auto mb-3 opacity-20" />
                  <p>No products purchased yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productHistory.map((prod, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-card flex justify-between items-center hover:border-primary/50 transition-colors">
                      <div>
                        <p className="font-bold text-foreground truncate max-w-[200px]" title={prod.name}>
                          {prod.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Total Quantity: <strong className="text-foreground">{prod.qty}</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Spent</p>
                        <p className="font-black text-primary">₹{prod.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
