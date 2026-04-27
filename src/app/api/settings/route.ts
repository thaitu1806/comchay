import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/schema";

const SETTING_KEYS = [
  "hotline",
  "zalo_url",
  "shopee_url",
  "promo_banner",
  "promo_banner_active",
] as const;

type SettingsObject = Record<(typeof SETTING_KEYS)[number], string>;

function buildSettingsObject(
  rows: { key: string; value: string }[]
): SettingsObject {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    result[key] = map.get(key) ?? "";
  }
  return result as SettingsObject;
}

export async function GET() {
  try {
    const rows = await db.select().from(siteSettings);
    return NextResponse.json(buildSettingsObject(rows));
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Không thể tải cài đặt" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate hotline is not empty if provided
    if ("hotline" in body && (!body.hotline || !body.hotline.trim())) {
      return NextResponse.json(
        { error: "Số hotline là bắt buộc" },
        { status: 400 }
      );
    }

    // Upsert each key-value pair
    for (const key of SETTING_KEYS) {
      if (!(key in body)) continue;

      const value = String(body[key]);

      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({ key, value });
      }
    }

    // Return updated settings
    const rows = await db.select().from(siteSettings);
    return NextResponse.json(buildSettingsObject(rows));
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật cài đặt" },
      { status: 500 }
    );
  }
}
