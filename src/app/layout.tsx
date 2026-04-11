import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "Cơm Cháy Bếp Cô Như",
  description: "Cơm cháy bếp cô Như - Đặc sản cơm cháy truyền thống",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-amber-50 text-amber-900">
        <Providers>
          <VisitTracker />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
