import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-amber-300">404</h1>
        <p className="text-xl font-medium text-amber-900">
          Sản phẩm không tồn tại
        </p>
        <p className="text-amber-700">
          Sản phẩm bạn tìm kiếm không có hoặc đã bị xóa.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
