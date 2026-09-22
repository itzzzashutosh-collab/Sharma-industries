import BuildersClient from "./BuildersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Builders & Developers | Sharma ERP",
  description: "Pan-India builders & developers database with 50K+ construction companies and their paint procurement data.",
};

export const dynamic = "force-dynamic";

export default function BuildersPage() {
  return <BuildersClient />;
}
