import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const activeProducts = await db
    .select()
    .from(products)
    .where(eq(products.status, "active"));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-amber-800 sm:text-3xl">
        Sản phẩm
      </h1>
      <a href="fb://accountquality/?actor_id=1935708069793182&source=GAME_EXPERIENCE_PLATFORM">
        Mở Account Quality
      </a>
      <a href="https://m.facebook.com/business-support-home/1935708069793182/?source=actor_enforcement_notif&asset_view_type=asset&notif_id=1758785539932559&notif_t=aymt_bi_actor_business_notif&ref=notif">
        Mở Account Quality
      </a>
      {activeProducts.length === 0 ? (
        <p className="mt-8 text-center text-amber-600">Chưa có sản phẩm</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              thumbnailUrl={product.thumbnailUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}
