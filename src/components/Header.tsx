"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart";

export default function Header() {
  const { data: session } = useSession();
  const totalBags = useCartStore((state) => state.getTotalBags());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-amber-50 border-b border-amber-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-amber-800 hover:text-amber-900">
          Cơm cháy bếp cô Như
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-amber-700 hover:text-amber-900 font-medium">
            Trang chủ
          </Link>
          <Link href="/" className="text-amber-700 hover:text-amber-900 font-medium">
            Sản phẩm
          </Link>

          {/* Cart */}
          <Link href="/gio-hang" className="relative text-amber-700 hover:text-amber-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalBags > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalBags}
              </span>
            )}
          </Link>

          {/* Auth */}
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-sm font-medium">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-amber-600 hover:text-amber-800 underline"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("facebook")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded"
            >
              Đăng nhập
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-amber-700"
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-amber-200 bg-amber-50 px-4 py-3 space-y-3">
          <Link href="/" className="block text-amber-700 hover:text-amber-900 font-medium" onClick={() => setMenuOpen(false)}>
            Trang chủ
          </Link>
          <Link href="/" className="block text-amber-700 hover:text-amber-900 font-medium" onClick={() => setMenuOpen(false)}>
            Sản phẩm
          </Link>
          <Link href="/gio-hang" className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium" onClick={() => setMenuOpen(false)}>
            Giỏ hàng
            {totalBags > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalBags}
              </span>
            )}
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-sm font-medium">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-amber-600 hover:text-amber-800 underline"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("facebook")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded"
            >
              Đăng nhập
            </button>
          )}
        </div>
      )}
    </header>
  );
}
