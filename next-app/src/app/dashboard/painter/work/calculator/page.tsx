import type { Metadata } from "next";
import { CalculatorClient } from "./CalculatorClient";
import { getPainterEstimations } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Material Estimator | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterEstimations();
  return <CalculatorClient initialData={(res as any)} />;
}
