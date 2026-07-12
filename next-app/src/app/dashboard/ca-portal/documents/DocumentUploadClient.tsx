"use client";
import React, { useRef, useState, useTransition } from "react";
import { FolderOpen, Upload, Download, FileText, Trash2, Eye } from "lucide-react";
import { uploadCADocument } from "../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Props { category: "company" | "gst" | "audit" | "statements"; title: string; description: string; }

export function DocumentUploadClient({ category, title, description }: Props) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<{ name: string; url: string; size: string; date: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) { setMessage({ type: "error", text: "File too large. Max 10MB allowed." }); return; }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      startTransition(async () => {
        const res = await uploadCADocument(base64, file.name, category);
        if (res.success && res.url) {
          setFiles(prev => [{ name: file.name, url: res.url!, size: `${(file.size / 1024).toFixed(1)} KB`, date: new Date().toLocaleDateString("en-IN") }, ...prev]);
          setMessage({ type: "success", text: `${file.name} uploaded successfully!` });
        } else {
          setMessage({ type: "error", text: res.error || "Upload failed." });
        }
        setIsUploading(false);
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Documents</span><span className="opacity-40">/</span><span className="text-foreground">{title}</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><FolderOpen size={20} className="text-primary" /></div>
          <div><h1 className="text-xl font-black text-foreground">{t(title)}</h1><p className="text-xs text-muted-foreground">{description}</p></div>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={isUploading || isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
          <Upload size={13} /> {isUploading || isPending ? "Uploading..." : "Upload Document"}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv,.xls" className="hidden" onChange={handleUpload} />
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-semibold border flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-rose-500/10 border-rose-500/30 text-rose-600"}`}>
          {message.type === "success" ? "✓" : "✗"} {message.text}
        </div>
      )}

      {/* Upload Zone */}
      <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
        <Upload size={28} className="text-muted-foreground/40 mx-auto mb-2 group-hover:text-primary/60 transition-colors" />
        <p className="text-sm font-bold text-muted-foreground">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, Images, Excel, CSV — Max 10MB per file</p>
      </div>

      {/* Supported formats */}
      <div className="flex flex-wrap gap-2">
        {["PDF", "PNG", "JPG", "XLSX", "CSV"].map(f => (
          <span key={f} className="px-2 py-0.5 rounded bg-muted border border-border text-[10px] font-bold text-muted-foreground">.{f.toLowerCase()}</span>
        ))}
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold text-foreground">{files.length} uploaded file{files.length > 1 ? "s" : ""}</div>
          <div className="divide-y divide-border/40">
            {files.map((f, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg"><FileText size={12} className="text-primary" /></div>
                  <div><p className="text-xs font-semibold text-foreground">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.size} • {f.date}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye size={12} className="text-muted-foreground" /></a>
                  <a href={f.url} download className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Download size={12} className="text-muted-foreground" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
