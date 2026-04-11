import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function ProductCard({ name, slug, price, thumbnailUrl }: ProductCardProps) {
  return (
    <Link
      href={`/san-pham/${slug}`}
      className="group block rounded-xl border border-amber-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-amber-300 overflow-hidden"
    >
      <div className="relative aspect-square w-full bg-amber-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-amber-900 line-clamp-2 group-hover:text-amber-700">
          {name}
        </h3>
        <p className="mt-1 text-base font-semibold text-orange-600">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
