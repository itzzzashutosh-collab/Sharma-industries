import type { Metadata } from "next";
import { ShopProfileSettingsClient } from "./ShopProfileSettingsClient";
import { getDealerShopProfile } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Shop Profile | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerShopProfile();
  return <ShopProfileSettingsClient initialData={(res.data || {}) as any} />;
}
