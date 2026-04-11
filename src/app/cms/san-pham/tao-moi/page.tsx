"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";

export default function CreateProductPage() {
  const router = useRouter();

  async function handleSubmit(data: {
    name: string;
    description: string;
    price: number | "";
    slug: string;
    thumbnailUrl: string;
    media: { url: string; type: string }[];
  }) {
    const res = await fetch("/api/products", {
      method: "POST",
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

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo sản phẩm mới</h2>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
