import ArchitectsClient from "./ArchitectsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architects Directory | Sharma ERP",
  description: "Pan-India architects database with 484K+ commercial, residential & luxury specialists.",
};

export const dynamic = "force-dynamic";

export default function ArchitectsPage() {
  return <ArchitectsClient />;
}
