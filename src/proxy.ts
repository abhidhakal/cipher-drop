import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

// Security headers configuration
const securityHeaders = {
  // Prevent clickjacking attacks - deny all framing
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Enable XSS filter in older browsers
  "X-XSS-Protection": "1; mode=block",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy (formerly Feature-Policy)
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",

  // Content Security Policy - adjust based on your needs
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
    "style-src 'self' 'unsafe-inline'", // Required for inline styles
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join("; "),
};

export default async function proxy(request: NextRequest) {
  // CSRF PROTECTION (Double Submit Cookie Pattern)
  const response = NextResponse.next();

  // 1. Generate CSRF token if missing
  let csrfToken = request.cookies.get("csrf_token")?.value;
  if (!csrfToken) {
    csrfToken = crypto.randomUUID();
    response.cookies.set("csrf_token", csrfToken, {
      path: "/",
      httpOnly: false, // JavaScript needs to read this to send the header
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // 2. Validate CSRF token on mutating requests
  const unsafeMethods = ["POST", "PUT", "DELETE", "PATCH"];
  if (unsafeMethods.includes(request.method)) {
    const headerToken = request.headers.get("x-csrf-token");
    if (headerToken !== csrfToken) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid CSRF Token" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const session = request.cookies.get("session")?.value;
  let parsedSession = null;

  if (session) {
    try {
      parsedSession = await decrypt(session);
    } catch {
      // Invalid session
    }
  }

  // FORCE HTTPS REDIRECT (Security Policy)
  // Check if we are in production and the request is not secure
  const protocol = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");

  // Skip for localhost development
  const isLocalhost = host?.includes("localhost") || host?.includes("127.0.0.1");

  if (protocol === "http" && !isLocalhost) {
    return NextResponse.redirect(
      `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  // Protected routes: /dashboard, /transfer, /profile, /drop, /admin
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/transfer") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/drop") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isProtected && !parsedSession) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    // Add security headers to redirect response
    Object.entries(securityHeaders).forEach(([key, value]) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  if (isAuthPage && parsedSession) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    Object.entries(securityHeaders).forEach(([key, value]) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

