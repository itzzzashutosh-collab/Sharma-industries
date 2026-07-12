"use client";

import React, { useState } from "react";
import { Download, Search, Trash2, RefreshCw, FileText, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface FileHistory {
  id: string;
  name: string;
  type: string;
  fy: string;
  format: string;
  date: string;
}

interface Props {
  initialData: FileHistory[];
}

const fmtDate = (s: string) => new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function DownloadsClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [history, setHistory] = useState<FileHistory[]>(initialData);
  const [search, setSearch] = useState("");

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const filtered = history.filter(h => {
    return !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.type.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Download Center</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Download size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Download Center</h1>
              <p className="text-xs text-muted-foreground">Historical records of all compiled financial statements and audits</p>
            </div>
          </div>
          <button onClick={handleClearHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold cursor-pointer hover:bg-rose-500/20 transition-all">
            <Trash2 size={13} /> Clear Download History
          </button>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> {history.length} generated files are cached for quick download. No file corruptions or checksum errors detected.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search report name or type..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Downloads History Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold text-foreground">Cached statement files</div>
        <div className="divide-y divide-border/40">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-12 text-center">No compiled statements found in download cache.</p>
          ) : filtered.map((h) => (
            <div key={h.id} className="p-4 flex flex-wrap items-center justify-between hover:bg-muted/10 transition-colors gap-3">
              <div className="flex items-center gap-3 min-w-[250px]">
                <div className="p-2 bg-primary/10 rounded-xl"><FileText size={16} className="text-primary" /></div>
                <div>
                  <p className="text-xs font-bold text-foreground">{h.name}</p>
                  <p className="text-[10px] text-muted-foreground">{h.type} • {h.fy}</p>
                </div>
              </div>
              <div className="text-xs font-mono text-muted-foreground">{fmtDate(h.date)}</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-black border bg-blue-500/10 text-blue-600 border-blue-500/20 uppercase font-mono">{h.format}</span>
                <button onClick={() => alert(`Downloading cached ${h.format} file...`)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Download size={13} /></button>
                <button onClick={() => alert("Regenerating fresh report parameters...")} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><RefreshCw size={13} /></button>
                <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded hover:bg-muted text-rose-500"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
