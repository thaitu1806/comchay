import { NextRequest, NextResponse } from "next/server";
import { sql, count, gte, lte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, pageVisits } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Total page visits
    const [visitsResult] = await db
      .select({ total: count() })
      .from(pageVisits);
    const totalVisits = visitsResult?.total ?? 0;

    // Current date boundaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const weekDay = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
    const weekStartStr = weekStart.toISOString();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Orders today
    const [todayResult] = await db
      .select({ total: count() })
      .from(orders)
      .where(gte(orders.createdAt, todayStart));
    const ordersToday = todayResult?.total ?? 0;

    // Orders this week
    const [weekResult] = await db
      .select({ total: count() })
      .from(orders)
      .where(gte(orders.createdAt, weekStartStr));
    const ordersThisWeek = weekResult?.total ?? 0;

    // Orders this month
    const [monthResult] = await db
      .select({ total: count() })
      .from(orders)
      .where(gte(orders.createdAt, monthStart));
    const ordersThisMonth = monthResult?.total ?? 0;

    // Build response
    const stats: Record<string, unknown> = {
      totalVisits,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
    };

    // Optional custom date range
    if (startDate && endDate) {
      const conditions = [
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
      ];
      const [rangeResult] = await db
        .select({ total: count() })
        .from(orders)
        .where(and(...conditions));
      stats.ordersInRange = rangeResult?.total ?? 0;
    }

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Không thể lấy thống kê" },
      { status: 500 }
    );
  }
}
