import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { calculateShippingFee, type Region } from "@/lib/shipping";

/**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
 *
 * Property 7: Phí vận chuyển V2 theo khu vực
 *
 * For any số nguyên totalBags ≥ 0 và khu vực (HCM hoặc TINH_KHAC),
 * calculateShippingFee(totalBags, region) phải trả về:
 * - 0 túi → 0đ (mọi khu vực)
 * - 1 túi → 30.000đ (mọi khu vực)
 * - 2 túi → 20.000đ (mọi khu vực)
 * - 3 túi → 15.000đ (mọi khu vực)
 * - ≥ 4 túi, HCM → 0đ
 * - 4 túi, Tỉnh khác → 10.000đ
 * - ≥ 5 túi, Tỉnh khác → 0đ
 * Và kết quả luôn ≥ 0.
 */

const regionArb: fc.Arbitrary<Region> = fc.constantFrom("HCM", "TINH_KHAC");

describe("ShippingCalculator — Property 7: Phí vận chuyển V2 theo khu vực", () => {
  it("0 túi → 0đ cho mọi khu vực (Req 4.7)", () => {
    fc.assert(
      fc.property(regionArb, (region) => {
        expect(calculateShippingFee(0, region)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("1 túi → 30.000đ cho mọi khu vực (Req 4.1)", () => {
    fc.assert(
      fc.property(regionArb, (region) => {
        expect(calculateShippingFee(1, region)).toBe(30000);
      }),
      { numRuns: 100 }
    );
  });

  it("2 túi → 20.000đ cho mọi khu vực (Req 4.2)", () => {
    fc.assert(
      fc.property(regionArb, (region) => {
        expect(calculateShippingFee(2, region)).toBe(20000);
      }),
      { numRuns: 100 }
    );
  });

  it("3 túi → 15.000đ cho mọi khu vực (Req 4.3)", () => {
    fc.assert(
      fc.property(regionArb, (region) => {
        expect(calculateShippingFee(3, region)).toBe(15000);
      }),
      { numRuns: 100 }
    );
  });

  it("≥ 4 túi HCM → 0đ miễn phí (Req 4.4)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 10000 }), (n) => {
        expect(calculateShippingFee(n, "HCM")).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("4 túi Tỉnh khác → 10.000đ (Req 4.5)", () => {
    // Deterministic for exactly 4 bags, but we still wrap in fc.assert
    // to keep consistent PBT style
    fc.assert(
      fc.property(fc.constant(4), (n) => {
        expect(calculateShippingFee(n, "TINH_KHAC")).toBe(10000);
      }),
      { numRuns: 100 }
    );
  });

  it("≥ 5 túi Tỉnh khác → 0đ miễn phí (Req 4.6)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 5, max: 10000 }), (n) => {
        expect(calculateShippingFee(n, "TINH_KHAC")).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("kết quả luôn ≥ 0 cho mọi totalBags ≥ 0 và mọi khu vực", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        regionArb,
        (totalBags, region) => {
          const fee = calculateShippingFee(totalBags, region);
          expect(fee).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("phí vận chuyển đúng theo bảng phí cho mọi totalBags ≥ 0 và mọi khu vực", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        regionArb,
        (totalBags, region) => {
          const fee = calculateShippingFee(totalBags, region);

          if (totalBags === 0) {
            expect(fee).toBe(0);
          } else if (totalBags === 1) {
            expect(fee).toBe(30000);
          } else if (totalBags === 2) {
            expect(fee).toBe(20000);
          } else if (totalBags === 3) {
            expect(fee).toBe(15000);
          } else if (totalBags >= 4 && region === "HCM") {
            expect(fee).toBe(0);
          } else if (totalBags === 4 && region === "TINH_KHAC") {
            expect(fee).toBe(10000);
          } else {
            // totalBags >= 5 && region === "TINH_KHAC"
            expect(fee).toBe(0);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
