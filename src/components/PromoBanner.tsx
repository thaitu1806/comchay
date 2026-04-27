"use client";

import { useState, useEffect } from "react";

interface SettingsData {
  promo_banner?: string;
  promo_banner_active?: string;
}

export default function PromoBanner() {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SettingsData | null) => {
        if (data) setSettings(data);
      })
      .catch(() => {
        /* silently ignore – promo banner is optional */
      });
  }, []);

  if (!settings) return null;
  if (settings.promo_banner_active !== "true") return null;
  if (!settings.promo_banner) return null;

  return (
    <div className="bg-vang-nang text-cam-chay-900">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-sm font-medium sm:text-base">
        {settings.promo_banner}
      </div>
    </div>
  );
}
