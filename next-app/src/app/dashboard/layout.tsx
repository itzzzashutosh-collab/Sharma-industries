import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/dashboard/logout-button";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar role={session.role as any} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent z-10 relative">
          {/* Top Left Logo Container */}
          <div className="flex items-center pl-10 lg:pl-0 shrink-0">
            {/* Main Logo */}
            <img
              src="/logo_day_cropped.png"
              alt="Sharma Industries Logo"
              className="w-[130px] sm:w-[150px] lg:w-[170px] h-auto object-contain transition-all"
            />
          </div>

          {/* Centered Title */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 flex-col items-center leading-tight">
            <span className="text-2xl font-bold text-foreground tracking-tight">Sharma Industries</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mt-1">ERP Software</span>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {session.name}
              </p>
              <p className="text-sm text-muted-foreground capitalize">{session.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {session.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="h-6 w-px bg-border mx-2" />
            <LogoutButton />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
