import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very
  // hard to debug issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check for custom session cookie (for our custom credentials auth)
  const sessionCookie = request.cookies.get("si_session");
  const hasCustomSession = !!sessionCookie?.value;

  // Protect dashboard routes
  if (
    !user &&
    !hasCustomSession &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login page
  if ((user || hasCustomSession) && request.nextUrl.pathname === "/login") {
    // If custom session, parse the role to redirect
    if (hasCustomSession) {
      try {
        const session = JSON.parse(sessionCookie!.value);
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${session.role}`;
        return NextResponse.redirect(url);
      } catch {
        // Invalid session cookie, let them through to login
      }
    }
  }

  return supabaseResponse;
}
