import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.CMS_USERNAME || "admin";
    const validPassword = process.env.CMS_PASSWORD || "";

    if (!validPassword) {
      return NextResponse.json(
        { error: "CMS_PASSWORD chưa được cấu hình" },
        { status: 500 }
      );
    }

    if (username === validUsername && password === validPassword) {
      // Simple token: base64 of username + timestamp
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      const response = NextResponse.json({ success: true });
      response.cookies.set("cms-auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { error: "Sai tên đăng nhập hoặc mật khẩu" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
