"use client";

import { CRMDataTable } from "@/components/crm/CRMDataTable";

const COLUMNS = [
  { key: 'name', label: 'Name', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
  { key: 'studio_name', label: 'Studio Name' },
  { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'category', label: 'Category', width: '180px' },
  { key: 'projects_count', label: 'Projects', format: (val: string) => <span className="font-bold text-pink-600">{val}</span> },
  { key: 'status', label: 'Status', format: (val: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
      val?.includes('Verified') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}>{val}</span>
  )},
];

const FILTERS = [
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'category', label: 'Category' },
];

export default function DesignersClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Interior Designers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pan-India interior designers database — 4.84 Lakh+ turnkey execution & design studios
        </p>
      </div>

      <CRMDataTable
        apiEndpoint="/api/crm/designers"
        title="Interior Designers"
        columns={COLUMNS}
        filterFields={FILTERS}
      />
    </div>
  );
}
