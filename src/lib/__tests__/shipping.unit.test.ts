import { describe, it, expect } from "vitest";
import { calculateShippingFee } from "@/lib/shipping";

describe("ShippingCalculator — Unit tests", () => {
  it("0 bags → 0 VNĐ", () => {
    expect(calculateShippingFee(0)).toBe(0);
  });

  it("1 bag → 30,000 VNĐ", () => {
    expect(calculateShippingFee(1)).toBe(30000);
  });

  it("2 bags → 20,000 VNĐ", () => {
    expect(calculateShippingFee(2)).toBe(20000);
  });

  it("3 bags → 15,000 VNĐ", () => {
    expect(calculateShippingFee(3)).toBe(15000);
  });

  it("4 bags → 0 VNĐ (free shipping)", () => {
    expect(calculateShippingFee(4)).toBe(0);
  });

  it("negative number → 0 VNĐ", () => {
    expect(calculateShippingFee(-1)).toBe(0);
  });
});
