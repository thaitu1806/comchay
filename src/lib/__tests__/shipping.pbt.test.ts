import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { calculateShippingFee } from "@/lib/shipping";

/**
 * **Validates: Requirements 4.4**
 *
 * Property 7: Miễn phí vận chuyển từ 4 túi trở lên
 * For any integer n ≥ 4, calculateShippingFee(n) === 0
 */
describe("ShippingCalculator — Property 7: Free shipping for 4+ bags", () => {
  it("should return 0 for any number of bags >= 4", () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 10000 }), (n) => {
        expect(calculateShippingFee(n)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});
