"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    fetch("/api/stats/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagePath: window.location.pathname }),
    });
  }, []);

  return null;
}
