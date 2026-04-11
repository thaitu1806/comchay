"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  thumbnailUrl: string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

export default function CmsProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Sản phẩm</h2>
        <Link
          href="/cms/san-pham/tao-moi"
          className="px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
        >
          Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ảnh</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Giá</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-gray-800">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.status === "active" ? "Đang bán" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/cms/san-pham/${product.id}/chinh-sua`}
                      className="inline-block px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
