"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Users, Plus, BadgeInfo, Building2, UserCircle2, CheckCircle2, XCircle, FileText, Phone, CreditCard, X, Calendar, ClipboardList, Wallet, Printer, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { markEmployeeAttendance, generateSalarySlip } from "@/actions/employeeActions";

interface Props {
  initialEmployees: any[];
  initialTodayAttendance: any[];
  initialAllAttendance: any[];
  initialPayrollSlips: any[];
}

export default function EmployeeDashboardClient({
  initialEmployees = [],
  initialTodayAttendance = [],
  initialAllAttendance = [],
  initialPayrollSlips = [],
}: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"directory" | "attendance" | "payroll" | "slips">("directory");

  // Database lists in state
  const [employees, setEmployees] = useState<any[]>(initialEmployees);
  const [todayAttendance, setTodayAttendance] = useState<any[]>(initialTodayAttendance);
  const [allAttendance, setAllAttendance] = useState<any[]>(initialAllAttendance);
  const [payrollSlips, setPayrollSlips] = useState<any[]>(initialPayrollSlips);

  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // Slip Modal
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [slipForm, setSlipForm] = useState({
    employeeId: "",
    month: "2026-07",
    baseSalary: "",
    daysPresent: "30",
    advancesDeducted: "0",
    paymentMode: "BANK",
    paymentDate: new Date().toISOString().split("T")[0]
  });

  // Calculate totals
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const presentToday = todayAttendance.filter(a => a.status === "Present").length;

  const handleMarkAttendance = async (empId: string, status: "Present" | "Absent") => {
    startTransition(async () => {
      const res = await markEmployeeAttendance(empId, attendanceDate, status);
      if (res.success) {
        // Update local today/all attendance states
        if (attendanceDate === new Date().toISOString().split("T")[0]) {
          setTodayAttendance(prev => {
            const filtered = prev.filter(a => a.employee_id !== empId);
            return [...filtered, { employee_id: empId, status }];
          });
        }
        setAllAttendance(prev => {
          const filtered = prev.filter(a => !(a.employee_id === empId && a.date === attendanceDate));
          return [{ employee_id: empId, date: attendanceDate, status }, ...filtered];
        });
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  const handleCreateSlipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipForm.employeeId || !slipForm.baseSalary) {
      alert("Please select employee and enter salary");
      return;
    }

    startTransition(async () => {
      const payload = {
        employeeId: slipForm.employeeId,
        month: slipForm.month,
        baseSalary: Number(slipForm.baseSalary),
        daysPresent: Number(slipForm.daysPresent) || 30,
        advancesDeducted: Number(slipForm.advancesDeducted) || 0,
        paymentMode: slipForm.paymentMode,
        paymentDate: slipForm.paymentDate
      };

      const res = await generateSalarySlip(payload);
      if (res.success) {
        const newSlip = {
          id: `PAY-${Date.now().toString().slice(-4)}`,
          employee_id: payload.employeeId,
          month: payload.month,
          base_salary: payload.baseSalary,
          days_present: payload.daysPresent,
          gross_salary: payload.baseSalary,
          advances_deducted: payload.advancesDeducted,
          net_paid: payload.baseSalary - payload.advancesDeducted,
          payment_mode: payload.paymentMode,
          payment_date: payload.paymentDate
        };
        setPayrollSlips(prev => [newSlip, ...prev]);
        setIsSlipModalOpen(false);
        setSlipForm({
          employeeId: "", month: "2026-07", baseSalary: "", daysPresent: "30", advancesDeducted: "0", paymentMode: "BANK", paymentDate: new Date().toISOString().split("T")[0]
        });
      } else {
        alert(`Error generating slip: ${res.error}`);
      }
    });
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.designation?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [employees, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Users className="text-primary animate-pulse" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Employee & Payroll Registry")}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Manage workforce roster logs, daily attendance logs, salary structures, and paycheck settlements.")}</p>
            </div>
          </div>
          <Link 
            href="/dashboard/employees/new"
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={14} /> {t("Onboard Employee")}
          </Link>
        </div>

        {/* Working Tabs Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {[
            { key: "directory", label: "Workforce Directory", icon: <Users size={13} /> },
            { key: "attendance", label: "Attendance Sheet", icon: <Calendar size={13} /> },
            { key: "payroll", label: "Payroll Ledger", icon: <Wallet size={13} /> },
            { key: "slips", label: "Pay Slips Settings", icon: <Printer size={13} /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-muted text-foreground border-border/80"
                  : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
              }`}
            >
              {tab.icon}{t(tab.label)}
            </button>
          ))}
          <button 
            onClick={() => setIsSlipModalOpen(true)}
            className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 px-4 py-2 rounded-xl text-xs font-black ml-auto flex items-center gap-1.5 transition-all"
          >
            <Plus size={13} /> {t("Add Salary Slip")}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Registered Workforce")}</p>
            <div className="bg-primary/10 p-2 rounded-lg"><Users size={20} className="text-primary" /></div>
          </div>
          <p className="text-4xl font-black text-foreground mt-2">{totalEmployees}</p>
          <p className="text-sm font-semibold text-primary mt-2">{activeEmployees} active profiles</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Attendance Marked Today")}</p>
            <div className="bg-emerald-500/10 p-2 rounded-lg"><CheckCircle2 size={20} className="text-emerald-500" /></div>
          </div>
          <p className="text-4xl font-black text-foreground mt-2">{presentToday}</p>
          <p className="text-sm font-semibold text-emerald-500 mt-2">{t("Attendance synced live")}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Total Registered Slips")}</p>
            <div className="bg-rose-500/10 p-2 rounded-lg"><ShieldCheck size={20} className="text-rose-500" /></div>
          </div>
          <p className="text-4xl font-black text-foreground mt-2">{payrollSlips.length}</p>
          <p className="text-sm font-semibold text-rose-500 mt-2">{t("Payroll Loop Connected")}</p>
        </div>
      </div>

      {/* ─── TAB: DIRECTORY ─── */}
      {activeTab === "directory" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-foreground">{t("Workforce Directory")}</h2>
            <input 
              type="text" 
              placeholder="Search employee or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary text-foreground font-semibold"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  <th className="pb-4 pr-4">{t("Employee Name")}</th>
                  <th className="pb-4 px-4">{t("Designation")}</th>
                  <th className="pb-4 px-4">{t("Payroll Loop")}</th>
                  <th className="pb-4 px-4">{t("Joining Date")}</th>
                  <th className="pb-4 px-4">{t("Status")}</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No employees found</td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr 
                      key={emp.id} 
                      onClick={() => setSelectedEmployee(emp)}
                      className="border-b border-border/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {emp.profile_pic_url ? (
                            <img src={emp.profile_pic_url} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                              <UserCircle2 size={20} className="text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-foreground group-hover:text-primary transition-colors block">{emp.name}</span>
                            <span className="text-sm text-muted-foreground font-mono">{emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{emp.designation}</td>
                      <td className="py-4 px-4 text-muted-foreground">{emp.payroll_type || "Monthly"}</td>
                      <td className="py-4 px-4 text-muted-foreground">{emp.joining_date || "N/A"}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          emp.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                        }`}>
                          {t(emp.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: ATTENDANCE SHEET ─── */}
      {activeTab === "attendance" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("Manual Roster Logs")}</h2>
              <p className="text-xs text-muted-foreground">Select a date below to manually log check-ins or absences.</p>
            </div>
            <input 
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground outline-none font-bold"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  <th className="pb-4 pr-4">{t("Employee")}</th>
                  <th className="pb-4 px-4">{t("Role")}</th>
                  <th className="pb-4 px-4 text-center">{t("Roster Status")}</th>
                  <th className="pb-4 pl-4 text-center">{t("Mark Actions")}</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold">
                {employees.map(emp => {
                  const record = allAttendance.find(a => a.employee_id === emp.id && a.date === attendanceDate);
                  const isPresent = record ? record.status === "Present" : false;
                  const isAbsent = record ? record.status === "Absent" : false;
                  return (
                    <tr key={emp.id} className="border-b border-border/30 hover:bg-muted/10">
                      <td className="py-4 pr-4">
                        <span className="font-bold text-foreground block">{emp.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{emp.id}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{emp.designation}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          isPresent ? 'bg-primary/10 text-primary border-primary/20' : isAbsent ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {record ? record.status : "Not Marked"}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleMarkAttendance(emp.id, "Present")} className="px-2.5 py-1.5 rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 cursor-pointer">Present</button>
                          <button onClick={() => handleMarkAttendance(emp.id, "Absent")} className="px-2.5 py-1.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer">Absent</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: PAYROLL LEDGER ─── */}
      {activeTab === "payroll" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-foreground">{t("Salary Disbursements Ledger")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  <th className="pb-4 pr-4">Slip ID</th>
                  <th className="pb-4 px-4">Employee</th>
                  <th className="pb-4 px-4">Month</th>
                  <th className="pb-4 px-4 text-right">Base Salary</th>
                  <th className="pb-4 px-4 text-center">Present Days</th>
                  <th className="pb-4 px-4 text-right">Deductions</th>
                  <th className="pb-4 pl-4 text-right">Net Settled</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold">
                {payrollSlips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No payroll slips issued yet</td>
                  </tr>
                ) : (
                  payrollSlips.map(slip => {
                    const emp = employees.find(e => e.id === slip.employee_id);
                    return (
                      <tr key={slip.id} className="border-b border-border/30 hover:bg-muted/10">
                        <td className="py-4 pr-4 font-mono font-bold text-foreground">{slip.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-foreground">{emp ? emp.name : "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground">{slip.payment_date}</p>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{slip.month}</td>
                        <td className="py-4 px-4 text-right text-foreground">₹{Number(slip.base_salary).toLocaleString()}</td>
                        <td className="py-4 px-4 text-center text-foreground">{slip.days_present}</td>
                        <td className="py-4 px-4 text-right text-rose-500">₹{Number(slip.advances_deducted).toLocaleString()}</td>
                        <td className="py-4 pl-4 text-right font-black text-primary">₹{Number(slip.net_paid).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: PAY SLIPS SETTINGS ─── */}
      {activeTab === "slips" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("Salary Structures & Pay Slips")}</h2>
              <p className="text-xs text-muted-foreground">Review base pay packages, tax slabs, and allowances.</p>
            </div>
            <button onClick={() => setIsSlipModalOpen(true)} className="bg-primary text-white text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer">Generate Pay Slip</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
            {employees.map(emp => (
              <div key={emp.id} className="border border-border p-5 rounded-2xl bg-background flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{emp.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{emp.designation}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">₹{Number(emp.salary || 0).toLocaleString()} / mo</p>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border font-semibold text-muted-foreground">Standard Loop</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── DETAIL DRAWER ─── */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedEmployee(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex justify-between items-start relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
                <div className="flex gap-4 relative z-10">
                  {selectedEmployee.profile_pic_url ? (
                    <img src={selectedEmployee.profile_pic_url} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-lg">
                      <UserCircle2 size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-black text-foreground">{selectedEmployee.name}</h2>
                    <p className="text-primary font-bold text-xs tracking-wide uppercase">{selectedEmployee.designation}</p>
                    <p className="text-muted-foreground text-xs font-mono mt-1">ID: {selectedEmployee.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative z-10"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Phone size={14} /> {t("Contact Details")}
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                      <div>
                        <p className="text-muted-foreground">{t("Phone Number")}</p>
                        <p className="font-semibold text-foreground mt-0.5">{selectedEmployee.contact_no || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("Emergency Contact")}</p>
                        <p className="font-semibold text-foreground mt-0.5">{selectedEmployee.emergency_contact || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <CreditCard size={14} /> {t("Payroll Details")}
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                      <div>
                        <p className="text-muted-foreground">{t("Type & Salary Day")}</p>
                        <p className="font-semibold text-foreground mt-0.5">{selectedEmployee.payroll_type} • {selectedEmployee.salary_day || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("Bank Account")}</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {selectedEmployee.bank_name ? `${selectedEmployee.bank_name} - ${selectedEmployee.account_no}` : "N/A"}
                        </p>
                        {selectedEmployee.ifsc_code && <p className="text-xs text-muted-foreground mt-0.5 font-mono">{selectedEmployee.ifsc_code}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Documents */}
                <div className="space-y-3 text-xs">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} /> {t("Legal & Identity Documents")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex flex-col justify-between">
                      <div>
                        <p className="text-muted-foreground">{t("Aadhaar No")}</p>
                        <p className="font-semibold font-mono text-foreground mt-0.5">{selectedEmployee.aadhaar_no || "N/A"}</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {selectedEmployee.aadhaar_front_url && (
                          <a href={selectedEmployee.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Front</a>
                        )}
                        {selectedEmployee.aadhaar_back_url && (
                          <a href={selectedEmployee.aadhaar_back_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Back</a>
                        )}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex flex-col justify-between">
                      <div>
                        <p className="text-muted-foreground">{t("PAN No")}</p>
                        <p className="font-semibold font-mono text-foreground mt-0.5">{selectedEmployee.pan_no || "N/A"}</p>
                      </div>
                      <div className="mt-4">
                        {selectedEmployee.pan_front_url && (
                          <a href={selectedEmployee.pan_front_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View PAN</a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all"
                >
                  {t("Close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MODAL: ADD SALARY SLIP
      ══════════════════════════════════════════ */}
      {isSlipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/20">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Wallet size={16} className="text-primary animate-pulse" /> {t("Issue Salary Slip")}
              </h2>
              <button onClick={() => setIsSlipModalOpen(false)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleCreateSlipSubmit} className="p-6 space-y-4 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Select Employee *</label>
                <select required value={slipForm.employeeId} onChange={e => {
                  const emp = employees.find(x => x.id === e.target.value);
                  setSlipForm({...slipForm, employeeId: e.target.value, baseSalary: emp ? emp.salary.toString() : ""});
                }}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Salary Month *</label>
                  <input type="text" required value={slipForm.month} onChange={e => setSlipForm({...slipForm, month: e.target.value})}
                    placeholder="e.g. 2026-07" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Base Salary (₹) *</label>
                  <input type="number" required value={slipForm.baseSalary} onChange={e => setSlipForm({...slipForm, baseSalary: e.target.value})}
                    placeholder="e.g. 28000" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Days Present</label>
                  <input type="number" value={slipForm.daysPresent} onChange={e => setSlipForm({...slipForm, daysPresent: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Deductions / Advances (₹)</label>
                  <input type="number" value={slipForm.advancesDeducted} onChange={e => setSlipForm({...slipForm, advancesDeducted: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Payment Mode</label>
                  <select value={slipForm.paymentMode} onChange={e => setSlipForm({...slipForm, paymentMode: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="BANK">BANK / NEFT</option>
                    <option value="CASH">CASH</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Payment Date</label>
                  <input type="date" value={slipForm.paymentDate} onChange={e => setSlipForm({...slipForm, paymentDate: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
              </div>

              <div className="pt-2 flex gap-3 border-t border-border">
                <button type="button" onClick={() => setIsSlipModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-black py-2.5 rounded-xl transition-colors cursor-pointer font-sans">
                  {isPending ? "Issuing..." : "Confirm & Issue Slip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
