import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("si_session");

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      redirect(`/dashboard/${session.role}`);
    } catch {
      redirect("/login");
    }
  }

  redirect("/login");
}
