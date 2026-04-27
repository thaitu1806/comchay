import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateVariant,
  getPriceRange,
  getAvailableOptions,
  findMatchingVariant,
  Variant,
} from "../variants";

/**
 * **Validates: Requirements 1.3**
 *
 * Property 1: Validate biến thể sản phẩm
 * For any đối tượng biến thể sản phẩm, validation phải chấp nhận khi và chỉ khi
 * `price > 0` VÀ `weight > 0`. Mọi biến thể có giá ≤ 0 hoặc trọng lượng ≤ 0 phải bị từ chối.
 */
describe("Variant Validation — Property 1: Validate biến thể sản phẩm", () => {
  const riceTypeArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Gạo Thường", "Gạo Lứt")
  );

  const spiceLevelArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay")
  );

  const variantArb = (weightArb: fc.Arbitrary<number>, priceArb: fc.Arbitrary<number>) =>
    fc.record({
      id: fc.integer({ min: 1, max: 100000 }),
      riceType: riceTypeArb,
      spiceLevel: spiceLevelArb,
      weight: weightArb,
      price: priceArb,
    }) as fc.Arbitrary<Variant>;

  it("should accept variant when price > 0 AND weight > 0", () => {
    fc.assert(
      fc.property(
        variantArb(
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: 1, max: 10000000 })
        ),
        (variant) => {
          expect(validateVariant(variant)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject variant when price <= 0", () => {
    fc.assert(
      fc.property(
        variantArb(
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: -10000000, max: 0 })
        ),
        (variant) => {
          expect(validateVariant(variant)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject variant when weight <= 0", () => {
    fc.assert(
      fc.property(
        variantArb(
          fc.integer({ min: -10000, max: 0 }),
          fc.integer({ min: 1, max: 10000000 })
        ),
        (variant) => {
          expect(validateVariant(variant)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject variant when both price <= 0 and weight <= 0", () => {
    fc.assert(
      fc.property(
        variantArb(
          fc.integer({ min: -10000, max: 0 }),
          fc.integer({ min: -10000000, max: 0 })
        ),
        (variant) => {
          expect(validateVariant(variant)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("validateVariant is true iff price > 0 AND weight > 0 (biconditional)", () => {
    fc.assert(
      fc.property(
        variantArb(
          fc.integer({ min: -10000, max: 10000 }),
          fc.integer({ min: -10000000, max: 10000000 })
        ),
        (variant) => {
          const expected = variant.price > 0 && variant.weight > 0;
          expect(validateVariant(variant)).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });
});

/**
 * **Validates: Requirements 1.4, 6.4**
 *
 * Property 2: Khoảng giá biến thể
 * For any danh sách biến thể không rỗng của một sản phẩm, `getPriceRange` phải trả về
 * `min` bằng giá thấp nhất và `max` bằng giá cao nhất trong danh sách.
 * Nếu danh sách rỗng, phải trả về `null`.
 */
describe("Variant Price Range — Property 2: Khoảng giá biến thể", () => {
  const riceTypeArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Gạo Thường", "Gạo Lứt")
  );

  const spiceLevelArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay")
  );

  const variantArb = fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    riceType: riceTypeArb,
    spiceLevel: spiceLevelArb,
    weight: fc.integer({ min: 1, max: 10000 }),
    price: fc.integer({ min: 1, max: 10000000 }),
  }) as fc.Arbitrary<Variant>;

  it("should return min = lowest price and max = highest price for non-empty list", () => {
    fc.assert(
      fc.property(
        fc.array(variantArb, { minLength: 1, maxLength: 50 }),
        (variants) => {
          const result = getPriceRange(variants);
          expect(result).not.toBeNull();

          const prices = variants.map((v) => v.price);
          const expectedMin = Math.min(...prices);
          const expectedMax = Math.max(...prices);

          expect(result!.min).toBe(expectedMin);
          expect(result!.max).toBe(expectedMax);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return null for empty variant list", () => {
    expect(getPriceRange([])).toBeNull();
  });

  it("should return min === max when all variants have the same price", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000000 }),
        fc.array(variantArb, { minLength: 1, maxLength: 20 }),
        (fixedPrice, variants) => {
          const samePrice = variants.map((v) => ({ ...v, price: fixedPrice }));
          const result = getPriceRange(samePrice);

          expect(result).not.toBeNull();
          expect(result!.min).toBe(fixedPrice);
          expect(result!.max).toBe(fixedPrice);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should always satisfy min <= max", () => {
    fc.assert(
      fc.property(
        fc.array(variantArb, { minLength: 1, maxLength: 50 }),
        (variants) => {
          const result = getPriceRange(variants);
          expect(result).not.toBeNull();
          expect(result!.min).toBeLessThanOrEqual(result!.max);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 2.2, 2.5**
 *
 * Property 3: Lọc tùy chọn biến thể khả dụng
 * For any danh sách biến thể và lựa chọn từng phần (selectedRiceType, selectedSpiceLevel),
 * `getAvailableOptions` phải trả về:
 * - Chỉ các giá trị tồn tại trong biến thể khớp với lựa chọn trước đó
 * - Nếu một thuộc tính chỉ có đúng 1 giá trị duy nhất (sau khi lọc), thuộc tính đó được tự động chọn (mảng trả về có 1 phần tử)
 * - Mọi giá trị trả về đều dẫn đến ít nhất 1 biến thể hợp lệ ở các bước tiếp theo
 */
describe("Available Options Filtering — Property 3: Lọc tùy chọn biến thể khả dụng", () => {
  const riceTypeArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Gạo Thường", "Gạo Lứt")
  );

  const spiceLevelArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay")
  );

  const variantArb = fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    riceType: riceTypeArb,
    spiceLevel: spiceLevelArb,
    weight: fc.integer({ min: 50, max: 5000 }),
    price: fc.integer({ min: 1000, max: 10000000 }),
  }) as fc.Arbitrary<Variant>;

  const variantsArb = fc.array(variantArb, { minLength: 1, maxLength: 30 });

  it("returned riceTypes only contain values existing in the variant list", () => {
    fc.assert(
      fc.property(variantsArb, (variants) => {
        const result = getAvailableOptions(variants);
        const allRiceTypes = new Set(
          variants.map((v) => v.riceType).filter((rt): rt is string => rt !== null)
        );
        for (const rt of result.riceTypes) {
          expect(allRiceTypes.has(rt)).toBe(true);
        }
        // Every existing riceType should be returned (no selection filter yet)
        for (const rt of allRiceTypes) {
          expect(result.riceTypes).toContain(rt);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("returned spiceLevels only contain values from variants matching selectedRiceType", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          // Pick a riceType that actually exists in the variants
          const existingRiceTypes = [
            ...new Set(
              variants.map((v) => v.riceType).filter((rt): rt is string => rt !== null)
            ),
          ];
          if (existingRiceTypes.length === 0) return; // skip if no riceTypes

          const selectedRiceType = existingRiceTypes[0];
          const result = getAvailableOptions(variants, selectedRiceType);

          // Filter variants matching selectedRiceType
          const matchingVariants = variants.filter(
            (v) => v.riceType === selectedRiceType
          );
          const expectedSpiceLevels = new Set(
            matchingVariants
              .map((v) => v.spiceLevel)
              .filter((sl): sl is string => sl !== null)
          );

          // Every returned spiceLevel must exist in matching variants
          for (const sl of result.spiceLevels) {
            expect(expectedSpiceLevels.has(sl)).toBe(true);
          }
          // Every expected spiceLevel must be returned
          for (const sl of expectedSpiceLevels) {
            expect(result.spiceLevels).toContain(sl);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returned weights only contain values from variants matching selectedRiceType and selectedSpiceLevel", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          // Pick existing riceType and spiceLevel
          const existingRiceTypes = [
            ...new Set(
              variants.map((v) => v.riceType).filter((rt): rt is string => rt !== null)
            ),
          ];
          if (existingRiceTypes.length === 0) return;

          const selectedRiceType = existingRiceTypes[0];
          const afterRice = variants.filter((v) => v.riceType === selectedRiceType);

          const existingSpiceLevels = [
            ...new Set(
              afterRice
                .map((v) => v.spiceLevel)
                .filter((sl): sl is string => sl !== null)
            ),
          ];
          if (existingSpiceLevels.length === 0) return;

          const selectedSpiceLevel = existingSpiceLevels[0];
          const result = getAvailableOptions(variants, selectedRiceType, selectedSpiceLevel);

          // Filter variants matching both selections
          const matchingVariants = afterRice.filter(
            (v) => v.spiceLevel === selectedSpiceLevel
          );
          const expectedWeights = new Set(matchingVariants.map((v) => v.weight));

          // Every returned weight must exist in matching variants
          for (const w of result.weights) {
            expect(expectedWeights.has(w)).toBe(true);
          }
          // Every expected weight must be returned
          for (const w of expectedWeights) {
            expect(result.weights).toContain(w);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when only 1 unique riceType exists, riceTypes array has exactly 1 element", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("Gạo Thường", "Gạo Lứt"),
        spiceLevelArb,
        fc.integer({ min: 50, max: 5000 }),
        fc.integer({ min: 1000, max: 10000000 }),
        fc.integer({ min: 1, max: 5 }),
        (singleRiceType, spice, weight, price, count) => {
          // Create variants all with the same riceType
          const variants: Variant[] = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            riceType: singleRiceType,
            spiceLevel: spice,
            weight: weight + i * 100,
            price: price + i * 1000,
          }));

          const result = getAvailableOptions(variants);
          expect(result.riceTypes).toHaveLength(1);
          expect(result.riceTypes[0]).toBe(singleRiceType);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when only 1 unique spiceLevel exists after filtering by riceType, spiceLevels has exactly 1 element", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("Gạo Thường", "Gạo Lứt"),
        fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay"),
        fc.array(fc.integer({ min: 50, max: 5000 }), { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1000, max: 10000000 }),
        (riceType, singleSpice, weights, basePrice) => {
          // Create variants with same riceType and same spiceLevel but different weights
          const variants: Variant[] = weights.map((w, i) => ({
            id: i + 1,
            riceType: riceType,
            spiceLevel: singleSpice,
            weight: w,
            price: basePrice + i * 1000,
          }));

          const result = getAvailableOptions(variants, riceType);
          expect(result.spiceLevels).toHaveLength(1);
          expect(result.spiceLevels[0]).toBe(singleSpice);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("every returned riceType leads to at least 1 variant with a valid spiceLevel or weight", () => {
    fc.assert(
      fc.property(variantsArb, (variants) => {
        const result = getAvailableOptions(variants);

        for (const rt of result.riceTypes) {
          // Selecting this riceType should yield at least 1 variant
          const matchingVariants = variants.filter((v) => v.riceType === rt);
          expect(matchingVariants.length).toBeGreaterThanOrEqual(1);

          // And getAvailableOptions with this riceType should return non-empty spiceLevels or weights
          const nextStep = getAvailableOptions(variants, rt);
          const hasNextOptions =
            nextStep.spiceLevels.length > 0 || nextStep.weights.length > 0;
          expect(hasNextOptions).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("every returned spiceLevel leads to at least 1 variant with a valid weight", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          const existingRiceTypes = [
            ...new Set(
              variants.map((v) => v.riceType).filter((rt): rt is string => rt !== null)
            ),
          ];
          if (existingRiceTypes.length === 0) return;

          const selectedRiceType = existingRiceTypes[0];
          const result = getAvailableOptions(variants, selectedRiceType);

          for (const sl of result.spiceLevels) {
            // Selecting this spiceLevel should yield at least 1 weight
            const nextStep = getAvailableOptions(variants, selectedRiceType, sl);
            expect(nextStep.weights.length).toBeGreaterThanOrEqual(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("every returned weight corresponds to at least 1 actual variant", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          const existingRiceTypes = [
            ...new Set(
              variants.map((v) => v.riceType).filter((rt): rt is string => rt !== null)
            ),
          ];
          if (existingRiceTypes.length === 0) return;

          const selectedRiceType = existingRiceTypes[0];
          const afterRice = variants.filter((v) => v.riceType === selectedRiceType);

          const existingSpiceLevels = [
            ...new Set(
              afterRice
                .map((v) => v.spiceLevel)
                .filter((sl): sl is string => sl !== null)
            ),
          ];
          if (existingSpiceLevels.length === 0) return;

          const selectedSpiceLevel = existingSpiceLevels[0];
          const result = getAvailableOptions(variants, selectedRiceType, selectedSpiceLevel);

          // Every returned weight must correspond to at least 1 actual variant
          const matchingVariants = afterRice.filter(
            (v) => v.spiceLevel === selectedSpiceLevel
          );
          for (const w of result.weights) {
            const hasVariant = matchingVariants.some((v) => v.weight === w);
            expect(hasVariant).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 2.3**
 *
 * Property 4: Tìm biến thể khớp lựa chọn
 * For any danh sách biến thể và bộ lựa chọn hoàn chỉnh (riceType, spiceLevel, weight),
 * `findMatchingVariant` phải trả về biến thể có đúng các thuộc tính khớp, hoặc `undefined`
 * nếu không tồn tại. Giá trả về phải bằng chính xác giá của biến thể trong danh sách.
 */
describe("Find Matching Variant — Property 4: Tìm biến thể khớp lựa chọn", () => {
  const riceTypeArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Gạo Thường", "Gạo Lứt")
  );

  const spiceLevelArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay")
  );

  const variantArb = fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    riceType: riceTypeArb,
    spiceLevel: spiceLevelArb,
    weight: fc.integer({ min: 50, max: 5000 }),
    price: fc.integer({ min: 1000, max: 10000000 }),
  }) as fc.Arbitrary<Variant>;

  const variantsArb = fc.array(variantArb, { minLength: 1, maxLength: 30 });

  it("should return a variant with exactly matching riceType, spiceLevel, weight when one exists", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          // Pick a variant that exists in the list
          const target = variants[0];
          const result = findMatchingVariant(
            variants,
            target.riceType,
            target.spiceLevel,
            target.weight
          );

          expect(result).toBeDefined();
          expect(result!.riceType).toBe(target.riceType);
          expect(result!.spiceLevel).toBe(target.spiceLevel);
          expect(result!.weight).toBe(target.weight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return a price that exactly matches the variant in the list", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          const target = variants[0];
          const result = findMatchingVariant(
            variants,
            target.riceType,
            target.spiceLevel,
            target.weight
          );

          expect(result).toBeDefined();
          // The returned variant must exist in the original list with the exact same price
          const matchInList = variants.find(
            (v) =>
              v.riceType === result!.riceType &&
              v.spiceLevel === result!.spiceLevel &&
              v.weight === result!.weight &&
              v.price === result!.price
          );
          expect(matchInList).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return undefined when no variant matches the selection", () => {
    fc.assert(
      fc.property(
        variantsArb,
        (variants) => {
          // Use a weight that doesn't exist in any variant
          const allWeights = new Set(variants.map((v) => v.weight));
          let nonExistentWeight = 99999;
          while (allWeights.has(nonExistentWeight)) {
            nonExistentWeight++;
          }

          const result = findMatchingVariant(
            variants,
            "Gạo Thường",
            "Cay nhiều",
            nonExistentWeight
          );

          expect(result).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returned variant is always a member of the input list (referential integrity)", () => {
    fc.assert(
      fc.property(
        variantsArb,
        riceTypeArb,
        spiceLevelArb,
        fc.integer({ min: 50, max: 5000 }),
        (variants, riceType, spiceLevel, weight) => {
          const result = findMatchingVariant(variants, riceType, spiceLevel, weight);

          if (result !== undefined) {
            // The returned variant must be one of the variants in the input list
            const found = variants.some(
              (v) =>
                v.id === result.id &&
                v.riceType === result.riceType &&
                v.spiceLevel === result.spiceLevel &&
                v.weight === result.weight &&
                v.price === result.price
            );
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("if result is defined, its properties must match the query exactly", () => {
    fc.assert(
      fc.property(
        variantsArb,
        riceTypeArb,
        spiceLevelArb,
        fc.integer({ min: 50, max: 5000 }),
        (variants, riceType, spiceLevel, weight) => {
          const result = findMatchingVariant(variants, riceType, spiceLevel, weight);

          if (result !== undefined) {
            expect(result.riceType).toBe(riceType);
            expect(result.spiceLevel).toBe(spiceLevel);
            expect(result.weight).toBe(weight);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
