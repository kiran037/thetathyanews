// File: middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session_token")?.value;

  // Protect admin routes: immediate redirect if no session cookie
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Authenticated admin checks and RBAC are authoritatively handled by app/admin/layout.tsx (requireAdmin)
  }

  // Redirect away from auth pages if session cookie is present
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  if (token && authRoutes.some((route) => pathname === route)) {
    // Only redirect root if not requesting with callback
    if (!request.nextUrl.searchParams.get("callbackUrl")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
