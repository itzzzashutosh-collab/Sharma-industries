import CRMHubClient from "./CRMHubClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Intelligence Hub | Sharma ERP",
  description: "Pan-India dealer, architect, builder & designer database with 1.2M+ records for Swatch Paints market intelligence.",
};

export const dynamic = "force-dynamic";

export default function CRMHubPage() {
  return <CRMHubClient />;
}
