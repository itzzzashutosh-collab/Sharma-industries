import type { Metadata } from "next";
import { PainterPortfolioClient } from "./PainterPortfolioClient";
import { getPainterPortfolioData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Portfolio Gallery | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterPortfolioData();
  return <PainterPortfolioClient initialData={(res as any)} />;
}
