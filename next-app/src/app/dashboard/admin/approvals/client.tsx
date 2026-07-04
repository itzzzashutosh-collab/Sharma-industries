"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Coins,
  QrCode,
  Zap,
  ArrowDownCircle,
  RefreshCw,
  CheckSquare,
  Package,
  Download,
} from "lucide-react";

type MainTab = "approvals" | "qr-generator" | "simulator";
type ApprovalTab = "dealers" | "painters" | "salesmen";

export default function ApprovalsClient({
  initialUsers,
  ledgerData,
  products,
  painters: initialPainters,
}: {
  initialUsers: any[];
  ledgerData: any[];
  products: any[];
  painters: any[];
}) {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>("approvals");
  const [activeTab, setActiveTab] = useState<ApprovalTab>("dealers");

  // ── Approvals State ──
  const [users, setUsers] = useState(initialUsers);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [painterProfiles, setPainterProfiles] = useState<Record<string, any>>({});

  // ── QR Generator State ──
  const [selectedProd, setSelectedProd] = useState("");
  const [quantity, setQuantity] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string>("");

  // ── Simulator State ──
  const [painters, setPainters] = useState(initialPainters);
  const [scanQrCode, setScanQrCode] = useState("");
  const [scanPainterId, setScanPainterId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const [withdrawPainterId, setWithdrawPainterId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; message: string } | null>(null);

  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let scanner: any = null;

    if (showScanner) {
      import("html5-qrcode").then((lib) => {
        scanner = new lib.Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
          },
          false
        );

        scanner.render(
          (decodedText: string) => {
            setScanQrCode(decodedText);
            setShowScanner(false);
            if (scanner) {
              scanner.clear().catch((err: any) => console.error("Failed to clear scanner:", err));
            }
          },
          () => {}
        );
      }).catch(err => console.error("Failed to load html5-qrcode library", err));
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err: any) => console.error("Failed to clear scanner on unmount:", err));
      }
    };
  }, [showScanner]);

  // ═══════════════════════════════════════════
  // APPROVALS LOGIC
  // ═══════════════════════════════════════════
  const fetchPainterProfile = async (painterId: string) => {
    try {
      const res = await fetch(`/api/painters/profile?painterId=${painterId}`);
      const data = await res.json();
      if (data.success) {
        setPainterProfiles((prev) => ({ ...prev, [painterId]: data.data }));
      }
    } catch (err) {
      console.error("Failed to fetch painter profile:", err);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      await fetchPainterProfile(id);
    }
  };

  const getFilteredUsers = () => {
    return users.filter((u) => {
      if (activeTab === "salesmen") return u.role?.toLowerCase() === "salesman";
      if (activeTab === "painters") return u.role?.toLowerCase() === "painter";
      if (activeTab === "dealers") return u.role?.toLowerCase() === "dealer";
      return false;
    });
  };

  const handleAction = async (userId: string, role: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, action }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== userId));
        router.refresh();
      } else {
        alert(data.error || "Action failed.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setProcessingId(null);
    }
  };

  // ═══════════════════════════════════════════
  // QR GENERATOR LOGIC
  // ═══════════════════════════════════════════
  const handleGenerateQRs = async () => {
    if (!selectedProd || !quantity) {
      setGenStatus("⚠️ Please select a product and enter a quantity.");
      return;
    }
    setGenerating(true);
    setGenStatus("⏳ Generating and packaging QR codes…");
    try {
      const res = await fetch("/api/production/generate-qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProd, quantity: parseInt(quantity, 10) }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrs_${selectedProd}_${quantity}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setGenStatus(`✅ Done! ${quantity} QR codes generated and downloaded.`);
        setQuantity("");
      } else {
        const err = await res.json();
        setGenStatus(`❌ ${err.error || "Generation failed."}`);
      }
    } catch {
      setGenStatus("❌ An error occurred during generation.");
    } finally {
      setGenerating(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProd);
  const computeTag = (p: any) => {
    if (!p) return "";
    const initials = p.product_name.split(" ").map((w: string) => w[0]).join("").toUpperCase();
    const size = Math.round(Number(p.package_size) || 0);
    const unit = (p.package_size_unit || "L").toUpperCase();
    return `${initials}${size}${unit}`;
  };

  // ═══════════════════════════════════════════
  // SCAN SIMULATOR LOGIC
  // ═══════════════════════════════════════════
  const handleScan = async () => {
    if (!scanQrCode || !scanPainterId) {
      setScanResult({ success: false, message: "⚠️ Please fill in both QR Code and Painter." });
      return;
    }
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/scan-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: scanQrCode, painter_id: scanPainterId }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult({ success: true, message: `✅ Scan successful! ${data.tokens_credited ?? "?"} tokens credited.` });
        setScanQrCode("");
        // Refresh painters list
        const updated = await fetch("/api/painters?format=list").then((r) => r.json());
        if (updated.success) setPainters(updated.data);
      } else {
        setScanResult({ success: false, message: `❌ ${data.error || "Scan failed."}` });
      }
    } catch {
      setScanResult({ success: false, message: "❌ Network error during scan." });
    } finally {
      setScanning(false);
    }
  };

  // ═══════════════════════════════════════════
  // WITHDRAWAL LOGIC
  // ═══════════════════════════════════════════
  const handleWithdraw = async () => {
    if (!withdrawPainterId || !withdrawAmount) {
      setWithdrawResult({ success: false, message: "⚠️ Please fill in painter and amount." });
      return;
    }
    setWithdrawing(true);
    setWithdrawResult(null);
    try {
      const res = await fetch("/api/painters/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painterId: withdrawPainterId, amount: parseInt(withdrawAmount, 10) }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawResult({ success: true, message: `✅ Withdrawal of ${withdrawAmount} tokens processed.` });
        setWithdrawAmount("");
        const updated = await fetch("/api/painters?format=list").then((r) => r.json());
        if (updated.success) setPainters(updated.data);
      } else {
        setWithdrawResult({ success: false, message: `❌ ${data.error || "Withdrawal failed."}` });
      }
    } catch {
      setWithdrawResult({ success: false, message: "❌ Network error during withdrawal." });
    } finally {
      setWithdrawing(false);
    }
  };

  const selectedPainterBalance = painters.find((p) => p.id === withdrawPainterId)?.total_tokens ?? null;

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  const mainTabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: "approvals", label: "Approvals", icon: <CheckSquare size={16} /> },
    { id: "qr-generator", label: "QR Generator", icon: <QrCode size={16} /> },
    { id: "simulator", label: "Scan & Withdraw", icon: <Zap size={16} /> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Traceability &amp; Token Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage approvals, generate product QR codes, and simulate scans &amp; withdrawals.
        </p>
      </div>

      {/* Main Tab Bar */}
      <div className="flex space-x-2 border-b border-border">
        {mainTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              mainTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB A: APPROVALS ═══ */}
      {mainTab === "approvals" && (
        <div className="space-y-6">
          {/* Approval Sub-Tabs */}
          <div className="flex space-x-2 bg-muted/30 rounded-xl p-1.5 w-fit">
            {(["dealers", "painters", "salesmen"] as ApprovalTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold capitalize rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                  {users.filter((u) =>
                    u.role?.toLowerCase() === (tab === "salesmen" ? "salesman" : tab.slice(0, -1))
                  ).length}
                </span>
              </button>
            ))}
          </div>

          {/* Approvals Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">User</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Contact</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {getFilteredUsers().length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      <User className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p>No pending {activeTab} found.</p>
                    </td>
                  </tr>
                ) : (
                  getFilteredUsers().map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className={`hover:bg-muted/30 transition-colors ${expandedId === user.id ? "bg-muted/30" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                              {user.name ? user.name.charAt(0) : "?"}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{user.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                New {user.role} Registration
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{user.phone || "No phone"}</p>
                          <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            {activeTab === "painters" && (
                              <button
                                onClick={() => toggleExpand(user.id)}
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted flex items-center gap-1"
                              >
                                <span className="text-xs font-medium">Insights</span>
                                {expandedId === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(user.id, user.role, "REJECT")}
                              disabled={processingId === user.id}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleAction(user.id, user.role, "APPROVE")}
                              disabled={processingId === user.id}
                              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Painter Deep Dive Accordion */}
                      {activeTab === "painters" && expandedId === user.id && (() => {
                        const profile = painterProfiles[user.id] || { total_tokens: 0, scanned_bags: 0, withdrawal_history: [] };
                        return (
                          <tr className="bg-muted/10 border-b border-border">
                            <td colSpan={3} className="px-6 py-6">
                              <div className="space-y-6 max-w-4xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <Coins size={18} />
                                      </div>
                                      <span className="text-sm font-semibold text-foreground">Current Token Balance</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground pl-11">{profile.total_tokens}</p>
                                  </div>
                                  <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <MapPin size={18} />
                                      </div>
                                      <span className="text-sm font-semibold text-foreground">Total Scanned Bags</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground pl-11">{profile.scanned_bags}</p>
                                  </div>
                                </div>
                                {/* Withdrawal History */}
                                <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
                                  <h3 className="text-sm font-semibold text-foreground mb-3">Withdrawal History</h3>
                                  {profile.withdrawal_history.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">No past withdrawals.</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead>
                                          <tr className="border-b border-border">
                                            <th className="pb-2 font-medium text-muted-foreground">Date</th>
                                            <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                                            <th className="pb-2 font-medium text-muted-foreground">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {profile.withdrawal_history.map((w: any) => (
                                            <tr key={w.id}>
                                              <td className="py-2 text-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                                              <td className="py-2 font-bold text-foreground">{w.amount}</td>
                                              <td className="py-2">
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full font-semibold">Completed</span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })()}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB B: QR GENERATOR ═══ */}
      {mainTab === "qr-generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <QrCode size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">QR Code Generator</h2>
                <p className="text-xs text-muted-foreground">Generates sequential, collision-free QR codes per product.</p>
              </div>
            </div>

            {/* Product select */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                <Package size={13} className="inline mr-1" />
                Product
              </label>
              <select
                value={selectedProd}
                onChange={(e) => { setSelectedProd(e.target.value); setGenStatus(""); }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
              >
                <option value="">Choose a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} {p.package_size ? `- ${p.package_size}${p.package_size_unit || ""}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Preview */}
            {selectedProduct && (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                <QrCode size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">QR Code Preview</p>
                  <p className="font-mono font-bold text-primary text-sm">
                    SP-{computeTag(selectedProduct)}-00001 … SP-{computeTag(selectedProduct)}-NNNNN
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Points per scan: <span className="font-semibold text-foreground">{selectedProduct.token_value ?? 10}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Quantity / Stock Produced
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setGenStatus(""); }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <button
              onClick={handleGenerateQRs}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              {generating ? "Generating…" : "Generate & Download ZIP"}
            </button>

            {genStatus && (
              <p className={`text-sm font-medium ${genStatus.startsWith("✅") ? "text-emerald-500" : genStatus.startsWith("❌") ? "text-red-500" : "text-muted-foreground"}`}>
                {genStatus}
              </p>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">How it works</h3>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Select a product — the system computes its unique tag (e.g. <span className="font-mono text-primary text-xs">RR20L</span>).</li>
                <li>Enter how many units of stock you have produced.</li>
                <li>Click Generate — serial numbers auto-continue from the last batch, ensuring no duplicates.</li>
                <li>A <span className="font-mono text-xs text-primary">.zip</span> file downloads with individual label files + an index list.</li>
                <li>When a painter scans a code, their points are credited automatically based on the product's token value.</li>
              </ol>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3 text-sm">QR Format</h3>
              <div className="font-mono bg-muted/40 rounded-xl p-4 text-primary text-sm text-center tracking-widest">
                SP-[TAG]-[00001]
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                TAG = Name Initials + Package Size + Unit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB C: SCAN SIMULATOR & WITHDRAWAL ═══ */}
      {mainTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Scan Simulator */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Zap size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">QR Scan Simulator</h2>
                <p className="text-xs text-muted-foreground">Simulate a painter scanning a QR code to credit tokens.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">QR Code</label>
              <input
                type="text"
                placeholder="e.g. SP-RR20L-00001"
                value={scanQrCode}
                onChange={(e) => { setScanQrCode(e.target.value); setScanResult(null); }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-mono"
              />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 font-semibold py-2.5 rounded-xl transition-all text-xs"
              >
                📷 {showScanner ? "Close Camera Scanner" : "Scan via Device Camera"}
              </button>
              
              {showScanner && (
                <div className="border border-border rounded-2xl overflow-hidden bg-muted/20 p-4">
                  <div id="reader" className="w-full rounded-xl overflow-hidden bg-black"></div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Allow camera access and align the QR code inside the box.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Painter</label>
              <select
                value={scanPainterId}
                onChange={(e) => { setScanPainterId(e.target.value); setScanResult(null); }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
              >
                <option value="">Select painter…</option>
                {painters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.total_tokens ?? 0} tokens
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleScan}
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {scanning ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
              {scanning ? "Scanning…" : "Simulate Scan"}
            </button>

            {scanResult && (
              <p className={`text-sm font-medium ${scanResult.success ? "text-emerald-500" : "text-red-500"}`}>
                {scanResult.message}
              </p>
            )}
          </div>

          {/* Withdrawal Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                <ArrowDownCircle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Token Withdrawal</h2>
                <p className="text-xs text-muted-foreground">Debit tokens from a painter's balance and record the audit.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Painter</label>
              <select
                value={withdrawPainterId}
                onChange={(e) => { setWithdrawPainterId(e.target.value); setWithdrawResult(null); }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
              >
                <option value="">Select painter…</option>
                {painters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.total_tokens ?? 0} tokens
                  </option>
                ))}
              </select>
            </div>

            {selectedPainterBalance !== null && (
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
                <Coins size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Current Balance: <span className="text-primary">{selectedPainterBalance} tokens</span>
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Amount to Withdraw</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={withdrawAmount}
                onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawResult(null); }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {withdrawing ? <RefreshCw size={16} className="animate-spin" /> : <ArrowDownCircle size={16} />}
              {withdrawing ? "Processing…" : "Process Withdrawal"}
            </button>

            {withdrawResult && (
              <p className={`text-sm font-medium ${withdrawResult.success ? "text-emerald-500" : "text-red-500"}`}>
                {withdrawResult.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
