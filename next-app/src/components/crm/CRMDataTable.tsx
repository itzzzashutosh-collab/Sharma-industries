"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Filter, X, Loader2 } from "lucide-react";

interface CRMDataTableProps {
  apiEndpoint: string;
  title: string;
  columns: { key: string; label: string; width?: string; format?: (val: string, row: Record<string, string>) => React.ReactNode }[];
  filterFields?: { key: string; label: string; options?: string[] }[];
  defaultSort?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

interface APIResponse {
  success: boolean;
  data: Record<string, string>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function CRMDataTable({
  apiEndpoint,
  title,
  columns,
  filterFields = [],
  defaultSort = '',
  defaultSortOrder = 'asc',
}: CRMDataTableProps) {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState(defaultSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res = await fetch(`${apiEndpoint}?${params.toString()}`);
      const json: APIResponse = await res.json();

      if (json.success) {
        setData(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error('CRM fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, page, pageSize, debouncedSearch, sortBy, sortOrder, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => `"${(row[c.key] || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      {/* Search + Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all fields..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {filterFields.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                showFilters || Object.values(filters).some(v => v)
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Filter size={14} />
              Filters
              {Object.values(filters).filter(v => v).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>
          )}

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-2 py-2 text-xs rounded-lg border border-border bg-background text-foreground font-semibold"
          >
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && filterFields.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border bg-muted/20">
          {filterFields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{field.label}</label>
              {field.options ? (
                <select
                  value={filters[field.key] || ''}
                  onChange={(e) => { setFilters(prev => ({ ...prev, [field.key]: e.target.value })); setPage(1); }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background min-w-[140px]"
                >
                  <option value="">All</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={filters[field.key] || ''}
                  onChange={(e) => { setFilters(prev => ({ ...prev, [field.key]: e.target.value })); setPage(1); }}
                  placeholder={`Filter by ${field.label.toLowerCase()}...`}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background min-w-[140px]"
                />
              )}
            </div>
          ))}
          <div className="flex items-end">
            <button
              onClick={() => { setFilters({}); setPage(1); }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {loading ? (
            <span className="flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Loading...</span>
          ) : (
            <span>Showing <strong className="text-foreground">{startRecord.toLocaleString()}</strong>–<strong className="text-foreground">{endRecord.toLocaleString()}</strong> of <strong className="text-foreground">{total.toLocaleString()}</strong> records</span>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wider w-[50px]">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortBy === col.key && (
                        <span className="text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3"><div className="h-4 w-6 bg-muted/60 rounded animate-pulse" /></td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3"><div className="h-4 bg-muted/60 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-sm font-semibold">No records found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                      {((page - 1) * pageSize) + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-2.5 text-xs text-foreground">
                        {col.format ? col.format(row[col.key] || '', row) : (row[col.key] || '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages.toLocaleString()}</strong>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border disabled:opacity-30 hover:bg-muted/50 transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border disabled:opacity-30 hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page number input */}
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= totalPages) setPage(val);
              }}
              className="w-16 text-center text-xs py-1.5 rounded-lg border border-border bg-background font-semibold"
            />

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-border disabled:opacity-30 hover:bg-muted/50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border disabled:opacity-30 hover:bg-muted/50 transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
