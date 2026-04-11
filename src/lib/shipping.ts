/**
 * Tính phí vận chuyển dựa trên tổng số túi sản phẩm.
 *
 * - 0 túi  → 0 VNĐ
 * - 1 túi  → 30,000 VNĐ
 * - 2 túi  → 20,000 VNĐ
 * - 3 túi  → 15,000 VNĐ
 * - 4+ túi → 0 VNĐ (miễn phí)
 */
export function calculateShippingFee(totalBags: number): number {
  if (totalBags <= 0) return 0;
  if (totalBags === 1) return 30000;
  if (totalBags === 2) return 20000;
  if (totalBags === 3) return 15000;
  return 0; // >= 4 túi: miễn phí
}
