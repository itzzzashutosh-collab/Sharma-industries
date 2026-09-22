import DesignersClient from "./DesignersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interior Designers | Sharma ERP",
  description: "Pan-India interior designers database with 484K+ turnkey execution and design studios.",
};

export const dynamic = "force-dynamic";

export default function DesignersPage() {
  return <DesignersClient />;
}
