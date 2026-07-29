import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight, Edge-safe JWT decoder (signature verification happens inside API route handlers)
function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    // Replace base64url characters to standard base64
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decode base64 string
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tokenCookie = req.cookies.get("auth_token");
  const token = tokenCookie ? tokenCookie.value : null;
  
  const decoded = token ? decodeJwt(token) : null;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || !decoded) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (decoded.role !== "ADMIN") {
      // Return 403 Forbidden redirect to home page
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token || !decoded) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based dashboard restrictions
    const role = decoded.role;
    
    // If a normal user tries to access owner/agent dashboards like /dashboard/properties or /dashboard/leads
    const isOwnerAgentPath = 
      pathname.startsWith("/dashboard/properties") || 
      pathname.startsWith("/dashboard/leads") || 
      pathname.startsWith("/dashboard/analytics");

    if (isOwnerAgentPath && role === "USER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith("/auth/")) {
    if (token && decoded) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
