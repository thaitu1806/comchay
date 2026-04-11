"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";

interface ProductData {
  name: string;
  description: string | null;
  price: number;
  slug: string;
  thumbnailUrl: string | null;
  media?: { url: string; type: string }[];
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
  }) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
