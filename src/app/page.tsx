import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants, siteSettings } from "@/lib/schema";
import { getPriceRange } from "@/lib/variants";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/HeroSection";
import PromoBanner from "@/components/PromoBanner";

export const dynamic = "force-dynamic";

async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(siteSettings);
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch {
    return {};
  }
}

export default async function Home() {
  const [activeProducts, allVariants, settings] = await Promise.all([
    db
      .select()
      .from(products)
      .where(eq(products.status, "active")),
    db.select().from(productVariants),
    getSettings(),
  ]);

  // Group variants by productId
  const variantsByProductId = new Map<
    number,
    (typeof productVariants.$inferSelect)[]
  >();
  for (const v of allVariants) {
    const existing = variantsByProductId.get(v.productId) ?? [];
    existing.push(v);
    variantsByProductId.set(v.productId, existing);
  }

  // Compute price ranges per product
  const productsWithPriceRange = activeProducts.map((product) => {
    const variants = variantsByProductId.get(product.id) ?? [];
    const priceRange = getPriceRange(variants);
    return {
      ...product,
      priceRange,
      variants,
    };
  });

  const zaloUrl = settings.zalo_url || "";
  const shopeeUrl = settings.shopee_url || "";

  return (
    <>
      <HeroSection />
      <PromoBanner />

      <section
        id="san-pham"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <h2 className="text-2xl font-bold text-cam-chay-800 sm:text-3xl">
          Sản phẩm
        </h2>

        {productsWithPriceRange.length === 0 ? (
          <p className="mt-8 text-center text-cam-chay-600">
            Chưa có sản phẩm
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productsWithPriceRange.map((product, index) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                thumbnailUrl={product.thumbnailUrl}
                badge={product.badge}
                priceRange={product.priceRange}
                stockStatus={product.stockStatus}
                hasVariants={product.variants.length > 0}
                loading={index < 4 ? "eager" : "lazy"}
              />
            ))}
          </div>
        )}

        {/* CTA Buttons — Zalo & Shopee */}
        {(zaloUrl || shopeeUrl) && (
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {zaloUrl && (
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cam-chay px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-cam-chay-600 focus:outline-none focus:ring-2 focus:ring-cam-chay-400 focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Mua Ngay qua Zalo
              </a>
            )}
            {shopeeUrl && (
              <a
                href={shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-cam-chay bg-white px-6 py-3 text-base font-semibold text-cam-chay shadow-md transition-colors hover:bg-cam-chay-50 focus:outline-none focus:ring-2 focus:ring-cam-chay-400 focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Xem trên Shopee
              </a>
            )}
          </div>
        )}
      </section>
    </>
  );
}
