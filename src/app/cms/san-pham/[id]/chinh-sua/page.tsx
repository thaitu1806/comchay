"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";

interface VariantData {
  id: number;
  riceType: string | null;
  spiceLevel: string | null;
  weight: number;
  price: number;
}

interface ProductData {
  name: string;
  description: string | null;
  price: number;
  slug: string;
  thumbnailUrl: string | null;
  media?: { url: string; type: string }[];
  variants?: VariantData[];
  badge?: string | null;
  stockStatus?: string | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          setError("Không thể tải thông tin sản phẩm");
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch {
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleSubmit(data: {
    name: string;
    description: string;
    price: number | "";
    slug: string;
    thumbnailUrl: string;
    media: { url: string; type: string }[];
    variants: { id?: number; riceType: string; spiceLevel: string; weight: number | ""; price: number | "" }[];
    badge: string;
    stockStatus: string;
  }) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: data.price,
        slug: data.slug,
        thumbnailUrl: data.thumbnailUrl,
        media: data.media,
        variants: data.variants,
        badge: data.badge || null,
        stockStatus: data.stockStatus,
      }),
    });

    if (res.ok) {
      router.push("/cms/san-pham");
      return {};
    }

    const result = await res.json();
    return { error: result.error, status: res.status };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        {error || "Sản phẩm không tồn tại"}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Chỉnh sửa sản phẩm</h2>
      <ProductForm
        initialData={{
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          slug: product.slug,
          thumbnailUrl: product.thumbnailUrl ?? "",
          media: (product.media ?? []).map((m) => ({
            url: m.url,
            type: m.type as "image" | "video",
          })),
          variants: (product.variants ?? []).map((v) => ({
            id: v.id,
            riceType: v.riceType ?? "",
            spiceLevel: v.spiceLevel ?? "",
            weight: v.weight,
            price: v.price,
          })),
          badge: product.badge ?? "",
          stockStatus: product.stockStatus ?? "in_stock",
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
