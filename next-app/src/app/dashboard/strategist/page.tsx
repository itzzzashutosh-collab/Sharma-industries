import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStrategist360Data } from "./actions";
import { StrategistClient } from "./StrategistClient";

export const dynamic = "force-dynamic";

export default async function StrategistPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("si_session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let session: { userId: string; name: string; role: string; phone: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  // Strictly enforce CEO-ONLY access
  if (session.role !== "ceo") {
    redirect("/dashboard");
  }

  const res = await getStrategist360Data();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <StrategistClient data={res as any} />
    </div>
  );
}
