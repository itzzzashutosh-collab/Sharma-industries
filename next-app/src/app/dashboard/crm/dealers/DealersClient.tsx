"use client";

import { useState } from "react";
import { CRMDataTable } from "@/components/crm/CRMDataTable";
import { Store, MapPin, Users } from "lucide-react";

const TABS = [
  { id: 'pan-india', label: 'Pan-India Dealers', icon: Store, endpoint: '/api/crm/dealers', count: '1.27L' },
  { id: 'rajasthan', label: 'Rajasthan Dealers', icon: MapPin, endpoint: '/api/crm/rajasthan-dealers', count: '3.5K' },
  { id: 'verified', label: 'Verified Dealers', icon: Users, endpoint: '/api/crm/verified-dealers', count: '2.1K' },
];

export default function DealersClient({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'pan-india');
  const tab = TABS.find(t => t.id === activeTab) || TABS[0];

  const panIndiaColumns = [
    { key: 'shop_name', label: 'Shop Name', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
    { key: 'owner_name', label: 'Owner' },
    { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'business_type', label: 'Business Type', width: '160px' },
    { key: 'estimated_monthly_bags', label: 'Monthly Vol.', format: (val: string) => <span className="font-bold text-primary">{val} bags</span> },
    { key: 'verified_status', label: 'Status', format: (val: string) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
        val?.includes('Verified') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}>{val}</span>
    )},
  ];

  const rajasthanColumns = [
    { key: 'shop_name', label: 'Shop Name', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
    { key: 'owner_name', label: 'Owner' },
    { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
    { key: 'district', label: 'District' },
    { key: 'cluster_area', label: 'Cluster Area' },
    { key: 'primary_category', label: 'Category' },
    { key: 'estimated_monthly_volume', label: 'Monthly Vol.', format: (val: string) => <span className="font-bold text-primary">{val} bags</span> },
  ];

  const verifiedColumns = [
    { key: 'shop_name', label: 'Shop Name', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
    { key: 'owner_name', label: 'Owner' },
    { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
    { key: 'city', label: 'City' },
    { key: 'market_area', label: 'Market Area' },
    { key: 'business_type', label: 'Business Type' },
    { key: 'estimated_monthly_bags', label: 'Monthly Vol.', format: (val: string) => <span className="font-bold text-primary">{val} bags</span> },
  ];

  const getColumns = () => {
    if (activeTab === 'rajasthan') return rajasthanColumns;
    if (activeTab === 'verified') return verifiedColumns;
    return panIndiaColumns;
  };

  const getFilters = () => {
    if (activeTab === 'rajasthan') return [
      { key: 'district', label: 'District' },
      { key: 'primary_category', label: 'Category' },
    ];
    if (activeTab === 'verified') return [
      { key: 'city', label: 'City' },
      { key: 'business_type', label: 'Business Type' },
    ];
    return [
      { key: 'state', label: 'State' },
      { key: 'city', label: 'City' },
      { key: 'business_type', label: 'Business Type' },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Dealers Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete paint dealer database — Pan-India, Rajasthan territory & verified partners
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-background shadow-sm text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              {t.label}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                activeTab === t.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <CRMDataTable
        key={activeTab}
        apiEndpoint={tab.endpoint}
        title={tab.label}
        columns={getColumns()}
        filterFields={getFilters()}
      />
    </div>
  );
}
