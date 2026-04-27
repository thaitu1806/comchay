"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, getCartKey } from "@/store/cart";
import { isValidVietnamesePhone } from "@/lib/phone";
import { calculateShippingFee, type Region } from "@/lib/shipping";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function buildVariantLabel(item: {
  riceType: string | null;
  spiceLevel: string | null;
  weight: number | null;
}): string | null {
  const parts: string[] = [];
  if (item.riceType) parts.push(item.riceType);
  if (item.spiceLevel) parts.push(item.spiceLevel);
  if (item.weight) parts.push(`${item.weight}g`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

interface FormErrors {
  customerName?: string;
  address?: string;
  phone?: string;
  region?: string;
}

export default function OrderPage() {
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalBags = useCartStore((state) => state.getTotalBags);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerName, setCustomerName] = useState(session?.user?.name || "");
  const [facebookLink, setFacebookLink] = useState(
    (session as any)?.facebookLink || ""
  );
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-fill from session when it loads
  useEffect(() => {
    if (session?.user?.name) {
      setCustomerName(session.user.name);
    }
    if ((session as any)?.facebookLink) {
      setFacebookLink((session as any).facebookLink);
    }
  }, [session]);

  // Compute shipping fee realtime based on region
  const subtotal = getSubtotal();
  const totalBags = getTotalBags();
  const shippingFee = region ? calculateShippingFee(totalBags, region) : calculateShippingFee(totalBags, "HCM");
  const total = subtotal + shippingFee;

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập tên";
    }
    if (!address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }
    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!isValidVietnamesePhone(phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)";
    }
    if (!region) {
      newErrors.region = "Vui lòng chọn khu vực giao hàng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          facebookLink: facebookLink.trim() || undefined,
          address: address.trim(),
          phone: phone.trim(),
          region,
          items: items.map((item) => {
            const variantLabel = buildVariantLabel(item);
            return {
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
              variantId: item.variantId ?? undefined,
              variantLabel: variantLabel ?? undefined,
            };
          }),
        }),
      });

      if (res.status === 201) {
        clearCart();
        setSuccessMessage("Đặt hàng thành công");
      } else {
        setErrorMessage("Đặt hàng thất bại, vui lòng thử lại");
      }
    } catch {
      setErrorMessage("Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (successMessage) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="mt-4 text-xl font-semibold text-cam-chay-900">{successMessage}</h1>
        <p className="mt-2 text-cam-chay-700">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất!</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-cam-chay hover:bg-cam-chay-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-vang-nang-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="mt-4 text-xl font-semibold text-cam-chay-900">Giỏ hàng trống</h1>
        <p className="mt-2 text-cam-chay-700">Bạn chưa có sản phẩm nào để đặt hàng.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-cam-chay hover:bg-cam-chay-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cam-chay-900 mb-6">Đặt hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-cam-chay-100 rounded-lg p-6 space-y-5">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-cam-chay-900 mb-1">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cam-chay-300 ${
                  errors.customerName ? "border-red-400" : "border-cam-chay-200"
                }`}
                placeholder="Nhập tên của bạn"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
              )}
            </div>

            {/* Facebook Link */}
            <div>
              <label htmlFor="facebookLink" className="block text-sm font-medium text-cam-chay-900 mb-1">
                Link Facebook
              </label>
              <input
                id="facebookLink"
                type="text"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
                className="w-full px-3 py-2 border border-cam-chay-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cam-chay-300"
                placeholder="https://facebook.com/..."
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-cam-chay-900 mb-1">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cam-chay-300 ${
                  errors.address ? "border-red-400" : "border-cam-chay-200"
                }`}
                placeholder="Nhập địa chỉ giao hàng"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-cam-chay-900 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cam-chay-300 ${
                  errors.phone ? "border-red-400" : "border-cam-chay-200"
                }`}
                placeholder="0xxxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Region Selector */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-cam-chay-900 mb-1">
                Khu vực giao hàng <span className="text-red-500">*</span>
              </label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value as Region | "")}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cam-chay-300 ${
                  errors.region ? "border-red-400" : "border-cam-chay-200"
                }`}
              >
                <option value="">-- Chọn khu vực --</option>
                <option value="HCM">TP. Hồ Chí Minh</option>
                <option value="TINH_KHAC">Tỉnh khác</option>
              </select>
              {errors.region && (
                <p className="mt-1 text-xs text-red-500">{errors.region}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cam-chay hover:bg-cam-chay-600 disabled:bg-cam-chay-300 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-cam-chay-100 rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-cam-chay-900 mb-4">Đơn hàng của bạn</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => {
                const cartKey = getCartKey(item);
                const variantLabel = buildVariantLabel(item);
                return (
                  <div key={cartKey} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-vang-nang-50">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-vang-nang-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cam-chay-900 truncate">{item.productName}</p>
                      {variantLabel && (
                        <p className="text-xs text-cam-chay-600 truncate">{variantLabel}</p>
                      )}
                      <p className="text-xs text-cam-chay-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-cam-chay-900">
                      {formatPrice(item.productPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Pricing breakdown */}
            <div className="mt-4 pt-4 border-t border-cam-chay-100 space-y-2">
              <div className="flex justify-between text-sm text-cam-chay-700">
                <span>Tiền hàng</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-cam-chay-700">
                <span>Phí vận chuyển</span>
                <span>
                  {!region
                    ? "Chọn khu vực"
                    : shippingFee === 0
                    ? "Miễn phí"
                    : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="border-t border-cam-chay-100 pt-2 flex justify-between text-base font-bold text-cam-chay-900">
                <span>Tổng cộng</span>
                <span className="text-cam-chay">{region ? formatPrice(total) : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
