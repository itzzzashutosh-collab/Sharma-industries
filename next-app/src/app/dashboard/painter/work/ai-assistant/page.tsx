import type { Metadata } from "next";
import { AIAssistantClient } from "./AIAssistantClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AI Paint Assistant | Painter Workspace" };
}

export default async function Page() {
  return <AIAssistantClient />;
}
