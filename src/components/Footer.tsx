"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SiteSettings {
  zalo_url: string;
  shopee_url: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({
    zalo_url: "",
    shopee_url: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            zalo_url: data.zalo_url || "",
            shopee_url: data.shopee_url || "",
          });
        }
      } catch {
        // Silently fail — use defaults
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="bg-cam-chay-800 text-cam-chay-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Bếp Cô Như"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <p className="font-bold text-lg">Bếp Cô Như</p>
              <p className="text-cam-chay-200 text-sm mt-1">Giòn Rụm Từng Hạt - Đậm Đà Vị Quê</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {settings.zalo_url && (
              <a
                href={settings.zalo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cam-chay-700 text-white text-sm font-medium hover:bg-cam-chay-600 transition-colors"
              >
                Mua Ngay qua Zalo
              </a>
            )}
            {settings.shopee_url && (
              <a
                href={settings.shopee_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vang-nang text-cam-chay-900 text-sm font-medium hover:bg-vang-nang-400 transition-colors"
              >
                Xem trên Shopee
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-cam-chay-300 text-sm">
          © {new Date().getFullYear()} Bếp Cô Như. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
