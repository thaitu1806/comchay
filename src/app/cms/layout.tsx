"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/cms", label: "Dashboard" },
  { href: "/cms/san-pham", label: "Sản phẩm" },
  { href: "/cms/don-hang", label: "Đơn hàng" },
];

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-800">Quản trị</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded text-gray-600 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-56 bg-white border-r border-gray-200 flex-shrink-0`}
      >
        <div className="hidden md:block px-4 py-4 border-b">
          <h1 className="text-lg font-bold text-gray-800">Quản trị</h1>
        </div>
        <nav className="p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block px-3 py-2 rounded text-sm ${
                  isActive
                    ? "bg-amber-100 text-amber-800 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
