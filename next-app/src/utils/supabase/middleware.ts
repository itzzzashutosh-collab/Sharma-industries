import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Check for custom session cookie (for our custom credentials auth)
  const sessionCookie = request.cookies.get("si_session");
  const hasCustomSession = !!sessionCookie?.value;

  // If user has active custom session, handle routing instantly without network delay
  if (hasCustomSession) {
    if (request.nextUrl.pathname === "/login") {
      try {
        const session = JSON.parse(sessionCookie.value);
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${session.role || "ceo"}`;
        return NextResponse.redirect(url);
      } catch {
        // Continue to login if malformed
      }
    }
    return NextResponse.next({ request });
  }

  // Protect dashboard routes when no session exists
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
