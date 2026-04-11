"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getShippingFee = useCartStore((state) => state.getShippingFee);
  const getTotal = useCartStore((state) => state.getTotal);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="mt-4 text-xl font-semibold text-amber-900">Giỏ hàng trống</h1>
        <p className="mt-2 text-amber-700">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Giỏ hàng</h1>

      {/* Cart items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white border border-amber-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Thumbnail */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-amber-100">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-amber-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-amber-900 truncate">{item.productName}</h3>
                <p className="text-sm text-orange-600 font-semibold">{formatPrice(item.productPrice)}</p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.productId)}
                className="text-amber-400 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label="Xóa sản phẩm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Quantity controls and line total */}
            <div className="mt-3 flex items-center justify-between pl-[76px] sm:pl-[92px]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-amber-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <p className="text-sm font-semibold text-amber-900">{formatPrice(item.productPrice * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-white border border-amber-200 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-amber-700">
            <span>Tạm tính</span>
            <span>{formatPrice(getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm text-amber-700">
            <span>Phí vận chuyển</span>
            <span>{getShippingFee() === 0 ? "Miễn phí" : formatPrice(getShippingFee())}</span>
          </div>
          <div className="border-t border-amber-200 pt-3 flex justify-between text-lg font-bold text-amber-900">
            <span>Tổng thanh toán</span>
            <span className="text-orange-600">{formatPrice(getTotal())}</span>
          </div>
        </div>

        <Link
          href="/dat-hang"
          className="mt-6 block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Đặt hàng
        </Link>
      </div>
    </div>
  );
}
