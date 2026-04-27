"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";

interface AddToCartProps {
  productId: number;
  productName: string;
  productPrice: number;
  thumbnailUrl: string;
  variantId?: number | null;
  variantLabel?: string | null;
  riceType?: string | null;
  spiceLevel?: string | null;
  weight?: number | null;
  disabled?: boolean;
  stockStatus?: string | null;
}

export default function AddToCart({
  productId,
  productName,
  productPrice,
  thumbnailUrl,
  variantId,
  variantLabel,
  riceType,
  spiceLevel,
  weight,
  disabled,
  stockStatus,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = stockStatus === "out_of_stock";
  const isDisabled = disabled || isOutOfStock;

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };

  const handleAddToCart = () => {
    if (isDisabled) return;

    addItem(
      {
        productId,
        productName,
        productPrice,
        thumbnailUrl,
        variantId: variantId ?? null,
        riceType: riceType ?? null,
        spiceLevel: spiceLevel ?? null,
        weight: weight ?? null,
      },
      quantity
    );
    setShowSuccess(true);
    setQuantity(1);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-cam-chay-800">Số lượng:</span>
        <div className="flex items-center rounded-lg border border-cam-chay-200 bg-white">
          <button
            onClick={handleDecrease}
            className="px-3 py-2 text-cam-chay-700 hover:bg-cam-chay-50 transition-colors rounded-l-lg disabled:opacity-50"
            disabled={quantity <= 1 || isDisabled}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center font-medium text-cam-chay-900">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="px-3 py-2 text-cam-chay-700 hover:bg-cam-chay-50 transition-colors rounded-r-lg disabled:opacity-50"
            disabled={isDisabled}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full rounded-lg px-6 py-3 text-lg font-semibold text-white shadow-md transition-all ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-cam-chay hover:bg-cam-chay-600 hover:shadow-lg active:scale-95"
        }`}
      >
        {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
      </button>

      {/* Success Feedback */}
      {showSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-center text-sm font-medium text-green-700 animate-fade-in">
          ✓ Đã thêm vào giỏ hàng!
        </div>
      )}
    </div>
  );
}
