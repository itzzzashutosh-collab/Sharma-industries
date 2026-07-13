import type { Metadata } from "next";
import { LearningClient } from "./LearningClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Sales Academy | Sales Executive" };
}

export default async function Page() {
  return <LearningClient />;
}
