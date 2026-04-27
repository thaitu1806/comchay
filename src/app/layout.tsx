import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";
import FloatingCart from "@/components/FloatingCart";

export const metadata: Metadata = {
  title: "Bếp Cô Như - Đặc sản cơm cháy truyền thống",
  description: "Bếp Cô Như - Giòn Rụm Từng Hạt, Đậm Đà Vị Quê. Đặc sản cơm cháy, chà bông, tép hành phi, rong biển và nhiều sản phẩm truyền thống khác.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-cam-chay-50 text-cam-chay-900">
        <Providers>
          <VisitTracker />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingCart />
        </Providers>
      </body>
    </html>
  );
}
