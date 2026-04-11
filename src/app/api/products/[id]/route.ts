import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productMedia } from "@/lib/schema";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 404 }
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
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
      .where(eq(productMedia.productId, productId))
      .orderBy(productMedia.sortOrder);

    return NextResponse.json({ ...product, media });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Không thể tải thông tin sản phẩm" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 404 }
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // Delete associated media first (cascade)
    await db
      .delete(productMedia)
      .where(eq(productMedia.productId, productId));

    // Delete the product
    await db.delete(products).where(eq(products.id, productId));

    return NextResponse.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, price, thumbnailUrl, slug, status } = body;

    const [updated] = await db
      .update(products)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(slug !== undefined && { slug }),
        ...(status !== undefined && { status }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, productId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
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

    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật sản phẩm" },
      { status: 500 }
    );
  }
}
