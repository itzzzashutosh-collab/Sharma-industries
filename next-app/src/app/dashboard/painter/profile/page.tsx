import type { Metadata } from "next";
import { MyProfileClient } from "./MyProfileClient";
import { getPainterPortfolioData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "My Profile | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterPortfolioData();
  return <MyProfileClient initialData={(res as any)} />;
}
