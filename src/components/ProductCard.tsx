import Link from "next/link";
import Image from "next/image";
import ProductBadge from "@/components/ProductBadge";
import QuickAddToCart from "@/components/QuickAddToCart";

interface ProductCardProps {
  productId: number;
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
  badge?: string | null;
  priceRange?: { min: number; max: number } | null;
  stockStatus?: string | null;
  hasVariants?: boolean;
  loading?: "eager" | "lazy";
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    const k = Math.round(price / 1000);
    return `${k}K`;
  }
  return price.toLocaleString("vi-VN") + "đ";
}

function formatPriceFull(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function ProductCard({
  productId,
  name,
  slug,
  price,
  thumbnailUrl,
  badge,
  priceRange,
  stockStatus,
  hasVariants = false,
  loading = "lazy",
}: ProductCardProps) {
  const isOutOfStock = stockStatus === "out_of_stock";

  return (
    <div className="group relative rounded-xl border border-cam-chay-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-cam-chay-200 overflow-hidden">
      <Link href={`/san-pham/${slug}`}>
        {/* Image */}
        <div className="relative aspect-square w-full bg-cam-chay-50">
          <ProductBadge badge={badge} />

          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={name}
              fill
              loading={loading}
              priority={loading === "eager"}
              className={`object-cover transition-transform group-hover:scale-105 ${
                isOutOfStock ? "opacity-50 grayscale" : ""
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-cam-chay-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
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

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="rounded-md bg-gray-800 px-3 py-1 text-sm font-semibold text-white">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pb-2">
          <h3 className="text-sm font-medium text-cam-chay-900 line-clamp-2 group-hover:text-cam-chay-700">
            {name}
          </h3>
          <p className="mt-1 text-base font-semibold text-cam-chay">
            {priceRange && priceRange.min !== priceRange.max
              ? `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`
              : formatPriceFull(priceRange ? priceRange.min : price)}
          </p>
        </div>
      </Link>

      {/* Action button */}
      <div className="px-4 pb-4">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full mt-2 py-2 rounded-lg text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Hết hàng
          </button>
        ) : hasVariants ? (
          <Link
            href={`/san-pham/${slug}`}
            className="block w-full mt-2 py-2 rounded-lg text-sm font-medium text-center border-2 border-cam-chay text-cam-chay hover:bg-cam-chay-50 transition-colors"
          >
            Chọn biến thể
          </Link>
        ) : (
          <QuickAddToCart
            productId={productId}
            productName={name}
            productPrice={price}
            thumbnailUrl={thumbnailUrl || ""}
          />
        )}
      </div>
    </div>
  );
}
