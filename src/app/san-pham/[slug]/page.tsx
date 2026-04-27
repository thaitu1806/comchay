import { notFound } from "next/navigation";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productMedia, productVariants } from "@/lib/schema";
import { getPriceRange } from "@/lib/variants";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    notFound();
  }

  const media = await db
    .select()
    .from(productMedia)
    .where(eq(productMedia.productId, product.id))
    .orderBy(productMedia.sortOrder);

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));

  const hasVariants = variants.length > 0;
  const priceRange = hasVariants ? getPriceRange(variants) : null;
  const isOutOfStock = product.stockStatus === "out_of_stock";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Media Gallery */}
        <div className="space-y-4">
          {media.length > 0 ? (
            media.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-cam-chay-100 bg-cam-chay-50"
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    controls
                    className="w-full rounded-xl"
                    preload="metadata"
                  />
                ) : (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={item.url}
                      alt={product.name}
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border border-cam-chay-100 bg-cam-chay-50 text-cam-chay-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Product name + badge */}
          <div>
            {product.badge && (
              <span className="inline-block rounded-full bg-vang-nang px-3 py-1 text-xs font-semibold text-white mb-2">
                {product.badge === "best_seller"
                  ? "Best Seller"
                  : product.badge === "ban_chay"
                    ? "Bán chạy"
                    : product.badge === "yeu_thich"
                      ? "Yêu thích"
                      : product.badge}
              </span>
            )}
            <h1 className="text-2xl font-bold text-cam-chay-900 md:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Out of stock label */}
          {isOutOfStock && (
            <div className="inline-block rounded-lg bg-gray-100 border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-500">
              Hết hàng
            </div>
          )}

          {/* Price display */}
          <div className="text-3xl font-bold text-cam-chay">
            {hasVariants && priceRange ? (
              priceRange.min === priceRange.max ? (
                formatPrice(priceRange.min)
              ) : (
                <span>
                  {formatPrice(priceRange.min)} — {formatPrice(priceRange.max)}
                </span>
              )
            ) : (
              formatPrice(product.price)
            )}
          </div>

          {product.description && (
            <div className="prose prose-orange">
              <p className="text-cam-chay-800 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Client-side interactive section: variant selector + add to cart */}
          <ProductDetailClient
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            thumbnailUrl={product.thumbnailUrl || ""}
            variants={variants.map((v) => ({
              id: v.id,
              riceType: v.riceType,
              spiceLevel: v.spiceLevel,
              weight: v.weight,
              price: v.price,
            }))}
            stockStatus={product.stockStatus ?? "in_stock"}
          />
        </div>
      </div>
    </main>
  );
}
