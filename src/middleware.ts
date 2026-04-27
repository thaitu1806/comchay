import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't protect login page or auth API routes
  if (pathname === "/cms/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protect /cms routes
  if (pathname.startsWith("/cms")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      const loginUrl = new URL("/cms/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*"],
};
