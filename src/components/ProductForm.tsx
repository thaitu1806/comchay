"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface VariantItem {
  id?: number;
  riceType: string;
  spiceLevel: string;
  weight: number | "";
  price: number | "";
}

interface ProductFormData {
  name: string;
  description: string;
  price: number | "";
  slug: string;
  thumbnailUrl: string;
  media: MediaItem[];
  variants: VariantItem[];
  badge: string;
  stockStatus: string;
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

const BADGE_OPTIONS = [
  { value: "", label: "Không có nhãn" },
  { value: "best_seller", label: "Best Seller" },
  { value: "ban_chay", label: "Bán chạy" },
  { value: "yeu_thich", label: "Yêu thích" },
];

const EMPTY_VARIANT: VariantItem = {
  riceType: "",
  spiceLevel: "",
  weight: "",
  price: "",
};

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "");
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media ?? []);
  const [variants, setVariants] = useState<VariantItem[]>(initialData?.variants ?? []);
  const [badge, setBadge] = useState(initialData?.badge ?? "");
  const [stockStatus, setStockStatus] = useState(initialData?.stockStatus ?? "in_stock");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [variantErrors, setVariantErrors] = useState<Record<number, string>>({});

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

  function addVariant() {
    setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);
  }

  function updateVariant(index: number, field: keyof VariantItem, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
    setVariantErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setVariantErrors((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const key = Number(k);
        if (key < index) next[key] = v;
        else if (key > index) next[key - 1] = v;
      });
      return next;
    });
  }

  function validateVariants(): boolean {
    const errors: Record<number, string> = {};
    variants.forEach((v, i) => {
      const p = typeof v.price === "number" ? v.price : 0;
      const w = typeof v.weight === "number" ? v.weight : 0;
      if (p <= 0 || w <= 0) {
        errors[i] = "Giá và trọng lượng phải lớn hơn 0";
      }
    });
    setVariantErrors(errors);
    return Object.keys(errors).length === 0;
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
    if (variants.length > 0 && !validateVariants()) {
      setError("Vui lòng kiểm tra lại thông tin biến thể");
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        name,
        description,
        price,
        slug,
        thumbnailUrl,
        media,
        variants,
        badge,
        stockStatus,
      });
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
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
          placeholder="Nhập tên sản phẩm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
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
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
          placeholder="Mô tả sản phẩm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giá gốc (VNĐ) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
          placeholder="0"
          min={0}
        />
      </div>

      {/* Badge dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nhãn sản phẩm</label>
        <select
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500 bg-white"
        >
          {BADGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stock status toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={stockStatus === "in_stock"}
            onChange={(e) => setStockStatus(e.target.checked ? "in_stock" : "out_of_stock")}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cam-chay-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cam-chay" />
        </label>
        <span className="text-sm text-gray-700">
          {stockStatus === "in_stock" ? "Còn hàng" : "Hết hàng"}
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload ảnh/video</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-cam-chay-50 file:text-cam-chay-700 hover:file:bg-cam-chay-100"
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

      {/* Variants section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Biến thể sản phẩm</h3>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1 text-xs bg-cam-chay-50 text-cam-chay-700 rounded hover:bg-cam-chay-100"
          >
            + Thêm biến thể
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-xs text-gray-400">Chưa có biến thể. Sản phẩm sẽ dùng giá gốc.</p>
        )}

        {variants.map((variant, i) => (
          <div key={i} className="border rounded p-3 mb-2 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Biến thể #{i + 1}</span>
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Xóa
              </button>
            </div>
            {variantErrors[i] && (
              <p className="text-xs text-red-500 mb-2">{variantErrors[i]}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Loại gạo</label>
                <input
                  type="text"
                  value={variant.riceType}
                  onChange={(e) => updateVariant(i, "riceType", e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
                  placeholder="Gạo Thường, Gạo Lứt..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Vị cay</label>
                <input
                  type="text"
                  value={variant.spiceLevel}
                  onChange={(e) => updateVariant(i, "spiceLevel", e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
                  placeholder="Cay nhiều, Cay vừa..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">
                  Trọng lượng (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={variant.weight}
                  onChange={(e) =>
                    updateVariant(i, "weight", e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
                  placeholder="250"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(i, "price", e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
                  placeholder="69000"
                  min={0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-cam-chay text-white text-sm rounded hover:bg-cam-chay-600 disabled:opacity-50"
      >
        {submitting ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo sản phẩm"}
      </button>
    </form>
  );
}
