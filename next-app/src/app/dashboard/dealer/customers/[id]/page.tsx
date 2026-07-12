import type { Metadata } from "next";
import { CustomerDetailClient } from "./CustomerDetailClient";
import { getDealerCustomerDetails } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Customer Detail ${id} | Dealer Workspace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getDealerCustomerDetails(id);

  if (!res.profile) {
    return (
      <div className="text-center py-12 text-xs text-muted-foreground">
        Customer profile not found.
      </div>
    );
  }

  return (
    <CustomerDetailClient
      profile={res.profile as any}
      projects={res.projects as any[]}
      followups={res.followups as any[]}
    />
  );
}
