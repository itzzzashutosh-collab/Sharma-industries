"use client";

import { CRMDataTable } from "@/components/crm/CRMDataTable";

const COLUMNS = [
  { key: 'name', label: 'Name', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
  { key: 'firm_name', label: 'Firm Name' },
  { key: 'phone', label: 'Phone', format: (val: string) => <span className="font-mono text-[11px]">{val}</span> },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'specialization', label: 'Specialization', width: '200px' },
  { key: 'experience_years', label: 'Exp (Yrs)', format: (val: string) => <span className="font-bold text-purple-600">{val} yrs</span> },
  { key: 'status', label: 'Status', format: (val: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
      val?.includes('Verified') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}>{val}</span>
  )},
];

const FILTERS = [
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'specialization', label: 'Specialization' },
];

export default function ArchitectsClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Architects Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pan-India architects database — 4.84 Lakh+ commercial, residential & luxury specialists
        </p>
      </div>

      <CRMDataTable
        apiEndpoint="/api/crm/architects"
        title="Architects"
        columns={COLUMNS}
        filterFields={FILTERS}
      />
    </div>
  );
}
