import type { Metadata } from "next";
import PainterRegisterClient from "./PainterRegisterClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Register New Painter | Dealer Workspace" };
}

export default function Page() {
  return <PainterRegisterClient />;
}
