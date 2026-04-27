"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export default function FloatingCart() {
  const totalBags = useCartStore((state) => state.getTotalBags());

  return (
    <Link
      href="/gio-hang"
      aria-label="Giỏ hàng"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cam-chay text-white shadow-lg transition-transform hover:scale-110 hover:bg-cam-chay-600 active:scale-95"
    >
      {/* Cart icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>

      {/* Badge */}
      {totalBags > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-vang-nang text-xs font-bold text-cam-chay-900">
          {totalBags > 99 ? "99+" : totalBags}
        </span>
      )}
    </Link>
  );
}
