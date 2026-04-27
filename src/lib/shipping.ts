/**
 * Khu vực giao hàng.
 * - "HCM": TP. Hồ Chí Minh
 * - "TINH_KHAC": Các tỉnh thành khác
 */
export type Region = "HCM" | "TINH_KHAC";

/**
 * Tính phí vận chuyển dựa trên tổng số túi sản phẩm và khu vực giao hàng.
 *
 * - 0 túi  → 0 VNĐ (mọi khu vực)
 * - 1 túi  → 30,000 VNĐ (mọi khu vực)
 * - 2 túi  → 20,000 VNĐ (mọi khu vực)
 * - 3 túi  → 15,000 VNĐ (mọi khu vực)
 * - ≥4 túi HCM → 0 VNĐ (miễn phí)
 * - 4 túi Tỉnh khác → 10,000 VNĐ
 * - ≥5 túi Tỉnh khác → 0 VNĐ (miễn phí)
 */
export function calculateShippingFee(totalBags: number, region: Region): number {
  if (totalBags <= 0) return 0;
  if (totalBags === 1) return 30000;
  if (totalBags === 2) return 20000;
  if (totalBags === 3) return 15000;
  // >= 4 túi
  if (region === "HCM") return 0;
  // Tỉnh khác
  if (totalBags === 4) return 10000;
  return 0; // >= 5 túi tỉnh khác: miễn phí
}
