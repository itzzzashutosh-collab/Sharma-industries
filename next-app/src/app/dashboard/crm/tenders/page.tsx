import TendersClient from "./TendersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Government Tenders | Sharma ERP",
  description: "Active paint & coating procurement tenders — 96.8K+ government tenders tracked with deadlines and values.",
};

export const dynamic = "force-dynamic";

export default function TendersPage() {
  return <TendersClient />;
}
