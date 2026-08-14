"use client";

import { useState, useTransition } from "react";
import { Check, X, ShieldAlert, Sparkles, AlertCircle, FileText, ShoppingBag, Landmark, Gift, Percent, Plus, Store, CheckSquare, Clock } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { approveOrRejectUserRegistration, approveOrRejectExpense, approveOrRejectPurchaseBill } from "./actions";

interface PendingUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  created_at: string;
}

interface PendingExpense {
  id: string;
  expense_name: string;
  category: string;
  amount: number;
  due_date: string;
}

interface PendingPurchase {
  id: string;
  invoice_no: string;
  supplier_name: string;
  total_amount: number;
  bill_date: string;
}

interface AuditLog {
  id: string;
  item_id: string;
  category: string;
  title: string;
  action: string;
  actor: string;
  created_at: string;
}

interface Props {
  pendingUsers: PendingUser[];
  pendingExpenses: PendingExpense[];
  pendingPurchases: PendingPurchase[];
  auditLogs: AuditLog[];
}

export function ApprovalsCenterClient({
  pendingUsers: initialUsers,
  pendingExpenses: initialExpenses,
  pendingPurchases: initialPurchases,
  auditLogs: initialAudits
}: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Active view tab: "pending" | "audits"
  const [activeView, setActiveView] = useState<"pending" | "audits">("pending");

  // Local state representing dynamic db entries
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(initialUsers);
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>(initialExpenses);
  const [pendingPurchases, setPendingPurchases] = useState<PendingPurchase[]>(initialPurchases);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAudits);

  const handleUserApproval = (id: string, name: string, role: string, action: "Approved" | "Rejected") => {
    startTransition(async () => {
      const res = await approveOrRejectUserRegistration(id, name, role, action);
      if (res.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== id));
        // Append to audit log state optimistically
        setAuditLogs(prev => [
          {
            id: `LOG-${Date.now()}`,
            item_id: id,
            category: "Dealer Approval",
            title: `${name} - ${role.toUpperCase()} access request`,
            action,
            actor: "CEO",
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  const handleExpenseApproval = (id: string, name: string, amount: number, action: "Approved" | "Rejected") => {
    startTransition(async () => {
      const res = await approveOrRejectExpense(id, name, amount, action);
      if (res.success) {
        setPendingExpenses(prev => prev.filter(e => e.id !== id));
        setAuditLogs(prev => [
          {
            id: `LOG-${Date.now()}`,
            item_id: id,
            category: "Expense Approval",
            title: `${name} (Amount: ₹${amount.toLocaleString()})`,
            action,
            actor: "CEO",
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  const handlePurchaseApproval = (id: string, invoiceNo: string, supplierName: string, amount: number, action: "Approved" | "Rejected") => {
    startTransition(async () => {
      const res = await approveOrRejectPurchaseBill(id, invoiceNo, supplierName, amount, action);
      if (res.success) {
        setPendingPurchases(prev => prev.filter(p => p.id !== id));
        setAuditLogs(prev => [
          {
            id: `LOG-${Date.now()}`,
            item_id: id,
            category: "Purchase Approval",
            title: `PO ${invoiceNo || "N/A"} - Supplier: ${supplierName} (Amount: ₹${amount.toLocaleString()})`,
            action,
            actor: "CEO",
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  const totalPendingCount = pendingUsers.length + pendingExpenses.length + pendingPurchases.length;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6 font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Approvals")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <CheckSquare className="text-primary animate-pulse" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Approvals Center")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage dealer registrations, raw material purchases, and factory expense approvals.")}</p>
          </div>
        </div>

        {/* Tab Controls (Bulk approval removed) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60 text-xs font-bold">
          <button 
            onClick={() => setActiveView("pending")}
            className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeView === "pending"
                ? "bg-muted text-foreground border-border/80"
                : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("All Pending")} ({totalPendingCount})
          </button>
          <button 
            onClick={() => setActiveView("audits")}
            className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeView === "audits"
                ? "bg-muted text-foreground border-border/80"
                : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {t("Audit Logs")} ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* ─── TAB: PENDING APPROVALS ─── */}
      {activeView === "pending" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {totalPendingCount === 0 && (
            <div className="p-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl">
              <CheckSquare size={32} className="mx-auto mb-3 opacity-25 text-primary" />
              <p className="font-bold text-foreground">{t("All caught up!")}</p>
              <p className="mt-1">{t("No pending registrations or operational bills await your authorization.")}</p>
            </div>
          )}

          {/* User registrations */}
          {pendingUsers.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Store size={14} className="text-violet-400" /> {t("Dealer Registrations")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
                {pendingUsers.map(user => (
                  <div key={user.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-4 hover:border-primary/20 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded uppercase font-black">
                          {user.role}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{user.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">Phone: {user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                      <button onClick={() => handleUserApproval(user.id, user.name, user.role, "Approved")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs transition-colors cursor-pointer">
                        <Check size={13} /> {t("Approve")}
                      </button>
                      <button onClick={() => handleUserApproval(user.id, user.name, user.role, "Rejected")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs transition-colors cursor-pointer">
                        <X size={13} /> {t("Reject")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending expenses */}
          {pendingExpenses.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Landmark size={14} className="text-amber-500" /> {t("Factory Expense Bills")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
                {pendingExpenses.map(exp => (
                  <div key={exp.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-4 hover:border-primary/20 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-black">
                          {exp.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Due: {exp.due_date}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{exp.expense_name}</h4>
                        <p className="text-sm font-black text-rose-500 mt-1">₹{Number(exp.amount).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                      <button onClick={() => handleExpenseApproval(exp.id, exp.expense_name, exp.amount, "Approved")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs transition-colors cursor-pointer">
                        <Check size={13} /> {t("Approve Payout")}
                      </button>
                      <button onClick={() => handleExpenseApproval(exp.id, exp.expense_name, exp.amount, "Rejected")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs transition-colors cursor-pointer">
                        <X size={13} /> {t("Reject")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending purchase order PO bills */}
          {pendingPurchases.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <ShoppingBag size={14} className="text-blue-500" /> {t("Supplier Procurement PO Bills")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
                {pendingPurchases.map(pur => (
                  <div key={pur.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-4 hover:border-primary/20 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-black font-mono">
                          PO: {pur.invoice_no || "N/A"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{pur.bill_date}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Supplier: {pur.supplier_name}</h4>
                        <p className="text-sm font-black text-rose-500 mt-1">₹{Number(pur.total_amount).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                      <button onClick={() => handlePurchaseApproval(pur.id, pur.invoice_no, pur.supplier_name, pur.total_amount, "Approved")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs transition-colors cursor-pointer">
                        <Check size={13} /> {t("Approve PO")}
                      </button>
                      <button onClick={() => handlePurchaseApproval(pur.id, pur.invoice_no, pur.supplier_name, pur.total_amount, "Rejected")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs transition-colors cursor-pointer">
                        <X size={13} /> {t("Reject")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── TAB: AUDIT LOGS ─── */}
      {activeView === "audits" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-300">
          <h3 className="text-base font-bold text-foreground">{t("Historical Decisions Audit Logs")}</h3>
          <p className="text-xs text-muted-foreground">Permanent transaction logs recording actions taken by the CEO/Co-Founders.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-muted-foreground uppercase font-bold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Item Category</th>
                  <th className="p-4">Approval Title & Target</th>
                  <th className="p-4">Decision</th>
                  <th className="p-4">Action By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-semibold">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No approval decisions logged in audits history yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="p-4 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border font-bold text-muted-foreground">{log.category}</span>
                      </td>
                      <td className="p-4 text-foreground font-bold">{log.title}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-black border uppercase ${
                          log.action === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{log.actor}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
