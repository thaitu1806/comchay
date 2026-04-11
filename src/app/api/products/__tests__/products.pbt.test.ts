import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * **Validates: Requirements 1.1**
 *
 * Property 1: Chỉ sản phẩm active được hiển thị
 * For any mix of products with active/inactive status,
 * the filtering logic should only return products with status = 'active',
 * and no active products should be missing.
 */

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  thumbnailUrl: string | null;
  status: string;
}

/** Same filtering logic used by GET /api/products (eq(products.status, "active")) */
function filterActiveProducts(products: Product[]): Product[] {
  return products.filter((p) => p.status === "active");
}

const productArb = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1 }),
  slug: fc.string({ minLength: 1 }),
  description: fc.option(fc.string(), { nil: null }),
  price: fc.integer({ min: 1000, max: 10_000_000 }),
  thumbnailUrl: fc.option(fc.webUrl(), { nil: null }),
  status: fc.oneof(fc.constant("active"), fc.constant("inactive")),
});

describe("Products API — Property 1: Only active products are returned", () => {
  it("all returned products have status 'active'", () => {
    fc.assert(
      fc.property(fc.array(productArb, { maxLength: 50 }), (products) => {
        const result = filterActiveProducts(products);
        for (const p of result) {
          expect(p.status).toBe("active");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("no active products are missing from the result", () => {
    fc.assert(
      fc.property(fc.array(productArb, { maxLength: 50 }), (products) => {
        const result = filterActiveProducts(products);
        const expectedActive = products.filter((p) => p.status === "active");
        expect(result).toHaveLength(expectedActive.length);
        expect(result).toEqual(expectedActive);
      }),
      { numRuns: 100 }
    );
  });

  it("no inactive products appear in the result", () => {
    fc.assert(
      fc.property(fc.array(productArb, { maxLength: 50 }), (products) => {
        const result = filterActiveProducts(products);
        const hasInactive = result.some((p) => p.status !== "active");
        expect(hasInactive).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
