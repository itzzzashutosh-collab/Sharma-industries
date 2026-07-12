import type { Metadata } from "next";
import { ProjectsClient } from "./ProjectsClient";
import { getDealerProjects, getDealerCustomers } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Projects Management | Dealer Workspace" };
}

export default async function Page() {
  const [projsRes, custsRes] = await Promise.all([
    getDealerProjects(),
    getDealerCustomers()
  ]);

  return (
    <ProjectsClient
      initialData={projsRes.list || []}
      customers={custsRes.list || []}
    />
  );
}
