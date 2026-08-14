import React from "react";
import SalesTeamAdminClient from "./SalesTeamAdminClient";
import { getSalesTeamData } from "./actions";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "CEO Mode - Salesmen Management & Distribution",
  description: "Strict Administrative dashboard for salesman KYC, approvals, and route distributions.",
  };
}

export default async function SalesTeamAdminPage() {
  const res = await getSalesTeamData();
  
  const initialData = res.success && res.data ? {
    executives: res.data.executives.map((e: any) => ({
      id: e.id,
      name: e.name,
      phone: e.phone || "",
      email: e.email || "",
      assignedRegion: e.assigned_region || "",
      status: e.status || "Pending",
      dateOfJoining: e.date_of_joining || "Pending Approval",
      emergencyContact: e.emergency_contact || "",
      designation: e.designation || "",
      aadhar: e.aadhar || "",
      pan: e.pan || "",
      bankName: e.bank_name || "",
      accountNo: e.account_no || "",
      ifsc: e.ifsc || "",
      salary: Number(e.salary) || 0,
      incentiveRate: Number(e.incentive_rate) || 0,
      targetMonthly: Number(e.target_monthly) || 0,
      achievedMonthly: Number(e.achieved_monthly) || 0,
      totalCollections: Number(e.total_collections) || 0,
      totalVisits: Number(e.total_visits) || 0,
      assignedDistricts: e.assigned_region ? [e.assigned_region] : []
    })),
    visits: res.data.visits.map((v: any) => ({
      id: v.id,
      salesmanId: v.salesman_id,
      salesmanName: "", // Mapped in client
      dealer: v.dealer_name || "",
      location: v.location || "",
      date: v.visit_date || "",
      purpose: v.purpose || "",
      outcome: v.outcome || "",
      status: v.status || "Completed"
    })),
    collections: res.data.collections.map((c: any) => ({
      id: c.id,
      salesmanId: c.salesman_id,
      salesmanName: "", // Mapped in client
      dealer: c.dealer_name || "",
      amount: Number(c.amount) || 0,
      date: c.payment_date || "",
      mode: c.payment_mode || "NEFT",
      reference: c.reference_no || "",
      status: c.status || "Settled"
    })),
    activities: res.data.activities.map((a: any) => ({
      id: a.id,
      salesmanId: a.salesman_id,
      type: a.activity_type || "Visit",
      desc: a.description || "",
      time: a.created_at ? new Date(a.created_at).toLocaleString() : ""
    })),
    inputs: res.data.inputs.map((i: any) => ({
      id: i.id,
      salesmanId: i.salesman_id,
      type: i.item_type || "Sample Kit",
      desc: i.description || "",
      quantity: Number(i.quantity) || 0,
      date: i.issued_date || "",
      status: i.status || "Issued"
    }))
  } : {
    executives: [],
    visits: [],
    collections: [],
    activities: [],
    inputs: []
  };

  return (
    <div className="min-h-screen">
      <SalesTeamAdminClient initialData={initialData} />
    </div>
  );
}
