import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// Mapping of routes to their required roles as per folder names in src/app
const ROLE_ROUTE_MAP: Record<string, string> = {
  "referring-admin": "REFERRING_ADMIN",
  "referring-doctor": "REFERRING_DOCTOR",
  "liaison-officer": "LIAISON_OFFICER",
  "recieving-admin": "RECEIVING_ADMIN",
  "receiving-specialist": "RECEIVING_SPECIALIST",
  "receptionist": "RECEPTIONIST",
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const path = req.nextUrl.pathname;

  let role: string | undefined;

  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      role = decoded.role;
    } catch (e) {
      console.error("Middleware token decode failed:", e);
    }
  }

  // Find if current path is protected by a role
  const protectedRoutePrefix = Object.keys(ROLE_ROUTE_MAP).find((prefix) =>
    path.startsWith(`/${prefix}`)
  );

  if (protectedRoutePrefix) {
    const requiredRole = ROLE_ROUTE_MAP[protectedRoutePrefix];

    if (role !== requiredRole) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // General admin protection (if applicable)
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/referring-admin/:path*",
    "/referring-doctor/:path*",
    "/liaison-officer/:path*",
    "/recieving-admin/:path*",
    "/receiving-specialist/:path*",
    "/receptionist/:path*",
    "/admin/:path*",
  ],
};
