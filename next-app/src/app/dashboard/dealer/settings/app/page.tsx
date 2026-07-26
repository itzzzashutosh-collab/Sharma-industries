import type { Metadata } from "next";
import { AppSettingsPreferencesClient } from "./AppSettingsPreferencesClient";
import { getDealerAppSettings } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Application Settings | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerAppSettings();
  return <AppSettingsPreferencesClient initialData={(res as any).data || {}} />;
}
