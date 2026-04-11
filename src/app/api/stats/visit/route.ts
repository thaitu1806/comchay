import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageVisits } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pagePath = typeof body.pagePath === "string" && body.pagePath.trim()
      ? body.pagePath.trim()
      : "/";

    await db.insert(pageVisits).values({ pagePath });

    return NextResponse.json(
      { message: "Đã ghi nhận lượt truy cập" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to record visit:", error);
    return NextResponse.json(
      { error: "Không thể ghi nhận lượt truy cập" },
      { status: 500 }
    );
  }
}
