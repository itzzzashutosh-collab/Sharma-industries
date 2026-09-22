"use client";

import { CRMDataTable } from "@/components/crm/CRMDataTable";

const COLUMNS = [
  { key: 'authority', label: 'Authority', format: (val: string) => <span className="font-semibold text-foreground">{val}</span> },
  { key: 'title', label: 'Tender Title', width: '280px' },
  { key: 'location', label: 'Location' },
  { key: 'estimated_value_inr', label: 'Est. Value (₹)', format: (val: string) => (
    <span className="font-bold text-emerald-600">₹{Number(val).toLocaleString('en-IN')}</span>
  )},
  { key: 'deadline', label: 'Deadline', format: (val: string) => {
    const deadline = new Date(val);
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let color = 'text-foreground';
    let bg = '';
    if (daysLeft <= 7) { color = 'text-rose-700'; bg = 'bg-rose-100'; }
    else if (daysLeft <= 30) { color = 'text-amber-700'; bg = 'bg-amber-100'; }
    else { color = 'text-emerald-700'; bg = 'bg-emerald-100'; }
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${color} ${bg}`}>
        {val} ({daysLeft > 0 ? `${daysLeft}d left` : 'Expired'})
      </span>
    );
  }},
  { key: 'work_type', label: 'Work Type' },
  { key: 'status', label: 'Status', format: (val: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
      val?.includes('Open') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
    }`}>{val}</span>
  )},
];

const FILTERS = [
  { key: 'status', label: 'Status' },
  { key: 'work_type', label: 'Work Type' },
];

export default function TendersClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Government Tenders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Active paint & coating procurement tenders — 96.8K+ government tenders tracked
        </p>
      </div>

      <CRMDataTable
        apiEndpoint="/api/crm/tenders"
        title="Government Tenders"
        columns={COLUMNS}
        filterFields={FILTERS}
        defaultSort="deadline"
        defaultSortOrder="asc"
      />
    </div>
  );
}
