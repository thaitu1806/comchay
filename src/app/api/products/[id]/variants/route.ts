import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/schema";

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

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách biến thể" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const { riceType, spiceLevel, weight, price } = body;

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Giá biến thể phải lớn hơn 0" },
        { status: 400 }
      );
    }

    if (typeof weight !== "number" || weight <= 0) {
      return NextResponse.json(
        { error: "Trọng lượng biến thể phải lớn hơn 0" },
        { status: 400 }
      );
    }

    const [variant] = await db
      .insert(productVariants)
      .values({
        productId,
        riceType: riceType ?? null,
        spiceLevel: spiceLevel ?? null,
        weight,
        price,
      })
      .returning();

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("Failed to create variant:", error);
    return NextResponse.json(
      { error: "Không thể tạo biến thể" },
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
    const { variantId, riceType, spiceLevel, weight, price } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "variantId là bắt buộc" },
        { status: 400 }
      );
    }

    if (price !== undefined && (typeof price !== "number" || price <= 0)) {
      return NextResponse.json(
        { error: "Giá biến thể phải lớn hơn 0" },
        { status: 400 }
      );
    }

    if (weight !== undefined && (typeof weight !== "number" || weight <= 0)) {
      return NextResponse.json(
        { error: "Trọng lượng biến thể phải lớn hơn 0" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Biến thể không tồn tại" },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(productVariants)
      .set({
        ...(riceType !== undefined && { riceType }),
        ...(spiceLevel !== undefined && { spiceLevel }),
        ...(weight !== undefined && { weight }),
        ...(price !== undefined && { price }),
      })
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        )
      )
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update variant:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật biến thể" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get variantId from body or query param
    let variantId: number | undefined;

    const url = new URL(request.url);
    const queryVariantId = url.searchParams.get("variantId");

    if (queryVariantId) {
      variantId = Number(queryVariantId);
    } else {
      try {
        const body = await request.json();
        variantId = body.variantId;
      } catch {
        // No body provided
      }
    }

    if (!variantId || isNaN(variantId)) {
      return NextResponse.json(
        { error: "variantId là bắt buộc" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Biến thể không tồn tại" },
        { status: 404 }
      );
    }

    await db
      .delete(productVariants)
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        )
      );

    return NextResponse.json({ message: "Xóa biến thể thành công" });
  } catch (error) {
    console.error("Failed to delete variant:", error);
    return NextResponse.json(
      { error: "Không thể xóa biến thể" },
      { status: 500 }
    );
  }
}
