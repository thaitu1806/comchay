export default function Footer() {
  return (
    <footer className="bg-amber-800 text-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg">Cơm cháy bếp cô Như</p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://zalo.me/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200 hover:text-white font-medium"
            >
              Zalo
            </a>
            <a
              href="https://facebook.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200 hover:text-white font-medium"
            >
              Facebook
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-amber-300 text-sm">
          © {new Date().getFullYear()} Cơm cháy bếp cô Như. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
