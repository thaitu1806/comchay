"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
  variantId?: number | null;
  variantLabel?: string | null;
}

interface Order {
  id: number;
  customerName: string;
  facebookLink: string | null;
  address: string;
  phone: string;
  region: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string | null;
  createdAt: string | null;
  items: OrderItem[];
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatRegion(region: string | null): string {
  if (!region) return "—";
  if (region === "HCM") return "TP.HCM";
  if (region === "TINH_KHAC") return "Tỉnh khác";
  return region;
}

export default function CmsOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border">
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-gray-800">#{order.id}</span>
                  <span className="text-gray-700">{order.customerName}</span>
                  <span className="text-gray-500">{order.phone}</span>
                  <span className="text-gray-500 hidden sm:inline truncate max-w-[200px]">
                    {order.address}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      order.region === "HCM"
                        ? "bg-blue-50 text-blue-600"
                        : order.region === "TINH_KHAC"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {formatRegion(order.region)}
                  </span>
                  <span className="font-medium text-cam-chay-700">{formatPrice(order.total)}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      order.status === "mới"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status ?? "mới"}
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {formatDate(order.createdAt)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedId === order.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t px-4 py-3 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Khách hàng:</span>{" "}
                      <span className="text-gray-800">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SĐT:</span>{" "}
                      <span className="text-gray-800">{order.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Khu vực:</span>{" "}
                      <span className="text-gray-800">{formatRegion(order.region)}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Địa chỉ:</span>{" "}
                      <span className="text-gray-800">{order.address}</span>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs border-b">
                          <th className="text-left py-1">Sản phẩm</th>
                          <th className="text-center py-1">SL</th>
                          <th className="text-right py-1">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b last:border-b-0">
                            <td className="py-1.5">
                              <span className="text-gray-800">{item.productName}</span>
                              {item.variantLabel && (
                                <span className="block text-xs text-gray-500">
                                  {item.variantLabel}
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                            <td className="py-1.5 text-right text-gray-800">
                              {formatPrice(item.lineTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-400 text-xs">Không có chi tiết sản phẩm.</p>
                  )}

                  <div className="mt-2 pt-2 border-t text-sm text-right space-y-0.5">
                    <div className="text-gray-500">
                      Tiền hàng: <span className="text-gray-800">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="text-gray-500">
                      Phí vận chuyển: <span className="text-gray-800">{formatPrice(order.shippingFee)}</span>
                    </div>
                    <div className="font-medium text-cam-chay-700">
                      Tổng: {formatPrice(order.total)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
