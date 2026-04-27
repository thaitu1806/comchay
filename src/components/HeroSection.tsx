import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cam-chay-50 via-vang-nang-50 to-cam-chay-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-12">
          {/* Text content */}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-cam-chay-800 sm:text-4xl lg:text-5xl">
              Giòn Rụm Từng Hạt
              <span className="block text-vang-nang-600">Đậm Đà Vị Quê</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-cam-chay-700 sm:text-lg lg:text-xl">
              Đặc sản cơm cháy truyền thống, được chế biến từ nguyên liệu tự
              nhiên, mang hương vị quê nhà đến bàn ăn của bạn.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#san-pham"
                className="inline-flex items-center justify-center rounded-lg bg-cam-chay px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-cam-chay-600 focus:outline-none focus:ring-2 focus:ring-cam-chay-400 focus:ring-offset-2"
              >
                Xem sản phẩm
              </a>
            </div>
          </div>

          {/* Decorative illustration / placeholder */}
          <div className="mt-10 flex-1 lg:mt-0">
            <div className="relative mx-auto aspect-square w-64 sm:w-72 lg:w-96">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full bg-vang-nang-200/60" />
              <div className="absolute inset-4 rounded-full bg-cam-chay-100/80" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src="/logo.png"
                  alt="Bếp Cô Như"
                  width={300}
                  height={300}
                  className="rounded-full drop-shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full text-white"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
