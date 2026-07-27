import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Sales Executive Settings | Swatch Paints" };
}

export default async function Page() {
  return <SettingsClient />;
}
