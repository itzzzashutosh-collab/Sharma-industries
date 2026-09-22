import type { Metadata } from "next";
import { LeaderboardClient } from "./LeaderboardClient";
import { createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Leaderboard | Community Workspace" };
}

export default async function Page() {
  let painters: any[] = [];
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("users")
      .select("id, name, phone, address, total_tokens")
      .eq("role", "painter")
      .order("total_tokens", { ascending: false });

    if (data && data.length > 0) {
      painters = data;
    }
  } catch (err) {
    console.error("Error loading painters leaderboard:", err);
  }

  return <LeaderboardClient initialPainters={painters} />;
}
