import { redirect } from "next/navigation";

export default function CEODashboardRedirect() {
  redirect("/dashboard/admin");
}
