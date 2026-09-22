import DealersClient from "./DealersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealers Directory | Sharma ERP",
  description: "Pan-India paint dealer database with 127K+ dealers, Rajasthan territory mapping, and verified dealer network.",
};

export const dynamic = "force-dynamic";

export default function DealersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return <DealersClient />;
}
