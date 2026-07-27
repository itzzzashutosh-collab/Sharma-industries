import type { Metadata } from "next";
import { ProjectsClient } from "./ProjectsClient";
import { getPainterPortfolioData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Active Job Sites | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterPortfolioData();
  return <ProjectsClient initialData={(res as any)} />;
}
