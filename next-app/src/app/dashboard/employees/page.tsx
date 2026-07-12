import React from "react";
import EmployeeDashboardClient from "./EmployeeDashboardClient";
import { getEmployeeDashboardData } from "@/actions/employeeActions";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Employee Directory & Payroll | Sharma ERP",
  description: "Administrative panel for managing employee profiles, manual roster entries, and payroll salary slips.",
  };
}
export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const res = await getEmployeeDashboardData();

  const initialData = res.success && res.data ? {
    employees: res.data.employees,
    todayAttendance: res.data.todayAttendance,
    allAttendance: res.data.allAttendance,
    payrollSlips: res.data.payrollSlips
  } : {
    employees: [],
    todayAttendance: [],
    allAttendance: [],
    payrollSlips: []
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <EmployeeDashboardClient
        initialEmployees={initialData.employees}
        initialTodayAttendance={initialData.todayAttendance}
        initialAllAttendance={initialData.allAttendance}
        initialPayrollSlips={initialData.payrollSlips}
      />
    </div>
  );
}
