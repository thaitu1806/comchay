import { describe, it, expect } from "vitest";
import {
  Variant,
  validateVariant,
  getAvailableOptions,
  findMatchingVariant,
  getPriceRange,
} from "../variants";

const sampleVariants: Variant[] = [
  { id: 1, riceType: "Gạo Thường", spiceLevel: "Cay nhiều", weight: 250, price: 69000 },
  { id: 2, riceType: "Gạo Thường", spiceLevel: "Cay vừa", weight: 250, price: 69000 },
  { id: 3, riceType: "Gạo Thường", spiceLevel: "Không cay", weight: 250, price: 69000 },
  { id: 4, riceType: "Gạo Lứt", spiceLevel: "Cay nhiều", weight: 250, price: 79000 },
  { id: 5, riceType: "Gạo Lứt", spiceLevel: "Cay vừa", weight: 500, price: 138000 },
  { id: 6, riceType: "Gạo Thường", spiceLevel: "Cay nhiều", weight: 500, price: 128000 },
];

describe("validateVariant", () => {
  it("chấp nhận biến thể hợp lệ (price > 0, weight > 0)", () => {
    expect(validateVariant({ id: 1, riceType: "Gạo Thường", spiceLevel: "Cay vừa", weight: 250, price: 69000 })).toBe(true);
  });

  it("từ chối biến thể có price <= 0", () => {
    expect(validateVariant({ id: 1, riceType: null, spiceLevel: null, weight: 250, price: 0 })).toBe(false);
    expect(validateVariant({ id: 1, riceType: null, spiceLevel: null, weight: 250, price: -1 })).toBe(false);
  });

  it("từ chối biến thể có weight <= 0", () => {
    expect(validateVariant({ id: 1, riceType: null, spiceLevel: null, weight: 0, price: 69000 })).toBe(false);
    expect(validateVariant({ id: 1, riceType: null, spiceLevel: null, weight: -100, price: 69000 })).toBe(false);
  });

  it("từ chối biến thể có cả price và weight <= 0", () => {
    expect(validateVariant({ id: 1, riceType: null, spiceLevel: null, weight: 0, price: 0 })).toBe(false);
  });
});

describe("getAvailableOptions", () => {
  it("trả về tất cả giá trị khi chưa chọn gì", () => {
    const result = getAvailableOptions(sampleVariants);
    expect(result.riceTypes).toContain("Gạo Thường");
    expect(result.riceTypes).toContain("Gạo Lứt");
    expect(result.spiceLevels).toContain("Cay nhiều");
    expect(result.spiceLevels).toContain("Cay vừa");
    expect(result.spiceLevels).toContain("Không cay");
    expect(result.weights).toContain(250);
    expect(result.weights).toContain(500);
  });

  it("lọc spiceLevels và weights theo riceType đã chọn", () => {
    const result = getAvailableOptions(sampleVariants, "Gạo Lứt");
    expect(result.riceTypes).toContain("Gạo Thường");
    expect(result.riceTypes).toContain("Gạo Lứt");
    expect(result.spiceLevels).toEqual(expect.arrayContaining(["Cay nhiều", "Cay vừa"]));
    expect(result.spiceLevels).not.toContain("Không cay");
    expect(result.weights).toContain(250);
    expect(result.weights).toContain(500);
  });

  it("lọc weights theo cả riceType và spiceLevel", () => {
    const result = getAvailableOptions(sampleVariants, "Gạo Lứt", "Cay nhiều");
    expect(result.weights).toEqual([250]);
    expect(result.weights).not.toContain(500);
  });

  it("trả về mảng rỗng khi không có biến thể", () => {
    const result = getAvailableOptions([]);
    expect(result.riceTypes).toEqual([]);
    expect(result.spiceLevels).toEqual([]);
    expect(result.weights).toEqual([]);
  });
});

describe("findMatchingVariant", () => {
  it("tìm biến thể khớp chính xác", () => {
    const result = findMatchingVariant(sampleVariants, "Gạo Thường", "Cay nhiều", 250);
    expect(result).toBeDefined();
    expect(result!.id).toBe(1);
    expect(result!.price).toBe(69000);
  });

  it("trả về undefined khi không tìm thấy", () => {
    const result = findMatchingVariant(sampleVariants, "Gạo Lứt", "Không cay", 250);
    expect(result).toBeUndefined();
  });

  it("khớp biến thể có riceType/spiceLevel là null", () => {
    const variants: Variant[] = [
      { id: 10, riceType: null, spiceLevel: null, weight: 300, price: 50000 },
    ];
    const result = findMatchingVariant(variants, null, null, 300);
    expect(result).toBeDefined();
    expect(result!.id).toBe(10);
  });
});

describe("getPriceRange", () => {
  it("trả về min và max đúng", () => {
    const result = getPriceRange(sampleVariants);
    expect(result).toEqual({ min: 69000, max: 138000 });
  });

  it("trả về null khi danh sách rỗng", () => {
    expect(getPriceRange([])).toBeNull();
  });

  it("trả về min === max khi chỉ có 1 biến thể", () => {
    const result = getPriceRange([{ id: 1, riceType: null, spiceLevel: null, weight: 250, price: 69000 }]);
    expect(result).toEqual({ min: 69000, max: 69000 });
  });
});
