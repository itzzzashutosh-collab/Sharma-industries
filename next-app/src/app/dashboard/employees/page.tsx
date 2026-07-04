"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, BadgeInfo, Building2, UserCircle2, CheckCircle2, XCircle, FileText, Phone, CreditCard, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EmployeeDashboardPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch Employees
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (empError) throw empError;
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attData, error: attError } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", today);
        
      if (attError) throw attError;

      setEmployees(empData || []);
      setAttendance(attData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAttendance(employeeId: string, status: string, e: React.MouseEvent) {
    e.stopPropagation(); // Prevent opening modal
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already marked
      const existing = attendance.find(a => a.employee_id === employeeId);
      
      if (existing) {
        // Update
        const { error } = await supabase
          .from("attendance")
          .update({ status })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("attendance").insert([
          {
            id: `ATT-${Date.now()}`,
            employee_id: employeeId,
            date: today,
            status: status
          }
        ]);
        if (error) throw error;
      }
      
      // Refresh
      fetchData();
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Failed to mark attendance");
    }
  }

  const getAttendanceStatus = (empId: string) => {
    const record = attendance.find(a => a.employee_id === empId);
    return record ? record.status : null;
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const presentToday = attendance.filter(a => a.status === 'Present').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-primary" size={32} /> {t("Team & HR Management")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("Manage employee onboarding, attendance, and compliance documents.")}</p>
        </div>
        <Link 
          href="/dashboard/employees/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} /> {t("Onboard New Employee")}
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Active Employees")}</p>
            <div className="bg-primary/10 p-2 rounded-lg"><UserCircle2 size={20} className="text-primary" /></div>
          </div>
          <p className="text-4xl font-black text-foreground mt-2">{activeEmployees}</p>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Present Today")}</p>
            <div className="bg-emerald-500/10 p-2 rounded-lg"><CheckCircle2 size={20} className="text-emerald-400" /></div>
          </div>
          <p className="text-4xl font-black text-emerald-400 mt-2">{presentToday}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Total Departments")}</p>
            <div className="bg-blue-500/10 p-2 rounded-lg"><Building2 size={20} className="text-blue-400" /></div>
          </div>
          <p className="text-4xl font-black text-blue-400 mt-2">4</p>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <BadgeInfo className="text-primary" size={20} />
          {t("Employee Directory & Attendance")}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                <th className="pb-4 pr-4">{t("Employee")}</th>
                <th className="pb-4 px-4">{t("Designation")}</th>
                <th className="pb-4 px-4">{t("Payroll")}</th>
                <th className="pb-4 px-4">{t("Status")}</th>
                <th className="pb-4 pl-4 text-center">{t("Today's Attendance")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                    {t("Loading directory...")}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                    {t("No employees found. Click 'Onboard New Employee' to start.")}
                  </td>
                </tr>
              ) : (
                employees.map(emp => {
                  const status = getAttendanceStatus(emp.id);
                  return (
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
                      <td className="py-4 px-4 font-semibold text-muted-foreground">{emp.designation}</td>
                      <td className="py-4 px-4 font-semibold text-muted-foreground">{emp.payroll_type}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-sm font-bold uppercase tracking-wider border ${
                          emp.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 pl-4">
                        <div className="flex justify-center items-center gap-2">
                          {status === 'Present' ? (
                            <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 size={14} /> Present
                            </span>
                          ) : status === 'Absent' ? (
                            <span className="text-sm font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 flex items-center gap-1">
                              <XCircle size={14} /> Absent
                            </span>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => markAttendance(emp.id, 'Present', e)}
                                className="p-2 rounded-lg hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors tooltip"
                                title="Mark Present"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={(e) => markAttendance(emp.id, 'Absent', e)}
                                className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors tooltip"
                                title="Mark Absent"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Profile Popup Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80  p-4 animate-in fade-in">
          <div className="bg-background border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-start relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
              <div className="flex gap-4 relative z-10">
                {selectedEmployee.profile_pic_url ? (
                  <img src={selectedEmployee.profile_pic_url} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-lg">
                    <UserCircle2 size={40} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-black text-foreground">{selectedEmployee.name}</h2>
                  <p className="text-primary font-bold text-sm tracking-wide uppercase">{selectedEmployee.designation}</p>
                  <p className="text-muted-foreground text-sm font-mono mt-1">ID: {selectedEmployee.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Phone size={16} /> Contact Details
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-semibold">{selectedEmployee.contact_no || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="font-semibold">{selectedEmployee.emergency_contact || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Payroll Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={16} /> Payroll Details
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Type & Salary Day</p>
                      <p className="font-semibold">{selectedEmployee.payroll_type} • {selectedEmployee.salary_day || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Account</p>
                      <p className="font-semibold text-sm">
                        {selectedEmployee.bank_name ? `${selectedEmployee.bank_name} - ${selectedEmployee.account_no}` : "N/A"}
                      </p>
                      {selectedEmployee.ifsc_code && <p className="text-sm text-muted-foreground">{selectedEmployee.ifsc_code}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Documents */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Legal & Identity Documents
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aadhaar No</p>
                      <p className="font-semibold font-mono text-sm">{selectedEmployee.aadhaar_no || "N/A"}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {selectedEmployee.aadhaar_front_url && (
                        <a href={selectedEmployee.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Front</a>
                      )}
                      {selectedEmployee.aadhaar_back_url && (
                        <a href={selectedEmployee.aadhaar_back_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Back</a>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">PAN No</p>
                      <p className="font-semibold font-mono text-sm">{selectedEmployee.pan_no || "N/A"}</p>
                    </div>
                    <div className="mt-4">
                      {selectedEmployee.pan_front_url && (
                        <a href={selectedEmployee.pan_front_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">View PAN</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
