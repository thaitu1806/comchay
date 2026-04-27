import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productMedia, productVariants } from "@/lib/schema";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  try {
    const activeProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "active"));

    // Fetch variants for all active products
    const productIds = activeProducts.map((p) => p.id);
    let allVariants: (typeof productVariants.$inferSelect)[] = [];
    if (productIds.length > 0) {
      allVariants = await db
        .select()
        .from(productVariants);
    }

    // Group variants by productId
    const variantsByProductId = new Map<number, (typeof productVariants.$inferSelect)[]>();
    for (const v of allVariants) {
      if (!productIds.includes(v.productId)) continue;
      const existing = variantsByProductId.get(v.productId) ?? [];
      existing.push(v);
      variantsByProductId.set(v.productId, existing);
    }

    const productsWithVariants = activeProducts.map((p) => ({
      ...p,
      variants: variantsByProductId.get(p.id) ?? [],
    }));

    return NextResponse.json(productsWithVariants);
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
    const { name, description, price, thumbnailUrl, slug, media, variants, badge, stockStatus } = body;

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
        badge: badge ?? null,
        stockStatus: stockStatus ?? "in_stock",
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

    // Insert variants if provided
    if (variants && Array.isArray(variants) && variants.length > 0) {
      await db.insert(productVariants).values(
        variants.map((v: { riceType?: string; spiceLevel?: string; weight: number; price: number }) => ({
          productId: created.id,
          riceType: v.riceType ?? null,
          spiceLevel: v.spiceLevel ?? null,
          weight: v.weight,
          price: v.price,
        }))
      );
    }

    // Fetch inserted variants to return with the product
    const createdVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, created.id));

    return NextResponse.json({ ...created, variants: createdVariants }, { status: 201 });
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
