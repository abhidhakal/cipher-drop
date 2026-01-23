import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export default async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  let parsedSession = null;

  if (session) {
    try {
      parsedSession = await decrypt(session);
    } catch {
      // Invalid session
    }
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  // Protected routes: /dashboard, /transfer, /profile, /drop
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/transfer") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/drop");

  if (isProtected && !parsedSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && parsedSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transfer/:path*", "/profile/:path*", "/drop/:path*", "/login", "/register"],
};
