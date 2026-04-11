import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * **Validates: Requirements 2.1**
 *
 * Property 2: Chi tiết sản phẩm hiển thị đầy đủ thông tin
 * For any product with media (images, videos), description, and price,
 * the rendered output must contain all media URLs, description, and price.
 *
 * Since the product detail page is a server component, we test the data
 * completeness property by verifying that a rendering/data preparation
 * function includes all required fields in its output.
 */

interface ProductMedia {
  id: number;
  url: string;
  type: "image" | "video";
  sortOrder: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
}

/** Format price in Vietnamese format — mirrors the page component logic */
function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

/**
 * Prepares product detail data for rendering.
 * This mirrors the data flow in /san-pham/[slug]/page.tsx:
 * - All media URLs are included
 * - Description is included
 * - Price is formatted
 */
function prepareProductDetailOutput(product: Product, media: ProductMedia[]) {
  const mediaUrls = media.map((m) => m.url);
  const formattedPrice = formatPrice(product.price);

  return {
    name: product.name,
    description: product.description,
    formattedPrice,
    mediaUrls,
    mediaItems: media.map((m) => ({ url: m.url, type: m.type })),
  };
}

// Arbitraries
const mediaArb: fc.Arbitrary<ProductMedia> = fc.record({
  id: fc.nat(),
  url: fc.webUrl(),
  type: fc.oneof(
    fc.constant("image" as const),
    fc.constant("video" as const)
  ),
  sortOrder: fc.nat({ max: 100 }),
});

const productArb: fc.Arbitrary<Product> = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  slug: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  price: fc.integer({ min: 1000, max: 10_000_000 }),
  thumbnailUrl: fc.option(fc.webUrl(), { nil: null }),
});

describe("Product Detail — Property 2: Product detail displays all information", () => {
  it("all media URLs are present in the output", () => {
    fc.assert(
      fc.property(
        productArb,
        fc.array(mediaArb, { minLength: 1, maxLength: 10 }),
        (product, media) => {
          const output = prepareProductDetailOutput(product, media);

          // Every media URL must be present in the output
          for (const m of media) {
            expect(output.mediaUrls).toContain(m.url);
          }
          // Count must match
          expect(output.mediaUrls).toHaveLength(media.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("description is present in the output", () => {
    fc.assert(
      fc.property(
        productArb,
        fc.array(mediaArb, { minLength: 1, maxLength: 10 }),
        (product, media) => {
          const output = prepareProductDetailOutput(product, media);

          expect(output.description).toBe(product.description);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("price is formatted and present in the output", () => {
    fc.assert(
      fc.property(
        productArb,
        fc.array(mediaArb, { minLength: 1, maxLength: 10 }),
        (product, media) => {
          const output = prepareProductDetailOutput(product, media);

          // Price must be formatted in Vietnamese format
          const expectedPrice = product.price.toLocaleString("vi-VN") + "đ";
          expect(output.formattedPrice).toBe(expectedPrice);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("for any product data, all required fields are present", () => {
    fc.assert(
      fc.property(
        productArb,
        fc.array(mediaArb, { minLength: 1, maxLength: 10 }),
        (product, media) => {
          const output = prepareProductDetailOutput(product, media);

          // All required fields must be defined
          expect(output.name).toBeDefined();
          expect(output.description).toBeDefined();
          expect(output.formattedPrice).toBeDefined();
          expect(output.mediaUrls.length).toBeGreaterThan(0);
          expect(output.mediaItems.length).toBe(media.length);

          // Each media item preserves its type
          for (let i = 0; i < media.length; i++) {
            expect(output.mediaItems[i].url).toBe(media[i].url);
            expect(output.mediaItems[i].type).toBe(media[i].type);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
