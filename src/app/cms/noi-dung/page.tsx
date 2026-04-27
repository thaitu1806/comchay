"use client";

import { useEffect, useState } from "react";

interface SiteSettings {
  hotline: string;
  zalo_url: string;
  shopee_url: string;
  promo_banner: string;
  promo_banner_active: string;
}

export default function CmsContentPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    hotline: "",
    zalo_url: "",
    shopee_url: "",
    promo_banner: "",
    promo_banner_active: "false",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      setError("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!settings.hotline.trim()) {
      setError("Số hotline là bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSuccess("Đã lưu thành công");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Không thể lưu cài đặt");
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải cài đặt...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý nội dung</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số hotline <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.hotline}
            onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
            placeholder="0901234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link Zalo
          </label>
          <input
            type="text"
            value={settings.zalo_url}
            onChange={(e) => setSettings({ ...settings, zalo_url: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
            placeholder="https://zalo.me/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link Shopee
          </label>
          <input
            type="text"
            value={settings.shopee_url}
            onChange={(e) => setSettings({ ...settings, shopee_url: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
            placeholder="https://shopee.vn/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung banner khuyến mãi
          </label>
          <textarea
            value={settings.promo_banner}
            onChange={(e) => setSettings({ ...settings, promo_banner: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cam-chay-500"
            placeholder="Nội dung banner khuyến mãi..."
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.promo_banner_active === "true"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  promo_banner_active: e.target.checked ? "true" : "false",
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cam-chay-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cam-chay" />
          </label>
          <span className="text-sm text-gray-700">Bật banner khuyến mãi</span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-cam-chay text-white text-sm rounded hover:bg-cam-chay-600 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
      </form>
    </div>
  );
}
