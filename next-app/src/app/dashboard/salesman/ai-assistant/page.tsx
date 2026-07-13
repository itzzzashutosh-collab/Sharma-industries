import type { Metadata } from "next";
import { AIAssistantClient } from "./AIAssistantClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AI Sales Coach | Sales Executive" };
}

export default async function Page() {
  return <AIAssistantClient />;
}
