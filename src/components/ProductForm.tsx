"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface ProductFormData {
  name: string;
  description: string;
  price: number | "";
  slug: string;
  thumbnailUrl: string;
  media: MediaItem[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<{ error?: string; status?: number }>;
}

function generateSlugClient(name: string): string {
  const vietnameseMap: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
    ă: "a", ắ: "a", ằ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ấ: "a", ầ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
    ê: "e", ế: "e", ề: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
    ô: "o", ố: "o", ồ: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ớ: "o", ờ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
    ư: "u", ứ: "u", ừ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
    đ: "d",
  };

  if (!name || !name.trim()) return "";
  return name
    .toLowerCase()
    .split("")
    .map((ch) => vietnameseMap[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "");
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media ?? []);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(generateSlugClient(name));
    }
  }, [name, slugManuallyEdited]);

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Tải file thất bại");
        return;
      }

      setMedia((prev) => [...prev, { url: data.url, type: data.type }]);
      if (!thumbnailUrl) {
        setThumbnailUrl(data.url);
      }
    } catch {
      setError("Tải file thất bại, vui lòng thử lại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeMedia(index: number) {
    setMedia((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index].url === thumbnailUrl && updated.length > 0) {
        setThumbnailUrl(updated[0].url);
      } else if (updated.length === 0) {
        setThumbnailUrl("");
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tên sản phẩm là bắt buộc");
      return;
    }
    if (price === "" || price <= 0) {
      setError("Giá sản phẩm là bắt buộc và phải lớn hơn 0");
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({ name, description, price, slug, thumbnailUrl, media });
      if (result?.status === 409) {
        setError("Slug đã tồn tại, vui lòng chọn slug khác");
      } else if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên sản phẩm <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Nhập tên sản phẩm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="slug-san-pham"
        />
        <p className="text-xs text-gray-500 mt-1">Tự động tạo từ tên. Có thể chỉnh sửa.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Mô tả sản phẩm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giá (VNĐ) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="0"
          min={0}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload ảnh/video</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Đang tải lên...</p>}
      </div>

      {media.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Media đã tải ({media.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {media.map((item, i) => (
              <div key={i} className="relative group">
                {item.type === "image" ? (
                  <img src={item.url} alt="" className="w-full h-20 object-cover rounded" />
                ) : (
                  <video src={item.url} className="w-full h-20 object-cover rounded" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 disabled:opacity-50"
      >
        {submitting ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo sản phẩm"}
      </button>
    </form>
  );
}
