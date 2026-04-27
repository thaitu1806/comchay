import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't protect login page or auth API
  if (pathname === "/cms/login" || pathname.startsWith("/api/cms-auth")) {
    return NextResponse.next();
  }

  // Protect /cms routes with simple cookie check
  if (pathname.startsWith("/cms")) {
    const authCookie = request.cookies.get("cms-auth");

    if (!authCookie?.value) {
      const loginUrl = new URL("/cms/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*"],
};
