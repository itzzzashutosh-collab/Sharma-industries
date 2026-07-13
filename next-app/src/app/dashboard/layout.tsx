import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/dashboard/logout-button";
import { Sidebar } from "@/components/Sidebar";
import { LanguageSwitcher } from "@/components/executive/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { AIChatAssistant } from "@/components/AIChatAssistant";

// All dashboard routes use cookies() for auth — must be dynamic.
export const dynamic = "force-dynamic";

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

  const roleLabels: Record<string, string> = {
    ceo:          "CEO",
    cofounder:    "Co-Founder",
    dealer:       "Dealer",
    salesman:     "Sales Executive",
    factory:      "Factory Manager",
    "ca-portal":  "CA Auditor Mode",
    ca:           "CA Auditor Mode",
    painter:      "Professional Painter",
  };


  const roleLabel = roleLabels[session.role] || session.role;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Navigation */}
      <Sidebar role={session.role as any} userName={session.name} roleLabel={roleLabel} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Header */}
        <header className="h-[72px] flex items-center justify-between pl-14 lg:pl-5 pr-4 sm:pr-6 bg-background border-b border-border z-20 relative shrink-0">

          {/* Left: Sharma Industries Logo — responsive width to fit mobile screens */}
          <div
            className="shrink-0 relative overflow-hidden w-12 sm:w-[240px]"
            style={{ height: "50px" }}
          >
            <img
              src="https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Sharmaindustries_daytheme.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1NoYXJtYWluZHVzdHJpZXNfZGF5dGhlbWUucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4Mzc2NTQ0MiwiZXhwIjo0OTM3MzY1NDQyfQ.NsMmaKzUaevoBm81geF4haKk-DFIPlv9Wub_Isc3WqI"
              alt="Sharma Industries"
              className="absolute [mix-blend-mode:multiply] max-none"
              style={{
                width: "225px",
                height: "225px",
                top: "-82px",
                left: "-9px",
              }}
            />
          </div>

          {/* Center: Company name + tagline */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center leading-tight pointer-events-none select-none">
            <span className="text-sm font-black text-foreground tracking-tight">Sharma Industries</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Paint Operating System
            </span>
          </div>

          {/* Right: Controls — hidden on mobile, shown in sidebar instead */}
          <div className="flex items-center gap-2">

            {/* Notification bell always visible */}
            <NotificationBell />

            {/* Language, avatar, user info, logout: desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSwitcher />

              <div className="h-5 w-px bg-border" />

              {/* User info */}
              <div className="flex flex-col items-end leading-tight">
                <p className="text-xs font-bold text-foreground">{session.name}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">{roleLabel}</p>
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{session.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* Logout */}
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <AIChatAssistant />
    </div>
  );
}
