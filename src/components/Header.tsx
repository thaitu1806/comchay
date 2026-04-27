"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";

interface HeaderProps {
  hotline?: string;
}

export default function Header({ hotline: hotlineProp }: HeaderProps) {
  const totalBags = useCartStore((state) => state.getTotalBags());
  const [menuOpen, setMenuOpen] = useState(false);
  const [hotline, setHotline] = useState(hotlineProp ?? "");

  useEffect(() => {
    if (hotlineProp) return;

    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hotline) setHotline(data.hotline);
      })
      .catch(() => {
        /* silently ignore – hotline is optional display */
      });
  }, [hotlineProp]);

  return (
    <header className="bg-cam-chay-50 border-b border-cam-chay-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-cam-chay-800 hover:text-cam-chay-900">
          Bếp Cô Như
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-cam-chay-700 hover:text-cam-chay-900 font-medium">
            Trang chủ
          </Link>
          <Link href="/" className="text-cam-chay-700 hover:text-cam-chay-900 font-medium">
            Sản phẩm
          </Link>

          {/* Hotline */}
          {hotline && (
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-1.5 text-cam-chay-700 hover:text-cam-chay-900 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {hotline}
            </a>
          )}

          {/* Cart */}
          <Link href="/gio-hang" className="relative text-cam-chay-700 hover:text-cam-chay-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalBags > 0 && (
              <span className="absolute -top-2 -right-2 bg-cam-chay text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalBags}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile hotline */}
          {hotline && (
            <a
              href={`tel:${hotline}`}
              className="text-cam-chay-700 hover:text-cam-chay-900"
              aria-label="Gọi hotline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </a>
          )}

          {/* Mobile cart */}
          <Link href="/gio-hang" className="relative text-cam-chay-700 hover:text-cam-chay-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalBags > 0 && (
              <span className="absolute -top-2 -right-2 bg-cam-chay text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalBags}
              </span>
            )}
          </Link>

          <button
            className="text-cam-chay-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-cam-chay-200 bg-cam-chay-50 px-4 py-3 space-y-3">
          <Link href="/" className="block text-cam-chay-700 hover:text-cam-chay-900 font-medium" onClick={() => setMenuOpen(false)}>
            Trang chủ
          </Link>
          <Link href="/" className="block text-cam-chay-700 hover:text-cam-chay-900 font-medium" onClick={() => setMenuOpen(false)}>
            Sản phẩm
          </Link>
          <Link href="/gio-hang" className="flex items-center gap-2 text-cam-chay-700 hover:text-cam-chay-900 font-medium" onClick={() => setMenuOpen(false)}>
            Giỏ hàng
            {totalBags > 0 && (
              <span className="bg-cam-chay text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalBags}
              </span>
            )}
          </Link>
          {hotline && (
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-2 text-cam-chay-700 hover:text-cam-chay-900 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Hotline: {hotline}
            </a>
          )}
        </div>
      )}
    </header>
  );
}
