import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productMedia } from "@/lib/schema";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  try {
    const activeProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "active"));

    return NextResponse.json(activeProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách sản phẩm" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, thumbnailUrl, slug, media } = body;

    // Validate required fields
    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Tên sản phẩm và giá là bắt buộc" },
        { status: 400 }
      );
    }

    const productSlug = slug || generateSlug(name);

    const [created] = await db
      .insert(products)
      .values({
        name,
        slug: productSlug,
        description: description ?? null,
        price,
        thumbnailUrl: thumbnailUrl ?? null,
      })
      .returning();

    // Insert media items if provided
    if (media && Array.isArray(media) && media.length > 0) {
      await db.insert(productMedia).values(
        media.map((item: { url: string; type: string }, index: number) => ({
          productId: created.id,
          url: item.url,
          type: item.type,
          sortOrder: index,
        }))
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    // Handle unique constraint violation on slug
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("UNIQUE constraint failed") ||
      message.includes("unique") ||
      message.includes("SQLITE_CONSTRAINT")
    ) {
      return NextResponse.json(
        { error: "Slug đã tồn tại, vui lòng chọn slug khác" },
        { status: 409 }
      );
    }

    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Không thể tạo sản phẩm" },
      { status: 500 }
    );
  }
}
