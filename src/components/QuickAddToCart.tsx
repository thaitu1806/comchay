"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";

interface QuickAddToCartProps {
  productId: number;
  productName: string;
  productPrice: number;
  thumbnailUrl: string;
}

export default function QuickAddToCart({
  productId,
  productName,
  productPrice,
  thumbnailUrl,
}: QuickAddToCartProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    addItem({ productId, productName, productPrice, thumbnailUrl }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="w-full mt-2 py-2 rounded-lg text-sm font-medium transition-colors bg-cam-chay text-white hover:bg-cam-chay-600 active:scale-95"
    >
      {added ? "✓ Đã thêm" : "Thêm giỏ hàng"}
    </button>
  );
}
