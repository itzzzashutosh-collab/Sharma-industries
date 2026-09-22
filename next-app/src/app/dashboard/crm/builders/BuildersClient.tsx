"use client";

import { useState } from "react";
import { CRMDataTable } from "@/components/crm/CRMDataTable";
import { Building, MapPin } from "lucide-react";

const TABS = [
  { id: 'pan-india', label: 'Pan-India Builders', icon: Building, endpoint: '/api/crm/builders', count: '50.9K' },
  { id: 'rajasthan', label: 'Rajasthan Builders', icon: MapPin, endpoint: '/api/crm/rajasthan-builders', count: '1K' },
];

export default function BuildersClient() {
  const [activeTab, setActiveTab] = useState('pan-india');
  const tab = TABS.find(t => t.id === activeTab) || TABS[0];

  const panIndiaColumns = [
    { key: 'company_name', label: 'Company', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'project_focus', label: 'Project Focus', width: '180px' },
    { key: 'company_scale', label: 'Scale', format: (val: string) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
        val?.includes('Tier-1') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
      }`}>{val}</span>
    )},
    { key: 'procurement_contact', label: 'Contact Person' },
    { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
    { key: 'estimated_annual_paint_liters', label: 'Annual Paint (L)', format: (val: string) => (
      <span className="font-bold text-amber-600">{Number(val).toLocaleString('en-IN')} L</span>
    )},
  ];

  const rajasthanColumns = [
    { key: 'company_name', label: 'Company', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
    { key: 'district_hq', label: 'District HQ' },
    { key: 'project_types', label: 'Project Types', width: '200px' },
    { key: 'company_scale', label: 'Scale' },
    { key: 'purchase_contact_person', label: 'Contact' },
    { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
    { key: 'estimated_annual_paint_requirement_liters', label: 'Annual Paint (L)', format: (val: string) => (
      <span className="font-bold text-amber-600">{Number(val).toLocaleString('en-IN')} L</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Builders & Developers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Construction companies & developers database — project focus, scale & paint procurement data
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
              }`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      <CRMDataTable
        key={activeTab}
        apiEndpoint={tab.endpoint}
        title={tab.label}
        columns={activeTab === 'rajasthan' ? rajasthanColumns : panIndiaColumns}
        filterFields={activeTab === 'rajasthan'
          ? [{ key: 'district_hq', label: 'District' }, { key: 'company_scale', label: 'Scale' }]
          : [{ key: 'state', label: 'State' }, { key: 'city', label: 'City' }, { key: 'company_scale', label: 'Scale' }]
        }
      />
    </div>
  );
}
