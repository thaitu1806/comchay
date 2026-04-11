import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productMedia } from "@/lib/schema";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    const media = await db
      .select()
      .from(productMedia)
      .where(eq(productMedia.productId, product.id))
      .orderBy(productMedia.sortOrder);

    return NextResponse.json({ ...product, media });
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return NextResponse.json(
      { error: "Không thể tải thông tin sản phẩm" },
      { status: 500 }
    );
  }
}
