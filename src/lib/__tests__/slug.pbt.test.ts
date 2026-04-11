import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generateSlug } from "@/lib/slug";

/**
 * **Validates: Requirements 8.8**
 *
 * Property 11: Slug generation produces valid slugs
 * For any non-empty Vietnamese product name, generateSlug produces a slug that:
 * 1. Contains only lowercase ASCII letters (a-z), digits (0-9), and hyphens
 * 2. Does not start or end with a hyphen
 * 3. Does not contain consecutive hyphens
 */
describe("SlugGenerator — Property 11: Slug generation produces valid slugs", () => {
  it("should produce slugs containing only lowercase ASCII, digits, and hyphens", () => {
    const nonEmptyWithAlphanumeric = fc
      .string({ minLength: 1 })
      .filter((s) => /[a-zA-Z0-9]/.test(s));

    fc.assert(
      fc.property(nonEmptyWithAlphanumeric, (name) => {
        const slug = generateSlug(name);
        expect(slug).toMatch(/^[a-z0-9-]*$/);
      }),
      { numRuns: 100 }
    );
  });

  it("should not start or end with a hyphen", () => {
    const nonEmptyWithAlphanumeric = fc
      .string({ minLength: 1 })
      .filter((s) => /[a-zA-Z0-9]/.test(s));

    fc.assert(
      fc.property(nonEmptyWithAlphanumeric, (name) => {
        const slug = generateSlug(name);
        if (slug.length > 0) {
          expect(slug[0]).not.toBe("-");
          expect(slug[slug.length - 1]).not.toBe("-");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should not contain consecutive hyphens", () => {
    const nonEmptyWithAlphanumeric = fc
      .string({ minLength: 1 })
      .filter((s) => /[a-zA-Z0-9]/.test(s));

    fc.assert(
      fc.property(nonEmptyWithAlphanumeric, (name) => {
        const slug = generateSlug(name);
        expect(slug).not.toMatch(/--/);
      }),
      { numRuns: 100 }
    );
  });

  it("should return empty string for empty or whitespace-only input", () => {
    const whitespaceOnly = fc
      .nat({ max: 20 })
      .map((n) => " ".repeat(n));

    fc.assert(
      fc.property(whitespaceOnly, (name) => {
        expect(generateSlug(name)).toBe("");
      }),
      { numRuns: 100 }
    );

    expect(generateSlug("")).toBe("");
  });
});
