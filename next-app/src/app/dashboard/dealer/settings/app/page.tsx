import type { Metadata } from "next";
import { AppSettingsPreferencesClient } from "./AppSettingsPreferencesClient";
import { getDealerShopProfile } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "App Settings Preferences | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerShopProfile();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <AppSettingsPreferencesClient initialData={data} />;
}
