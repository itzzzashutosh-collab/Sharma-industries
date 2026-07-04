"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Radar, Crosshair, MapPin, TrendingUp, AlertTriangle } from "lucide-react";

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
  purchase_price: number;
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
}

export function MarketIntelligenceClient({
  dealerPerformance,
  competitorSpyData,
  heatmapData,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Radar className="text-primary" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {t("Market Intelligence")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("Live tracking of dealer performance, regional heatmaps, and competitor infiltration.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dealer Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary animate-pulse" />
              {t("Dealer Performance Grid")}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="text-sm uppercase tracking-wider text-muted-foreground border-b border-border bg-background/50">
                    <th className="p-4 font-semibold">{t("Dealer")}</th>
                    <th className="p-4 font-semibold">{t("Location")}</th>
                    <th className="p-4 font-semibold text-right">{t("Revenue (YTD)")}</th>
                    <th className="p-4 font-semibold text-right">{t("Outstanding")}</th>
                    <th className="p-4 font-semibold pl-6">{t("Top Product")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {dealerPerformance.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-background/40 transition-colors group">
                      <td className="p-4 font-medium text-foreground">{dealer.name}</td>
                      <td className="p-4 text-muted-foreground flex items-center gap-1">
                        <MapPin size={14} className="text-primary" /> {dealer.mockPincode}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-primary">
                        ₹{dealer.totalRevenue.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-mono text-rose-500 font-semibold">
                        {dealer.outstanding > 0 ? `₹${dealer.outstanding.toLocaleString()}` : t("Cleared")}
                      </td>
                      <td className="p-4 pl-6 text-muted-foreground">
                        <span className="px-2 py-1 bg-background border border-border rounded-md text-sm font-medium">
                          {dealer.mockTopProduct}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {dealerPerformance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        {t("No active dealers found.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* Competitor Spy Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Crosshair size={20} className="text-rose-500 animate-spin-slow" />
                {t("Competitor Spy Radar")}
              </h3>
            </div>

            <div className="space-y-4 relative z-10">
              {competitorSpyData.length > 0 ? (
                competitorSpyData.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-background border border-border rounded-xl relative group hover:border-rose-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-foreground">{prod.name}</p>
                      <span className="text-sm uppercase font-bold tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                        {t("Alien SKU")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("Spotted at:")}{" "}
                      <span className="text-foreground font-medium">{prod.dealerName}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-2">
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[10px]">
                          {t("Avg Selling Price")}
                        </span>
                        <span className="text-foreground font-semibold">₹{prod.selling_price}</span>
                      </div>
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[10px]">
                          {t("Est. Dealer Margin")}
                        </span>
                        <span className="text-rose-500 font-bold">
                          {prod.marginPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[10px]">
                          {t("Total Sold Qty")}
                        </span>
                        <span className="text-primary font-bold">{prod.totalQtySold || 0}</span>
                      </div>
                      <div className="bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground block mb-1 text-[10px]">
                          {t("Sentiment")}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium truncate text-xs" title={prod.sentiment || "-"}>
                          {prod.sentiment || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                  <AlertTriangle size={24} className="text-muted-foreground opacity-60" />
                  <p className="text-sm">
                    {t("No competitor SKUs detected in dealer POS systems currently.")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Regional Heatmap */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              {t("Regional Sales Heatmap")}
            </h3>

            <div className="space-y-5">
              {heatmapData.map((region, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-foreground font-medium">{region.location}</span>
                    <span className="font-mono text-muted-foreground">{region.sales}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary rounded-full shadow-md opacity-80"
                      style={{ width: region.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
